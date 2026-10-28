import {createReadStream,existsSync,readFileSync} from 'node:fs';
import {Readable} from 'node:stream';
import {createGunzip,gunzipSync} from 'node:zlib';
import {createInterface} from 'node:readline';
import {join,resolve,sep} from 'node:path';
export function evidencePath(dir,name){const p=resolve(dir,name);if(!p.startsWith(resolve(dir)+sep))throw Error('Invalid evidence path');return p;}
export function logStream(dir,name){
 const plain=join(dir,name);if(existsSync(plain))return createReadStream(plain);
 if(existsSync(plain+'.gz'))return createReadStream(plain+'.gz').pipe(createGunzip());
 const m=JSON.parse(readFileSync(join(dir,'integrity.json'),'utf8'));
 const group=m.reconstructedLogs?.find(g=>g.originalFile===name);if(!group)throw Error(`Missing log: ${name}`);
 return Readable.from((async function*(){for(const part of group.parts)yield gunzipSync(readFileSync(evidencePath(dir,part)));})());
}
export async function* rpcRecords(dir,name='rpc.jsonl'){
 let lineNumber=0;for await(const line of createInterface({input:logStream(dir,name),crlfDelay:Infinity})){lineNumber++;if(line.trim())yield{record:JSON.parse(line),line,lineNumber};}
}
