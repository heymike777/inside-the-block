import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateKeyPairSync} from 'node:crypto';
import {getBase58Decoder} from '@solana/kit';
import {run} from '../src/run.mjs';
import {MAINNET_GENESIS} from '../src/core.mjs';
async function fixture(cap=20000){
 const dir=mkdtempSync(join(tmpdir(),'ordering-pipeline-')),keys=[];
 for(let i=0;i<4;i++){
  const key=generateKeyPairSync('ed25519').privateKey.export({format:'jwk'});
  const path=join(dir,`key-${i}.json`);writeFileSync(path,JSON.stringify([...Buffer.concat([Buffer.from(key.d,'base64url'),Buffer.from(key.x,'base64url')])]),{mode:0o600});keys.push(path);
 }
 let slotCalls=0;const calls=[];
 const fetch=async(_url,options)=>{
  const q=JSON.parse(options.body);calls.push(q.method);let result;
  switch(q.method){
   case 'getGenesisHash':result=MAINNET_GENESIS;break;
   case 'getClusterNodes':result=[{pubkey:'test-validator',version:'test-version'}];break;
   case 'getEpochInfo':result={absoluteSlot:100,slotIndex:0,epoch:1};break;
   case 'getLeaderSchedule':result={'test-validator':[20,21,22,23]};break;
   case 'getSlot':result=slotCalls++===0?113:120;break;
   case 'getLatestBlockhash':result={value:{blockhash:'11111111111111111111111111111111',lastValidBlockHeight:999}};break;
   case 'simulateTransaction':result={value:{err:null}};break;
   case 'getFeeForMessage':result={value:5000};break;
   case 'getBalance':result={value:1000000};break;
   case 'sendTransaction':result=getBase58Decoder().decode(Buffer.from(q.params[0],'base64').subarray(1,65));break;
   default:throw Error(q.method);
  }
  return Response.json({jsonrpc:'2.0',id:q.id,result});
 };
 const config=join(dir,'config.json');writeFileSync(config,JSON.stringify({targets:[{identity:'test-validator',version:'test-version'}],repeats:1,maxWaitSeconds:5,capLamports:cap,sendMode:'burst',phase:'synthetic-test'}));
 return {dir,keys,config,calls,fetch,url:'http://synthetic.invalid',close:()=>{}};
}
test('pipeline gates sending and persists reservations before accepted submissions',async()=>{
 const previousFetch=globalThis.fetch;
 const previous={RPC_URL:process.env.RPC_URL,KEYPAIR_PATHS:process.env.KEYPAIR_PATHS};
 try{
  for(const mode of ['dry','live','cap-reject']){
   const f=await fixture(mode==='cap-reject'?19999:20000);
   globalThis.fetch=f.fetch;process.env.RPC_URL=f.url;process.env.KEYPAIR_PATHS=f.keys.join(',');
   try{
    if(mode==='cap-reject')await assert.rejects(run([f.config,'--live'],f.dir),/Batch exceeds/);
    else await run([f.config,...(mode==='live'?['--live']:[])],f.dir);
    assert.equal(f.calls.filter(m=>m==='sendTransaction').length,mode==='live'?4:0);
    assert.equal(existsSync(join(f.dir,'live.lock')),false);
    if(mode==='live'){
     const entries=readFileSync(join(f.dir,'budget.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
     assert.equal(entries.reduce((s,e)=>s+e.lamports,0),20000);
     assert.equal(new Set(entries.map(e=>e.signature)).size,4);
    }else assert.equal(existsSync(join(f.dir,'budget.jsonl')),false);
   }finally{f.close();}
  }
 }finally{globalThis.fetch=previousFetch;for(const[k,v]of Object.entries(previous))if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
