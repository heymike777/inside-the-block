import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname} from 'node:path';
import {rpcRecords} from './logs.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
export async function attributeRun(runDir,output){
 const manifest=JSON.parse(readFileSync(`${runDir}/manifest.json`,'utf8'));
 const targets=new Map(manifest.config.targets.map(t=>[t.identity,t]));
 const histories=new Map([...targets].map(([id])=>[id,[]]));
 for await(const {record:r,line,lineNumber}of rpcRecords(runDir)){
  if(r.method!=='getClusterNodes'||!Array.isArray(r.response?.result))continue;
  const recordHash=hash(line);
  for(const n of r.response.result)if(histories.has(n.pubkey))histories.get(n.pubkey).push({at:r.at,line:lineNumber,sha256:recordHash,clientId:n.clientId??null,version:n.version,featureSet:n.featureSet});
 }
 for(const h of histories.values())h.sort((a,b)=>a.at.localeCompare(b.at));
 const rows=readFileSync(`${runDir}/observations.jsonl`,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
 const enriched=rows.map(row=>{
  const snapshot=histories.get(row.targetValidator)?.findLast(s=>s.at<=row.at);
  const matches=snapshot?.version===targets.get(row.targetValidator)?.version;
  return {...row,targetVersion:targets.get(row.targetValidator)?.version??null,targetClientId:matches?snapshot.clientId:null,clientId:row.onTarget&&matches?snapshot.clientId:null,clientEvidence:snapshot?{source:'getClusterNodes / advertised clientId, not binary attestation',snapshotAt:snapshot.at,rawLog:'rpc.jsonl',line:snapshot.line,sha256Record:snapshot.sha256,featureSet:snapshot.featureSet,ageMs:Date.parse(row.at)-Date.parse(snapshot.at),versionMatches:matches}:null};
 });
 if(output){mkdirSync(dirname(output),{recursive:true});writeFileSync(output,enriched.map(r=>JSON.stringify(r)).join('\n')+'\n');}
 return enriched;
}
