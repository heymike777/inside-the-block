import {readFileSync,writeFileSync} from 'node:fs';
import {analyze} from './core.mjs';
import {windowStatistics} from './statistics.mjs';
import {diagnostics} from './diagnostics.mjs';
export function report(files,out) {
  if (!files.length) throw Error('Usage: report run1/observations.jsonl [run2/observations.jsonl ...]');
  const rows=files.flatMap(f=>readFileSync(f,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse));
  const unique=[...new Map(rows.map(r=>[r.signature,r])).values()];
  const phases=new Set(unique.filter(r=>r.live).map(r=>r.phase??'pilot-v1'));
  if(phases.size>1) throw Error('Do not pool different experiment phases; report them separately');
  const eligible=unique.filter(r=>r.live===true && r.status==='finalized' && r.onTarget===true && !r.error && r.version);
  const validators=new Set(eligible.map(r=>r.validator));
  const versions=new Set(eligible.map(r=>r.version));
  const dates=[...new Set(eligible.map(r=>r.blockTime?new Date(r.blockTime*1000).toISOString().slice(0,10):'unknown'))];
  const fees=unique.filter(r=>r.status==='finalized').reduce((s,r)=>s+(r.actualFee||0),0);
  const perValidator=[...Map.groupBy(eligible,r=>r.validator)].map(([identity,group])=>{
    const windows=Map.groupBy(group,r=>r.targetSlot);
    const whole=[...windows.values()].filter(w=>w.length===4 && new Set(w.map(r=>r.slot)).size===1).length;
    return `| ${identity} | ${[...new Set(group.map(r=>r.version))].join(', ')} | ${[...new Set(group.map(r=>r.clientId).filter(Boolean))].join(', ')||'unattributed'} | ${group.length} | ${windows.size} | ${whole} |`;
  });
  const check=diagnostics(unique);
  writeFileSync(`${out}/diagnostics.json`,JSON.stringify(check.coverage,null,2)+'\n');
  writeFileSync(`${out}/full-burst-window-statistics.json`,JSON.stringify(check.fullBurstStatistics,null,2)+'\n');
  const result=analyze(unique);
  writeFileSync(`${out}/window-statistics.json`,JSON.stringify(windowStatistics(unique),null,2)+'\n');
  writeFileSync(`${out}/analysis.json`,JSON.stringify(result,null,2)+'\n');
  const lines=[ '# Measurement report', '', `Generated: ${new Date().toISOString()}`, '', `Unique attempts: ${unique.length}. Eligible successful on-target transactions: ${eligible.length}.`, `Validators: ${validators.size}; exact version strings: ${versions.size}. Measurement dates (UTC): ${dates.join(', ')||'none'}.`, `Finalized transaction fees: ${fees} lamports. This does not include unresolved reservations, wallet funding or other campaigns.`, '', '## Coverage gate', '', validators.size>=6 && versions.size>=3?'Minimum identity/version counts met. Advertised client IDs and per-condition coverage are reported separately; they are not binary attestations.':'INCOMPLETE: minimum six validators / three versions not met.', '', '## Per-validator coverage', '', '| Identity | Version(s) | Advertised clientId(s) | Eligible transactions | Leader windows | All four in one block |', '|---|---|---|---:|---:|---:|', ...perValidator, '', '## What went wrong', '', `Unresolved: ${unique.filter(r=>r.status!=='finalized').length}.`, `Failed on chain: ${unique.filter(r=>r.error).length}.`, `Landed on another leader: ${unique.filter(r=>r.status==='finalized'&&!r.onTarget).length}.`, '', 'Review events.jsonl for missed windows, RPC errors, simulation failures and reservation totals. Missing observations are not random; compare landing rates by treatment before interpreting ordering.', '', '## Findings', '', 'No causal scheduler rule is automatically inferred. Inspect analysis.json by validator, version, slot and batch. Pair counts within a batch are dependent. A version string alone cannot establish a client family.', '', '## Limits', '', 'RPC forwarding and transport delay are not observed at the validator. Block serialization is observable; internal scheduling decisions and exact execution start times are not. Cross-slot order is excluded. Failed, unresolved, off-target and synthetic rows are excluded from ordering comparisons. Block competition, packet loss and account locks can affect inclusion. Do not mix upgrade regimes.', ''];
  writeFileSync(`${out}/report.md`,lines.join('\n'));
}
