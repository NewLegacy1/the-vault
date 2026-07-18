---
topic: eval-timeout-fee-drag-modeling · researched: 2026-07-18 · sources: 6 · agent-cycle: cycle3-laneA
---
# Eval Timeout & Fee-Drag Modeling: Time-to-Pass Distributions and the Monthly-Fee Bleed

Extends `monte-carlo-prop-firm-survival.md` and the DeltaTrend finding that his Powell build showed **~55% probability of timing out** an eval (low-WR/high-RR wins too infrequently). Question: how to model time-to-pass and fee bleed analytically and in the path MC, and how to add a timeout dimension to the scorecard.

## Key findings

- **CLAIM (standard math):** for an equity path approximated by drifted Brownian motion \(X_t = \nu t + \sigma W_t\), the first-passage time to a profit target \(a\) is **inverse-Gaussian (Wald)**: mean \(a/\nu\), shape \(a^2/\sigma^2\), variance \(a\sigma^2/\nu^3\), skewness \(3\sqrt{\mu/\lambda} = 3\sqrt{\nu\sigma^2/(a\nu^2)}\cdot\) — strongly right-skewed when drift is small relative to volatility. Consequence: **median time-to-pass is well below the mean, and the right tail (slow passes) is fat** — exactly the paths where monthly fees accumulate. (Wikipedia/IG; Wald 1947 via LibreTexts.)
- **Structural reading for geometry:** \(\nu\) = per-week trade EV, \(\sigma^2\) = per-week P&L variance. Two strategies with identical EV but different variance have the *same mean* time-to-pass but very different spreads: the low-WR/high-RR shape (big \(\sigma\)) passes lightning-fast on lucky streaks and bleeds subscription fees for months on unlucky ones — and also busts more (the trailing-DD barrier is the absorbing lower boundary the IG formula ignores). This is the analytic skeleton behind DeltaTrend's simulated 55% Powell timeout and his "pass rate falls as trade-P&L std-dev rises" result.
- **EVIDENCE (TopStep published 2025 cohort data):** 16.8% of Trading Combine *attempts* pass; 51.8% of *participants* eventually reach the funded level (i.e., persistence across multiple attempts roughly triples the per-attempt rate); 33.3% of funded-level traders got ≥1 payout; 0.71% of Express Funded traders reached Live Funded. Pricing as of April 2026: $49/$99/$149 per month for 50K/100K/150K, one-time $149 activation (or a "No Activation Fee" path at higher monthly, e.g. $95 vs $49 on the 50K — a pure cost optimization on expected months subscribed). **There is no hard time limit — the monthly subscription *is* the timeout mechanism**: slow evals don't fail, they bleed.
- **Fee-bleed identity (derivable, no source needed):** expected fees per funded account
  \(E[\text{fees}] = E[\text{attempts}] \times (E[\text{months per attempt}] \times \text{monthlyFee}) + \text{activation}\), with \(E[\text{attempts}] = 1/p_\text{pass}\) if attempts are i.i.d. (geometric). At TopStep's 16.8% per-attempt rate that is ~6 attempts on average for the marginal trader; at Dual46's simulated pass rates it should be near 1–2. The dominant unknown is **E[months per attempt]**, which only the path MC's time dimension can supply — hence "time-to-pass distribution" belongs on the scorecard, not just pass probability.
- **Timeout as a third absorbing state:** an eval attempt ends in {pass, bust, quit/timeout}. With no firm-imposed deadline, "timeout" is a *policy variable*: the trader's own stop-loss on months subscribed. A rational cutoff exists because the option value of continuing a stalled eval falls as accumulated fees rise while pass probability from the current equity level (deep under water vs the trailing DD) shrinks. The MC can price this directly: for each month m, compute P(eventual pass | state at month m) × E[payout] vs. continued fee stream — quit when the former drops below the latter.

## Details / mechanics

**What the Vault's engine already has** (read-only audit of `vault-app/lib/monte-carlo.ts`): `McFees` includes `evalFee`, `activationFee`, `monthlyFee`, `payoutBuffer`; `McResult` already reports `timeoutRate`, `tradesToPassP50/P90`, and `economics.weeksToPassP50/P90`, `weeksToPayoutP50/P90`, `expectedNetPerAccountUsd`. So the engine models fee drag structurally. What the *scorecard* hierarchy does not yet do is treat the **time dimension as a first-class kill/promote criterion** — the DeltaTrend Powell case (positive $206 net EV per account, yet 55% timeouts and ~10 days pass-to-payout) shows a strategy can look net-positive while being practically untradeable because capital and morale are locked in stalled evals.

**Scorecard timeout dimension — proposed columns (post-May backlog):**

