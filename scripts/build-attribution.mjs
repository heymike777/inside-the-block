import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {createHash}from'node:crypto';import {attributeRun}from'../src/attribution.mjs';
const root='results/attribution';mkdirSync(root,{recursive:true});
const monitor=JSON.parse(readFileSync('data/attribution/validator-clients.json','utf8'));
monitor.rawResponseSha256=createHash('sha256').update(readFileSync('data/attribution/firedancer-report.json')).digest('hex');
monitor.sources=[{url:'https://raw.githubusercontent.com/anza-xyz/agave/v4.3.2/version/src/client_ids.rs',sha256:createHash('sha256').update(readFileSync('data/attribution/agave-source-0.txt')).digest('hex')},{url:'https://github.com/anza-xyz/agave/blob/v4.3.2/CHANGELOG.md',sha256:createHash('sha256').update(readFileSync('data/attribution/agave-source-1.txt')).digest('hex')},{url:'https://bam.dev/validators/'},{url:'https://github.com/harmonic/salsa'},{url:'https://github.com/harmonic/samba'}];
writeFileSync(`${root}/validator-clients.json`,JSON.stringify(monitor,null,2)+'\n');
const coverage=[];
for(const dir of readdirSync('results',{withFileTypes:true}).filter(d=>d.isDirectory()&&(d.name.startsWith('main-')||d.name.startsWith('expanded-')))){
 const rows=await attributeRun(`results/${dir.name}`,`${root}/${dir.name}.jsonl`);
 coverage.push({run:dir.name,rows:rows.length,attributedOnTarget:rows.filter(r=>r.clientId).length,unattributedOnTarget:rows.filter(r=>r.onTarget&&!r.clientId).length,clientIds:[...new Set(rows.map(r=>r.clientId).filter(Boolean))],maxSnapshotAgeMs:Math.max(...rows.map(r=>r.clientEvidence?.ageMs??0))});
}
writeFileSync(`${root}/coverage.json`,JSON.stringify(coverage,null,2)+'\n');
const files=readdirSync(root).filter(f=>f!=='integrity.json').sort().map(file=>{const b=readFileSync(`${root}/${file}`),hash=createHash('sha256').update(b).digest('hex');return{file,originalBytes:b.length,storedBytes:b.length,sha256Original:hash,sha256Stored:hash};});
writeFileSync(`${root}/integrity.json`,JSON.stringify({sourceRun:'derived-client-attribution',exportedAt:new Date().toISOString(),files},null,2)+'\n');
console.log(JSON.stringify(coverage));
