const E=window.PatternEngine;
let paper;try{paper=JSON.parse(localStorage.getItem('btc-paper-v1')||'null')}catch{}
if(!paper||!Array.isArray(paper.history)||!Number.isFinite(paper.balance))paper={balance:1000,position:null,history:[],used:[]};
paper.used=paper.used||[];
if(paper.position)paper.position.gap=true;
let watching=false,seen=0,watchTF=interval,baseline=null,observation=null,marketPrice=0,marketAt=0,tradeSocket,tradeReconnect,lastTradeId=0;
const freshPrice=()=>marketPrice>0&&Date.now()-marketAt<10000;
const freshChart=()=>lastTick>0&&Date.now()-lastTick<15000;
const entryNear=()=>!!observation&&freshPrice()&&Math.abs(marketPrice-observation.close)<=observation.atr*.35;
function persistPaper(){try{localStorage.setItem('btc-paper-v1',JSON.stringify(paper))}catch{$('paperNote').textContent='Browser storage unavailable. Keep this page open; results will not persist.'}}
function gap(){if(paper.position&&!paper.position.gap){paper.position.gap=true;persistPaper()}renderPaper()}
function scan(){
  const bars=candles.filter(x=>x.closed===true||(x.closed!==false&&x.T<Date.now()));
  observation=E.inspect(bars.slice(-120));
  if(!observation){$('openSetup').disabled=true;$('testPaper').disabled=true;$('patternRead').textContent='Waiting for completed candles';return;}
  $('patternName').textContent=observation.pattern;
  $('rangeRead').textContent=fmt(observation.low)+' – '+fmt(observation.high);
  $('patternRead').textContent=observation.pattern+(observation.qualified?' · entry rules confirmed':' · entry rules not confirmed');
  $('sampleRead').textContent=bars.slice(-120).length+' completed '+interval+' candles';
  $('c2').textContent=observation.trigger?'✓':'○';
  $('c4').textContent=observation.rsiOk?'✓':'○';$('c5').textContent=observation.macdOk?'✓':'○';
  $('rsiValue').textContent=observation.rsi.toFixed(1);
  $('rsiStatus').textContent=observation.side?(observation.rsiOk?'Within '+observation.side+' range':'Outside '+observation.side+' range'):'No trend direction';
  $('macdValue').textContent=observation.macd.line.toFixed(2)+' / '+observation.macd.signal.toFixed(2);
  $('macdStatus').textContent=observation.macdOk?'Agrees with trend':'Does not confirm trend';
  $('volumeRatio').textContent=observation.volumeRatio.toFixed(2)+'×';$('atrValue').textContent=fmt(observation.atr)+' USDT';
  const missing=[];if(!observation.trend)missing.push('EMA trend');if(!observation.trigger)missing.push('pattern');if(!observation.volume)missing.push('volume');if(!observation.rsiOk)missing.push('RSI');if(!observation.macdOk)missing.push('MACD');
  $('filterReason').textContent=missing.length?'Waiting for: '+missing.join(', ')+'.':'All candle filters passed. '+(freshChart()&&entryNear()?'Live entry is within 0.35 ATR.':'Waiting for a fresh chart and an entry within 0.35 ATR of signal close.');
  if(watching&&watchTF!==interval){watching=false;seen=0;baseline=null;$('watchState').textContent='Timeframe changed. Start a new observation.';}
  if(watching){
    if(baseline===null)baseline=observation.t;
    else if(observation.t>baseline){seen=observation.t-baseline===ms()?seen+1:0;baseline=observation.t;}
    const need=+$('watchBars').value;
    $('watchState').textContent=seen<need?`Observing ${seen} / ${need} new closed candles · ${interval}`:'Observation complete · waiting for a qualified pattern';
    if(seen>=need&&observation.qualified&&Date.now()-observation.T<ms()&&freshChart()&&entryNear()&&$('autoPaper').checked&&!paper.position){openPaper(false);}
  }
  $('watchStart').textContent=watching?'Stop observing':'Start observing';
  $('openSetup').disabled=!(observation.qualified&&freshChart()&&entryNear()&&seen>=+$('watchBars').value&&watching&&!paper.position&&Date.now()-observation.T<ms());
  $('testPaper').disabled=!freshPrice()||!!paper.position||!(observation.atr>0);
}
function openPaper(practice){
  if(paper.position||!freshPrice()||!observation)return;
  if(!practice&&(!watching||seen<+$('watchBars').value||!observation.qualified||Date.now()-observation.T>=ms()||!freshChart()||!entryNear()))return;
  const key=interval+':'+observation.t;
  if(!practice&&paper.used.includes(key)){$('paperNote').textContent='This signal has already been tested.';return;}
  const t=E.open({side:practice?$('practiceSide').value:observation.side,entry:marketPrice,atr:observation.atr,balance:paper.balance,risk:+$('paperRisk').value});
  if(!t){$('paperNote').textContent='Enter a risk between 0.1% and 5%, with sufficient demo balance.';return;}
  paper.position={...t,opened:Date.now(),interval,pattern:practice?'Manual practice — not a signal':observation.pattern,strategyVersion:2,practice,gap:false,tp1Hit:false};
  if(!practice){paper.used.push(key);paper.used=paper.used.slice(-500)}
  $('paperNote').textContent=practice?'Practice trade opened at live price. This tests the simulator, not pattern performance.':'Pattern trade opened at the observed live price after the observation period.';
  persistPaper();renderPaper();scan();
}
function closePaper(reason){
  const t=paper.position;if(!t||!freshPrice())return;
  const result=E.result(t,marketPrice),closed={...t,...result,exit:marketPrice,closed:Date.now(),reason};
  paper.balance+=result.net;paper.history.unshift(closed);paper.history=paper.history.slice(0,200);paper.position=null;persistPaper();renderPaper();scan();
}
function renderPaper(){
  const t=paper.position;$('demoBalance').textContent=fmt(paper.balance)+' USDT';
  $('demoEquity').textContent=fmt(paper.balance+(t&&freshPrice()?E.result(t,marketPrice).net:0))+' USDT';
  $('demoFeed').textContent=freshPrice()?'Live trade ticks':'Waiting for trade feed';
  $('closePaper').disabled=!t||!freshPrice();
  $('positionRead').textContent=t?`${t.side} · ${t.practice?'PRACTICE':'PATTERN'} · ${t.interval}`:'No open demo position';
  $('tradePattern').textContent=t?t.pattern:'Observe the market or open a manual practice trade.';
  $('gapRead').textContent=t?.gap?'Monitoring gap detected. Earlier stop/target touches are unknown. Close manually; this result is excluded from pattern statistics.':'';
  ['entry','stop','tp1','tp2'].forEach(k=>$('p_'+k).textContent=t?fmt(t[k]):'—');
  $('p_qty').textContent=t?t.qty.toFixed(6)+' BTC':'—';
  $('p_pnl').textContent=t&&freshPrice()?fmt(E.result(t,marketPrice).net)+' USDT (after estimated fees)':'—';
  $('tp1Status').textContent=t?(t.tp1Hit?'Touched · informational only':'Waiting · full exit at Target 2'):'—';
  const tested=paper.history.filter(x=>!x.practice&&!x.gap&&x.strategyVersion===2);
  $('demoStats').textContent=`${tested.length} completed indicator strategy trades · ${tested.filter(t=>t.net>0).length} wins · ${fmt(tested.reduce((s,t)=>s+t.net,0))} USDT net. Practice, older strategy and monitoring-gap trades excluded.`;
  $('paperHistory').innerHTML=paper.history.length?paper.history.slice(0,20).map(t=>`<tr><td>${new Date(t.closed).toLocaleTimeString()}</td><td>${t.side}<br><span class="small">${t.practice?'Practice':t.pattern}${t.gap?' · gap':''}</span></td><td>${fmt(t.entry)} → ${fmt(t.exit)}</td><td>${t.reason}</td><td style="color:${t.net>=0?'#00dc82':'#f3747f'}">${fmt(t.net)}</td></tr>`).join(''):'<tr><td colspan="5" class="small">Completed demo trades will appear here.</td></tr>';
}
function tradeConnect(){
  clearTimeout(tradeReconnect);
  tradeSocket=new WebSocket('wss://data-stream.binance.vision:443/ws/btcusdt@trade');
  tradeSocket.onmessage=e=>{
    const tick=JSON.parse(e.data);if(!Number.isFinite(+tick.p)||+tick.p<=0||Date.now()-tick.E>10000)return;
    if(lastTradeId&&tick.t>lastTradeId+1)gap();
    if(tick.t<=lastTradeId)return;lastTradeId=tick.t;
    if(marketAt&&Date.now()-marketAt>10000)gap();marketPrice=+tick.p;marketAt=Date.now();
    const t=paper.position;if(t&&!t.gap){if(t.side==='LONG'?marketPrice>=t.tp1:marketPrice<=t.tp1){if(!t.tp1Hit){t.tp1Hit=true;persistPaper()}}const reason=E.exitReason(t,marketPrice);if(reason)closePaper(reason);}
    renderPaper();scan();
  };
  tradeSocket.onclose=()=>{gap();tradeReconnect=setTimeout(tradeConnect,3000)};
  tradeSocket.onerror=()=>tradeSocket.close();
}
$('watchStart').onclick=()=>{watching=!watching;seen=0;watchTF=interval;baseline=observation?.t??null;if(!watching)$('watchState').textContent='Observation stopped.';scan()};
$('watchBars').onchange=()=>{seen=0;baseline=observation?.t??null;scan()};
$('openSetup').onclick=()=>openPaper(false);$('testPaper').onclick=()=>openPaper(true);$('closePaper').onclick=()=>closePaper('Manual close');
$('resetPaper').onclick=()=>{paper={balance:1000,position:null,history:[],used:[]};watching=false;seen=0;baseline=null;persistPaper();$('watchState').textContent='Demo reset. Start observing to test a pattern.';renderPaper();scan()};
window.addEventListener('beforeunload',()=>{if(paper.position){paper.position.gap=true;persistPaper()}});
setInterval(()=>{if(!freshPrice())gap();scan();renderPaper()},1500);
renderPaper();tradeConnect();
