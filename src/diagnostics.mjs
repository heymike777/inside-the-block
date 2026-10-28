import {windowStatistics} from './statistics.mjs';
export function diagnostics(rows){
 const groups=Map.groupBy(rows,r=>JSON.stringify([r.runId,r.targetValidator,r.targetSlot,r.batch]));
 const fullRows=[],strata=new Map();
 for(const group of groups.values()){
  const sample=group[0],key=JSON.stringify([sample.targetValidator,sample.targetVersion??sample.version,sample.targetClientId??sample.clientId??null,sample.locks,sample.treatment]);
  if(!strata.has(key))strata.set(key,{stratum:JSON.parse(key),attempts:0,batches:0,finalized:0,successfulOnTarget:0,offTarget:0,failed:0,unresolved:0,completeSameBlockBatches:0,straddlingBatches:0,unattributedOnTarget:0});
  const s=strata.get(key);s.batches++;s.attempts+=group.length;
  const good=group.filter(r=>r.status==='finalized'&&r.onTarget&&!r.error);
  s.finalized+=group.filter(r=>r.status==='finalized').length;s.successfulOnTarget+=good.length;
  s.offTarget+=group.filter(r=>r.status==='finalized'&&!r.onTarget).length;s.failed+=group.filter(r=>r.error).length;s.unresolved+=group.filter(r=>r.status!=='finalized').length;s.unattributedOnTarget+=good.filter(r=>!r.clientId).length;
  if(new Set(good.map(r=>r.slot)).size>1)s.straddlingBatches++;
  if(group.length===4&&new Set(group.map(r=>r.signature)).size===4&&good.length===4&&new Set(good.map(r=>r.slot)).size===1){s.completeSameBlockBatches++;fullRows.push(...good);}
 }
 const blocks=Map.groupBy(rows.filter(r=>r.status==='finalized'&&r.onTarget&&!r.error),r=>`${r.validator}:${r.slot}`);
 const coResidentNominalWindows=[...blocks.values()].filter(a=>new Set(a.map(r=>`${r.runId}:${r.targetSlot}:${r.batch}`)).size>1).length;
 return {coverage:{coResidentNominalWindows,batches:groups.size,completeSameBlockBatches:fullRows.length/4,strata:[...strata.values()]},fullBurstStatistics:windowStatistics(fullRows)};
}
