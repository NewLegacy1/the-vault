---
topic: losing-streak-math
researched: 2026-07-17
sources: 6
agent-cycle: cycle2-wave1
---
# Losing-Streak Math at 60–70% Win Rates: Exact Distributions, Drawdown-in-R, and the Trailing-Buffer Interaction

## Key findings
- **Streaks are a property of the win rate and sample length, not of the strategy's health.** For i.i.d. trades with loss probability q = 1−p, P(k consecutive losses at a given spot) = q^k, but the relevant question is "at least one k-streak *somewhere* in n trades," which is far larger and grows toward 1 as n grows (JournalPlus; BacktestBase; Pomegra). Mechanical math.
- **The standard approximation E[longest streak] ≈ ln(n)/ln(1/q)** (theory of runs; Schilling's longest-run results) is decent at large n but overstates slightly at small n — exact Markov-chain values computed below are the ones to use. The p=0.65/n=100 exact answer is **4.0**, vs 4.4 from the approximation.
- **Headline numbers at p = 0.65 (exact, computed this cycle via Markov-chain DP, cross-checked against BacktestBase's published p=0.60 table):** in 100 trades, a 3-loss streak is a 95% certainty, a 4-loss streak is a 63% likelihood, and a 5-loss streak is a 29% possibility. Even in a 30-trade sample (≈ May+June), a 3-loss streak is more likely than not (59%). Anyone at this win rate who has not planned for a 4–5 loss streak has not planned.
- **Drawdown in R is worse than streak-length × 1R**, because drawdowns chain across interleaved wins: a loss, a win that doesn't recover the peak... at 65%/5R the *median* max drawdown over 100 trades is ~4R and the 95th percentile is ~6R (Monte Carlo, 50k paths, this cycle). With capped/mixed winners (cap binding on wide stops) the p99 stretches to ~9R.
- **Against a trailing prop buffer, the streak math converts directly into blow-up probability**: the chance the account's worst closed-equity drawdown reaches B risk-units within n trades (p=0.65, 5R winners) is ~28% for B=5R and ~1.3% for B=8R over 100 trades. Since the buffer in R = (drawdown allowance $)/(risk per trade $), **position size is the only lever** — the same strategy is a ~1-in-4 blow-up risk at 5R of buffer and a ~1-in-75 risk at 8R. Computed this cycle; consistent with the risk-of-ruin exponential form in the Monte Carlo note.
- **Psychological framing from the practitioner literature, consistent with the behavioral evidence**: streaks of this length are "mathematically inevitable outcomes of probability, not evidence a strategy has failed" (BacktestBase; JournalPlus); the documented failure mode is the trader's response to the streak (size-up, rule-break, revenge sequence — see the daily-loss-limits note), not the streak itself.

## Details / mechanics
**Formulas.**
- P(specific k-streak) = q^k. At p=0.65: q³ = 4.3%, q⁴ = 1.5%, q⁵ = 0.5%.
- P(at least one k-streak in n trades) ≈ 1 − exp(−n·p·q^k) (Poisson/clump-count approximation); exact values below use the k-state Markov chain (states = current trailing-loss count, absorbing at k).
- E[longest streak in n] = Σₖ P(longest ≥ k); approximation ln(n)/ln(1/q).
- Max drawdown in R requires path simulation (no clean closed form once winners ≫ losers in magnitude).

**Exact streak table (Markov-chain DP, this cycle):**

| p | n | E[longest] | P(≥3) | P(≥4) | P(≥5) | P(≥6) |
|---|---|---|---|---|---|---|
| 0.65 | 30 | 2.9 | 0.59 | 0.24 | 0.09 | 0.03 |
| 0.65 | 50 | 3.4 | 0.78 | 0.38 | 0.15 | 0.05 |
| 0.65 | 100 | 4.0 | 0.95 | 0.63 | 0.29 | 0.11 |
| 0.65 | 200 | 4.7 | 1.00 | 0.87 | 0.50 | 0.21 |
| 0.667 | 100 | 3.9 | 0.93 | 0.56 | 0.24 | 0.08 |
| 0.70 | 50 | 3.0 | 0.63 | 0.24 | 0.08 | 0.02 |
| 0.70 | 100 | 3.5 | 0.86 | 0.43 | 0.15 | 0.05 |
| 0.70 | 200 | 4.1 | 0.98 | 0.68 | 0.29 | 0.10 |

Reading: at the June point-estimate win rate (~0.667), the first 100 frozen trades should be *expected* to contain a 4-loss streak (56%), and a 5-loss streak would still be unremarkable (24%). Only a 7+ streak starts to be genuine evidence against p ≈ 0.65 (P ≈ 3% in 100 trades) — and per the sample-size note, even that belongs in a pre-registered stopping rule, not an in-the-moment judgment.

**Max drawdown in R (MC, 50k paths, win = +5R, loss = −1R):**

| p | n | median | p90 | p95 | p99 |
|---|---|---|---|---|---|
| 0.65 | 50 | 3R | 5R | 6R | 7R |
| 0.65 | 100 | 4R | 6R | 6R | 8R |
| 0.65 | 200 | 4R | 6R | 7R | 8R |
| 0.70 | 100 | 3R | 5R | 5R | 7R |

With mixed winner sizes (5R/4R/3.33R/2.5R at 60/20/10/10% to model the 100-pt cap binding), p=0.65, n=200: median 4.5R, p95 7R, p99 9R. **Plan on surviving 8R of drawdown; expect 4–5R.**

**Trailing-buffer breach probabilities** (p=0.65, flat 5R, within first n trades):

| Buffer B (in R) | n=50 | n=100 |
|---|---|---|
| 4R | 38% | 63% |
| 5R | 15% | 28% |
| 6R | 6% | 11% |
| 8R | 0.6% | 1.3% |
| 10R | 0.1% | 0.2% |

Caveats: closed-equity only — intraday-trailing firms ratchet on open MFE too, making true breach odds worse (per the Monte Carlo note, simulate with MAE/MFE); i.i.d. assumption — any regime clustering of losses fattens all these tails; and p is uncertain (Wilson 95% lower bound ≈ 0.42 on June's data), so these are conditional on the edge being real.

## APPLICATION TO THE VAULT
- **The May+June combined sample (~30 takes): expect a 3-loss streak (59%), and don't blink at a 4 (24%).** If the walk produces one, that is the base rate doing its job. If May shows *no* streak ≥ 2, that is mildly surprising (P ≈ 5% for n=15) and worth checking for accidental selection in what counted as a "take."
- **Pre-register the streak alarm threshold before going live**: at p≈0.65, a 6-loss streak in the first 100 live trades has probability ~11% (yellow flag, review execution but keep trading); 7+ is ~3–4% (red flag, invoke the pre-registered mSPRT/stopping rule from the sample-size note). Write these two numbers in the charter now, while nothing hurts.
- **Buffer sizing is the live-account decision this note forces.** At a $2.5K trailing allowance: risking ~$300/trade (≈15-pt stop at 10 MNQ, or wider stops at smaller size) gives B ≈ 8R → ~1.3% chance of a buffer-depth drawdown in the first 100 trades. Risking ~$500/trade gives B = 5R → ~28%. **The difference between a 1-in-75 and a 1-in-4 first-hundred-trades blow-up risk is entirely position size**, at identical strategy and edge. This is the quantitative case for sizing down on wide-structure days (or capping dollar risk per trade) rather than running fixed 10 MNQ into 33-pt stops.
- **Trailing ratchet timing**: drawdowns that follow new equity highs are the dangerous ones (floor has ratcheted up). At 5R winners, a single win ratchets the floor by up to 5R-equivalents; the highest-risk state is *immediately after a winning streak* with the buffer freshly compressed to the allowance. Expect the emotional experience to invert the math: the account feels safest exactly when it is closest to the floor in ratchet terms. The path MC (Monte Carlo note) already covers this; this note supplies the streak inputs.
- **Psychological pre-commitment card for going live** (the point of this note): at your win rate, over your first 100 live trades — a 4-loss streak is *more likely than not*; a 5-loss streak is a 1-in-3 event; ~4R of drawdown is the median experience, and 6R is p95-normal. None of these numbers, if they occur, contain any information the June scorecard didn't already have.

## Sources
1. BacktestBase — Trading Losing Streak Calculator (published p=0.60/n=100 table used as cross-check: P(≥4)=91.9%… matches DP output at p=0.60): https://www.backtestbase.com/education/losing-streak-calculator-trading
2. Pomegra — Calculating Your Worst Expected Streak / How Likely Is a 10-Loss Streak? (ln(n)/ln(1/q) formula, 1−exp(−n·q^k) approximation, streak→drawdown conversion): https://pomegra.io/learn/library/track-e-trading-risk/risk-management/chapter-02-the-risk-of-ruin-equation/calculating-worst-streaks
3. JournalPlus — Consecutive Losses glossary (streaks as probability outputs; evaluate over ≥20 trades, not 3–5 losses): https://journalplus.co/learn/glossary/consecutive-losses
4. theBetInvestor — How to Estimate Your Longest Losing Sequence (ELLR formula, bankroll-from-streak sizing method): https://thebetinvestor.com/guide/how-to-estimate-your-longest-losing-sequence/
5. Schilling, M. — "The Longest Run of Heads" (*College Mathematics Journal*, 1990) — theory-of-runs basis for the log approximation and its small-n bias (background; approximation verified against exact DP this cycle).
6. This cycle's computations — exact Markov-chain streak distributions and 50k-path drawdown MC (Node.js, seeds fixed); method: k-state DP over trailing-loss counts; MC with flat and cap-mixed winner distributions. Reproducible from the formulas above.
