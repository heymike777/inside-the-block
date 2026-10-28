import {measurementDirectories} from './datasets.mjs';
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { plan, analyze, MAINNET_GENESIS, digest } from './core.mjs';
import { rpcClient } from './rpc.mjs';
const [command = 'plan', input] = process.argv.slice(2);
const out = process.env.OUTPUT_DIR || 'data';
if (process.argv.includes('--live') && command !== 'run') throw Error('--live is supported only for run');
mkdirSync(out, { recursive: true });
function save(name, value) { writeFileSync(`${out}/${name}`, JSON.stringify(value, null, 2) + '\n'); }
try {
  if (command === 'plan' || command === 'demo') {
    const batches = plan();
    save('plan.json', { seed: 20261028, batches, transactionsPerValidator: batches.length * 4, minimumValidators: 6, minimumVersionStrings: 3, hash: digest(batches) });
    if (command === 'demo') save('demo-analysis.json', analyze([{ synthetic: true, price: 10, blockIndex: 0 }]));
    console.log(`Saved deterministic ${batches.length}-batch plan. No transactions sent.`);
  } else if (command === 'attribute') {
    const {attributeRun}=await import('./attribution.mjs');
    const rows=await attributeRun(input,`${out}/client-attribution.jsonl`);
    console.log(`Attributed ${rows.filter(r=>r.clientId).length} of ${rows.length} observations from contemporaneous gossip.`);
  } else if (command === 'reproduce-all' || command === 'expanded-reproduce') {
    if (!input) throw Error('Usage: reproduce-all results');
    const {integrity} = await import('./integrity.mjs');
    const {verify} = await import('./verify.mjs');
    const {context} = await import('./context.mjs');
    const {report} = await import('./report.mjs');
    const {narrative} = await import('./narrative.mjs');
    const allDirectories = readdirSync(input,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>`${input}/${d.name}`).sort();
    for(const dir of allDirectories) if(existsSync(`${dir}/integrity.json`)) integrity(dir);
    const prefix=command==='expanded-reproduce'?'expanded-':'main-';
    const directories=measurementDirectories(input,prefix);
    if (!directories.length) throw Error('No main datasets found');
    for (const dir of directories) {verify(dir);context(dir);}
    const {attributeRun}=await import('./attribution.mjs');
    const files=[];for(const dir of directories){const name=dir.split('/').at(-1),file=`${out}/${name}.attributed.jsonl`;await attributeRun(dir,file);const published=`${input}/attribution/${name}.jsonl`;if(existsSync(published)&&!readFileSync(file).equals(readFileSync(published)))throw Error(`Published temporal attribution differs from raw replay: ${name}`);files.push(file);}
    report(files,out);narrative(files,`${out}/REPORT.md`,{analysisPath:command==='expanded-reproduce'?'results/expanded-analysis':'results/analysis'});
  } else if (command === 'narrative') {
    const {narrative} = await import('./narrative.mjs');
    narrative(process.argv.slice(3),`${out}/REPORT.md`);
  } else if (command === 'export') {
    const {exportRun} = await import('./export.mjs');
    exportRun(input,process.argv[4]);
  } else if (command === 'reproduce') {
    if (!input) throw Error('Usage: reproduce results/main');
    const {integrity} = await import('./integrity.mjs');
    integrity(input);
    const {verify} = await import('./verify.mjs');
    const {context} = await import('./context.mjs');
    const {report} = await import('./report.mjs');
    verify(input); context(input); report([`${input}/observations.jsonl`],out);
  } else if (command === 'context') {
    const {context} = await import('./context.mjs');
    context(input);
  } else if (command === 'verify') {
    const {verify} = await import('./verify.mjs');
    verify(input);
  } else if (command === 'preflight') {
    const {preflight} = await import('./preflight.mjs');
    await preflight(out);
  } else if (command === 'wallets') {
    const { wallets } = await import('./wallets.mjs');
    await wallets();
  } else if (command === 'report') {
    const { report } = await import('./report.mjs');
    report(process.argv.slice(3), out);
  } else if (command === 'run' || command === 'collect') {
    const runner = await import('./run.mjs');
    if (command === 'run') await runner.run(process.argv.slice(3), out);
    else await runner.collect(input);
  } else if (command === 'discover') {
    const rpc = rpcClient(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', event => appendFileSync(`${out}/discovery-rpc.jsonl`, JSON.stringify(event) + '\n'));
    if (await rpc('getGenesisHash') !== MAINNET_GENESIS) throw Error('Not mainnet');
    const epoch = await rpc('getEpochInfo', [{ commitment: 'finalized' }]);
    const nodes = await rpc('getClusterNodes');
    const schedule = await rpc('getLeaderSchedule', [epoch.absoluteSlot, { commitment: 'finalized' }]);
    const votes = await rpc('getVoteAccounts');
    const stake = new Map(votes.current.map(v => [v.nodePubkey, v.activatedStake]));
    const firstSlot = epoch.absoluteSlot - epoch.slotIndex;
    const candidates = nodes.filter(n => n.version && schedule?.[n.pubkey]).map(n => ({ identity: n.pubkey, version: n.version, featureSet: n.featureSet, activatedStake: stake.get(n.pubkey) || 0, upcomingSlots: schedule[n.pubkey].map(s => s + firstSlot).filter(s => s > epoch.absoluteSlot + 32) })).filter(n => n.upcomingSlots.length);
    save('candidates.json', { capturedAt: new Date().toISOString(), epoch, candidates });
    console.log(`Saved ${candidates.length} candidates. Exact version strings do not prove client fork identity.`);
  } else if (command === 'analyze') {
    if (!input) throw Error('Usage: analyze data/observations.jsonl');
    const rows = readFileSync(input, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    save('analysis.json', analyze(rows));
  } else throw Error(`Unknown command: ${command}`);
} catch (e) { console.error(e.message); process.exitCode = 1; }
