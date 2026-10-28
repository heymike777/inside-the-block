import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';import {tmpdir}from'node:os';import{join}from'node:path';
import{exportRun}from'../src/export.mjs';import{integrity}from'../src/integrity.mjs';import{rpcRecords}from'../src/logs.mjs';import{attributeRun}from'../src/attribution.mjs';
test('chunked logs reconstruct Unicode and contemporaneous client attribution without using future snapshots',async()=>{
 const root=mkdtempSync(join(tmpdir(),'evidence-')),raw=join(root,'raw'),dest=join(root,'export');mkdirSync(raw);
 const nodes=(client,at)=>({method:'getClusterNodes',at,response:{result:[{pubkey:'v',version:'1',clientId:client,featureSet:7}]}});
 const records=[nodes('JitoLabs','2026-10-28T00:00:00.000Z'),{method:'getSlot',at:'2026-10-28T00:00:00.500Z',note:'Привет 🌍'},nodes('FireBAM','2026-10-28T00:00:02.000Z')];
 writeFileSync(join(raw,'rpc.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n');
 writeFileSync(join(raw,'manifest.json'),JSON.stringify({config:{targets:[{identity:'v',version:'1'}]}}));
 writeFileSync(join(raw,'observations.jsonl'),JSON.stringify({at:'2026-10-28T00:00:01.000Z',targetValidator:'v',onTarget:true})+'\n');
 exportRun(raw,dest,{chunkBytes:61});integrity(dest);
 const got=[];for await(const {record}of rpcRecords(dest))got.push(record);assert.deepEqual(got,records);
 const rows=await attributeRun(dest);assert.equal(rows[0].clientId,'JitoLabs');assert.equal(rows[0].clientEvidence.ageMs,1000);
 const manifest=JSON.parse(readFileSync(join(dest,'integrity.json')));writeFileSync(join(dest,manifest.reconstructedLogs[0].parts[0]),'corrupt');assert.throws(()=>integrity(dest));
});
