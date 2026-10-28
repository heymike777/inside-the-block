import {rng} from './core.mjs';
export const PREDICTORS = { price:1, priorityLamports:1, units:-1, sendOrder:-1 };
export function windowStatistics(rows, iterations=2000, seed=20261028) {
  const strata=new Map();
  for(const r of rows) {
    if(r.live!==true || r.onTarget!==true || r.status!=='finalized' || r.error || !r.version || !Number.isInteger(r.blockIndex)) continue;
    const key=JSON.stringify([r.validator,r.version,r.locks,r.treatment]);
    if(!strata.has(key)) strata.set(key,new Map());
    const windows=strata.get(key), id=JSON.stringify([r.runId??'',r.targetSlot,r.batch]);
    if(!windows.has(id)) windows.set(id,[]);
    windows.get(id).push(r);
  }
  const random=rng(seed), results=[];
  for(const [stratum,windows] of strata) for(const [predictor,direction] of Object.entries(PREDICTORS)) {
    const scores=[];
    for(const group of windows.values()) {
      let c=0,d=0;
      for(let i=0;i<group.length;i++) for(let j=i+1;j<group.length;j++) {
        const a=group[i],b=group[j];
        // Compare only transactions serialized in the same block; partial windows remain explicit.
        if(a.slot!==b.slot || a[predictor]===b[predictor]) continue;
        if(direction*(a[predictor]-b[predictor])*(a.blockIndex-b.blockIndex)<0)c++;else d++;
      }
      if(c+d) scores.push(c/(c+d));
    }
    const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
    const samples=[];
    if(scores.length>=5) for(let k=0;k<iterations;k++) samples.push(mean(scores.map(()=>scores[Math.floor(random()*scores.length)])));
    samples.sort((a,b)=>a-b);
    results.push({stratum:JSON.parse(stratum),predictor,informativeWindows:scores.length,meanWindowConcordance:scores.length?mean(scores):null,bootstrap95:samples.length?[samples[Math.floor(samples.length*.025)],samples[Math.floor(samples.length*.975)]]:null});
  }
  return {minimumWindowsForInterval:5,method:'Equal-weight window concordance, percentile cluster bootstrap within validator/version/lock/treatment. Exploratory marginal intervals; no multiple-testing correction or causal interpretation. Partial landing may bias results.',seed,iterations,results};
}
