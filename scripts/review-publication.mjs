import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {parseEnv} from 'node:util';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbidden=files.filter(f=>f==='.env'||f.startsWith('secrets/')||f.startsWith('node_modules/')||f.endsWith('.p8'));
if(forbidden.length)throw Error(`Forbidden tracked paths: ${forbidden.join(', ')}`);
const needles=[];
if(existsSync('.env')){const env=parseEnv(readFileSync('.env','utf8'));if(env.RPC_URL && env.RPC_URL!=='https://api.mainnet-beta.solana.com')needles.push(env.RPC_URL);}
if(existsSync('secrets'))for(const f of readdirSync('secrets'))if(f.endsWith('.json'))needles.push(readFileSync(`secrets/${f}`,'utf8').trim());
for(const file of files){
 if(!existsSync(file))continue;
 const bytes=readFileSync(file);const body=(file.endsWith('.gz')?gunzipSync(bytes):bytes).toString('utf8');
 if(needles.some(secret=>body.includes(secret)))throw Error(`Sensitive local value found in ${file}`);
}
console.log(`Reviewed ${files.length} tracked paths; no local RPC endpoint or key files found in public contents.`);
