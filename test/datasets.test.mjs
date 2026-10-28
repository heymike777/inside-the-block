import test from'node:test';import assert from'node:assert/strict';import{mkdtempSync,mkdirSync,writeFileSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import{measurementDirectories}from'../src/datasets.mjs';
test('measurement discovery excludes similarly named derived analysis directories',()=>{
 const root=mkdtempSync(join(tmpdir(),'datasets-'));for(const name of ['expanded-01','expanded-analysis','main-01'])mkdirSync(`${root}/${name}`);
 writeFileSync(`${root}/expanded-01/manifest.json`,'{}');writeFileSync(`${root}/main-01/manifest.json`,'{}');writeFileSync(`${root}/expanded-analysis/report.md`,'derived report');writeFileSync(`${root}/expanded-summary.json`,'{}');
 assert.deepEqual(measurementDirectories(root,'expanded-'),[`${root}/expanded-01`]);assert.deepEqual(measurementDirectories(root,'main-'),[`${root}/main-01`]);
});
