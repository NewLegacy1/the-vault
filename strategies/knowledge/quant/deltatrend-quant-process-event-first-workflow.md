---
topic: deltatrend-quant-process-event-first-workflow · researched: 2026-07-18 · sources: 6 · agent-cycle: cycle2-deltatrend
---
# DeltaTrend's Strategy-Development Workflow: Events First, Features Second, Model Third

Synthesis of the "Quant Process" series (episodes 01–03), "Build Your Own Trading Strategy," "Will Your Trading Strategy MAKE MONEY?", and "Is Orderflow Imbalance Tradable?" from DeltaTrend Trading (Thomas Skinner — Columbia applied-physics student, institutional-trader father, founder of QuantPad). All transcripts archived at `vault-app/data/deltatrend-transcripts/`.

## Key findings

- **The workflow he teaches** (CLAIM, consistent across all three Quant Process episodes): define an *event* (which bars are in scope) → label *outcomes* (double-barrier or forward-return) → engineer *contextual features* that explain why the same event has different outcomes → quantify the multi-dimensional relationship → only then build signal processing + risk protocol → validate with bootstrap/MC → deploy. This is structurally identical to the Vault's existing Track B event-study loop.
- **Don't sample every candle** (CLAIM): "when we sample at random times instead of actually defining events... we're just trying to forecast noise" [quant-process-03, 1:37–1:45]. Event frequency is a tradeoff — too frequent = forecasting noise, too infrequent = no sample [2:21–2:32]. Consistent with `quant/event-study-methodology-intraday-setups.md`.
- **Discretion is unquantified feature engineering** (CLAIM): "all your discretion is... is just a multi-dimensional pattern between features that you've engineered mentally but haven't actually quantified and the outcomes of your trades" [quant-process-02, 12:16–12:26]. His corollary: almost everything retail calls discretion is programmable.
- **Same event, different eras, different answer** (EVIDENCE, shown on screen): his ES previous-day-high/low sweep study had a statistically significant *negative* EV for the bearish case in 2023, but over 2022–2025 (512 events) the 95% CI widened to include zero [quant-process-02, 25:56–26:39]. He uses this to motivate contextual features; it's equally a regime-instability warning — see `quant/walk-forward-testing-overfitting-prevention.md`.
- **WR and avg RR are collapsed statistics; path questions need resampling** (CLAIM): win rate and average RR "don't do the job of expected value... but they also don't do the descriptive job of some sort of Monte Carlo simulation, something that actually explains path dependency" [will-your-strategy, 0:10–0:23]. Prop-firm pass probability is explicitly listed as a path-dependent question that only resampling answers [2:56–3:08].
- **Contemporaneous ≠ predictive** (EVIDENCE): reproducing the Cont et al. order-flow-imbalance paper, he matched the published result (paper 65% R², his reproduction 63% — same-window), then lagged the imbalance by one 10-second bin: "the explanatory power collapses by 78 times the moment you lag the imbalance" [orderflow, 4:54–5:00]. A strong correlation measured in the same window as the outcome is a statement about price formation, not a signal.
- **Public strategies are (per his argument) definitionally edge-free** (CLAIM with cited literature): he cites a publication-effect paper estimating edges lose ~25% of returns after publication plus ~10% statistical bias [build-your-own, 2:25–2:47]. The rhetoric is partly channel-marketing, but the alpha-decay logic is standard.

## Details / mechanics

