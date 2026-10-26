(function(root){
  const ema=(a,n)=>a.reduce((v,c)=>v===null?c.c:c.c*2/(n+1)+v*(1-2/(n+1)),null);
  function inspect(bars){
    if(bars.length<60)return null;
    const c=bars.at(-1),p=bars.at(-2),prior=bars.slice(-21,-1),e20=ema(bars,20),e50=ema(bars,50);
    const up=c.c>e20&&e20>e50,down=c.c<e20&&e20<e50;
    const high=Math.max(...prior.map(x=>x.h)),low=Math.min(...prior.map(x=>x.l));
    const vol=c.v>=prior.reduce((s,x)=>s+x.v,0)/20*1.2;
    const atr=bars.slice(-14).reduce((s,x,i)=>{const pc=bars[bars.length-15+i].c;return s+Math.max(x.h-x.l,Math.abs(x.h-pc),Math.abs(x.l-pc))},0)/14;
    const breakout=(up&&c.c>high)||(down&&c.c<low);
    const old20=ema(bars.slice(0,-1),20);
    const pullback=(up&&p.l<=old20&&p.c>=old20&&c.c>p.h)||(down&&p.h>=old20&&p.c<=old20&&c.c<p.l);
    return {side:up?'LONG':down?'SHORT':null,pattern:breakout?'Range breakout':pullback?'EMA pullback':up?'Uptrend':down?'Downtrend':'Sideways / mixed',qualified:vol&&(breakout||pullback)&&atr>0,atr,trend:up||down,trigger:breakout||pullback,volume:vol,high,low,t:c.t,T:c.T};
  }
  function open({side,entry,atr,balance,risk,fee=0.0005}){
    if(!['LONG','SHORT'].includes(side)||![entry,atr,balance,risk,fee].every(Number.isFinite)||entry<=0||atr<=0||balance<=0||risk<=0||risk>5||fee<0)return null;
    const d=side==='LONG'?1:-1,distance=atr*1.5;
    if(entry-distance*2<=0)return null;
    // Total planned loss includes entry and stop-exit fee; cap notional at virtual balance.
    const stop=entry-d*distance,qty=Math.min(balance*risk/100/(distance+fee*(entry+stop)),balance/(entry*(1+fee)));
    return {side,entry,stop,tp1:entry+d*distance*1.5,tp2:entry+d*distance*2,qty,fee,entryFee:qty*entry*fee};
  }
  function result(t,exit){const gross=(exit-t.entry)*t.qty*(t.side==='LONG'?1:-1);const fees=t.entryFee+exit*t.qty*t.fee;return {gross,fees,net:gross-fees};}
  function exitReason(t,price){return t.side==='LONG'?(price<=t.stop?'Stop-loss':price>=t.tp2?'Target 2':null):(price>=t.stop?'Stop-loss':price<=t.tp2?'Target 2':null)}
  root.PatternEngine={inspect,open,result,exitReason};
})(typeof window==='undefined'?globalThis:window);
