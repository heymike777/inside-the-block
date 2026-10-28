import test from 'node:test';
import assert from 'node:assert/strict';
import {rpcClient} from '../src/rpc.mjs';
test('transient reads retry, submission never retries',async()=>{
 const original=globalThis.fetch;let calls=0;const log=[];
 try{
  globalThis.fetch=async()=>++calls===1?new Response('',{status:502}):Response.json({result:42});
  assert.equal(await rpcClient('https://synthetic.invalid',r=>log.push(r))('getSlot'),42);
  assert.equal(calls,2);assert.equal(log[0].httpStatus,502);
  calls=0;globalThis.fetch=async()=>{calls++;return new Response('',{status:503});};
  await assert.rejects(rpcClient('https://synthetic.invalid')('sendTransaction',['synthetic']),/HTTP 503/);
  assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
