import {mkdirSync,readdirSync,readFileSync,writeFileSync,existsSync,statSync,openSync,readSync,closeSync} from 'node:fs';
import {basename,dirname,join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
export function exportRun(source,destination,{chunkBytes=32*1024*1024}={}){
 if(!source||!destination)throw Error('Usage: export data/RUN_ID results/main');
 if(!Number.isSafeInteger(chunkBytes)||chunkBytes<1||chunkBytes>32*1024*1024)throw Error('Invalid log chunk size');
 const finished=existsSync(join(source,'events.jsonl')) && readFileSync(join(source,'events.jsonl'),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).some(e=>e.type==='run-finished');
 if(existsSync(join(dirname(source),'live.lock'))&&!finished)throw Error('This run is still active; export after it finishes');
 if(existsSync(destination))throw Error('Destination exists; refusing to overwrite evidence');
 mkdirSync(destination,{recursive:true});const manifest=[],reconstructedLogs=[];
 const hash=b=>createHash('sha256').update(b).digest('hex');
 const save=(file,raw,compressed)=>{const bytes=compressed?gzipSync(raw,{level:9}):raw;writeFileSync(join(destination,file),bytes);manifest.push({file,originalBytes:raw.length,storedBytes:bytes.length,sha256Original:hash(raw),sha256Stored:hash(bytes)});};
 for(const name of readdirSync(source).sort()){
  if(!/^(manifest\.json|attempts\.jsonl|events\.jsonl|observations\.jsonl|client-attribution\.jsonl|block-context\.json|rpc\.jsonl|collection-rpc\.jsonl|block-\d+\.json)$/.test(name))continue;
  const path=join(source,name),log=name.endsWith('rpc.jsonl');
  if(log&&statSync(path).size>chunkBytes){
   const fd=openSync(path,'r'),buffer=Buffer.allocUnsafe(chunkBytes),parts=[],whole=createHash('sha256');let total=0,n,index=0;
   try{while((n=readSync(fd,buffer,0,buffer.length,null))>0){const raw=buffer.subarray(0,n);whole.update(raw);total+=n;const file=`${name.slice(0,-6)}.part-${String(++index).padStart(4,'0')}.jsonl.gz`;save(file,raw,true);parts.push(file);}}finally{closeSync(fd);}
   reconstructedLogs.push({originalFile:name,parts,originalBytes:total,sha256Original:whole.digest('hex')});
  }else{const raw=readFileSync(path),compressed=log||/^block-\d+\.json$/.test(name);save(name+(compressed?'.gz':''),raw,compressed);}
 }
 writeFileSync(join(destination,'integrity.json'),JSON.stringify({sourceRun:basename(source),exportedAt:new Date().toISOString(),files:manifest,reconstructedLogs},null,2)+'\n');
 console.log(`Exported ${manifest.length} evidence files with SHA-256 hashes to ${destination}`);
}
