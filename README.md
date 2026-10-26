# BTC Pattern Lab

Live Binance BTC/USDT spot candlestick chart and experimental breakout setup monitor.

## Run
Serve this repository using any static HTTP server, e.g. `python3 -m http.server 8000`, then visit http://localhost:8000.

No API keys, build step or dependencies. Internet access to Binance public REST and WebSocket endpoints is required. Some regions may restrict Binance.

## Strategy
Selected timeframe, completed candles only: EMA20/EMA50 alignment, close beyond the previous 20-candle high/low, volume at least 1.2x prior 20-candle average. Stop distance is 1.5x 14-bar simple average true range; targets are 1.5R and 2R. Signals expire after one candle. Browser-local journal and optional sound operate only while the page is open.

This strategy has not been backtested or validated. No automated trading, guaranteed returns, outcome tracking or win-rate claims. Spot prices are not futures mark prices. Position sizing excludes fees, slippage and funding.
