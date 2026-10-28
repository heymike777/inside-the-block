import test from 'node:test';
import assert from 'node:assert/strict';
import {windowStatistics} from '../src/statistics.mjs';
test('window bootstrap does not compare transactions across slots',()=>{
 const b={live:true,onTarget:true,status:'finalized',validator:'v',version:'1',locks:'shared',treatment:'price',batch:'p',targetSlot:1,priorityLamports:0,units:20000,sendOrder:0};
 const rows=[{...b,slot:1,price:10,blockIndex:0},{...b,slot:1,price:0,blockIndex:1},{...b,targetSlot:2,slot:2,price:10,blockIndex:1},{...b,targetSlot:2,slot:2,price:0,blockIndex:0},{...b,targetSlot:3,slot:3,price:100,blockIndex:0},{...b,targetSlot:3,slot:4,price:0,blockIndex:1}];
 const x=windowStatistics(rows,100).results.find(x=>x.predictor==='price');
 assert.equal(x.informativeWindows,2);assert.equal(x.meanWindowConcordance,.5);assert.equal(x.bootstrap95,null);
 assert.deepEqual(windowStatistics(rows,100),windowStatistics(rows,100));
});
