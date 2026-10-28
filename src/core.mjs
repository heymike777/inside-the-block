import { appendFileSync, existsSync, readFileSync, openSync, fsyncSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
export const MAINNET_GENESIS = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function shuffle(items, random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function plan(seed = 20261028, repeats = 12) {
  if (!Number.isSafeInteger(repeats) || repeats < 1 || repeats > 100) throw Error('Invalid repeats');
  const random = rng(seed), result = [];
  for (const locks of ['shared-payer', 'independent-payers']) {
    for (const treatment of ['price', 'limit', 'equal-fee']) {
      for (let repeat = 0; repeat < repeats; repeat++) {
        const cells = [0, 1, 2, 3].map(i => {
          const units = treatment === 'price' ? 20000 : [10000, 20000, 40000, 80000][i];
          const price = treatment === 'price' ? [0, 1000, 10000, 100000][i] : treatment === 'equal-fee' ? 100000000 / units : 10000;
          return { units, price, priorityLamports: Math.ceil(units * price / 1e6), payer: locks === 'shared-payer' ? 0 : (i + repeat) % 4 };
        });
        result.push({ id: `${locks}-${treatment}-${repeat}`, locks, treatment, repeat, cells: shuffle(cells, random).map((x, sendOrder) => ({ ...x, sendOrder })) });
      }
    }
  }
  return result;
}
// Append + fsync BEFORE submission. Ambiguous sends remain reserved forever.
// Caller must hold exclusive process lock for the entire live session.
export class Budget {
  constructor(path, cap = 50000000) {
    if (!Number.isSafeInteger(cap) || cap < 1 || cap > 50000000) throw Error('Cap must be 1..50000000 lamports');
    this.path = path; this.cap = cap;
    this.entries = existsSync(path) ? readFileSync(path, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
    this.used = this.entries.reduce((sum, e) => {
      if (!Number.isSafeInteger(e.lamports) || e.lamports <= 0) throw Error('Invalid budget journal');
      return sum + e.lamports;
    }, 0);
    if (this.used > cap) throw Error('Existing reservations exceed cap');
  }
  reserve(signature, lamports) {
    if (this.entries.some(e => e.signature === signature)) throw Error('Already reserved');
    if (!Number.isSafeInteger(lamports) || lamports < 1 || this.used + lamports > this.cap) throw Error('Spend cap exceeded or invalid fee');
    const entry = { signature, lamports, at: new Date().toISOString() };
    const fd = openSync(this.path, 'a', 0o600);
    try { appendFileSync(fd, JSON.stringify(entry) + '\n'); fsyncSync(fd); } finally { closeSync(fd); }
    this.entries.push(entry); this.used += lamports;
  }
}
export function digest(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export function analyze(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (row.synthetic || row.live !== true || row.onTarget !== true || row.status !== 'finalized' || row.error || !row.version || !Number.isInteger(row.blockIndex)) continue;
    const key = JSON.stringify([row.validator, row.version, row.slot, row.batch]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const results = [];
  for (const [key, group] of groups) {
    let concordant = 0, discordant = 0, ties = 0;
    for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
      const a = group[i], b = group[j];
      if (a.price === b.price) { ties++; continue; }
      if ((a.price - b.price) * (a.blockIndex - b.blockIndex) < 0) concordant++; else discordant++;
    }
    results.push({ stratum: JSON.parse(key), landed: group.length, concordant, discordant, ties });
  }
  return { note: 'Descriptive within-block pairs; correlated pairs are not independent samples. No causal scheduler claim.', groups: results };
}
