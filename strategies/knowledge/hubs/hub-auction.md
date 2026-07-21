---
updated: 2026-07-21
tags: [knowledge, hub, moc, auction, profile, order-flow]
---
# Hub — Auction / profile / order flow

Quant-adjacent session structure: **TPO**, **volume profile**, **absorption**.
Context and optional journal columns only — **not** Dual46 lock inputs, **not** Lab promote.

## Start here

1. [[../quant/tpo-market-profile-basics]] — letters, POC, VA ~70%, IB, Sierra **TPO Profile Chart**
2. [[../quant/volume-profile-poc-vah-val]] — contracts vs time; HVN/LVN; prefer volume POC for NQ/MNQ (CLAIM)
3. [[../quant/order-flow-absorption]] — aggression without displacement; census at RB tap only

## Dual46 rule of thumb

| Use | Don’t |
|---|---|
| Eyes-only at 10:00 leave (open vs prior VA; IB vs OR30) | Mid-May lock / Pine edits |
| Optional journal: priorVAH/VAL/POC, `absorp_at_tap?` | Stage-0 without measurable definition |
| Sierra for TPO + Numbers Bars | Treat TV candles as footprint |

Related regimes: [[hub-regimes]] (`or30Band`) · ops fills: [[hub-ops]].

## Sierra setup stub (minimal)

1. Intraday NQ/MNQ chart, RTH session times set correctly.
2. **Analysis → Studies → TPO Profile Chart** (not “Market Profile”) — 30m letters, ~70% VA, show POC/VAH/VAL.
3. Add **Volume by Price (VBP)**; align period to session / TPO as needed; show volume POC + VA.
4. Separate chart: **Chart Type → Numbers Bars** for footprint / delta; optional DOM.
5. Save chartbook template (e.g. `MNQ_Auction_RTH`) — do not wire into Dual46 Pine.

## Unresolved: DDY

User asked about **“DDY.”** Not confidently identified in this cycle — **do not invent a definition.**

Plausible candidates (clarify which, if any):

| Candidate | Why it might be “DDY” |
|---|---|
| **Developing Day** / developing profile (POC/VA still forming) | Common MP speech; “developing” abbreviated oddly |
| **Typo / shorthand for TPO day-type** (normal, trend, neutral…) | Adjacent to IB / balance-vs-trend teaching |
| **Sierra template / study / chartbook brand** | User-specific abbreviation |
| **Something else** (vendor indicator, Discord slang, non-auction) | Unknown |

**Ask:** What does DDY mean in your usage (platform, screenshot, or full phrase)? Until then, no note claims a DDY mechanic.
