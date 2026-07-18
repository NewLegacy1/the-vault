---
topic: expectancy-math-wr-rr-capped-payoffs
researched: 2026-07-17
sources: 7
agent-cycle: wave-3
---
# Expectancy Math: The WR × RR Frontier, Capped-R Payoffs, and What Dollar Asymmetry Does (and Doesn't) Mean

## Key findings
- **Expectancy is the only single number that combines win rate and payoff**: E = p·W − (1−p)·L, or in risk units E(R) = p·R − (1−p) (Finaur; TradersSecondBrain; TradeZella). Win rate alone and payoff ratio alone are each "incomplete" — algebraically two views of the same object, since profit factor PF = p·R/(1−p) (TradingStats).
- **The breakeven frontier is p\* = 1/(1+R).** At R = 5 the breakeven win rate is 16.7%; at R = 3.33 it is 23.1%; at R = 1 it is 50% (Finaur breakeven table; TrendsAndBreakouts). Every (WR, RR) pair above the curve is positive-expectancy; distance above the curve, not either coordinate, is the edge.
- **A cap on reward truncates the payoff distribution from the right and silently degrades realized R.** A "fixed 1:5" target capped at an absolute point ceiling is only 1:5 when the stop is at or below cap/5; wider stops make realized R = cap/stop < 5, raising the breakeven win rate trade-by-trade (mechanics below; general principle in TrendsAndBreakouts: averaging across different risk sizes without normalizing to R produces misleading payoff ratios).
- **Expectancy per trade ≠ expectancy per unit time.** A +$20/trade system firing 200×/yr out-earns a +$50/trade system firing 30×/yr (TrendsAndBreakouts). For a one-setup-per-session strategy, E[$/week] = E per trade × setups/week × fill rate — the fill-rate term is part of the time-based expectancy, which is why missed fills are an expectancy problem, not just an annoyance.
- **Payoff/asymmetry ratios are extremely fragile in small samples.** One outlier winner can move a payoff ratio from 2.5 to 1.3 on removal; ratios above ~3 on small n should be treated as "exceptional — or a small sample. Verify before trusting" (TrendsAndBreakouts; Nexural). A 13.6:1 dollar asymmetry on 15 trades is a description of the sample, not an estimate of a population parameter.
- **Identical expectancy, different equity curves.** High-WR/low-R systems produce smooth curves with short losing streaks; low-WR/high-R systems produce long droughts punctuated by spikes — this matters for trailing-drawdown survival even when E is identical (TrendsAndBreakouts; connects to the existing Monte Carlo prop-survival note).
- **Expectancy must be computed net.** Commission + slippage per trade must come out of W and L before any judgment; small gross edges frequently go negative after costs (TradersSecondBrain; TradingStats).

## Details / mechanics
**The frontier.** Setting E(R) = p·R − (1−p) = 0 gives p\* = 1/(1+R). Useful reference points:

| Realized R | Breakeven WR | WR = 66.7% gives E(R) |
|---|---|---|
| 5.0 | 16.7% | +3.00 |
| 4.0 | 20.0% | +2.33 |
| 3.33 | 23.1% | +1.89 |
| 2.5 | 28.6% | +1.33 |

**How a point-cap reshapes the distribution.** With target = min(5 × stop, 100 pts) and stop set by structure (block extreme), realized R per trade is:
- stop ≤ 20 pts → R = 5 (cap not binding)
- stop > 20 pts → R = 100/stop (cap binding; e.g. 25-pt stop → 4R, 30-pt → 3.33R, 40-pt → 2.5R)

The cap converts a fixed-R system into a *stop-size-dependent* R system. Three consequences:
1. The right tail of the R distribution is deleted above 5R and compressed below it whenever structure is wide — expectancy falls monotonically as average stop size grows past 20 pts.
2. WR and R become correlated through volatility: wide-structure (high-vol) days simultaneously have wider stops (lower realized R) and possibly different win odds, so E must be estimated per regime, not from the blended headline numbers.
3. Portfolio math (Monte Carlo inputs) should sample (stop, outcome) pairs jointly, not an assumed flat 1:5 Bernoulli — a flat-5R assumption overstates E whenever any historical stop exceeded 20 pts.

