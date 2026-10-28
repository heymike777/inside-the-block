import {existsSync,readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
export function readBlock(dir,slot) {
 const path=`${dir}/block-${slot}.json`;
 return JSON.parse(existsSync(path)?readFileSync(path,'utf8'):gunzipSync(readFileSync(path+'.gz')).toString('utf8'));
}
