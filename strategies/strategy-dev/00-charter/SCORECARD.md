---
updated: 2026-07-15
tags: [scorecard, strategy-dev, promote]
---
# Strategy scorecard — success / failure

> Every Lab cohort and Stage-0 event study ends with **toward / away / kill**.  
> Metric hierarchy: path MC first → trade EV ± CI → risk geometry (diagnostic only).

## Hierarchy (do not invert)

| Rank | Metric | Role |
|---|---|---|
| 1 | Path MC + net EV after fees (`E[$/wk]`, pass/bust/timeout, chain EV) | **Promote / kill authority** |
| 2 | Trade EV $ + bootstrap CI (IS + OOS) | Stage-0 / ledger diagnostics |
| 3 | Risk geometry (WR, avg win/loss, RR, trade PnL SD) | Barrier intuition — **not KPIs** |

WR / avg RR alone never settle an experiment.

## Eval targets (TPT $50K)

| Field | Success (toward) | Failure (away / kill) |
|---|---|---|
| `E[$/wk]` after fees | Competitive vs A0a gated baseline | ≤ ungated / negative without a documented ops fix |
| Bust rate | ↓ vs baseline on same window | ↑ or trail-hostile loss shape |
| Pass → P(payout\|pass) | Holds with consistency | Pass but consistency-blocked spike |
| Trade EV OOS CI | Does not include 0 (or context hypothesis registered) | OOS CI covers 0 with no context plan |
| Max consecutive loss × avg loss | Fits $2k trail | 3–5L path regularly busts trail |
| Execution haircut | Slip/fee band applied before “edge” language | Gross-only stories |

## Funded targets

| Field | Success | Failure |
|---|---|---|
| `E[$/wk]` recycle loop | Positive after fees on 3y + OOS | Fast pass with tiny / negative extract |
| Weeks → first payout | Competitive vs D1/H0b leaders | Slow extract that dies on chain EV |
| Geometry | Documented; may differ from eval | Blind high-RR fat losses under intraday trail |

Eval and funded may want **different geometries** — always separate MC.

## Convex product framing

Prop challenge + funded ≈ **convex payoff**: economic downside ≈ fees paid; payouts can be realized. That does **not** license zero-edge forever books. Durable income still needs trail-compatible loss shape + positive `E[$/wk]` on full + OOS evidence. See [[prop-firm-math]].

## Four gates (optimizable / Track B edges)

Before Lab strategy MC promote:

1. IS excellence (not obviously overfit)  
2. IS **price-permutation** quasi-p (see [[permutation-tests]])  
3. Walk-forward  
4. WF price-permutation  

Locked PRB v1 (no free param search) is exempt from re-optimize loops; still needs OOS / decay hygiene.

## Verdict language

| Token | Meaning |
|---|---|
| **toward** | Closer to SCORECARD success on primary metrics |
| **away** | Worse on primary metrics; do not promote |
| **kill** | Graveyard; do not retune without new Stage-0 evidence |

## Breadth vs correlated A/Bs (Grinold translation)

Information ratio thinking: value-add per unit of active risk. Fundamental law: skill × √breadth — and **independent** is doing the work.

| Vault situation | Breadth reading |
|---|---|
| Macro ∥ PRB (chain EV, different predicates) | Real breadth — count as separate books |
| Ten Pine A/Bs on the same fills / same session ORB | Usually **one** bet; do not claim more skill from stacking filters |
| Jul+Oct calendar + path cold-3L on same ledger | Often one regime context hypothesis, not two alphas |

Promote language: prefer `E[$/wk]` / bust (IR-style) over “we added another gate.” Correlated filters ≠ √N.

## Implementation shortfall (prop form)

Gross TV trade EV vs **net** path EV after fees/slip is the vault analog of implementation shortfall. Timeout-dominated MC paths are opportunity cost. Never close a cohort on gross-only.

## Point-in-time (single continuous)

No CUSIP matching required. Still ask: was this calendar/news/version **known as of the trade date**? Cohort + `mc_engine_version` is reproducible “time travel.” Do not silently restate early years with a filter invented later without OOS labeling.

## Decay check (weekly review)

Compare latest OOS / rolling window to IS. Collapsing OOS EV or `E[$/wk]` → **away** (α-decay), not “one bad week — press on.”
