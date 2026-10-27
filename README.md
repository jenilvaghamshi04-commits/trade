# BTC Pattern Lab

Live Binance BTC/USDT spot chart, transparent pattern rules, and a browser-local paper trading simulator.

## Run
`npm start` serves port 10000, or the value of `PORT`. No dependencies or API keys are required. See RENDER.md for Docker deployment settings.

## Observe and test
1. Select a timeframe (1m offers a quicker test).
2. Choose 1, 3, 5 or 10 new candle closes and press **Start observing**.
3. The app analyses up to 120 completed candles, showing trend, the prior 20-bar range, and a breakout or EMA pullback when detected.
4. After the observation period, a qualifying pattern opens one demo position if automatic demo is checked. Otherwise use **Open confirmed demo**. No qualifying pattern means no trade.
5. **Open practice now** opens a manual long/short at the observed live price to test simulator controls. It does not represent a pattern signal.

### Defined rules
- Breakout: close above the previous 20-bar high (long) or below the previous 20-bar low (short).
- Pullback: the previous candle touches EMA20 and closes back on the trend side; the current completed candle closes beyond the previous high/low.
- Both need price/EMA20/EMA50 trend alignment and volume >= 1.2x the previous 20-bar average. RSI(14), Wilder smoothed, must be 50–70 for a long or 30–50 for a short. MACD (12,26,9) must be above its signal line for a long or below for a short. These rules are experimental, not proven improvements.
- Pattern calculations use completed candles only. A candidate expires after one selected-timeframe candle.
- Observation counts new closed candles seen after starting. A missing interval resets the count. Changing timeframe stops observation.

### Demo execution and accounting
Starts at 1,000 virtual USDT. One position at a time. Entry is the observed live Binance trade price, not a historical candle close. Pattern trades require a fresh candle feed and entry within 0.35 ATR of the signal close; otherwise they wait. Stop distance is 1.5 times the 14-bar simple mean true range. Target 1 is informational at 1.5R; the entire position exits at Target 2 (2R) or stop. Actual exit uses the first observed trade price crossing a boundary, including overshoot.

Sizing includes estimated entry and stop-exit fees (0.05% each side), with notional capped at the virtual balance. No leverage or funding. Short trades are hypothetical spot-price directional simulations, not a futures execution model. Risk input is capped at 5%.

Realized balance equals initial balance plus all closed net results; equity includes open estimated net P/L after both fees. The indicator-strategy summary excludes practice trades, prior strategy versions and trades with monitoring gaps. History retains the latest 200 closes.

Keep the page open. State persists in this browser, but no background server monitors trades. Reloads, disconnects, missing trade IDs and stale execution data flag open trades as uncertain: automatic exits are suspended and manual close is required. The app does not invent outcomes for missed prices. Observation and automatic mode are not resumed on reload. Reset clears the virtual account.

## Validation
`node engine.test.cjs` and `node paper.test.cjs` test pattern direction/volume gating, fee-adjusted risk, notional caps, observation counting, practice open/close, monitoring gaps and timeframe changes.

Experimental rules have not been backtested or proven profitable. Public Binance access may be restricted in some regions. No real orders are sent.
