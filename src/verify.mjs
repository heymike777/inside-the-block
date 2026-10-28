import {readBlock} from './storage.mjs';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {getBase58Encoder} from '@solana/kit';
export function verify(runDir) {
 const rows=readFileSync(`${runDir}/observations.jsonl`,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
 const manifest=JSON.parse(readFileSync(`${runDir}/manifest.json`,'utf8'));
 const seen=new Set();let checked=0,fees=0;
 for(const r of rows){
  assert.ok(!seen.has(r.signature),'Duplicate signature');seen.add(r.signature);
  if(r.status!=='finalized')continue;
  const stored=readBlock(runDir,r.slot);
  assert.equal(stored.slot,r.slot);assert.equal(stored.validator,r.validator);
  const tx=stored.block.transactions[r.blockIndex];
  assert.equal(tx.transaction.signatures[0],r.signature);assert.equal(tx.meta.fee,r.actualFee);
  assert.deepEqual(tx.meta.err,r.error);
  const message=tx.transaction.message,keys=message.accountKeys.map(k=>typeof k==='string'?k:k.pubkey);
  assert.equal(keys[0],manifest.payerAddresses[r.payer],'Fee payer differs from assigned experimental signer');
  assert.equal(tx.transaction.signatures.length,1);assert.equal(message.header.numRequiredSignatures,1);assert.equal(message.header.numReadonlySignedAccounts,0);
  const instructions=message.instructions;
  assert.equal(instructions.length,3,'Probe must contain only compute budget and memo instructions');
  assert.equal(keys[instructions[0].programIdIndex],'ComputeBudget111111111111111111111111111111');
  assert.equal(keys[instructions[1].programIdIndex],'ComputeBudget111111111111111111111111111111');
  assert.equal(keys[instructions[2].programIdIndex],'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  const data=instructions.slice(0,2).map(ix=>getBase58Encoder().encode(ix.data));
  assert.equal(data[0][0],2);assert.equal(new DataView(data[0].buffer,data[0].byteOffset,data[0].byteLength).getUint32(1,true),r.units);
  assert.equal(data[1][0],3);assert.equal(Number(new DataView(data[1].buffer,data[1].byteOffset,data[1].byteLength).getBigUint64(1,true)),r.price);
  checked++;fees+=r.actualFee;
 }
 console.log(`Verified ${checked} finalized signatures, indices, fee and compute-budget fields against saved blocks; ${fees} lamports.`);
 return {checked,fees};
}