| Column | Definition | Red line (proposal) |
|---|---|---|
| `weeksToPassP90` | 90th pct weeks to pass among passing paths | > 12 weeks → flag |
| `timeoutRate@26w` | fraction of paths neither passed nor busted by week 26 | > 25% → flag |
| `feeDragP50 / P90` | cumulative monthly+activation fees on median / p90 path | fee p90 > 30% of median payout → flag |
| `feeAdjEwk` | `E[$/wk]` net of expected fee stream (already implicit in `expectedNetPerAccountUsd`; surface per-week) | must remain > 0 |

**Analytic quick-check (no MC needed, for Stage-0 triage):** with per-week EV \(\nu\) and per-week std \(\sigma\) from the event study, mean weeks-to-pass ≈ \(a/\nu\) and the IG 90th percentile can be read from the closed-form CDF \(\Phi[\sqrt{\lambda/t}(t/\mu - 1)] + e^{2\lambda/\mu}\Phi[-\sqrt{\lambda/t}(t/\mu + 1)]\). If mean weeks-to-pass at the candidate's Stage-0 EV already exceeds ~8–10 weeks on a 50K target ($3,000), the candidate is a fee-bleeder regardless of its EV sign — kill-triage before any full MC. Caveat: the IG formula has no lower barrier, so it *understates* effective time-to-pass; it is a cheap optimistic bound (if it already fails, the MC will fail harder).

**Attempts-level economics:** model account attempts as a geometric sequence with per-attempt outcome probabilities from the MC (pass/bust/quit). TopStep resets cost the same as the monthly subscription, so a bust mid-month is cheaper than a slow grind — a perverse but real feature: **high-variance geometries fail cheap and fast; low-drift geometries fail expensive and slow.** Fee drag punishes stall, not risk.

## APPLICATION TO THE VAULT

1. **Dual46's shape is fee-favorable and the numbers should prove it.** High WR (~65–70%) with one trade/day gives high drift relative to variance → IG time-to-pass concentrates near its mean with thin right tail → low timeout exposure. Action: surface `weeksToPassP90` and `timeoutRate@26w` from the existing MC output into the SCORECARD as standing columns (they are already computed — this is a reporting change, not an engine change).
2. **Adopt the four timeout columns above for every candidate sleeve (Stage-0 onward).** The Powell/DeltaTrend case is the cautionary precedent already in the vault: net-EV-positive but 55% timeout. A sleeve that passes trade-EV gates but flags on `timeoutRate@26w` is not income — it is a lottery ticket with a subscription fee.
3. **Add the IG analytic triage to Stage-0.** `analyze-event-study.ts` already emits per-event EV and variance; one derived line — implied mean and p90 weeks-to-pass on a 50K target — costs nothing and kills fee-bleeders before MC time is spent. (Optimistic bound; only ever used to kill, never to promote.)
4. **Quit-rule research item (post-May):** use the MC's per-month state distribution to compute the break-even month where continuing a stalled eval has negative expected value net of fees. This turns "when do I abandon an eval account" from vibes into a number — directly relevant once multiple funded/eval accounts are running.
5. **Fee-path choice is a solvable arithmetic problem:** TopStep's Standard ($49/mo + $149 activation) vs No-Activation ($95/mo + $0) crossover is at ~3.2 months subscribed. Dual46's expected months-to-pass from the MC picks the path; log the choice and its basis in the ops notes.

## Sources

- TopStep published 2025 cohort statistics (16.8% / 51.8% / 33.3% / 0.71%) and April-2026 pricing — https://www.topstep.com/our-program , https://www.topstep.com/no-activation-fee , summarized at https://proptradingvibes.com/blog/topstep-accounts-overview
- Inverse Gaussian first-passage distribution (mean a/ν, shape a²/σ², closed-form CDF) — https://wikipedia.org/wiki/Inverse_Gaussian_distribution ; https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/05%3A_Special_Distributions/5.37%3A_The_Wald_Distribution
- Wald (1947) sequential-analysis origin of the distribution (via Numdam first-passage survey) — https://www.numdam.org/item/AIHPB_1990__26_1_145_0.pdf
- DeltaTrend Powell-build timeout evidence — `deltatrend-guru-quantification-powell-detail.md` (55% timeout, $206 net EV), `deltatrend-monte-carlo-markov-prop-convexity.md` (pass rate vs P&L std-dev)
- Cross-refs: `monte-carlo-prop-firm-survival.md`, `prop-firm-landscape-2026.md`, `vault-app/lib/monte-carlo.ts` (existing `timeoutRate`, `weeksToPassP50/P90`, `McFees`)
