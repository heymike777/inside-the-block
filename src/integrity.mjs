import {readFileSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
export function integrity(dir){
 const manifest=JSON.parse(readFileSync(join(dir,'integrity.json'),'utf8'));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 for(const f of manifest.files){
  const path=resolve(dir,f.file);if(!path.startsWith(resolve(dir)+sep))throw Error('Invalid manifest path');
  const bytes=readFileSync(path),raw=f.file.endsWith('.gz')?gunzipSync(bytes):bytes;
  if(hash(bytes)!==f.sha256Stored||hash(raw)!==f.sha256Original||bytes.length!==f.storedBytes||raw.length!==f.originalBytes)throw Error(`Integrity mismatch: ${f.file}`);
 }
 console.log(`SHA-256 verified for ${manifest.files.length} evidence files.`);
}
