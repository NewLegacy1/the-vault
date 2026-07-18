---
topic: ops-replay-live-calibration-protocol
researched: 2026-07-18
sources: 6
agent-cycle: cycle3-laneB
---
# Replay→Live Calibration Protocol: Measuring the One-Tick-Candle Handicap with Pre-Registered Metrics

*Extends `execution-latency-reaction-time-replay-realism.md` (the mechanics of why replay differs) and `limit-order-fill-modeling-queue-position.md` (fill-mode taxonomy). This note is the operational protocol: what to log, for how long, and what counts as "live matches replay."*

## Key findings

- **The replay handicap has a specific sign for each Dual46 component, and two of the three favor live.** (a) *Decision latency*: replay candles form in one tick, so the trader reacts to a completed bar with zero forming-bar information — live tape gives continuous intra-bar information, so pre-staging should get *faster*, not slower (this matches the June finding that missed A+ setups were pre-staging latency). (b) *Fill optimism*: replay fills limits at touch with no queue — live fills will be *worse* (see fill-modeling note). (c) *Psychological pressure*: replay allows pause/step; live does not — error rate under time pressure is unmeasured and can only degrade. Net direction of replay→live drift is therefore not knowable a priori; it must be measured per component. (Synthesis of TradingView bar-replay docs, ChartMini replay-limitations review, FX Replay transition guides.)
- **CLAIM (practitioner consensus, no academic figure): 30–100 trades of sim-live forward test is the standard bridge before sizing up.** ForexMechanics prescribes ≥50 demo trades as an *execution* test (not an edge test) and ≥100 micro-live trades measuring slippage/spread/partials; FX Replay's checklist is 50–100 trades with "metrics match backtest within a reasonable range." At Dual46's ~15–17 candidate events/month, that is **2–3 months of sim-live** for the low end. No published figure found for a one-trade/day mechanical strategy specifically — the sample-size note's binomial math is the better guide (WR CI at n=30 is ±17pp; only gross divergence is detectable early).
- **The statistically honest pass criterion is a confidence-interval test, not a point comparison.** The EdgeTools/TradingView validation protocol formalizes it: live metrics (expectancy, WR, fill rate) must fall inside the bootstrap 95% CI built from the replay-baseline trade list; a live Sharpe/expectancy below the CI lower bound is evidence of structural (execution-model) divergence, not variance. CUSUM control charts on per-trade deviation from replay-mean detect drift earlier than monthly summaries.
- **Pre-registration is the anti-rationalization device.** All sources converge: define the metrics, thresholds, and the go/no-go rule *before* the first live-sim session, in writing. Otherwise every miss gets explained away ("that one doesn't count") and the calibration sample is silently curated. This mirrors the event-study pre-registration doctrine already in the Vault charter.
- **Rule adherence must be scored separately from P&L.** FX Replay: "Did you take every valid signal? Did you avoid every invalid signal? That matters more than whether you made money" in the first N sessions. A profitable month with 3 unlogged improvisations is a *failed* calibration month.
- **No published figure found for the replay-vs-live fill-rate gap on wick-anchored limits.** The measurement protocol below is the substitute: the June/May replay ledger already contains per-trade fill modes; live-sim produces the same columns; the gap estimate is the difference of proportions with its CI.

## Details / mechanics

**What "one-tick candle" cost the replay baseline, restated as measurable quantities:**
1. *Reaction-time term*: in replay, order-staging happens after bar completion (bar paints at once → user reacts late by construction). Live metric: `t_stage − t_trigger_bar_close` in seconds. Replay pseudo-baseline: effectively one replay-step (≥ the bar interval); live target: order staged before the next 1m bar closes, ideally pre-armed during the forming bar.
2. *Fill-model term*: replay counts touch-fills. Live metric: fill mode per trade (limit-clean / limit-trade-through / converted / missed) — columns already prescribed by the fill-modeling note. Comparable replay number: re-score the May/June ledger under the trade-through rule first, so live is compared to the *corrected* baseline, not the optimistic one.
3. *Price term*: replay entry = planned limit price by definition. Live metric: `fill_price − planned_price` in ticks (signed; adverse positive).
4. *Decision-quality term*: replay allows pause. Live metric: count of improvised deviations per session (any action not in the pre-trade plan).

**The pre-registered calibration sheet (write it down before session 1):**

