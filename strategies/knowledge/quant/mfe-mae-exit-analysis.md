---
topic: mfe-mae-exit-analysis
researched: 2026-07-17
sources: 8
agent-cycle: cycle2-wave1
---
# MFE/MAE Exit Analysis: E-Ratio Methodology, Capture Ratio, and the Evidence on Scaling Out vs All-In/All-Out

## Key findings
- **MFE/MAE is the only per-trade dataset that lets you evaluate exits separately from entries.** MAE = worst open excursion against the position; MFE = best open excursion in favor. The closed P&L conflates entry quality and exit quality; the excursion pair de-conflates them (DayTrading.com; forex-basics). Definitional, not opinion.
- **The edge ratio (e-ratio, Curtis Faith, *Way of the Turtle*) measures entry edge independent of any exit rule**: normalize each trade's MFE and MAE by ATR at entry, average across trades, take avg(nMFE)/avg(nMAE). Random entries converge to ≈1.0; anything persistently >1.0 is entry edge (StrategyQuant; IASG; DayTrading.com). The e-ratio is *time-indexed* — e5, e10, e50 computed over 5/10/50 bars from entry — and the shape of e(t) tells you when the edge decays, which is exit information. Data-backed methodology; the specific >1.5 threshold some tools use is practitioner convention.
- **Capture ratio = avg realized gain / avg MFE of winners.** Practitioner benchmarks: retail typically captures 50–60% of winner MFE; 70–80% is considered professional-grade (forex-basics). Opinion-grade benchmarks, but the metric itself is a clean diagnostic: low capture → targets too near or exits too early; capture near 100% with low WR → targets too far.
- **Scaling out raises nominal win rate but the systematic backtest evidence says it usually lowers expectancy and total return.** Enlightened Stock Trading's RealTest study of partial-profit-taking inside a trend system: *every* tested combination of profit target × position-reduction fraction reduced compound return, and all but one outlier produced equal-or-worse MAR, though every combination did reduce max drawdown. Bulkowski's tests (thepatternsite) agree in both directions: scaling out reduced profit on winners *and* worsened losers, and "the closer the profit target is to the entry price, the more the average profit is reduced." Data-backed for trend/breakout systems.
- **The honest summary of the partials trade-off**: partials convert expectancy into equity-curve smoothness and win-rate optics. QuantStrategy.io's comparison frames it as WR up / average payoff down, with all-in/all-out (AIAO) "often superior for mean-reversion and high-frequency strategies where transaction costs matter" and scaling out more defensible for long-horizon trend following. An Elite Trader simulation found scaling out gave the lowest trade-return stddev but was beaten on return/maxDD by a simple time stop — and the strongest counterargument on record is that the smoothness partials buy can be replicated by just trading smaller, without giving up the payoff tail. Mix of data and reasoned practitioner argument.
- **Caveat that keeps this honest**: most published partial-exit backtests are trend-following systems with unbounded right tails, where the case against partials is strongest (partials amputate the tail that pays for everything). For a *capped* 5R payoff there is no unbounded tail to amputate, so the expectancy penalty of partials is smaller — but it is still a penalty whenever the remainder would have reached the cap, and the June-style profile (most winners running to full target) is exactly the profile partials hurt.

## Details / mechanics
**E-ratio procedure** (Faith via StrategyQuant/IASG):
1. For each signal, record MFE and MAE over a fixed horizon of t bars.
2. Divide each by ATR(14) at entry (volatility normalization; makes trades comparable across regimes).
3. e(t) = mean(normalized MFE) / mean(normalized MAE).
4. Plot e(t) for t = 1, 2, 5, 10, 20… bars. Rising e(t) → edge still developing (exits too early cost money); flat/declining e(t) → edge exhausted (holding costs money).

**Capture ratio**: C = mean(realized R of winners) / mean(MFE-in-R of winners). Forex-basics' remediation menu when C < ~0.7: push target toward 0.8×avg-MFE, or trail by ATR, or take partial + trail remainder — each with the explicit warning that a wider target lowers WR, a trailing stop clips in high vol, and partials cost expectancy.

