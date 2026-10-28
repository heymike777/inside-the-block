import {rpcRecords} from '../src/logs.mjs';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {parseEnv} from 'node:util';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbidden=files.filter(f=>f==='.env'||f.startsWith('secrets/')||f.startsWith('node_modules/')||f.endsWith('.p8'));
if(forbidden.length)throw Error(`Forbidden tracked paths: ${forbidden.join(', ')}`);
const needles=[];
if(existsSync('.env')){const env=parseEnv(readFileSync('.env','utf8'));if(env.RPC_URL && env.RPC_URL!=='https://api.mainnet-beta.solana.com'){needles.push(env.RPC_URL);const url=new URL(env.RPC_URL);for(const [key,value] of url.searchParams)if(/key|token|auth|secret/i.test(key)&&value.length>=8)needles.push(value);if(url.password)needles.push(url.password);for(const segment of url.pathname.split('/'))if(segment.length>=20)needles.push(segment);}}
if(existsSync('secrets'))for(const f of readdirSync('secrets'))if(f.endsWith('.json'))needles.push(readFileSync(`secrets/${f}`,'utf8').trim());
for(const file of files){
 if(!existsSync(file))continue;
 const bytes=readFileSync(file);const body=(file.endsWith('.gz')?gunzipSync(bytes):bytes).toString('utf8');
 if(needles.some(secret=>body.includes(secret)))throw Error(`Sensitive local value found in ${file}`);
}
if(needles.length) for(const file of files.filter(f=>f.endsWith('/integrity.json'))){
 const manifest=JSON.parse(readFileSync(file,'utf8'));const dir=file.slice(0,-'/integrity.json'.length);
 for(const group of manifest.reconstructedLogs??[])for await(const {line}of rpcRecords(dir,group.originalFile))if(needles.some(secret=>line.includes(secret)))throw Error(`Sensitive local value found across chunks of ${dir}/${group.originalFile}`);
}
console.log(`Reviewed ${files.length} tracked paths; no local RPC endpoint or key files found in public contents.`);
