import {readBlock} from './storage.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
export function context(runDir) {
 const rows=readFileSync(`${runDir}/observations.jsonl`,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
 const slots=[...new Set(rows.filter(r=>r.status==='finalized').map(r=>r.slot))];
 const results=slots.map(slot=>{
   const stored=readBlock(runDir,slot);
   const txs=stored.block.transactions;
   return {slot,validator:stored.validator,blockTime:stored.block.blockTime,transactionCount:txs.length,failedTransactions:txs.filter(t=>t.meta?.err).length,totalFees:txs.reduce((s,t)=>s+(t.meta?.fee??0),0),reportedComputeUnits:txs.reduce((s,t)=>s+(t.meta?.computeUnitsConsumed??0),0),missingComputeUnits:txs.filter(t=>t.meta?.computeUnitsConsumed==null).length,probes:rows.filter(r=>r.slot===slot).map(r=>({signature:r.signature,index:r.blockIndex,relativePosition:r.blockIndex/Math.max(txs.length-1,1),treatment:r.treatment,units:r.units,price:r.price,dispatchOrder:r.sendOrder}))};
 });
 writeFileSync(`${runDir}/block-context.json`,JSON.stringify(results,null,2)+'\n');
 console.log(`Saved competition context for ${results.length} blocks. Compute totals are sums of reported values, not measured saturation.`);
}