**Partials arithmetic in R-units** (why WR optics improve while E falls). Take a p=0.65, all-out 5R system, E = 0.65×5 − 0.35 = +2.90R. Convert to "half off at +2R, runner to 5R, stop unchanged":
- Full winner leg: 0.5×2R + 0.5×5R = 3.5R on the ~65% of trades that reach target.
- The new "saved" category — trades that reach +2R then reverse to the stop — earn 0.5×2 − 0.5×1 = +0.5R instead of −1R. Whether E rises or falls depends entirely on what fraction f of eventual full losers actually touched +2R first vs what fraction of eventual 5R winners you halved. With June-like behavior (winners mostly go straight to target; losers mostly fail early and never see +2R), f is small, so the scheme forfeits ~1.5R on every winner to rescue almost nothing: E ≈ 0.65×3.5 − 0.35×1 ≈ +1.93R, a ~33% expectancy haircut. The MAE/MFE ledger, not theory, supplies the real f.
- This is the measurement that decides the Powell-partials question — it cannot be answered from WR/RR headline stats.

**MAE-based stop audit** (standard use, complements the existing stop-placement note): histogram MAE of *winners* — the stop only needs to sit beyond the winner-MAE cluster; anything wider buys nothing but smaller position size. If many winners have MAE near 90–100% of stop distance, the stop is load-bearing and tightening it would convert winners to losers.

## APPLICATION TO THE VAULT
- **Start logging MFE and MAE (in points and in R) for every May-walk replay take, now.** This is close to free during replay (note the extreme adverse/favorable prints while the trade is open) and it is the single dataset that later answers, with the frozen study's own trades: (a) the Powell partials question, (b) the Powell BE-move question, (c) whether the 100-pt cap clips real MFE. Without it, every post-walk Stage-0 exit question becomes an opinion contest.
- **The frozen all-in/all-out convention is the evidence-aligned default for this strategy class.** Retracement limit entries at a fixed 5R capped target look like the AIAO-favoring case in the published comparisons (short-horizon, capped payoff, cost-sensitive). Keep the freeze; do not adopt partials mid-walk.
- **Compute three numbers from the May+June combined ledger once MFE/MAE exists**: (1) capture ratio of winners vs the 100-pt cap — if winners' MFE routinely exceeds the cap, the cap is a measurable expectancy tax and *that* (not partials) is the highest-value exit question; (2) fraction of losers that touched +2R before stopping — this is the only quantity that can make partials-at-2R positive-expectancy; (3) e(t) curve of the entry itself, as the frozen study's entry-quality benchmark for any future B3/B4 variant.
- **Prediction to test, written down before the data arrives** (per the sample-size note's pre-registration discipline): given June's profile (losers died early, winners ran), expect loser-touched-+2R fraction < 20% and partials-at-2R to cost ≥ 0.5R/trade of expectancy. If the May data contradicts this, that is genuinely interesting and belongs in the Stage-0 queue with numbers attached.
- **Do not evaluate partials by win rate.** Scaling out mechanically manufactures "wins" (any positive trade counts), which will make the discretionary-sleeve-vs-script comparison lie. Expectancy in R per trade-slot, per the charter's prop-math hierarchy, is the only fair metric.

## Sources
1. StrategyQuant — Edge Ratio in StrategyQuant X (Faith's e-ratio, ATR normalization, computation steps): https://strategyquant.com/blog/edge-ratio-in-strategyquant-x/
2. DayTrading.com — Edge Ratio (E-Ratio) (definition, exit-evaluation use, subjectivity caveats): https://www.daytrading.com/edge-ratio
3. IASG — Measuring the Edge of Entry Signals (time-indexed R5/R10/R50 ratios, random-entry ≈1.0 baseline): https://www.iasg.com/blog/2015/06/09/every-investor-needs-an-edge-whats-yours
4. Curtis Faith, *Way of the Turtle* (e-ratio origin; summary via Bookey): https://www.bookey.app/book/way-of-the-turtle
5. forex-basics — MAE and MFE: Trade Analysis and Stop/TP Calibration (capture ratio, 50–60% retail vs 70–80% professional benchmarks): https://forex-basics.com/practice/mae-mfe-trade-analysis/
6. Enlightened Stock Trading — Trend Following Profit Targets: Do They Work? (RealTest partial-profit study: all combinations reduced return; drawdown reduced; MAR worse): https://enlightenedstocktrading.com/trend-following-profit-targets-do-they-work/
7. QuantStrategy.io — Scaling Out vs All-In All-Out: A Data-Driven Backtesting Comparison (WR-up/payoff-down trade-off; AIAO favored for mean reversion): https://quantstrategy.io/blog/scaling-out-vs-all-in-all-out-a-data-driven-backtesting/
8. Bulkowski, thepatternsite — Scaling Out (tests: scaling out worse on winners and losers; BE stop after scale-out "dramatically reduces profit"): https://www.thepatternsite.com/ScalingOut.html
