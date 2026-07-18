---
topic: monte-carlo-prop-firm-survival
researched: 2026-07-17
sources: 9
agent-cycle: wave-1
---
# Monte Carlo Path Simulation for Prop-Firm Evaluation & Funded-Account Survival

## Key findings

- **Trailing drawdown makes prop-account outcomes path-dependent, so expectancy alone is the wrong metric.** The drawdown floor ratchets up with every new equity peak and never comes back down; a winning streak followed by a normal pullback can breach an account that simple EV math says is healthy (FuturesFury drawdown calculator docs; Tanto prop-firm simulator). This is a mechanical fact of the account rules, not opinion.
- **Intraday (tick-by-tick) trailing is strictly harsher than end-of-day trailing**: even a momentary *unrealized* peak mid-trade permanently ratchets the floor. Apex-style intraday trailing is the worst case; EOD trailing (Topstep-style) only updates at close; static drawdown (FTMO-style) never trails (FuturesFury; Tanto firm table). Fact, per firm rulebooks.
- **The standard method is trade-level path Monte Carlo**: resample your actual trade distribution (win rate, R-multiples, trades/day) into thousands of randomized sequences, apply the firm's exact rules (trailing floor, daily loss limit, profit target, time/day caps) to each path, and count Pass / Blow-DD / Timeout (CrossTrade Monte Carlo docs; Damn Prop Firms calculator). Industry-standard practice.
- **Practitioner thresholds** (opinion, but consistent across tools): Pass% < 50% → don't pay the fee yet; > 65% → acceptable; Blow-DD% > 20% on a trailing-DD eval → per-trade size too big, halve and re-run (CrossTrade). Run ≥ 1,000 paths, ideally 10,000, for stable estimates (Tanto; CrossTrade).
- **Expected $/week comes from EV per attempt and expected funded lifetime, not from per-trade expectancy.** EV = P(pass) × P(survive to payout) × E[payout] − fee; funded lifetime under a monthly blowup hazard h over horizon T is a geometric-survival sum, and it is dramatically shorter than intuition — e.g. a 20% monthly blowup rate over 12 months yields only ~4.7 expected funded months (PropFirmsData EV calculator; Delphic Alpha "Prop Firm Math").
- **Base rates are brutal and should anchor priors**: roughly 90%+ of traders fail evals, and of those funded, ~80% lose the account within 90 days; only ~55% of funded traders survive to a first payout within 90 days (Delphic Alpha citing FTMO published stats; NexusFi Academy). These are aggregated-tracker numbers — directionally reliable, precision debatable.
- **Closed-form risk of ruin is the sanity check on the Monte Carlo**: RoR ≈ ((1−A)/(1+A))^U with A = per-R edge and U = drawdown buffer in units of per-trade risk (Balsara 1992 via BacktestBase; CrossTrade). It assumes i.i.d. trades and a *static* barrier, so it understates ruin under a trailing floor — treat it as a lower bound.
- **Losing-streak math matters more than mean expectancy under a trailing floor**: the probability of a k-loss streak somewhere in n trades is ≈ 1 − exp(−n·(1−p)·q^(k−1)) style calculations; simulators surface this as "5+ loss streak risk" because one such streak near the floor ends the account (Damn Prop Firms).

## Details / mechanics

**Trailing drawdown state machine** (per firm rulebooks, FuturesFury):
- floor = start_balance − DD_allowance (e.g. $50K − $2.5K)
- On every new equity peak P (tick-level for intraday-trailing firms, close-level for EOD): floor = max(floor, P − DD_allowance). Many firms stop trailing once floor reaches start_balance ("locked" at breakeven).
- Breach: equity ≤ floor at the granularity the firm measures. Account dead; buffer never regenerates.

**Path MC procedure** (CrossTrade / Damn Prop Firms, generalized):
1. Build empirical trade distribution from ≥ ~100 logged trades (or bootstrap the small sample with humility — see application).
2. For each of N ≥ 10,000 paths: draw trades in random order (or resample with replacement), apply per-trade $ P&L at intended size, update equity *including intra-trade excursion if simulating intraday trailing* (MAE matters, not just closed P&L), apply daily-loss and floor rules, stop at target / breach / day-cap.
3. Outputs: Pass%, BlowDD%, Timeout%, distribution of days-to-pass, max losing streak distribution.
4. Sensitivity: re-run at 0.5× and 0.75× size; Pass% often *rises* as size falls until timeout risk dominates — there is an interior optimum size for each ruleset.

**EV and $/week math** (PropFirmsData, Delphic Alpha, SatoshiMacro):
- EV_attempt = P(pass) × P(survive to payout) × E[after-split payout] − E[fees per attempt] (fees include resets, activation, data).
- Expected funded months under monthly blowup hazard h, horizon T: E[months] = Σ_{t=1..T} (1−h)^t ≈ (1−h)(1−(1−h)^T)/h.
- E[$/week] ≈ (EV_attempt + E[funded months] × E[monthly net payout]) / E[total calendar weeks including failed attempts]. The denominator — weeks burned on failed evals — is what most traders omit.
- Break-even pass probability: p* = fee / (E[payout] × P(survive)). If your honest simulated Pass% < p*, the eval is −EV at any size.

