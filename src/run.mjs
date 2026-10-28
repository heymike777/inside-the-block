import { mkdirSync, readFileSync, writeFileSync, appendFileSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { createKeyPairSignerFromBytes, generateKeyPairSigner } from '@solana/kit';
import { rpcClient } from './rpc.mjs';
import { Budget, MAINNET_GENESIS, plan, digest } from './core.mjs';
import { buildProbe } from './transactions.mjs';
import { provenance } from './provenance.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function run(args, out) {
  const live = args.includes('--live');
  const configPath = args.find(x => !x.startsWith('--'));
  if (!configPath) throw Error('Usage: run config.json [--live]');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  if (!Array.isArray(config.targets) || !config.targets.length) throw Error('Missing targets');
  const batches = plan(config.seed ?? 20261028, config.repeats ?? 12);
  const cap = config.capLamports ?? 50000000;
  const runId = randomUUID();
  const dir = `${out}/${runId}`; mkdirSync(dir, { recursive: true });
  const log = (name, event) => appendFileSync(`${dir}/${name}.jsonl`, JSON.stringify({ at: new Date().toISOString(), ...event }) + '\n');
  const rpc = rpcClient(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', e => log('rpc', e));
  let lock;
  try {
    // One shared journal + exclusive lock across all runs in OUTPUT_DIR.
    if (live) lock = openSync(`${out}/live.lock`, 'wx', 0o600);
    const budget = new Budget(`${out}/budget.jsonl`, cap);
    if (await rpc('getGenesisHash') !== MAINNET_GENESIS) throw Error('Not mainnet');
    const nodes = await rpc('getClusterNodes');
    const targetVersions = new Map();
    for (const target of config.targets) {
      const node = nodes.find(n => n.pubkey === target.identity);
      if (!node?.version || node.version !== target.version) throw Error(`Target version missing/changed: ${target.identity}`);
      targetVersions.set(target.identity, node.version);
    }
    if (new Set(config.targets.map(t => t.identity)).size !== config.targets.length) throw Error('Duplicate target');
    const keyPaths = process.env.KEYPAIR_PATHS?.split(',').map(s => s.trim()).filter(Boolean) || [];
    if (live && keyPaths.length !== 4) throw Error('Live mode requires four funded keypair files via KEYPAIR_PATHS');
    const signers = live ? await Promise.all(keyPaths.map(async p => createKeyPairSignerFromBytes(Uint8Array.from(JSON.parse(readFileSync(p, 'utf8')))))) : await Promise.all(Array.from({length:4}, () => generateKeyPairSigner()));
    if (new Set(signers.map(s => s.address)).size !== 4) throw Error('Independent payers must be distinct');
    const epoch = await rpc('getEpochInfo', [{commitment:'confirmed'}]);
    const schedule = await rpc('getLeaderSchedule', [epoch.absoluteSlot, {commitment:'confirmed'}]);
    const first = epoch.absoluteSlot - epoch.slotIndex;
    const windows = config.targets.flatMap(t => {
      const slots = (schedule?.[t.identity] || []).map(s => s + first);
      return slots.filter((s,i) => i===0 || s!==slots[i-1]+1).filter(s => s > epoch.absoluteSlot + 16).map(slot => {
        let endSlot=slot; while (slots.includes(endSlot+1)) endSlot++;
        return {slot,endSlot,identity:t.identity,version:t.version};
      });
    }).sort((a,b) => a.slot-b.slot);
    const completed = new Set();
    for (const previous of config.resumeFrom ?? []) {
      const old = JSON.parse(readFileSync(`${previous}/manifest.json`,'utf8'));
      if(old.designHash!==digest(batches) || old.config.phase!==config.phase || old.config.sendMode!==config.sendMode) throw Error('Resume design/phase mismatch');
      const attempts=readFileSync(`${previous}/attempts.jsonl`,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
      for(const row of attempts) {
        const target=config.targets.find(t=>t.identity===row.targetValidator);
        if(target?.version===row.version) completed.add(`${row.targetValidator}:${row.batch}`);
      }
    }
    const queues = new Map(config.targets.map(t => [t.identity, batches.filter(b=>!completed.has(`${t.identity}:${b.id}`))]));
    const manifest = {provenance:provenance(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'),runId, live, startedAt:new Date().toISOString(), config, designHash:digest(batches), payerAddresses:signers.map(s=>s.address), epoch, delivery:`JSON-RPC ${config.sendMode??'sequential'} forwarding, maxRetries=0, skipPreflight=true; arrival at validator unobserved`, budgetPath:resolve(out,'budget.jsonl')};
    writeFileSync(`${dir}/manifest.json`, JSON.stringify(manifest,null,2));
    if (!windows.length) throw Error('No future windows in current epoch; rediscover later');
    const started = Date.now(), maxWait = config.maxWaitSeconds ?? 600;
    if (!Number.isFinite(maxWait) || maxWait <= 0 || maxWait > 86400) throw Error('Invalid maxWaitSeconds');
    for (const window of windows) {
      const queue = queues.get(window.identity);
      if (Date.now()-started > maxWait*1000) break;
      if (!queue.length) continue;
      // Prepare only near the target window, so blockhash is fresh.
      let slot = await rpc('getSlot', [{commitment:'processed'}]);
      while (slot < window.slot - 8 && Date.now()-started < maxWait*1000) { await sleep(500); slot = await rpc('getSlot',[{commitment:'processed'}]); }
      if (Date.now()-started >= maxWait*1000) break;
      if (slot >= window.slot) { log('events',{type:'missed-window',...window,slot}); continue; }
      const batch = queue[0];
      const lifetime = (await rpc('getLatestBlockhash',[{commitment:'confirmed'}])).value;
      const probes = await Promise.all(batch.cells.map(async cell => ({cell, ...await buildProbe(signers[cell.payer],lifetime,cell,`itb:${runId.slice(0,8)}:${batch.id}:${cell.sendOrder}`)})));
      for (const probe of probes) {
        const simulation = await rpc('simulateTransaction',[probe.wire,{encoding:'base64',sigVerify:true,commitment:'processed'}]);
        // Dry-run ephemeral unfunded payers can fail balance checks. Record, never hide it.
        if (live && simulation.value.err) throw Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
        probe.simulationError = simulation.value.err;
        probe.quotedFee = (await rpc('getFeeForMessage',[probe.message,{commitment:'confirmed'}])).value;
        if (live && (!Number.isSafeInteger(probe.quotedFee) || probe.quotedFee <= 0)) throw Error('Fee quote unavailable');
      }
      if (live) {
        if (budget.used + probes.reduce((sum,p)=>sum+p.quotedFee,0) > cap) throw Error('Batch exceeds remaining spend cap');
        for (let i=0;i<4;i++) {
          const required = probes.filter(p=>p.cell.payer===i).reduce((sum,p)=>sum+p.quotedFee,0);
          const balance = (await rpc('getBalance',[signers[i].address,{commitment:'confirmed'}])).value;
          if (balance < required) throw Error(`Insufficient fee balance for payer ${i}`);
        }
      }
      const versionNow = (await rpc('getClusterNodes')).find(n=>n.pubkey===window.identity)?.version;
      if (versionNow !== window.version) throw Error('Validator changed version before send');
      while ((slot = await rpc('getSlot',[{commitment:'processed'}])) < window.slot && Date.now()-started < maxWait*1000) await sleep(80);
      if (slot > window.endSlot || Date.now()-started >= maxWait*1000) { log('events',{type:'missed-version-check',...window,slot}); continue; }
      const records = [];
      const submit = async (probe) => {
        const row = {runId,phase:config.phase??'pilot-v2',signature:probe.signature, batch:batch.id, ...probe.cell, locks:batch.locks,treatment:batch.treatment,targetValidator:window.identity,version:window.version,targetSlot:window.slot,observedSendSlot:slot,lastValidBlockHeight:lifetime.lastValidBlockHeight,simulationError:probe.simulationError,quotedFee:probe.quotedFee,live,sendStartedMs:performance.now()};
        if (live) budget.reserve(probe.signature,probe.quotedFee);
        log('attempts',row); // Persist signature before any possibly ambiguous submission.
        if (live) {
          try {
            const returned = await rpc('sendTransaction',[probe.wire,{encoding:'base64',skipPreflight:true,maxRetries:0}]);
            if (returned !== probe.signature) throw Error('RPC returned different signature');
            log('events',{type:'rpc-accepted',signature:probe.signature,ackMs:performance.now()});
          } catch (e) { log('events',{type:'send-unknown',signature:probe.signature,message:e.message}); }
        }
        records.push(row);
      };
      if (config.sendMode === 'burst') await Promise.all(probes.map(submit));
      else for (const probe of probes) await submit(probe);
      queue.shift();
      log('events',{type:'batch-finished',batch:batch.id,...window,reservedLamports:budget.used});
      // One batch/window. Collection is a separate resumable read-only command.
    }
    log('events',{type:'run-finished',remainingBatches:Object.fromEntries([...queues].map(([id,q])=>[id,q.length])),reservedLamports:budget.used});
    console.log(`${live?'Live':'Dry'} run saved to ${dir}`);
  } finally {
    if (lock !== undefined) { closeSync(lock); unlinkSync(`${out}/live.lock`); }
  }
}
export async function collect(runDir) {
  const manifest = JSON.parse(readFileSync(`${runDir}/manifest.json`,'utf8'));
  if (!manifest.live) throw Error('No on-chain evidence in dry-run');
  const attempts = readFileSync(`${runDir}/attempts.jsonl`,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  const rpc = rpcClient(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', e => appendFileSync(`${runDir}/collection-rpc.jsonl`,JSON.stringify(e)+'\n'));
  if (await rpc('getGenesisHash') !== MAINNET_GENESIS) throw Error('Not mainnet');
  const rows = [], cache = new Map();
  for (const attempt of attempts) {
    const status = (await rpc('getSignatureStatuses',[[attempt.signature],{searchTransactionHistory:true}])).value[0];
    if (!status || status.confirmationStatus !== 'finalized') { rows.push({...attempt,status:'unresolved'}); continue; }
    if (!cache.has(status.slot)) {
      const block = await rpc('getBlock',[status.slot,{encoding:'json',transactionDetails:'full',rewards:false,maxSupportedTransactionVersion:1,commitment:'finalized'}]);
      const leaders = await rpc('getSlotLeaders',[status.slot,1]);
      cache.set(status.slot,{block,validator:leaders[0]});
      writeFileSync(`${runDir}/block-${status.slot}.json`,JSON.stringify({slot:status.slot,validator:leaders[0],block}));
    }
    const {block,validator} = cache.get(status.slot);
    const index = block?.transactions.findIndex(t=>t.transaction.signatures[0]===attempt.signature) ?? -1;
    if (index < 0) throw Error('Finalized signature absent from reported block');
    const tx = block.transactions[index];
    rows.push({...attempt,runId:manifest.runId,phase:attempt.phase??'pilot-v1',slot:status.slot,blockTime:block.blockTime,validator,blockIndex:index,error:tx.meta.err,actualFee:tx.meta.fee,computeUnitsConsumed:tx.meta.computeUnitsConsumed,status:'finalized',onTarget:validator===attempt.targetValidator,version:validator===attempt.targetValidator?attempt.version:null});
  }
  writeFileSync(`${runDir}/observations.jsonl`,rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
  console.log(`Collected ${rows.length} observations; unresolved signatures retained.`);
}
