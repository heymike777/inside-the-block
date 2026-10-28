import {mkdirSync,readdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {basename,dirname,join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
export function exportRun(source,destination){
 if(!source||!destination)throw Error('Usage: export data/RUN_ID results/main');
 if(existsSync(join(dirname(source),'live.lock')))throw Error('Live campaign still running; export after it finishes');
 if(existsSync(destination))throw Error('Destination exists; refusing to overwrite evidence');
 mkdirSync(destination,{recursive:true});
 const manifest=[];
 for(const name of readdirSync(source).sort()){
  if(!/^(manifest\.json|attempts\.jsonl|events\.jsonl|observations\.jsonl|block-context\.json|rpc\.jsonl|collection-rpc\.jsonl|block-\d+\.json)$/.test(name))continue;
  const raw=readFileSync(join(source,name));
  const compressed=name.endsWith('rpc.jsonl')||/^block-\d+\.json$/.test(name);
  const file=name+(compressed?'.gz':'');
  const bytes=compressed?gzipSync(raw,{level:9}):raw;
  writeFileSync(join(destination,file),bytes);
  manifest.push({file,originalBytes:raw.length,storedBytes:bytes.length,sha256Original:createHash('sha256').update(raw).digest('hex'),sha256Stored:createHash('sha256').update(bytes).digest('hex')});
 }
 writeFileSync(join(destination,'integrity.json'),JSON.stringify({sourceRun:basename(source),exportedAt:new Date().toISOString(),files:manifest},null,2)+'\n');
 console.log(`Exported ${manifest.length} evidence files with SHA-256 hashes to ${destination}`);
}
