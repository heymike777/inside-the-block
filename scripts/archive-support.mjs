import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
function archive(label,inputs){
 const dir=`results/${label}`;if(existsSync(dir))throw Error(`${dir} already exists`);mkdirSync(dir,{recursive:true});
 const files=[];
 for(const[path,name]of inputs){
  const raw=readFileSync(path),bytes=gzipSync(raw,{level:9}),file=name+'.gz';writeFileSync(`${dir}/${file}`,bytes);
  files.push({file,originalBytes:raw.length,storedBytes:bytes.length,sha256Original:createHash('sha256').update(raw).digest('hex'),sha256Stored:createHash('sha256').update(bytes).digest('hex')});
 }
 writeFileSync(`${dir}/integrity.json`,JSON.stringify({sourceRun:label,exportedAt:new Date().toISOString(),files},null,2)+'\n');
}
if(existsSync('data/live.lock'))throw Error('Archive support only after the live campaign stops');
archive('discovery',[['data/candidates.json','candidates.json'],['data/discovery-rpc.jsonl','rpc.jsonl']]);
archive('accounting',[['data/budget.jsonl','budget.jsonl'],['data/funding-check.json','funding-check.json'],['data/preflight.json','preflight.json']]);
console.log('Archived discovery, funded preflight and final reservation journal. No key files included.');
