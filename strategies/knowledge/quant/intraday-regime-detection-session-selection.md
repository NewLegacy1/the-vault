---
topic: intraday-regime-detection-session-selection
researched: 2026-07-17
sources: 11
agent-cycle: wave-2
---
# Intraday Regime Detection for Session Selection: Trend vs Chop, Opening-Range Signals, Day-of-Week

## Key findings

- **Three complementary regime classifiers dominate the practitioner literature — ADX (fast, directional-strength), variance ratio (statistical, testable), Hurst exponent (slow, structural).** Standard readings: ADX < 20 = ranging, > 25 = trending; VR(q) > 1 = momentum/persistence, < 1 = mean reversion; Hurst H > 0.55 = persistent, < 0.45 = anti-persistent, 0.45–0.55 = indistinguishable from random walk (QuanterLab; FractalCycles; NexusFi Academy). The thresholds are conventions; the underlying statistics are well-defined.
- **The Lo-MacKinlay variance ratio test (1988) is the only one of the three with a formal hypothesis test attached**: under a random walk, Var(q-period returns) = q·Var(1-period returns), so VR(q) = 1; the heteroskedasticity-robust z* statistic (M2) is valid under ARCH/GARCH-type volatility, which intraday index futures exhibit strongly (Lo & MacKinlay, *RFS* 1988, via MetricGate and Charles & Darné survey). Peer-reviewed.
- **Each classifier has a fatal blind spot alone**: ADX(14) lags ~14 bars and is direction-blind (a 35 in an uptrend looks identical to a 35 in a downtrend — pair it with +DI/−DI); Hurst needs 100–500 bars for a stable estimate, making it a *session-labeling* tool, not a real-time gate; high ADX with low Hurst often marks trend exhaustion rather than a green light (FractalCycles Hurst-vs-ADX; NexusFi). Practitioner consensus with clear mechanical justification.
- **Opening-range behavior is the best-documented session-regime predictor for index futures.** The first 5–30 minutes are the most information-dense window of the day; volatility and volume cluster at the equity open, and the first directional move out of the opening range predicts the session's trend direction ~58% of the time on S&P products (TradeAlgo citing *Journal of Technical Analysis*; Finexus on Crabel). The IEEE Access TORB study (10+ years of 1-minute index futures data) found breakout strategies keyed to the underlying stock market's opening hour remained profitable — peer-reviewed support for "the open sets the day."
- **Narrow opening ranges precede trend days** (Crabel's NR7 / range-compression finding): opening ranges in the bottom quartile of their 10-day distribution preceded trending days ~68% of the time vs ~52% for average-width ranges in a 2013–2023 replication (TradeAlgo; Traders Mastermind on Crabel). Original claim is 1990 practitioner research; the replication is a vendor study — directionally credible, precision unverified.
- **Breakouts outside the prior day's value area are more likely to trend; inside, more likely to rotate/mean-revert** (Finexus/market-profile framing). Practitioner claim, widely repeated, thin formal evidence.
- **NY morning regime persistence has peer-reviewed support via intraday momentum**: Gao, Han, Li & Zhou (*JFE* 2018, SPY 1993–2013) show the first half-hour return (from prior close) predicts the last half-hour return with R² ≈ 1.6% — small but out-of-sample robust, stronger on high-volatility, high-volume, and macro-news days, and present in equity index futures. Direction set early in the session carries information for the rest of it.
- **Day-of-week effects in index futures are weak and measurement-dependent — do not build schedule rules on them.** Sweeney (JABR) shows day-of-week conclusions flip depending on the intraday measurement interval and "may therefore be spurious"; the classic negative-Monday/weekend effect documented by Junkus (1986) and others largely disappeared after 1987, with some studies finding a *reverse* Monday effect for large caps (Investopedia summary of Fed study; Heston-Korajczyk-Sadka find their intraday periodicity is *not* a weekday artifact). What is robust across decades is the intraday U-shape: volatility/volume peak at open and close on every weekday (Ekman; academia.edu S&P futures intraday-patterns literature).

## Details / mechanics

**ADX**: smoothed ratio of directional movement (+DM/−DM) to true range over N bars (default 14). For intraday use, practitioners drop to ADX(7) or ADX(5) to cut lag, accepting more false flips (NexusFi). Always read with +DI vs −DI for direction.

**Variance ratio**: VR(q) = Var(r_t^(q)) / (q·Var(r_t)), computed on log returns; equivalently VR(q) = 1 + 2·Σ_{k=1}^{q−1} (1 − k/q)·ρ_k (weighted sum of the first q−1 autocorrelations). Test stat M2 = (VR−1)/√φ* ~ N(0,1) with heteroskedasticity-robust φ*. Typical q: 2, 4, 8, 16. Use the Chow-Denning joint test when checking several q at once.

**Hurst (R/S estimate)**: regress log(R/S) of sub-windows on log(window length); slope = H. Needs 100–500 bars — on a 1-minute chart that is 1.7–8+ hours, i.e. an entire session. Rolling intraday Hurst on 1-minute bars is too noisy to gate a 10:00 entry; use it to *label completed sessions* for post-hoc analysis.

**ATR-ratio volatility regime** (NexusFi, simplest of all): regime = ATR(14, intraday bars) / rolling 20-session baseline of same. > 1.5 elevated/trending-or-transitional, 0.8–1.5 normal, < 0.7 compressed.

**Opening-range regime tags** (Crabel lineage): OR width (e.g. 09:30–10:00 high−low) as a percentile of its trailing 10-day distribution; NR7 flag on the daily bar (narrowest range of last 7 days); OR position relative to prior day's value area / prior day's range.

**Intraday momentum regression** (Gao et al.): r_last30 = α + β·r_first30 + ε, β > 0, significant at 1%, R² 1.6% (2.6% adding the 12th half-hour). Effect concentrates on high-vol/high-volume/news days.

## APPLICATION TO THE VAULT

- **The Dual46 window is already sitting on the evidence-rich part of the day.** Entries near the 10:00 NY open key off exactly the opening 30-minute range the ORB/Crabel literature says is most informative, and the 09:30–13:00 session captures the high-volume left side of the intraday U-shape. The session choice needs no change; what's missing is *labeling*.
- **Adopt three cheap per-session regime tags, logged at entry time, no rule changes**: (1) OR width percentile — 09:30–10:00 MNQ range vs its last 10 sessions; (2) ADX(7) on the 5-minute chart at 10:00 with +DI/−DI direction; (3) first-30-min direction vs the daily bias line. Post-hoc per session, add (4) realized session Hurst and (5) VR(q=5,15) on 1-minute returns — these two are labels, not gates, given their bar requirements.
- **Hypothesis worth tracking (not acting on yet)**: June wins clustered at 11.5–33.5-pt stops, i.e. wide rejection blocks. Wide blocks form in higher-volatility opens, which the compression→expansion literature associates with trend potential *when the prior range was narrow*. Tagging will show within ~3–4 months whether wins concentrate in high-OR-percentile or NR7-preceded sessions. Per the sample-size note, do **not** split 15 trades into regime buckets now — 5-trade cells carry ±22%+ margins.
- **Adding Mondays is statistically unobjectionable.** The day-of-week literature gives no credible reason MNQ mornings should differ by weekday (Sweeney: interval-dependent, possibly spurious; the Monday effect died post-1987). Treat Monday as a fresh sub-sample anyway: tag takes by weekday and let the count accumulate; ~30+ Monday trades are needed before a Monday-specific claim means anything.
- **A realistic future gate, if tags prove predictive**: "skip sessions where OR width percentile < 20 AND ADX(7)@10:00 < 15" style filters are one-parameter rules that could clear the 50–100-trades-per-parameter bar within a year. Anything fancier (rolling Hurst gates, HMM regime models) is over-parameterized for a 15-trade/month system and would violate the frozen-system discipline for speculative benefit.
- **Caution on the ORB vendor numbers**: the 58%/68% figures come from vendor blogs replicating Crabel, not peer review; the IEEE TORB paper and Gao et al. are the load-bearing evidence that the open carries session-level information. Treat specific percentages as hypotheses to verify against the Vault's own tagged ledger.

## Sources

- Lo & MacKinlay (1988), "Stock Market Prices Do Not Follow Random Walks" (variance ratio test; M1/M2 statistics) — summarized with formulas at https://metricgate.com/docs/lo-mackinlay-variance-ratio/
- Charles & Darné, "Variance ratio tests of random walk: an overview" (M1/M2 derivations, Chow-Denning) — https://hal.science/hal-00771078v1/document
- Gao, Han, Li & Zhou (2018), "Market intraday momentum," *Journal of Financial Economics* — https://doi.org/10.1016/j.jfineco.2018.05.009 (working-paper PDF: https://c.mql5.com/forextsd/forum/173/intraday_momentum_-_the_first_half-hour_return_predicts_the_last_half-hour_return.pdf)
- IEEE Access (2019), "Assessing the Profitability of Timely Opening Range Breakout on Index Futures Markets" (10+ years of 1-min data; open-hour information density) — https://doi.org/10.1109/access.2019.2899177
- QuanterLab, "Market Regime Detection" (Hurst/ADX/VR thresholds, multi-indicator agreement) — https://quanterlab.com/articles/mr-regime-detection
- FractalCycles, "Hurst Exponent vs ADX" (lookback requirements, divergence interpretation) — https://fractalcycles.com/compare/hurst-vs-adx
- FractalCycles, "Market Regime Detection: Trending vs Mean-Reverting" (H-band taxonomy) — https://fractalcycles.com/guides/market-regime-detection
- NexusFi Academy, "Regime Detection for Automated Trading Systems" (ADX(7) intraday adaptation, ATR-ratio regime, ES examples) — https://nexusfi.com/a/automation/regime-detection-automated-trading
- TradeAlgo, "Opening Range Breakout Strategy" (Crabel narrow-range findings, 2013–2023 replication, ES/NQ stats) — https://www.tradealgo.com/trading-guides/day-trading/opening-range-breakout-strategy-how-to-trade-the-first-30-minutes
- Sweeney, "On the Day of the Week Effect: Intraday Prices for S&P 500 Futures" (interval-dependence; spuriousness) — https://doi.org/10.19030/jabr.v3i3.6517
- Junkus (1986), "Weekend and day of the week effects in returns on stock index futures," *Journal of Futures Markets*; plus Heston, Korajczyk & Sadka (2010) intraday periodicity (not a weekday artifact) — https://onlinelibrary.wiley.com/doi/10.1002/fut.3990060305 ; https://www.bauer.uh.edu/departments/finance/documents/Heston-Korajczyk-Sadka-jf-2010-01-07.pdf
