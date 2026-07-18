---
topic: execution-latency-reaction-time-replay-realism
researched: 2026-07-17
sources: 8
agent-cycle: wave-3
---
# Execution Latency: Human Reaction Time, Retail Order-Path Latency, Pre-Staged Orders, and Bar-Replay Realism

## Key findings
- **Human simple visual reaction time averages ~200–250 ms** — a large study in Frontiers in Human Neuroscience measured ~231 ms across ~1,500 subjects (cited in NexusFi platform-latency guide). No platform optimization removes this floor for reactive manual trading.
- **Retail futures order round-trip (click → broker risk check → CME Aurora → ack) is typically 50–200 ms**; co-located institutional firms do the same path in 200–500 µs, a ~300× gap (NexusFi broker-infrastructure guide, with the 8-step order path). Total manual reactive latency ≈ reaction time + platform + network ≈ 300–500 ms.
- **For discretionary traders, stability dominates raw speed**: "a manual trader will not notice the difference between 2 ms and 15 ms of latency — human reaction time is roughly 200–300 ms," but jitter, frozen DOMs, and disconnects are ruinous (Optimus Futures VPS guide; NexusFi).
- **Pre-staged orders eliminate the human term entirely.** A resting limit is already in the CME queue when the market arrives — latency 0 and queue priority accrues from placement time. Server-side native brackets (stop + target activate on parent fill, OCO-linked) remove exit reaction time as well and survive connection loss (NexusFi bracket-trading guide; Optimus Futures).
- **Latency matters by order type in opposite directions**: market orders pay execution latency as slippage; limit orders pay *data* latency — a limit placed off a stale DOM reacts to a market that already moved (NexusFi platform-latency guide).
- **Bar replay/backtest engines walk bars as a handful of synthetic ticks — TradingView's default is 4 ticks (O, H/L or L/H, C)** with the H/L order inferred heuristically; when both stop and target sit inside one bar, the engine effectively coin-flips which was hit first (TradingView Bar Detalization docs; PyneCore bar-magnifier docs put it at ~50/50 for that specific bar).
- **A large performance swing when toggling finer intrabar resolution (Bar Magnifier / high detalization) is a red flag that the edge lives inside intra-bar assumptions live trading cannot replicate** (AlphaInsider; TradingView docs recommend exactly this A/B comparison).

## Details / mechanics
**The retail order path (NexusFi, after @Fat Tails):** price change at exchange → UDP market data out → data provider → your screen (data latency, tens of ms) → perceive + decide + click (~230 ms+) → platform → broker gateway + margin check (1–10 ms) → broker → CME Aurora (4–8 ms from Chicago-proximate, tens of ms cross-country) → matching engine. The human stage is 10–100× larger than every technical stage combined for a retail setup.

**Reactive vs pre-staged, quantified for a fast open:** MNQ near 10:00 can move several points in 300–500 ms of combined reaction + transit. A reactive "I'll click when the wick forms" plan is structurally 1–3 points late on fast rejections. A pre-staged limit at a pre-computed level has zero reaction cost and better queue position (earlier timestamp = FIFO priority; see fill-modeling note). The trade-off: pre-staging commits to a level before final confirmation — the price of zero latency is occasionally being filled into a failed setup that confirmation would have skipped.

