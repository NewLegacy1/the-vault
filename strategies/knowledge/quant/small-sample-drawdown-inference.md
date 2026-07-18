---
topic: small-sample-drawdown-inference · researched: 2026-07-18 · sources: 6 · agent-cycle: cycle3-laneA
---
# Small-Sample Drawdown Inference: Bootstrap vs Analytic Bounds for 20–40-Trade Samples

Companion to `losing-streak-math.md` (streak analytics at fixed WR) and `regime-switching-monte-carlo.md` (which covers drawdown-tail bias under regimes). Question: with the May+June combined ledger at ~20–40 trades, which drawdown inference method deserves trust — resampling the ledger, or analytic bounds?

## Key findings

- **EVIDENCE (controlled coverage study, marketmaker.cc 2026):** bootstrap max-drawdown quantiles are **optimistic on every data-generating process tested, even i.i.d. Gaussian**: the nominal-5% worst-case drawdown had realized exceedance 0.102 at T=250 and 0.082 at T=1000 — roughly 2× nominal *with the resampling scheme exactly correct*. Cause: **plug-in bias** — "the bootstrap sees only one realized path; its resamples cannot produce drawdowns much deeper than the volatility and luck of that one path allow." This bias decays only slowly with sample size; at 20–40 trades it is at its worst. Their prudent reading: multiply the nominal tail probability of any bootstrap drawdown quantile by **1.5–5×**, or validate against a parametric model.
- **CLAIM (canonical analytic result, Magdon-Ismail & Atiya et al., J. Appl. Prob. 2004):** for a Brownian motion with drift μ and vol σ over horizon T, E[MDD] has closed/series form: \(\sigma\sqrt{\pi T/2}\) at zero drift; \((2\sigma^2/\mu)\,Q_p(\mu^2 T/2\sigma^2)\) for μ>0 (tabulated universal function); with a **phase transition** in scaling — MDD grows as log T (positive drift), √T (zero drift), linearly (negative drift). Two operational warnings: it is an *expected value, not an upper bound* (MATLAB's own docs stress realized MDD routinely exceeds it), and it assumes Gaussian increments — wrong in the tails for bracket-exit trade outcomes.
- **The structural insight for fixed-bracket systems (reasoned from the above):** Dual46's outcome distribution is **known almost by construction** — each trade is ≈ −1R or +(capped) 5R, with the only unknowns being WR and the cap-truncation fraction. For such a system, *the ledger path adds almost no information about drawdown beyond its win/loss counts*. The right inference is therefore **parametric**: put the Beta posterior on WR (topic 44), draw p per path, simulate ±R sequences, read the drawdown distribution. This sidesteps plug-in bias entirely — the parametric model *can* generate paths worse than the observed one — and it is exactly what `losing-streak-math.md` did at a fixed 65% WR (63% chance of a 4-loss streak in 100 trades); the upgrade is integrating over WR uncertainty instead of fixing it.
- **When the bootstrap still earns its keep:** (a) when outcome *magnitudes* vary materially (partial cap hits, slippage, discretionary exits) — the parametric ±R model misses this, and resampling realized PnLs captures it; (b) as a cross-check that the parametric model isn't understating magnitude dispersion. At 20–40 trades use it only in this supporting role, with quantiles read as **optimistic lower bounds**.
- **Ranking for the Vault's sample size (20–40 trades):** parametric MC over the WR posterior > analytic streak bounds (fast sanity) > Magdon-Ismail Brownian E[MDD] (order-of-magnitude only; Gaussian assumption mismatched to bracket outcomes) > ledger bootstrap (worst plug-in bias exactly here). Trust in that order; quote in that order.

## Details / mechanics

**Parametric drawdown recipe for the May+June combined ledger (concrete):**

1. Counts from the ledger: w wins, l losses, n = w + l (script vs disc sleeves separate, per the canvas rule).
2. WR posterior Beta(0.5 + w, 0.5 + l). Empirical win-size distribution from the ledger (how many capped at 100 pts vs full 5R vs partial) — this is the one place the realized ledger *is* the right source, since win sizes are mechanical.
3. Per path: draw p ~ posterior; simulate N future trades (e.g. a quarter, ~60) as Bernoulli(p) with win sizes drawn from step 2's empirical set and losses at −1R; track running max-drawdown in R and in $ at 10-MNQ sizing.
4. Report: MDD p50 / p90 / p95 in R and $, plus P(MDD > trailing-DD budget). ~10⁴ paths, milliseconds. Every ingredient exists in `vault-app/lib` (the MC engine's trade resampler plus a Beta sampler — the only new piece).
5. Cross-check: (a) analytic streak bound from `losing-streak-math.md` at posterior-p05 WR (pessimistic corner); (b) ledger bootstrap p95 — if the parametric p95 is *shallower* than the bootstrap p95, magnitude dispersion is being missed; investigate before trusting either.

**Why in-R units matter:** the coverage study's bias factors are about probability calibration, and R-units keep drawdown statements portable across sizing (10 MNQ = $20/pt is applied last). The kill-lessons loss-shape gate (#10: max modeled streak × $risk < $2k trail) is already an analytic-bound rule — this note's recipe is its distribution-valued upgrade.

**What NOT to do at n=20–40:** quote the observed ledger max drawdown as "the" drawdown (a single order statistic of a single path — `monte-carlo-prop-firm-survival.md` already bans this); or quote an unadjusted bootstrap p95 as a "worst case" (the study above measured that this specific claim fails at 1.5–5× nominal).

## APPLICATION TO THE VAULT

1. **Adopt the parametric-first hierarchy for the May+June combined ledger** and any sample under ~100 trades: parametric MC over the WR posterior for the headline drawdown numbers; streak bound at posterior-p05 WR as the fast corner check; bootstrap only as a magnitude-dispersion cross-check labeled "optimistic lower bound."
2. **Scorecard wording rule (immediate, zero code):** every drawdown quantile carries its method tag — `MDD p95 (parametric/WR-posterior)` vs `(bootstrap — lower bound)`. Untagged drawdown numbers are non-compliant with the no-invented-numbers doctrine because the method *is* part of the number.
3. **Engine backlog item (small):** a `drawdownParametric()` helper — Beta-draw + Bernoulli path + empirical win-size sampler — surfaced beside the existing bootstrap bands in the MC UI. Composes with the regime upgrade (topic 42): regime-conditional win-size buckets slot into step 3 unchanged.
4. **Kill-lessons gate upgrade (post-May):** restate hard constraint #10 distributionally — "P(quarterly MDD > $2k trail) < 5% under the parametric model at posterior WR" — same spirit, calibrated tail instead of a point streak estimate.
5. **Expectation management for the walk:** at 65% WR the parametric model says multi-loss streaks are *certain* over a quarter (63% chance of 4+ in 100 trades at fixed WR; higher after integrating WR uncertainty). Pre-writing the expected MDD p50/p90 into the walk plan converts a future drawdown from evidence-of-brokenness into a pre-registered scenario — the psychological payload of this math.

## Sources

- "Do Bootstrap Confidence Intervals for Backtest Statistics Cover?" (2026) — plug-in bias, exceedance 0.08–0.23, 1.5–5× correction factor — https://bootstrap.marketmaker.cc/
- Magdon-Ismail, Atiya, Pratap, Abu-Mostafa, "On the maximum drawdown of a Brownian motion," *J. Applied Probability* 41(1), 2004 — https://doi.org/10.1239/jap/1077134674 ; practitioner form: "An Analysis of the Maximum Drawdown Risk" — https://www.cs.rpi.edu/~magdon/ps/journal/drawdown_RISK04.pdf
- MathWorks `emaxdrawdown` docs (E[MDD] is an average, not a bound) — https://www.mathworks.com/help/finance/emaxdrawdown.html
- "Don't draw the downs apart," *J. Empirical Finance* (2026) — stationary bootstrap best-in-class among resamplers for MDD, i.i.d. Efron systematically underestimates — https://doi.org/10.1016/j.jempfin.2026.101738
- Cross-refs: `losing-streak-math.md`, `bayesian-beta-binomial-win-rate-updating.md`, `regime-switching-monte-carlo.md`, `monte-carlo-prop-firm-survival.md`, `kill-lessons-track-b.md` (#10)
