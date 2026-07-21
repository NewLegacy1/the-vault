---
topic: order-flow-absorption
researched: 2026-07-21
sources: 5
agent-cycle: adhoc-auction-2026-07-21
---
# Order-flow absorption (vs exhaustion)

## Key findings

- **CLAIM:** **Absorption** = aggressive market orders (hitting bid or lifting offer) are **consumed by passive limit liquidity** such that price **fails to displace** (or displaces far less than the aggression implies). Aggressors work; passives get filled. **EVIDENCE:** Standard order-flow glossaries (SCS / OrderFlow Labs); definitional — not a Vault measured edge.
- **CLAIM:** **Exhaustion** ≠ absorption. Exhaustion = late-trend **delta spike in the trend direction** then **immediate reversal on lighter follow-through** — fuel spent. Absorption = aggression **without** progress (passive win). **EVIDENCE:** Practitioner teaching (SCS footprint guide); do not conflate in journals.
- **CLAIM (signatures):** Footprint / Number Bars — heavy ask volume at the high with no break (or heavy bid at the low with no break); bar delta large while body small; DOM — resting size that **refills** as it is hit. Cumulative delta vs price divergence is often *after* absorption, not a clean lead. **EVIDENCE:** Practitioner CLAIM only.
- **Data requirement:** Needs **volume-at-price / (ideally) aggressor or depth**. **Update 2026-07-21:** TradingView **Premium+** has native **Volume Footprint** + Pine `request.footprint()` — good enough to **learn** absorption/exhaustion and draft countable rules. Caveat (**EVIDENCE, TV Help**): TV buy/sell split is from **intrabar OHLC direction**, not Sierra-style bid×ask aggressor prints — do not mix TV and Sierra deltas in one Stage-0 sample. **Sierra Numbers Bars** + depth remains the higher-fidelity path when a registered hypothesis needs it — see [[auction-order-flow-tv-premium-vs-sierra-prop]].
- **Hard stop for R&D:** Do **not** promote “absorption edge” as Stage-0 without a **measurable definition** (thresholds, window, instrument, fill model) and event-study path. Knowledge ≠ Lab claim.

## Details / mechanics

**Mechanics.** Buyer lifts offer repeatedly → if sellers refill the offer, price stalls → positive delta, flat/down next prints = buy absorption. Symmetric for sell absorption at lows.

**vs iceberg / hidden size.** Similar footprint; iceberg is a *source* of passive refill, absorption is the *observed* aggression-without-progress pattern. Journal the pattern, not the inferred identity of the passive.

**False positives.** News prints thin the book then refill — looks like absorption but is microstructure stand-down territory (see ops news note). Wide spreads and one-lot noise on MNQ overnight are not Dual46-window absorption.

**Sierra stub.** Chart Type → **Numbers Bars**; calibrate imbalance ratio per MNQ; optional Volume at Price Threshold alerts. Pair with session VBP for context — not as a Dual46 input.

## APPLICATION TO THE VAULT

- **Census only at Dual46 RB tap** — optional journal flags (`absorp_at_tap?`, `delta_vs_body`) when Sierra is available during replay/live review. Eyes-only / post-trade; **does not** change arm, stop, or TP mid-May walk.
- **Limit-fill / wick link:** Dual46 limit entries that fill into a wick already sit near “passive got filled while aggression printed.” Absorption census is a *label for that microstructure story*, not a new entry model. Ties to fill-haircut / limit-fill notes — do not double-count as edge.
- **No Stage-0** from absorption folklore. If ever promoted: define measurable event (e.g. ask VAP ≥ X at swing high + no N-tick break in T seconds) → CSV → `analyze-event-study.ts` → EV±CI → path MC `E[$/wk]`. One open Stage-0 candidate at a time; Dual46 freeze untouched.
- Cross-link: profiles → [[tpo-market-profile-basics]], [[volume-profile-poc-vah-val]]; hub → [[../hubs/hub-auction]]; fills → [[limit-order-fill-modeling-queue-position]], [[fill-haircut-defaults-stage0-lab]].

## Sources

1. SCS — Sierra Chart Footprint / Numbers Bars complete guide (absorption vs exhaustion) — https://www.scstudies.com/blog/sierra-chart-footprint-complete-guide
2. SCS Glossary — Absorption — https://www.scstudies.com/glossary/absorption
3. SCS Glossary — Numbers Bars — https://www.scstudies.com/glossary/numbers-bars
4. SCS Glossary — Footprint chart — https://www.scstudies.com/glossary/footprint-chart
5. OrderFlow Labs — Footprint charts (bid/ask, absorption; Sierra Numbers Bars) — https://orderflowlabs.com/blogs/theblog/footprint-chart-guide
