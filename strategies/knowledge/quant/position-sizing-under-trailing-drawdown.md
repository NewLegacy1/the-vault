---
topic: position-sizing-under-trailing-drawdown
researched: 2026-07-17
sources: 9
agent-cycle: wave-1
---
# Position Sizing Under Trailing Drawdown: Kelly, Fixed-Fractional, and Prop-Firm-Optimal Sizing

## Key findings

- **Kelly maximizes long-run geometric growth, but full Kelly routinely produces 50%+ drawdowns** — mathematically survivable with infinite bankroll, fatal under any drawdown rule. Betting *above* Kelly reduces growth and eventually guarantees ruin despite positive expectancy (Kelly criterion, Wikipedia summary of Kelly 1956/MacLean-Thorp; Ryan O'Connell CFA). Established theory.
- **The growth curve is flat near the optimum**: half-Kelly keeps ~75% of the growth rate with ~50% of the volatility; quarter-Kelly keeps ~44% with ~75% volatility reduction. Under-betting costs little; over-betting is catastrophic — so estimation error argues for fractional Kelly always (O'Connell; Wikipedia). Data-backed.
- **Risk-constrained Kelly (Busseti, Ryu & Boyd 2016) is the rigorous upgrade for prop accounts**: instead of an arbitrary fraction, maximize E log growth subject to Prob(W_min < α) < β — a drawdown-probability constraint made convex via E[(rᵀb)^(−λ)] ≤ 1 with λ = log β / log α. It converts a survival rule (exactly what a prop firm imposes) into a sizing input (Busseti et al., Stanford; Atlas Peak Research survey). Peer-reviewed.
- **Fixed-fractional (1–2% of equity per trade) is the practitioner default and the de-facto prop-firm standard**: it bounds every loss, auto-de-risks in drawdown, and has predictable drawdown behavior; prop-specific guidance tightens this to 0.25–2% *of the drawdown allowance*, not the nominal account (QuantOracle comparison; CrossTrade; Damn Prop Firms). Consensus practice; the specific percentages are convention.
- **Optimal f (Vince 1990) anchors on the worst historical loss and is widely considered too aggressive**: it assumes the worst observed loss is the worst possible loss, which it almost never is. Secure f (Zamansky & Stendahl 1998) re-derives it with an explicit max-drawdown constraint (QuantOracle; Zamansky & Stendahl, TASC). The critique is consensus opinion backed by simulation studies.
- **Fixed-ratio (Ryan Jones) addresses whole-contract granularity**: add one contract per delta dollars of accumulated profit, with escalating thresholds; built for futures where you cannot trade 1.73 lots. More aggressive early, weaker de-risking in drawdowns (ProfitLogic; TTT Markets). Practitioner method, mixed empirical support.
- **The correct bankroll for prop sizing is the drawdown allowance, not the account balance.** A "$50K" account with a $2.5K trailing allowance is, for ruin purposes, a $2.5K account with leverage. All Kelly/fixed-fractional math should be computed on the buffer (CrossTrade prop-firm RoR guidance; Damn Prop Firms). This reframing is the single most consequential idea across all sources.
- **Layered institutional process** (Atlas Peak, synthesizing the literature): shrink the edge estimate first (Bayesian/estimation-error haircut) → compute raw Kelly → impose the explicit drawdown-probability constraint → apply hard external caps last. Fractional Kelly alone doesn't know *where* your model error lives.

## Details / mechanics

**Discrete Kelly for asymmetric payoff** (Wikipedia; standard form): with win prob p, loss prob q = 1−p, gain g (in R multiples) and loss l per unit staked:

f* = p/l − q/g   (for l = 1R loss, g = b·R gain: f* = p − q/b)

**Fractional Kelly**: bet k·f*, k ∈ {0.25, 0.5}. Equivalent to Kelly under power utility u(x) = x^(1−1/k)/(1−1/k); also interpretable as shrinking your edge estimate toward zero.

**Risk-constrained Kelly** (Busseti–Ryu–Boyd 2016):
- Problem: maximize E log(rᵀb) s.t. bets sum to 1, b ≥ 0, Prob(W_min < α) < β (e.g. α = 0.7 → never lose 30% of bankroll, β = 0.1 → with ≥90% confidence).
- Tractable sufficient condition: E[(rᵀb)^(−λ)] ≤ 1 with λ = log β / log α ⇒ the drawdown constraint holds. λ acts as a single risk-aversion dial; the bound is reported "generally quite tight" in their simulations.
- For a two-outcome bet (Dual46-like) this reduces to a 1-D problem: find largest f ≤ f* with p·(1+g·f)^(−λ) + q·(1−l·f)^(−λ) ≤ 1.

**Fixed-fractional**: risk_$ = c × equity (c = 0.5–2%); contracts = floor(risk_$ / (stop_pts × $/pt)). Auto-compounds and auto-de-risks. Under prop rules substitute equity → remaining buffer (distance to the trailing floor) for the survival-relevant version: risk_$ = c′ × (equity − floor), c′ ≈ 5–10% of buffer per trade is the aggressive end.

**Fixed-ratio** (Jones): contracts N → N+1 requires N·Δ cumulative profit (thresholds escalate: Δ, 2Δ, 3Δ…). Choose Δ ≥ ~2× worst expected drawdown per contract. De-escalate on falling back through thresholds.

**Optimal f / secure f** (Vince; Zamansky–Stendahl): optimal f maximizes Π(1 + f·(−trade_i/worst_loss)) over the trade history; secure f does the same maximization subject to historical max drawdown ≤ chosen limit — always ≤ optimal f, often far below.

## APPLICATION TO THE VAULT

- **Raw Kelly on June numbers is absurdly high — which is the tell that the inputs, not the formula, bind.** p = 0.667, b = 5 (capped) → f* = 0.667 − 0.333/5 ≈ 0.60 of bankroll per trade. Even quarter-Kelly (15%) of a $2.5K allowance is $375/trade — coincidentally right around the current ~$300 average risk at 10 MNQ with mid-range stops. At the Wilson 95% lower-bound win rate (p ≈ 0.42), f* ≈ 0.30 and quarter-Kelly ≈ 7.5% of buffer ≈ $190/trade ≈ 6–7 MNQ on a mid-size stop. Reading: current 10-MNQ sizing is defensible near the point estimate but sits at/above prudent-Kelly under honest parameter uncertainty from n = 15.
- **Size off the buffer, not the account.** For a trailing-DD account the bankroll is (equity − trailing floor). This has a sharp implication the Vault should adopt: **as the floor ratchets up after wins, constant contract size becomes progressively more aggressive in Kelly terms.** The fixed-fractional-on-buffer rule (e.g. risk ≤ 8% of remaining buffer per trade) naturally forces smaller size right after a new equity high — exactly when trailing DD is most dangerous — and allows full size again once the floor locks at breakeven.
- **The variable stop (4.75–33.5 pts) means contracts, not risk, should flex.** At fixed 10 MNQ, a 33.5-pt stop risks $670 (~27% of a $2.5K buffer — over full Kelly at the Wilson bound) while a 4.75-pt stop risks $95 (~4%). Fixed-fractional says: pick a per-trade $ risk (e.g. $200–250 ≈ 8–10% of buffer) and set contracts = risk / (stop × $2/pt/contract) → ~20+ MNQ on the tightest stops (capped by fill reality), ~5 MNQ on the widest. This also directly softens the wide-stop trades that currently dominate tail risk. Counter-consideration: bigger size on sub-10-pt stops collides with the known wick-out problem — if tight stops die to noise more often, their effective p is lower and uniform-$ risk overweights exactly the fragile trades. The Monte Carlo (see companion note) should test both sizing rules against the ledger with stop-size-conditional win rates before switching.
- **Whole-contract granularity is a real but minor issue at 10 MNQ** (Jones's fixed-ratio motivation): steps of 1 MNQ = 10% sizing steps, fine-grained enough that fixed-fractional works; fixed-ratio's escalating-delta machinery adds little here. Where it matters is any future move to NQ minis (1 NQ = 10 MNQ steps) — stay on micros while the buffer is a trailing $2.5–4.5K.
- **Recommended layered rule for the SCORECARD, per the Atlas Peak sequence**: (1) haircut the edge — use Wilson-lower-bound p, not the June point estimate; (2) compute Kelly on the buffer; (3) apply the Busseti-style survival constraint — choose "≤10% chance of losing 70% of the buffer" and solve the 1-D version above (a few lines in the replay engine); (4) hard cap at whatever the prop firm's consistency/size rules impose. Re-derive after each completed walk month as n grows.

## Sources

- Busseti, Ryu & Boyd (2016), "Risk-Constrained Kelly Gambling" (Stanford preprint) — https://web.stanford.edu/~boyd/papers/pdf/kelly.pdf
- Busseti, Ryu & Boyd (2016), Journal of Investing version — https://doi.org/10.3905/joi.2016.25.3.118
- Kelly criterion — Wikipedia (formulas, fractional-Kelly utility equivalence, drawdown behavior) — https://en.wikipedia.org/wiki/Kelly_criterion
- Ryan O'Connell CFA, "Kelly Criterion: Optimal Position Sizing" (fractional-Kelly growth/vol table) — https://ryanoconnellfinance.com/kelly-criterion/
- Atlas Peak Research, "The Kelly Criterion in Financial Markets" (layered sizing framework survey) — https://www.atlaspeakresearch.com/report/07bf72
- QuantOracle, "Kelly vs Fixed Fractional vs Optimal-f" (comparison table, optimal-f critique) — https://quantoracle.dev/compare/kelly-vs-fixed-fractional-vs-optimal-f
- Zamansky & Stendahl (1998), "Secure Fractional" (secure f, TASC) — https://finance.martinsewell.com/money-management/ZaSt98.pdf
- ProfitLogic, "Fixed Ratio Position Sizing: Ryan Jones Method" (delta thresholds, contract granularity) — https://profitlogic.com.au/blog/fixed-ratio-position-sizing-ryan-jones-method
- CrossTrade, "Risk of Ruin" (prop-firm per-trade risk guidance, Kelly formula) — https://crosstrade.io/learn/risk-management/risk-of-ruin
