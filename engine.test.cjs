const assert=require('node:assert/strict');require('./engine.js');const E=globalThis.PatternEngine;
let bars=Array.from({length:120},(_,i)=>({t:i*60000,T:(i+1)*60000-1,o:100+i,c:100+i+.4,h:100+i+.8,l:100+i-.5,v:10}));
assert.equal(E.inspect(bars.slice(0,20)),null);
bars.at(-1).c=224;bars.at(-1).h=225;bars.at(-1).v=20;let s=E.inspect(bars);assert.equal(s.pattern,'Range breakout');assert.equal(s.side,'LONG');assert(s.qualified);
bars.at(-1).v=1;assert(!E.inspect(bars).qualified);
const mirrored=bars.map(x=>({...x,o:500-x.o,c:500-x.c,h:500-x.l,l:500-x.h,v:20}));mirrored.at(-1).v=40;assert.equal(E.inspect(mirrored).side,'SHORT');assert(E.inspect(mirrored).qualified);
for(const side of ['LONG','SHORT']){const t=E.open({side,entry:80000,atr:400,balance:1000,risk:.5});assert(t);assert(t.qty*t.entry+t.entryFee<=1000);assert(Math.abs(E.result(t,t.stop).net+5)<1e-9);assert.equal(E.exitReason(t,t.stop),'Stop-loss');assert.equal(E.exitReason(t,t.tp2),'Target 2');assert.equal(E.exitReason(t,t.entry),null);assert(E.result(t,t.tp2).net>0);}
assert.equal(E.open({side:'LONG',entry:100,atr:1,balance:1000,risk:-1}),null);assert.equal(E.open({side:'SHORT',entry:100,atr:1,balance:1000,risk:NaN}),null);
console.log('Pattern direction, volume gate, both trade directions, fee-adjusted loss and notional cap passed.');
