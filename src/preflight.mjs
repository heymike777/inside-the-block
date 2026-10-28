import {readFileSync,writeFileSync} from 'node:fs';
import {createKeyPairSignerFromBytes} from '@solana/kit';
import {rpcClient} from './rpc.mjs';
import {MAINNET_GENESIS,plan} from './core.mjs';
import {buildProbe} from './transactions.mjs';
export async function preflight(out) {
 const rpc=rpcClient(process.env.RPC_URL);
 if(await rpc('getGenesisHash')!==MAINNET_GENESIS)throw Error('Not mainnet');
 const paths=process.env.KEYPAIR_PATHS?.split(',');if(paths?.length!==4)throw Error('Need four keypairs');
 const signers=await Promise.all(paths.map(async p=>createKeyPairSignerFromBytes(Uint8Array.from(JSON.parse(readFileSync(p.trim(),'utf8'))))));
 const life=(await rpc('getLatestBlockhash',[{commitment:'confirmed'}])).value;
 const cells=[...new Map(plan(20261028,1).flatMap(b=>b.cells).map(c=>[`${c.units}:${c.price}`,c])).values()];
 const results=[];
 for(const cell of cells){
  const probe=await buildProbe(signers[cell.payer],life,cell,`preflight:${cell.units}:${cell.price}`);
  const sim=(await rpc('simulateTransaction',[probe.wire,{encoding:'base64',sigVerify:true,commitment:'confirmed'}])).value;
  const fee=(await rpc('getFeeForMessage',[probe.message,{commitment:'confirmed'}])).value;
  results.push({cell,error:sim.err,unitsConsumed:sim.unitsConsumed,fee,logs:sim.logs});
 }
 writeFileSync(`${out}/preflight.json`,JSON.stringify({at:new Date().toISOString(),results},null,2)+'\n');
 if(results.some(r=>r.error||!r.fee))throw Error('Preflight failed; inspect data/preflight.json');
 console.log(`${results.length} unique probe budgets simulated successfully. No transactions sent.`);
}