| # | Metric | Definition | Replay baseline | Alarm threshold |
|---|--------|-----------|-----------------|-----------------|
| 1 | Setup detection rate | valid setups flagged in-session ÷ valid setups found in EOD review | ~100% (replay, unlimited time) | <90% over 10 sessions |
| 2 | Staging latency | seconds from trigger confirmation to bracket resting | n/a (replay can't measure) | order not resting before next bar close |
| 3 | Fill rate on limits | filled ÷ (filled + missed-touch) | re-scored trade-through baseline | outside 95% CI of baseline |
| 4 | Entry delta | fill − plan, ticks, signed | 0 by construction | mean > +2 ticks over 10 fills |
| 5 | Conversion frequency | converted ÷ total entries | June baseline (conversion rule events) | drift >2× baseline |
| 6 | Rule adherence | sessions with zero improvisations ÷ sessions | n/a | any session with ≥2 improvisations |
| 7 | Expectancy (R) | mean R per trade | May+June replay ledger | below bootstrap 95% CI lower bound |

**Duration and staging:** minimum 20 sessions (≈1 month) before *any* metric is compared formally; 40–60 events (2.5–4 months) before expectancy comparison means anything (binomial CI math). Metrics 1–6 (execution metrics) converge much faster than metric 7 (edge metric) — expect to certify execution first and edge later, and resist reading edge signals into the first month.

**Session protocol:** (a) pre-market: write the plan (levels, sizes, stand-down windows); (b) in-session: trade the plan, log timestamps at trigger/stage/fill; (c) EOD: re-scan the session bars as if in replay, count setups missed live, fill the calibration row. The EOD re-scan is the direct replay-vs-live A/B on the *same* session — this is the cleanest measurement of the one-tick-candle handicap available anywhere, because every other comparison confounds different market days.

## APPLICATION TO THE VAULT

- **Re-score the May/June replay ledger under trade-through fills BEFORE live-sim starts.** The live comparison baseline must be the corrected one; otherwise live will "underperform" by exactly the touch-fill optimism and the transition will look like edge decay when it is fill-model correction.
- **Journal fields to add for live-sim (the calibration row):** `t_trigger`, `t_staged`, `fill_mode` (limit-clean/trade-through/converted/missed), `entry_delta_ticks`, `improvise_count`, `eod_missed_setups`. Six fields, one row per session — the entire protocol is ~1 minute of logging per day.
- **Pre-register now, in the walk plan:** the seven metrics above, the alarm thresholds, and the rule "no sizing up and no rule changes until 20 sessions are logged and metrics 1–6 are green." Print it; don't renegotiate it in-session.
- **Expected direction, written down so it can be falsified:** staging latency should *improve* vs replay (live forming bars > one-tick candles — the June pre-staging misses should shrink); fill rate should *degrade* vs touch-counting replay (queue reality); expectancy should hold within CI once fills are scored consistently. If staging latency does NOT improve live, the June "we'll do better live" hypothesis is false and the arm→limit workflow needs the topic-59 fixes instead.
- **Guardrail unchanged:** this protocol measures execution, it does not authorize touching Dual46 parameters. Any red metric feeds the post-May backlog, not the frozen rules.

## Sources

1. ForexMechanics — Demo accounts, backtesting, forward testing & market replay (50-demo/100-micro-live prescription, slippage-measurement table): https://forexmechanics.com/platforms-tools/demo-backtesting/
2. FX Replay — From Backtest to Real Trades (50–100 trade bridge, rule-adherence-first doctrine): https://fxreplay.com/learn/from-backtest-to-real-trades-making-the-transition-with-confidence
3. FX Replay — Backtesting vs Live Trading: What Most Traders Get Wrong (fill/slippage divergence, behavioral vs outcome logging): https://fxreplay.com/learn/backtesting-vs-live-trading-what-most-traders-get-wrong
4. EdgeTools (TradingView) — The Complete Strategy Validation Protocol (bootstrap-CI pass criterion, CUSUM live monitoring, paper-trade gate metrics): https://www.tradingview.com/chart/ES1!/3R6sNhO1-The-Complete-Strategy-Validation-Protocol/
5. TradingView — Bar Replay: how and why to test a strategy in the past (official statement of replay capabilities/limits): https://www.tradingview.com/support/solutions/43000712747-bar-replay-how-and-why-to-test-a-strategy-in-the-past/
6. ChartMini — TradingView Bar Replay limitations review (bar-by-bar only; tick replay Ultimate-only, 7 days; no execution simulation): https://chartmini.com/blog/tradingview-bar-replay-alternative-free
