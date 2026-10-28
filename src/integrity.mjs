import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {evidencePath} from './logs.mjs';
export function integrity(dir){
 const manifest=JSON.parse(readFileSync(join(dir,'integrity.json'),'utf8'));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 for(const f of manifest.files){
  const bytes=readFileSync(evidencePath(dir,f.file)),raw=f.file.endsWith('.gz')?gunzipSync(bytes):bytes;
  if(hash(bytes)!==f.sha256Stored||hash(raw)!==f.sha256Original||bytes.length!==f.storedBytes||raw.length!==f.originalBytes)throw Error(`Integrity mismatch: ${f.file}`);
 }
 for(const group of manifest.reconstructedLogs??[]){
  const whole=createHash('sha256');let length=0;
  for(const part of group.parts){const raw=gunzipSync(readFileSync(evidencePath(dir,part)));whole.update(raw);length+=raw.length;}
  if(length!==group.originalBytes||whole.digest('hex')!==group.sha256Original)throw Error(`Reconstructed log mismatch: ${group.originalFile}`);
 }
 console.log(`SHA-256 verified for ${manifest.files.length} evidence files.`);
}
