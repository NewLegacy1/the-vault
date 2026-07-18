---
topic: multiple-testing-selection-bias-sleeves · researched: 2026-07-18 · sources: 6 · agent-cycle: cycle3-laneA
---
# Multiple Testing & Selection Bias Across Candidate Sleeves: How Skeptical to Be of Survivor k+1

The Vault has killed **13 Track-B candidates** (B0–B12, per `kill-lessons-track-b.md`). This note answers the question that ledger raises: after k kills, what does it take for survivor k+1 to be more than the luckiest of k+1 coin flips? Formalizes the intuition already implicit in the kill-lessons doctrine.

## Key findings

- **CLAIM (Bailey & López de Prado 2014, *JPM* — the Deflated Sharpe Ratio):** under the null of zero edge, the *expected maximum* Sharpe across N trials is strictly positive and grows with N and with the variance of Sharpe estimates across trials: \(E[\max \widehat{SR}] \approx \sqrt{V[\{\widehat{SR}\}]}\left((1-\gamma)\,\Phi^{-1}(1-\tfrac{1}{N}) + \gamma\,\Phi^{-1}(1-\tfrac{1}{Ne})\right)\) (γ = Euler–Mascheroni). DSR = the Probabilistic Sharpe Ratio evaluated against *that* raised threshold instead of zero, additionally correcting for skew, kurtosis, and sample length. A reported Sharpe only counts as a discovery if it clears the expected-max-of-N bar.
- **CLAIM (counting N honestly):** N is "every distinct backtest run on this hypothesis — every parameter combination in the grid, every variant discarded, every related idea tested on overlapping data. The honest answer is usually much larger than the number of strategies you remember." A 100 × 20 parameter grid is N = 2,000, not 1. Correlated trials shrink to an *effective* N (via clustering), so N isn't a raw count either — but the direction of honesty is always upward from "1."
- **CLAIM (White 2000, *Econometrica* — the Reality Check):** the formal test for "is the best of my k strategies better than a benchmark, accounting for having picked the best?" — a stationary-bootstrap test of the *max* performance statistic across the whole candidate universe against its null distribution. Hansen's SPA test (2005) is the studentized, less-conservative refinement. These are the published-quant-shop machinery for exactly the Vault's Track-B situation; the DSR is the closed-form cousin for Sharpe specifically.
- **Bonferroni intuition (the pocket version):** testing k candidates at per-test size α, the family-wise false-positive probability is ≈ 1 − (1−α)^k. **At the Vault's k = 14 (B0–B12 + the next one) and α = 0.05: ~51% chance at least one "significant" survivor appears by pure noise.** Bonferroni's fix — test each at α/k — would demand p < 0.0036, i.e. a bootstrap EV CI at ~99.6% rather than 95%. Crude (assumes independence, overkill for correlated trials) but the right order of magnitude for "how much more skeptical."
- **The kill-lessons doctrine already implements the informal version.** Hard constraints #11 (no param-retune resurrection without a *new* Stage-0 note and event definition) and #12 (independence: ≥2 structural differences) are multiplicity controls in disguise: #11 stops N from silently inflating inside one hypothesis; #12 keeps trials closer to independent so the effective-N arithmetic stays meaningful. What's missing is only the explicit *count* and the raised evidence bar as k grows.
- **Asymmetry worth naming:** multiplicity skepticism applies to *positive* surprises (survivors), not to kills. A kill at k=13 needs no deflation — negative EV with CI excluding 0 is a kill under any multiplicity regime (the test is against the null the family was searching for, not against it). The doctrine's one-directional design ("CI excl. 0 → kill" vs "OOS lift needed → promote") is already correctly asymmetric.

## Details / mechanics

**How the Vault's k should be counted (proposal):**

- **Family = Track-B / sleeve search since the PRB freeze.** B0–B12 = 13 completed trials. Every future Stage-0 that reaches an EV number increments the counter — including BLOCK/away closeouts (they were looks at the data). Param sweeps *inside* a candidate add to that candidate's internal N (which is why #11 bans them without a new event definition).
- **Effective k is smaller than raw k** because several kills are siblings (B6/B8 gap fade/cont; B7/B9 AM→PM). Clustering them: roughly 8–9 effectively independent families. Use raw k for the skeptical bound, clustered k for the fair one — quote both.

