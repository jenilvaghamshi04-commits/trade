const assert=require('node:assert/strict');require('./engine.js');const E=global.PatternEngine;
const bars=a=>a.map((c,i)=>({t:i*60000,T:(i+1)*60000-1,o:c,h:c+0.2,l:c-0.2,c,v:10}));
assert.equal(E.rsi(bars(Array(60).fill(100))),50);
assert.equal(E.rsi(bars(Array.from({length:80},(_,i)=>100+i))),100);
assert.equal(E.rsi(bars(Array.from({length:80},(_,i)=>200-i))),0);
assert.equal(E.macd(bars(Array(100).fill(100))).histogram,0);
let qualified;
for(let slope=0.05;slope<1&&!qualified;slope+=0.05){for(let amplitude=1;amplitude<20&&!qualified;amplitude++){let a=bars(Array.from({length:120},(_,i)=>1000+i*slope+amplitude*Math.sin(i*.4)));let p=a.at(-1);p.c=Math.max(...a.slice(-21,-1).map(x=>x.h))+0.1;p.h=p.c+0.1;p.v=20;let r=E.inspect(a);if(r.qualified&&r.side==='LONG')qualified={a,r}}}
assert(qualified,'A valid long setup should pass every filter');const {a,r}=qualified;assert(r.rsiOk&&r.macdOk&&r.volume&&r.trigger&&r.trend);
let insufficient=a.map(x=>({...x}));insufficient.at(-1).v=0;assert.equal(E.inspect(insufficient).qualified,false);
let mirrored=a.map(x=>({...x,o:3000-x.o,c:3000-x.c,h:3000-x.l,l:3000-x.h}));let sr=E.inspect(mirrored);assert.equal(sr.side,'SHORT');assert(sr.qualified);
const over=bars(Array.from({length:120},(_,i)=>1000+i));over.at(-1).v=20;assert.equal(E.inspect(over).qualified,false);assert.equal(E.inspect(over).rsiOk,false);
for(const side of ['LONG','SHORT']){const t=E.open({side,entry:80000,atr:400,balance:1000,risk:.5});assert(t);assert(t.qty*t.entry+t.entryFee<=1000);assert(Math.abs(E.result(t,t.stop).net+5)<1e-9);assert.equal(E.exitReason(t,t.stop),'Stop-loss');assert.equal(E.exitReason(t,t.tp2),'Target 2');assert.equal(E.exitReason(t,t.entry),null);assert(E.result(t,t.tp2).net>0)}
console.log('RSI edge cases, MACD flat, long/short qualification, volume and RSI rejection, fees, stop and target passed.');