**Per-time expectancy.** E[$/wk] = E(R) × avg $risk × expected fills/week. Each term is attackable separately: E(R) via setup quality and cap geometry, $risk via sizing policy, fills/week via setup frequency × fill rate. A 10% fill-rate loss is exactly a 10% E[$/wk] loss — equivalent to giving up 0.3R of per-trade expectancy at their numbers.

**What a 13.6:1 dollar asymmetry implies — and doesn't.**
- *Implies:* average loss in dollars was ~7% of average win; losses were being cut far below full R (early exits, tight structure, or small stops on losing days), and/or wins were concentrated in trades with small stops where the cap didn't bind. Mechanically, WR needed to break even at 13.6:1 is only 1/14.6 ≈ 6.8%.
- *Does NOT imply:* (a) that the ratio is stable — payoff ratios are the most outlier-sensitive statistic in the ledger (TrendsAndBreakouts); (b) that expectancy is as high as WR × 13.6 suggests — dollar asymmetry conflates R-multiple asymmetry with risk-size variation across trades, so it must be recomputed in R-normalized units; (c) that risk of ruin is low — a handful of full-stop losses at the widest structural stops can dominate the loss column going forward; (d) anything at n = 15 — per the existing sample-size note, the 95% CI on a 10/15 win rate alone spans roughly 38–88%.

## APPLICATION TO THE VAULT
- **Headline June expectancy: 10W/5L at nominal 1:5 → E ≈ +3.0R/trade, ~18× the breakeven margin (WR 66.7% vs p\* 16.7%).** That is enormous *if real* — which is exactly why the sample-size and event-study disciplines matter more here than more replay reps.
- **Audit every June trade for cap-binding.** Any trade with a stop over 20 MNQ points did not get 5R at target. Recompute the ledger with realized R = min(5, 100/stop) per trade; report E(R) from that column, not from the "1:5" label. If most stops are 15–25 pts, the true blended R is likely 4.something, and breakeven WR ~19–20% rather than 16.7%.
- **Recompute the 13.6:1 asymmetry in R units.** Convert each trade's P&L to R using its own stop, then take avg-win-R / avg-loss-R. If the R-normalized asymmetry is close to 5:1, the extra dollar asymmetry is coming from *sizing/stop-width covariance* (winning on wide-risk days or losing on narrow-risk days), which is fragile; if losses are genuinely fractional-R (cut early), document the exit rule that produced them, because it is load-bearing for the whole expectancy claim.
- **Wire fill rate into E[$/wk].** June had 2 high-grade setups lost to fills out of ~17 candidates (~12%). At +3R per expected winner-weighted trade, recovering those via the conversion rule (see the fill-modeling note) is worth more than any realistic WR improvement — a 12% frequency recovery ≈ +0.36R/trade-slot of time-based expectancy.
- **Feed the path MC with the joint distribution.** Per the charter's prop-math hierarchy (path MC E[$/wk] first), the MC should draw (stop-width, capped-R outcome, fill/miss) tuples from the replay ledger rather than a Bernoulli(0.667) × 5R — the trailing-drawdown survival answer changes materially when 2.5R and 5R winners are mixed.

## Sources
1. Finaur — Trade System Expectancy Formula (breakeven table, payoff matrix): https://finaur.com/blog/en/risk-management/trade-expectancy-formula/
2. TrendsAndBreakouts — Win Rate vs Payoff Ratio: https://trendsandbreakouts.com/win-rate-vs-payoff-ratio
3. TradingStats — Win Rate, Profit Factor & Expectancy (PF = pR/(1−p) identity, "free win rate" of geometry): https://tradingstats.net/win-rate-profit-factor-expectancy/
4. TradersSecondBrain — Trading Expectancy Formula: https://traderssecondbrain.com/guides/expectancy-formula
5. TradeZella — Trading Expectancy: https://www.tradezella.com/blog/trading-expectancy
6. Nexural — The Math of Asymmetry: https://www.nexural.io/blog/math-of-asymmetry-40-percent-win-rate
7. Investopedia — Win/Loss Ratio (what count-ratios do and don't measure): https://www.investopedia.com/terms/w/win-loss-ratio.asp
