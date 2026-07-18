---
topic: deltatrend-monte-carlo-markov-prop-convexity · researched: 2026-07-18 · sources: 5 · agent-cycle: cycle2-deltatrend
---
# DeltaTrend's Validation Toolkit: Three Monte Carlo Flavors, Markov Regimes, and Prop-Firm Convexity

Synthesis of "How To: Monte Carlo Simulation," "Markov Chains & Steady States," and "stop trading like an idiot" parts 1–2 (DeltaTrend Trading / Thomas Skinner). Extends `quant/monte-carlo-prop-firm-survival.md` with one genuinely new technique (regime-switching MC) and one quantified geometry result (pass rate vs P&L standard deviation).

## Key findings

- **A backtest is one draw from a stochastic process** (CLAIM): same distribution, different ordering → different max drawdown and terminal equity. His demo strategy (EVIDENCE, on screen): per-trade EV 90% CI of −0.26% to +0.47% — spans zero, so "you can't say that this strategy is statistically distinguishable from a strategy with no edge" [monte-carlo, 0:53–1:04]; and 64% of reshuffled paths had a *less* severe max drawdown than the actual backtest path [4:05–4:10], i.e. the realized path was unluckier than median.
- **Three MC flavors with explicit applicability rules** (CLAIM/mechanics): (1) reshuffling — sample trade returns with replacement; (2) regime-switching — tag every trade with a regime, build a Markov transition matrix from observed trade-to-trade regime transitions, then sample regime-conditionally; (3) parametric — fit a continuous distribution to capture unobserved tails. He explicitly warns parametric "often does not make that much sense" for retail because hard stops/TPs cap the tails [10:18–10:33] — consistent with the Vault's choice of trade-level resampling.
- **Regime-switching MC preserves clustering** (CLAIM): plain reshuffling destroys the serial structure of trade returns; "almost every single trading strategy is regime dependent" [13:40–13:42]. The transition matrix can also be estimated from a longer dataset than the backtest itself [8:58–9:07].
- **Markov steady state = long-run regime budget** (CLAIM, from the Markov video): solving (I−T)s = 0 with Σs=1 gives the fraction of time spent in each regime, usable to set base exposure [8:02–8:12]. Toy math video, but it's the analytic companion to the transition matrix used in regime-switching MC.
- **Prop accounts are convex structured products** (CLAIM): losses cap at fees paid, wins are realized — "like a call option" [idiot-1, 2:25–2:26]. Therefore even a zero-EV strategy can have positive *net* EV across repeated cheap evals. This is the same doctrine as `quant/monte-carlo-prop-firm-survival.md`, arrived at independently.
- **Pass rate is driven by trade-P&L standard deviation, not just EV** (EVIDENCE, simulated on a TopStep 50K model with zero-EV toy strategies): 4:1 RR / 20% WR passed 37%; pass probability rose monotonically as RR fell and WR rose, up to wide-stop/75%-WR variants. "As the standard deviation of trade P&Ls increases, your pass rate decreases" [idiot-1, 5:35–5:39]. A slightly-positive-EV opening-range-breakout he coded passed ~50% vs TopStep's own reported 12.4% (2024) average pass rate [6:27–6:38].
- **Challenge-phase and funded-phase optimal geometry differ** (EVIDENCE, same sim): the best-passing geometry was *not* the best-payout geometry; re-tuning risk geometry for the funded phase produced ≈$9,000 average expected payout per passed account, ≈$300 average cost to reach a funded account, ≈$8,600 net [idiot-1, 7:29–8:12]. (Toy numbers — zero-EV assumption, one firm's ruleset — directional only.)
- **Options-pricing video** adds only one Vault-relevant idea: fair value = probability-weighted payoff integrated over the outcome distribution — the identical EV-over-distribution logic he applies to prop challenges. No separate note warranted.

## Details / mechanics

**Regime-switching MC recipe** (monte-carlo, 4:36–9:07): (1) add a regime column to the backtest trade log via any regime classifier; (2) split trade returns into per-regime distributions; (3) count trade-to-trade regime transitions → row-normalized transition matrix; (4) to build each synthetic path: draw a starting regime, sample a trade from that regime's distribution, then transition per the matrix probabilities; repeat for the path length; (5) repeat 10⁴–10⁶ paths. Output: regime-aware drawdown/terminal-equity/barrier statistics.

**Prop geometry sim setup** (idiot-1): all toy strategies constructed to zero EV per trade (e.g. 4:1 RR at 20% WR, 1:1 at 50%, sub-1:1 at 62.5–75%), simulated as barrier problems on a TopStep 50K ruleset with GBM / jump-diffusion price paths. He models the funded phase separately with withdrawals, profit splits, and trailing drawdown (detailed further in idiot-2's description of the QuantPad prop assistant [11:35–12:22]).

**QuantPad product facts** (idiot-2, vendor claims): three prongs — (1) cloud AI coding agent with all-you-can-eat market data: full-history OHLCV to 1-second granularity, last 1 year of tick data, last 1 month of L2, for all CME futures, US equities, and equity options, plus SEC filings and Fed macro data (his cost anchor: 16 years of 1-second Nasdaq bars ≈ $1,163 on Databento [6:47–6:53]); Pine Script generation with a proprietary TradingView linter; (2) "Quant Co-Pilot" — non-agent validation pipeline that grades an uploaded trade log, runs normal + regime-aware MC, surfaces feature correlations, and includes the prop-firm assistant (pass probability, net EV per account, days-to-payout); (3) community library. Launched late June 2026.

## APPLICATION TO THE VAULT

1. **Path-MC hierarchy confirmed.** His whole toolkit is an argument that barrier/path questions (eval pass, payout timing) can only be answered by resampling — which is exactly the Vault's `E[$/wk]`-first scorecard rule. No change.
2. **Concrete upgrade candidate: regime-switching MC.** The Vault's path MC currently reshuffles trades i.i.d. If Dual46 outcomes cluster by vol regime (queue topic #32 will test this), plain reshuffling *understates* drawdown-cluster risk. Post-May backlog: tag the Dual46 ledger with a simple 2-state vol regime, build the transition matrix, and compare regime-aware vs i.i.d. `E[$/wk]` and eval-pass distributions. If they diverge materially, adopt regime-aware as the scorecard default. The Markov steady-state vector is a free by-product (long-run % of weeks in each regime).
3. **The geometry result cuts both ways for Dual46.** Dual46 is high-RR (1:5) — the geometry his sim ranks *worst* for pass probability at fixed EV. Dual46 survives this critique only because (a) its WR is far above the zero-EV break-even for 1:5 and (b) the 100-pt cap bounds per-trade variance. But the finding sharpens a known risk: the Powell-style low-WR/high-RR shape times out evals (his Powell build: ~55% timeout probability — see `deltatrend-guru-quantification-powell-detail.md`). Ensure the path MC explicitly models eval time limits/timeout, not just the drawdown barrier.
4. **Funded ≠ challenge geometry** is worth a backlog line: once an eval is passed, his sims say the payout-maximizing risk posture differs from the pass-maximizing one. The Vault currently treats both phases with one frozen geometry (correctly, under the freeze) — but the post-May backlog can quantify whether a funded-phase-specific sizing rule (within firm rules, without touching entry logic) improves `E[$/wk]`.
5. **QuantPad flag** (evaluation candidate only): its prop-firm assistant claims exactly the trailing-drawdown-aware structured-product MC the Vault already built in-house, and its data/backtest stack targets the "waiting for TV export" bottleneck. Vendor-sourced claims, zero independent verification, product weeks old. Trial-before-trust; not a recommendation.

## Sources

- How To: Monte Carlo Simulation: https://www.youtube.com/watch?v=jGhk-uSrtII
- Quant Trading: Markov Chains & Steady States: https://www.youtube.com/watch?v=vQ9n4SaFxHE
- stop trading like an idiot: https://www.youtube.com/watch?v=BiTqwX-4rNw
- stop trading like an idiot pt. 2: https://www.youtube.com/watch?v=TSmF8IU-rrM
- The One Idea Behind All Options Pricing: https://www.youtube.com/watch?v=AR1CQUCMgnE
- Transcripts: `vault-app/data/deltatrend-transcripts/` (fetch script `vault-app/scripts/fetch-deltatrend-transcripts.ts`)
- Cross-refs: `quant/monte-carlo-prop-firm-survival.md`, `quant/expectancy-math-wr-rr-capped-payoffs.md`, `quant/position-sizing-under-trailing-drawdown.md`