**What bar replay hides:**
1. *Intra-bar path:* a 1-minute bar in replay renders via a few synthetic ticks; the live tape delivered hundreds of trades in an order the OHLC cannot reconstruct. Whether a limit at the wick extreme filled before the bar reversed is *unknowable from the bar* — replay resolves this ambiguity, usually optimistically (TradingView bar detalization; PyneCore).
2. *No queue/liquidity:* replay fills at touch with infinite liquidity and no queue — the exact opposite of the FIFO reality at a single-touch wick extreme (NexusFi backtesting guides).
3. *No latency term:* the replay click is applied at the displayed price instantly; live, a reactive order lands 300–500 ms later.
4. *Decision-time compression:* replay lets the trader pause/step; live tape at the open forces decisions under time pressure — an unmeasured psychological latency and error-rate difference (general limitation noted across replay/backtest realism sources).
5. What replay *does* preserve: bar-close information sets. Decisions made only on completed bars with pre-staged orders transfer to live far better than intra-bar reactive decisions (AlphaInsider's repainting discussion — forming-bar signals are the divergence source).

**Practical rules synthesized:**
- Convert every reactive decision that can be pre-computed into a resting or bracket order before the trigger window (entry limit, stop, and capped target all staged server-side as a native bracket).
- Budget slippage for anything that must remain reactive: ≥1 tick/side on liquid index futures, more in fast markets (NexusFi backtesting guide, kevinkdog slippage figures).
- Validate replay results by re-running fills under a trade-through rule and a +1-tick adverse-entry assumption; the edge should survive both.

## APPLICATION TO THE VAULT
- **Their architecture is already latency-correct in shape** — resting limits at pre-identified wick levels with structural stops and fixed targets is the pre-staged pattern; the residual latency exposure is concentrated in exactly the two June failure events: the fallback market order (reactive, ~300–500 ms + slippage) and any manual stop/target adjustments mid-trade.
- **Make the bracket native and server-side.** Entry limit + stop beyond block extreme + min(5R, 100 pt) target should be one platform-native bracket so exits require zero reaction time and survive disconnects (NexusFi bracket guide: manual OCO risks orphan orders if the parent fails). For live forward-testing on a prop account this is also a trailing-drawdown protection.
- **The one-tick candle formation in replay flatters them twice at the wick:** (a) touch-fills at the extreme that FIFO would deny, and (b) certainty about H-before-L ordering inside the entry bar that the 4-tick walk fabricates. Before trusting the June 10W/5L, re-score the ledger under trade-through fills; and for any trade where stop and target were both inside one subsequent bar's range, flag the outcome as path-ambiguous rather than counted.
- **Live forward-test will add a measurable latency tax only where they improvise.** Pre-staged component: expect ~0 latency degradation vs replay (fills will differ due to queues, not speed). The fallback-to-market rule: budget 1–2 ticks slippage ($0.50–$1.00/contract on MNQ) — trivial against a 20-pt stop, so codifying the fallback (per the fill-modeling note) remains positive-EV even after the latency tax.
- **Instrument the gap during forward-test:** log for each live trade (i) order staged before or after trigger bar, (ii) slippage vs intended price, (iii) any decision made intra-bar. This isolates the replay-to-live degradation into fill-model error vs latency error vs decision-under-pressure error — three different fixes.

## Sources
1. NexusFi Academy — Platform Latency and Execution Speed (reaction-time study, data vs execution latency): https://nexusfi.com/a/platforms/platform-latency-execution-speed
2. NexusFi Academy — Futures Broker Technology Infrastructure (8-step order path, retail vs co-located): https://nexusfi.com/a/brokers/futures-broker-technology-infrastructure
3. NexusFi Academy — Bracket Trading for Futures (native server-side brackets, OCO mechanics): https://nexusfi.com/a/strategies/bracket-trading-futures
4. Optimus Futures — How to Choose a Trading VPS (stability vs speed for manual traders, server-side risk logic): https://optimusfutures.com/blog/best-trading-vps/
5. TradingView — Bar Detalization (4-tick OHLC replay model, high-detalization mode): https://www.tradingview.com/support/solutions/43000786180-bar-detalization/
6. TradingView — Script Executions (price-visibility / look-ahead masking on history ticks): https://www.tradingview.com/support/solutions/43000786178-script-executions/
7. PyneCore — Bar Magnifier docs (OHLC heuristic, 50/50 same-bar stop/target ambiguity): https://pynecore.org/docs/advanced/bar-magnifier/
8. AlphaInsider — TradingView Backtest vs Live Trading divergence (repainting, magnifier A/B red flag): https://blog.alphainsider.com/tradingview-backtest-vs-live-trading-why-they-diverge-and-how-to-fix-it/
