import {readdirSync,existsSync} from 'node:fs';
export function measurementDirectories(root,prefix){
 return readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&d.name.startsWith(prefix)&&existsSync(`${root}/${d.name}/manifest.json`)).map(d=>`${root}/${d.name}`).sort();
}