**The raised bar, three ways (all should agree in direction):**

1. **Bonferroni-style:** survivor k+1's Stage-0 bootstrap CI must exclude 0 at 1 − 0.05/k (~99.6% at k=14) *or* replicate in a genuinely new sample (the OOS gate — replication is the cleanest multiplicity killer because the fresh sample resets N to 1).
2. **Expected-max benchmark (Build Alpha logic, ties to `benchmark-discipline-naive-baselines.md`):** the random-entry baseline for survivor k+1 is the **best of k+1 random searches** under the same constraints — the empirical DSR threshold without normality assumptions. One extra loop in the baseline script.
3. **DSR proper (when a Sharpe-like statistic is quoted):** compute expected-max-SR from N and V of the trial ledger's SR estimates; report PSR against that threshold. At the Vault's per-candidate n (30–800 trades) this is feasible — the trial ledger exists in the kill cards.
- **Deeper OOS reserve discipline:** each look at the 3-year matrix data spends it. The era-splitting protocol (topic 47) plus a held-out final year that Stage-0 *never* touches is the structural complement; multiplicity math cannot rescue a fully-mined dataset.

**What it means for the current state:** the honest claim for any *future* Track-B survivor is not "EV positive, CI excludes 0, promote" but "EV positive at the k-adjusted level, or independently replicated." Dual46/PRB itself predates the Track-B family and was promoted on a different evidence path (event study + live replay walk) — its multiplicity family is the (much smaller) set of Path-B variants actually tried, not the 13 Track-B kills. Worth writing down *now* because the count grows monotonically and memory doesn't.

## APPLICATION TO THE VAULT

1. **Add a trial counter to the kill-lessons header (immediate, one line):** `k = 13 completed Track-B trials (≈8–9 effective after clustering) · family-wise 5%-noise odds at next survivor: ~51%`. Update on every closeout. The number's job is to be seen every time someone reads a promising Stage-0.
2. **Scorecard field for candidates:** `kAtTest` (trials completed before this one) and the corresponding adjusted CI level. Kill rule #13 unchanged; the *promote/proceed* rule tightens with k: CI excluding 0 at the k-adjusted level, or explicit deferral to OOS replication as the gate.
3. **Upgrade the random baseline to best-of-(k+1)** in the baseline script (one loop around the existing B-RAND simulation) — this operationalizes White's Reality Check without new statistical machinery.
4. **Protect the OOS reserve:** designate the most recent ~12 months of matrix data as touch-last; Stage-0 runs on the earlier window only. Every candidate that peeked disqualifies that window as its own replication sample (log which windows each candidate has seen — one column in the sim queue).
5. **Guard against the subtler inflation:** #11's ban on retunes is also a ban on *silent N growth* — when a Stage-0 note is drafted, it must state its own internal N (parameter combinations examined, including discarded ones) per the DSR counting rule. The assumption-log convention (DeltaTrend note) already has the slot for this.

## Sources

- Bailey, D.H. & López de Prado, M. (2014), "The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting, and Non-Normality," *Journal of Portfolio Management* 40(5), 94–107 — https://davidhbailey.com/dhbpapers/deflated-sharpe.pdf ; overview https://en.wikipedia.org/wiki/Deflated_Sharpe_ratio
- White, H. (2000), "A Reality Check for Data Snooping," *Econometrica* 68(5), 1097–1126 (stationary-bootstrap max-statistic test; Hansen 2005 SPA refinement) — referenced with method context in https://bootstrap.marketmaker.cc/ §2
- Keel, "Deflated Sharpe Ratio — Selection Bias in Backtests" (N-counting guidance, five-input recipe, 0.95 bar) — https://usekeel.io/learn/deflated-sharpe-ratio
- Bailey, Borwein, López de Prado, Zhu (2013), "The Probability of Backtest Overfitting" (companion PBO framework) — doi:10.2139/ssrn.2326253
- Cross-refs: `kill-lessons-track-b.md` (#11–#13, the informal implementation), `benchmark-discipline-naive-baselines.md` (best-of-random), `stationarity-era-splitting-event-studies.md` (OOS reserve), `walk-forward-testing-overfitting-prevention.md`
