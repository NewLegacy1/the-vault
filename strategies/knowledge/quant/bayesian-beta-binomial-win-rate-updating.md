---
topic: bayesian-beta-binomial-win-rate-updating · researched: 2026-07-18 · sources: 5 · agent-cycle: cycle3-laneA
---
# Bayesian Beta-Binomial Updating of Small-Sample Win Rates, Month over Month

Companion to `minimum-sample-size-statistical-significance.md` (frequentist view) — this note supplies the Bayesian machinery for the recurring Vault question: *what does June's ~15-take replay sample actually tell us about Dual46's true WR, and how should May's sample update it?*

## Key findings

- **CLAIM (textbook, conjugacy):** with a Beta(α, β) prior on win rate p and x wins in n trades, the posterior is **Beta(α + x, β + n − x)** — closed form, no simulation. Posterior mean = (α + x)/(α + β + n). The prior acts as α + β "pseudo-trades"; its pull dies off as real n grows.
- **CLAIM (prior choice):** three defensible defaults — uniform Beta(1,1); **Jeffreys Beta(0.5, 0.5)** (reparameterization-invariant, and its credible interval has near-optimal *frequentist* coverage — the "Jeffreys interval" is a recommended small-n binomial interval alongside Wilson, both strictly better than the Wald ±z·SE interval); or an **informative prior encoding last month's data**. For month-over-month updating the third is not a subjective choice at all: *sequential updating is exact* — May's posterior *is* June's prior, and updating May-then-June equals pooling both months in one batch (data-order invariance; Kruschke 2015 §5.2.1). The only assumption purchased is that p was the same in both months (see stationarity note, topic 47).
- **EVIDENCE (computed exactly for the Vault's numbers, incomplete-beta quantiles, this session):**
  - June alone, 10 wins / 15 trades, Jeffreys prior → posterior mean **0.656**, 95% credible interval **[0.42, 0.86]**, P(WR > 50%) = 0.90, P(WR > 55%) = 0.82. A 15-trade month cannot distinguish a 45% coin from an 85% edge.
  - Pooled May+June at the same rate (24/35) → mean **0.681**, 95% CI **[0.52, 0.82]**, P(WR > 55%) = 0.95. Doubling the sample moves the lower bound from 0.42 to 0.52 — the first month buys the most.
  - At n = 100 (~5 months of one-trade/day) at 67%: 95% CI **[0.58, 0.76]** — only then does the interval exclude everything below the high-50s.
- **CLAIM (why Bayesian here, not another frequentist test):** the credible interval is a direct probability statement about p given the data — exactly the object the path MC needs. And the posterior is a *distribution*, not a point: feeding the MC a fixed WR = 66.7% ignores parameter uncertainty; drawing p from Beta(α+x, β+n−x) per simulated path propagates it (a "Bayesian bootstrap" layer). With small n this widens the outcome bands materially — honestly.
- **Prior-sensitivity discipline:** report the posterior under Jeffreys *and* under the informative carry-forward prior. If conclusions differ, the data are too thin for the decision — that disagreement is itself the finding. (Standard robust-Bayes practice; e.g. posterior means above differ by <1 pt at n=15, but tail probabilities differ: P(WR>55%) = 0.82 Jeffreys vs 0.88 with a 10-pseudo-trade 65% prior.)

## Details / mechanics

**Month-over-month protocol (concrete):**

1. Start of walk: prior = Jeffreys Beta(0.5, 0.5). Do **not** encode the replay-derived "~65–70% observed" belief as a strong prior — it came from the same data that will update it (double-counting).
2. End of month M: posterior = Beta(0.5 + Σwins, 0.5 + Σlosses) over all months so far. Log four numbers in the harvest note: posterior mean, 95% equal-tailed CI (Beta quantiles), P(WR > 50%), P(WR > break-even WR for the frozen geometry).
3. Regime/era caveat: pooling months assumes one stationary p. If the era-split protocol (topic 47) flags a WR break between months, restart the accumulation at the break and treat prior months as an *informative but discounted* prior — multiply (α, β) by a discount δ ∈ [0.3, 0.7] ("power prior") instead of carrying them at full weight.
4. Script vs discretionary sleeves get separate posteriors — never pool them (the Dual46 canvas rule already enforces the split).

**Edge cases:** a 0-loss or 0-win month makes the Wald interval degenerate but the Jeffreys posterior remains proper (this is precisely why Jeffreys is the recommended small-n interval). For x = 0 or x = n, quote the one-sided bound.

**What the posterior feeds:**

- **Path MC:** per-simulation, draw p ~ posterior, then simulate the month at that p (or equivalently, resample trades with Dirichlet weights). Compare `E[$/wk]` bands vs fixed-p runs; the delta is the price of parameter uncertainty.
- **Streak math:** `losing-streak-math.md` computed streak odds at a fixed 65% WR. Integrating over the posterior fattens the streak tail (Jensen: streak risk is convex in loss probability) — the honest streak number at n=15 is worse than the point-estimate number.

## APPLICATION TO THE VAULT

1. **Immediate logging change (May-walk, zero code):** add a standing line to each monthly harvest note — `WR posterior: Beta(a,b) · mean · 95% CI · P(>break-even)` — computed by the two-line quantile formula above. June's line today: `Beta(10.5, 5.5) · 0.656 · [0.42, 0.86] · P(>50%)=0.90` (adjust to the true ledger counts when pulled fresh, per the dual46 canvas rule).
2. **Scorecard honesty rule:** any claim of "~65–70% WR" must carry the credible interval beside it until n ≥ 40. At n=15 the interval spans 44 points; income projections quoted off the point estimate alone overstate certainty.
3. **Path-MC backlog item:** add optional `wrPosterior?: {alpha, beta}` sampling to the MC so pass/bust/`E[$/wk]` bands include parameter uncertainty. This is a small, isolated engine change and composes with the regime-MC upgrade (topic 42).
4. **Kill/promote asymmetry:** for candidate sleeves, use the posterior *lower* bound (e.g. p05) in the geometry check, not the mean — a Stage-0 candidate whose economics only work at the posterior mean is being promoted on hope. Dual46 itself is frozen; this applies to NWOG and future sleeves.
5. **Break-even framing:** the decision-relevant tail probability is P(WR > break-even for the frozen 1:5-capped geometry), not P(WR > 50%). Compute break-even from `expectancy-math-wr-rr-capped-payoffs.md` (with the 100-pt cap and observed average win, not the nominal 5R) and log that probability monthly — it is the single most compressed statement of "is the edge real yet."

## Sources

- Beta-binomial conjugate updating (posterior algebra, prior ESS, prior menu) — https://metricgate.com/docs/beta-binomial-conjugate-updating/ ; https://metricgate.com/docs/bayesian-binomial-beta-update/
- Jeffreys interval properties (coverage, small-n recommendation, x=0/x=n handling) — https://metricgate.com/docs/jeffreys-interval/ ; Downey, *Think Bayes 2* beta example — https://github.com/AllenDowney/ThinkBayes2/blob/master/examples/beta.ipynb
- Sequential updating / data-order invariance (Kruschke 2015 §5.2.1, via) — https://sesen.ai/blog/from-mle-to-bayesian-inference
- Numbers in EVIDENCE computed exactly this session via regularized-incomplete-beta quantiles (node, bisection; reproducible one-liner in the cycle log)
- Cross-refs: `minimum-sample-size-statistical-significance.md`, `losing-streak-math.md`, `expectancy-math-wr-rr-capped-payoffs.md`, topic 47 note (era-splitting) for the stationarity caveat