**Closed-form RoR** (Balsara via BacktestBase; CrossTrade):
- Edge per 1R risked: A = p·RR − (1−p) (in R units, for RR reward-to-risk and win rate p).
- Units of buffer: U = (drawdown allowance in $) / (risk per trade in $).
- RoR ≈ ((1−A)/(1+A))^U — static-barrier approximation; trailing floor makes true ruin risk higher, especially after early wins.

## APPLICATION TO THE VAULT

- **June inputs for the simulator**: p = 10/15 ≈ 0.667, capped 1:5 RR, win/loss asymmetry 13.6:1 in dollars, ~15 trades/month at ~10 MNQ. At $20/pt (10 MNQ) with stops 4.75–33.5 pts, per-trade risk is roughly $95–$670 — the risk is *not* constant in dollars, so the MC must draw (stop_size, outcome) pairs jointly from the ledger, not a fixed-R abstraction. A trade with a 33.5-pt stop is ~7× the dollar risk of a 4.75-pt one; uniform-R simulation would badly misstate BlowDD%.
- **The edge is enormous *if real*: A = 0.667×5 − 0.333 ≈ 3.0 in R terms.** Plugging into RoR with, say, a $2.5K trailing allowance and a $300 average risk (U ≈ 8): even pessimistic win rates from the Wilson lower bound (p ≈ 0.42 → A ≈ 1.5) give near-zero static-barrier ruin. The real threats are (a) the trailing ratchet after a winning streak, and (b) parameter uncertainty from n = 15. So: run the MC by *bootstrapping from the Wilson-lower-bound win rate*, not the point estimate, and simulate intraday trailing with MAE, since 1:5 targets mean trades sit open through large adverse excursions.
- **Low trade frequency changes which rule bites.** At 2–15 trades/month, daily loss limits almost never bind, but *time/day caps and timeout risk do* — many paths will neither pass nor die within a typical eval window. Pass% for Dual46 is mostly a race between the 100-pt cap winners arriving and the eval clock. Model "Ran Out of Time" as its own outcome; a reset costs a fee but not the edge.
- **E[$/wk] is the promotion gate the charter already requires** — this research confirms the SCORECARD hierarchy (path MC / E[$/wk] above trade EV) matches industry-standard prop math. Concrete next artifact: a small script (the pathb-engine/replay scaffolding is a natural home) that takes the June ledger JSON, a firm ruleset (allowance, trailing type, target, day cap), and outputs Pass%, BlowDD%, E[days-to-pass], and E[$/wk] at 1.0×/0.75×/0.5× size.
- **Sizing headline from the tools' consensus**: if BlowDD% > 20% at 10 MNQ under intraday trailing, drop to 7 or 5 MNQ and re-run — with a 3R-per-trade edge, halving size costs little in E[$/wk] (still positive, more paths survive) but can double survival. Whether that trade-off is worth it is exactly what the MC quantifies.
- **Caution on the 13.6:1 asymmetry**: it is partly an artifact of the 1:5 cap plus small stops on winners; a Monte Carlo resampling only 15 observed trades will inherit June's luck. Widen inputs (Wilson bound on p, jitter on stop sizes, occasional slippage-degraded winner→loser flips for the fills-missed-by-ticks problem) before trusting Pass%.

## Sources

- FuturesFury, Prop Firm Drawdown Calculator (trailing floor mechanics, intraday vs EOD) — https://futuresfury.com/drawdown-calculator
- Tanto, Prop Firm Challenge Monte Carlo Simulator (firm rule table, 10k-path methodology) — https://tradetanto.com/tools/prop-firm-simulator
- CrossTrade, Monte Carlo Simulation docs (Pass%/BlowDD% thresholds, procedure) — https://crosstrade.io/learn/performance-metrics/monte-carlo-simulation
- CrossTrade, Risk of Ruin (RoR formula, prop-firm sizing guidance) — https://crosstrade.io/learn/risk-management/risk-of-ruin
- Damn Prop Firms, Futures Prop Firm Evaluation Calculator (loss-streak risk, dynamic sizing) — https://damnpropfirms.com/futures-prop-firm-evaluation-calculator/
- Delphic Alpha, "Prop Firm Math: What the Rules Actually Demand" (EV formula, survival base rates, break-even Sharpe) — https://delphicalpha.substack.com/p/prop-firm-math-what-the-rules-actually
- PropFirmsData, EV Calculator (geometric survival / expected funded lifetime) — https://www.propfirmsdata.com/tools/ev-calculator/
- NexusFi Academy, "Expected Value in Prop Firm Evaluations" (path dependence, reset economics) — https://nexusfi.com/a/prop-firms/expected-value-prop-firm-evaluations
- BacktestBase, Risk of Ruin Calculator (Balsara 1992 formula and tables) — https://www.backtestbase.com/education/risk-of-ruin-calculator-trading
