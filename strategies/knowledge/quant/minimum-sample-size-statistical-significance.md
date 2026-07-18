---
topic: minimum-sample-size-statistical-significance
researched: 2026-07-17
sources: 10
agent-cycle: wave-2
---
# Minimum Sample Size & Statistical Significance for Trade Systems

## Key findings

- **Wilson score interval is the modern default for win-rate confidence intervals; drop the textbook Wald formula entirely.** The naive ±1.96·√(p(1−p)/n) interval is anti-conservative at small n and extreme proportions (it can exceed 100% or collapse to zero width); Wilson stays in [0,1], is asymmetric in the right direction, and holds near-nominal coverage everywhere. This is the recommendation of Brown, Cai & DasGupta (2001, *Statistical Science*) and essentially every modern text (Wikipedia binomial CI; MetricGate comparison). Data-backed, peer-reviewed.
- **Clopper-Pearson is the "exact but wasteful" alternative**: it guarantees coverage ≥ nominal by inverting the exact binomial test (endpoints are Beta-distribution quantiles), but it is systematically wider than needed. Reserve it for cases where a strict guarantee matters; Brown et al. explicitly call it "wastefully conservative... not a good choice for practical use" (Brown/Cai/DasGupta 2001; MetricGate). Data-backed.
- **Error shrinks with √n, so precision is brutally expensive**: halving the win-rate error bar takes 4× the trades. Rough margins at 95%: ±22% at 20 trades, ±14% at 50, ±10% at 100, ±7% at 200, ±4.4% at 500 (StratBase; traderssecondbrain). Mechanical math, not opinion.
- **"How many trades" depends on the size of the edge you must distinguish, not a magic number.** Distinguishing a 65% win rate from a coin flip takes ~40–70 trades; distinguishing 55% from 50% takes ~380; 52% from 50% takes 2,000+ (TradeProb power calculations). The oft-quoted floors — 30 (CLT heuristic), 100 (basic reliability), 200–500 (institutional standard per López de Prado) — are conventions layered on this math (BacktestBase; StratBase). The specific tier labels are opinion; the underlying power calculation is not.
- **Regime coverage is a second, independent requirement**: 500 trades from one regime validate less than 150 spread across trending/ranging/volatile/quiet conditions, because trades within a regime are correlated and the effective sample size is smaller than the count (BacktestBase; Trading Dude, Medium). Consensus practice, supported by the serial-correlation argument.
- **Parameter count inflates the requirement**: rough guideline of 50–100 trades per free parameter of the strategy (StratBase). Heuristic/opinion, but consistent with degrees-of-freedom logic and with the wave-1 DSR note (more variants tried → higher hurdle).
- **Sequential testing / optional stopping is the silent killer of small-sample evaluation.** Checking significance after every walk month and stopping when it "looks good" turns one test into the maximum of many correlated tests: nominal α = 5% inflates to ~25–40% with regular peeking (Atticus Li replication-crisis writeup; CalibreOS). This is Wald's 1947 optional-stopping problem; clinical trials solved it decades ago with group-sequential designs. Data-backed, long-established theory.
- **Valid ways to peek**: (a) pre-registered alpha-spending schedules (Pocock, O'Brien-Fleming/Lan-DeMets) for a small number of planned looks; (b) SPRT / mixture-SPRT (always-valid p-values, e-values) for continuous monitoring — track a likelihood ratio and stop only when it crosses ~1/α (LessonsVault; Loecher overview; Spotify Engineering comparison). Every valid method pays a transparent cost in a larger critical value; naive peeking pays an unbounded invisible one.

## Details / mechanics

**Wilson interval** (95%, z = 1.96), for w wins in n trades, p̂ = w/n:

center = (p̂ + z²/2n) / (1 + z²/n)
half-width = [z / (1 + z²/n)] · √( p̂(1−p̂)/n + z²/4n² )

**Clopper-Pearson**: lower = Beta(α/2; w, n−w+1) quantile, upper = Beta(1−α/2; w+1, n−w) quantile. Guaranteed ≥ nominal coverage, wider than Wilson.

**Sample size for a target margin of error m** (win rate near p): n ≈ p(1−p)·(z/m)². At p = 0.65: ±10% → ~87 trades; ±7% → ~178; ±5% → ~350.

**Two-proportion power calculation** (distinguish true rate p₁ from benchmark p₀, one-sided α, power 1−β):

n ≈ [ z_α·√(p₀(1−p₀)) + z_β·√(p₁(1−p₁)) ]² / (p₁ − p₀)²

**Sequential (valid-peeking) options**:
- *Alpha spending*: pre-commit to k looks (e.g. after each walk month) and a spending function. O'Brien-Fleming spends almost nothing early (early boundaries ~z > 4), preserving most power for the final look; Pocock spends evenly (each look needs z ≈ 2.4 for 5 looks).
- *Beta-binomial mSPRT* (simplest for win-rate data): with prior Beta(a,b) and null p₀, after w wins / l losses compute LR = [B(a+w, b+l)/B(a,b)] / [p₀^w (1−p₀)^l]. Declare an edge only when LR > 1/α (≈20 for α = 0.05). Valid at any stopping time; conservative.
- The non-negotiable part (all sources agree): pre-register the stopping rule before the data arrives.

## APPLICATION TO THE VAULT

- **Wilson 95% CI on June's 10W/15: [41.7%, 84.9%]** (center 63.3%, not 66.7% — Wilson shrinks toward 0.5). Clopper-Pearson gives ≈ [38.4%, 88.2%]. The 90% Wilson interval is [45.5%, 82.7%]. Quote these bands, never the point estimate, in the SCORECARD.
- **Against the 1:5 break-even rate of 16.7%, n = 15 is already conclusive.** Exact binomial: P(≥10 wins in 15 | p = 0.167) ≈ 2×10⁻⁵. Even the Wilson lower bound (41.7%) clears break-even by 2.5×. Consistent with wave-1's verdict: "not a losing system" is supported; "true win rate ≈ 67%" is not — the CI spans 43 points.
- **Trade-count targets for the walk program**, at ~15 takes/month: ±10% precision (≈87 trades) arrives after ~6 months of frozen walks; ±7% (≈178) after ~12 months. Distinguishing Dual46 from a hypothetical 55%-WR variant (Δ ≈ 12 pts) needs ~180–200 trades per arm — i.e., *variant comparisons are out of reach this year; don't run them*. This is the statistical backing for the charter's one-open-candidate rule.
- **Regime coverage is currently zero-dimensional**: all 15 takes are June 2026, one volatility regime, one macro backdrop. Under the regime-coverage requirement, the June result generalizes only to June-like conditions. Prescription (matches wave-1 walk-forward note): accumulate months before trusting pooled stats, and tag each take with session-regime markers (see the intraday-regime-detection note) so future subgroup analysis is possible once n ≥ ~200 — not before, since 15-trade subgroups carry ±22%+ margins.
- **The monthly "is it still working?" check is a peeking problem.** Evaluating the ledger after every month and being ready to unfreeze on a bad print is optional stopping — with 6 monthly looks, an actually-fine system has roughly a 20–30% chance of flunking some look at nominal α. Two clean fixes: (a) pre-register a Beta-binomial mSPRT against p₀ = 0.35 (comfortably above break-even, below the CI's lower bound) and only act when LR crosses 20 or drops below 1/20; or (b) pre-commit now to a fixed evaluation horizon (e.g. judge only at 60 and 120 trades) and ignore interim wobbles. Either belongs in the charter as a written stopping rule.
- **Kill decisions have the same math in reverse**: a 3-loss streak in 5 trades is P ≈ 0.21 even at a true 60% win rate — streak-triggered unfreezing is noise response (TradeProb's phrase: "behavioral variance introduced into the system"). Let the pre-registered rule, not the streak, decide.

## Sources

- Brown, Cai & DasGupta (2001), "Interval Estimation for a Binomial Proportion," *Statistical Science* — https://www.acsu.buffalo.edu/~cxma/STA517/Interval%20Estimation%20for%20Binomial%20Proportion-StatSci.pdf
- Binomial proportion confidence interval — Wikipedia (Wilson, Clopper-Pearson formulas and coverage properties) — https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
- MetricGate, "Wilson vs Agresti-Coull vs Clopper-Pearson" (method comparison table) — https://metricgate.com/blogs/wilson-vs-agresti-coull-vs-clopper-pearson/
- retired.today, Win-rate confidence interval calculator (Wilson worked examples, paired-comparison guidance) — https://retired.today/tools/win-rate-confidence
- BacktestBase, "Minimum Trades for a Valid Backtest" (30/100/200-500 tiers, regime-coverage argument) — https://www.backtestbase.com/education/how-many-trades-for-backtest
- StratBase, "Sample Size in Backtesting" (margin-of-error table, trades-per-parameter heuristic) — https://stratbase.ai/en/blog/backtest-sample-size
- TradeProb, "What a Sample Size Means in a Live Trading System" (edge-size-dependent power calculations) — https://tradeprob.com/foundations/trading-sample-size-statistical-validity/
- Trading Dude (Medium), "How Many Trades Are Enough?" (regime diversity vs raw count, bootstrap for small samples) — https://medium.com/@trading.dude/how-many-trades-are-enough-a-guide-to-statistical-significance-in-backtesting-093c2eac6f05
- Atticus Li, "The Peeking Problem in A/B Testing" (optional stopping history: Wald 1947, Pocock 1977, O'Brien-Fleming 1979, mSPRT) — https://atticusli.com/replication-crisis/ab-testing-peeking-problem/
- Loecher, "p-Value Hacking Solutions" (Beta-binomial mSPRT recipe, LR threshold 1/α, gsDesign/rpact) — https://markusloecher.github.io/pValue-Hacking-Solutions/
