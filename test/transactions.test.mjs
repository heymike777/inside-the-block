import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSigner } from '@solana/kit';
import { buildProbe } from '../src/transactions.mjs';
test('offline signing creates distinct probes with one signature', async () => {
  const signer = await generateKeyPairSigner();
  const life = {blockhash:'11111111111111111111111111111111',lastValidBlockHeight:100};
  const a = await buildProbe(signer,life,{units:20000,price:1000},'a');
  const b = await buildProbe(signer,life,{units:20000,price:1000},'b');
  assert.notEqual(a.signature,b.signature);
  assert.equal(Buffer.from(a.wire,'base64')[0],1);
  assert.ok(a.message.length > 0);
});