**Feature taxonomy** (quant-process-02): by value — continuous (ATR, normalized SMA distance), binary flags (liquidity swept? FVG tap?), ordinal buckets (vol regime 1–5); by purpose — *event-defining* (what's in scope), *contextual* (why outcomes differ: regime, trend efficiency, time-of-day, wick/body ratio), *reference* (prior session high/low — inputs to other features), *outcome* (double-barrier à la stop/TP, or N-bar forward return). Price-scaled features must be normalized (percent or z-score) or the asset's price level dominates the model — he demos this with an SMA-slope indicator across a decade of price inflation [17:51–19:29].

**Event-defining features** (quant-process-03): examples include breakout candles, prior-session sweeps, NWOG/NDOG ("a new day opening gap, a new week opening gap" [2:48–2:50] — directly the Vault's NWOG sleeve), volatility compression→expansion, news (CPI/FOMC), CUSUM movement detectors with ATR-normalized thresholds so high-vol regimes don't spam events. His edge heuristic: "it's either better data or better interpretation" [3:56–3:58]. His Bitcoin CUSUM demo (EVIDENCE) showed forward-return box plots indistinguishable from random once 2024 drift is accounted for — his own point being that raw events without context are not signals.

**Validation stack** (will-your-strategy + series framing): historical EV → bootstrap CI on EV → resampled equity paths for drawdown/final-balance/barrier questions. The EV formula and the "EV is just the mean of the return distribution; WR is just the mass on each side" framing matches `quant/expectancy-math-wr-rr-capped-payoffs.md`.

**QuantPad** (his product, disclosed throughout): AI IDE with natural-language feature research, Pine Script strategy generation with a custom TradingView linter, bootstrap/MC validation, regime analysis, feature-correlation surfacing, and a prop-firm assistant. Covered in more depth in `deltatrend-monte-carlo-markov-prop-convexity.md`.

## APPLICATION TO THE VAULT

1. **Confirms the event-study loop.** `scripts/analyze-event-study.ts` already samples 10:00 KO events rather than every bar, labels barrier outcomes, and demands baselines — his workflow is the same shape. Nothing to change structurally; this is independent convergence on the methodology in `quant/event-study-methodology-intraday-setups.md`.
2. **Extends it: era-split the event EV.** His ES sweep result (significant in 2023, not in 2022–2025) is a concrete argument for reporting Stage-0 event stats per-year/per-regime, not pooled. Post-May backlog: add a year-split (or vol-regime-split) column to the event-study script output so a candidate that only worked in one era is visible before Stage-0 promotion.
3. **Lag-check every feature.** The orderflow 78× collapse is the cleanest demonstration in the archive of why contextual features must be computable *strictly before* the entry decision. Audit any future event-study feature for same-window leakage (e.g. using the full 10:00 bar's range to condition an entry inside that bar).
4. **Vindicates the Dual46 mechanization.** "Discretion = unquantified features" is exactly what Dual46 did to Powell's discretionary RB teaching: froze the feature set (KO leave direction, freeze-leg fib, OTE zone, 1m RB) into rules. His framing supports keeping it frozen rather than re-adding discretion.
5. **QuantPad as an evaluation candidate only** for the "waiting for TV export" bottleneck: it claims CME futures data (full-history OHLCV to 1-second, 1yr tick, 1mo L2), programmatic backtesting, MC, and prop-challenge assessment — i.e. everything the Vault currently waits on manual TradingView Deep Backtest exports for. Unverified marketing from the vendor himself; would need a hands-on trial against a known Dual46 export before trusting any number from it. Not a recommendation.
6. **Guardrail unchanged:** none of this reopens killed Track B candidates or touches the Dual46 freeze; it informs the post-May backlog only.

## Sources

- The Quant Process 01 — How Trading Is Actually Done: https://www.youtube.com/watch?v=M3-0LfZMsz4
- The Quant Process 02 — Turning Data Into Meaning: https://www.youtube.com/watch?v=TEVRiSNxs50
- The Quant Process 03 — STOP Sampling EVERY CANDLE: https://www.youtube.com/watch?v=Zu4sL5u-WyU
- Build Your Own Trading Strategy: https://www.youtube.com/watch?v=fIEwVmJJ06s
- Will Your Trading Strategy MAKE MONEY?: https://www.youtube.com/watch?v=MCnFrUxZARU
- Is Orderflow Imbalance Tradable?: https://www.youtube.com/watch?v=IHZLyff3FgE
- Transcripts: `vault-app/data/deltatrend-transcripts/` (fetch script `vault-app/scripts/fetch-deltatrend-transcripts.ts`)
