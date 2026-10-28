import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Budget, plan, analyze, digest } from '../src/core.mjs';
test('spend reservations survive restart and ambiguous submission', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'block-')), 'budget.jsonl');
  new Budget(file, 100).reserve('one', 60);
  const budget = new Budget(file, 100);
  assert.throws(() => budget.reserve('two', 41));
  assert.throws(() => budget.reserve('one', 1));
  assert.throws(() => budget.reserve('three', -1));
  budget.reserve('two', 40);
  assert.equal(new Budget(file, 100).used, 100);
  assert.throws(() => new Budget(file, 99));
  writeFileSync(file, '{broken');
  assert.throws(() => new Budget(file));
});
test('balanced reproducible design and equal-fee control', () => {
  const batches = plan();
  assert.equal(batches.length, 72);
  assert.equal(digest(batches), digest(plan()));
  assert.notEqual(digest(batches), digest(plan(123)));
  for (const b of batches) {
    assert.equal(b.cells.length, 4);
    if (b.treatment === 'equal-fee') assert.deepEqual(b.cells.map(c => c.priorityLamports), [100, 100, 100, 100]);
    assert.equal(new Set(b.cells.map(c => c.payer)).size, b.locks === 'shared-payer' ? 1 : 4);
  }
});
test('analysis never pools validators, versions, blocks or failed transactions', () => {
  const base = {live:true,onTarget:true,status:'finalized',validator:'a', version:'v', slot:1, batch:'b'};
  const rows = [{...base,price:10,blockIndex:0},{...base,price:0,blockIndex:1}, {...base,price:20,blockIndex:2,error:{failed:true}}, {...base,slot:2,price:30,blockIndex:0}, {...base,synthetic:true,price:99,blockIndex:9}];
  const result = analyze(rows);
  assert.equal(result.groups.length,2);
  assert.equal(result.groups[0].concordant,1);
  assert.equal(result.groups[0].discordant,0);
});
