import test from 'node:test';import assert from 'node:assert/strict';import{diagnostics}from'../src/diagnostics.mjs';
test('complete-burst sensitivity excludes straddles, off-targets and failures while preserving inclusion counts',()=>{
 const base={runId:'r',targetValidator:'v',validator:'v',version:'1',targetVersion:'1',clientId:'JitoLabs',targetClientId:'JitoLabs',locks:'shared',treatment:'price',live:true,onTarget:true,status:'finalized',units:20000};
 const batch=(n)=>Array.from({length:4},(_,i)=>({...base,signature:`${n}-${i}`,batch:`b${n}`,targetSlot:n,slot:n,blockIndex:i,price:3-i,sendOrder:i,priorityLamports:3-i}));
 const one=batch(1),split=batch(2),off=batch(3),failed=batch(4);split[3].slot=22;off[0].onTarget=false;off[0].clientId=null;failed[0].error='failed';
 const r=diagnostics([...one,...split,...off,...failed]);assert.equal(r.coverage.batches,4);assert.equal(r.coverage.completeSameBlockBatches,1);assert.equal(r.coverage.strata[0].attempts,16);assert.equal(r.coverage.strata[0].offTarget,1);assert.equal(r.coverage.strata[0].failed,1);assert.equal(r.coverage.strata[0].straddlingBatches,1);assert.equal(r.fullBurstStatistics.results.find(r=>r.predictor==='price').informativeWindows,1);
});
