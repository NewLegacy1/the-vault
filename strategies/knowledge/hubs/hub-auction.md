---
updated: 2026-07-21
tags: [knowledge, hub, moc, auction, profile, order-flow]
---
# Hub — Auction / profile / order flow

Quant-adjacent session structure: **TPO**, **volume profile**, **footprint / absorption**.
Context and optional journal columns only — **not** Dual46 lock inputs, **not** Lab promote.

## Start here

1. [[../quant/auction-order-flow-tv-premium-vs-sierra-prop]] — **TV Premium first** (footprint + VP + 2-week learn) · Sierra buy gate · prop paths A/B/C
2. [[../quant/tpo-market-profile-basics]] — letters, POC, VA ~70%, IB, Sierra **TPO Profile Chart**
3. [[../quant/volume-profile-poc-vah-val]] — contracts vs time; HVN/LVN; prefer volume POC for NQ/MNQ (CLAIM)
4. [[../quant/order-flow-absorption]] — aggression without displacement; census at RB tap only

## Dual46 rule of thumb

| Use | Don’t |
|---|---|
| Eyes-only at 10:00 leave (open vs prior VA; IB vs OR30) | Mid-May lock / Pine edits |
| Optional journal: priorVAH/VAL/POC, `absorp_at_tap?` | Stage-0 without measurable definition |
| TV Premium footprint + Session VP for learning | Assume TV footprint = Sierra aggressor Numbers Bars |
| Sierra later only if Stage-0 needs TPO/depth/MBO | Pay Sierra / DDY hoping for edge |

Related regimes: [[hub-regimes]] (`or30Band`) · ops fills: [[hub-ops]] · parked OF sketches: [[../../strategy-dev/60-track-b/parked-of-auction-sleeve-sketches]].

## TradingView Premium stub (do this before Sierra)

1. Chart type → **Volume Footprint** (Premium+).
2. Add **Session Volume Profile** (+ Fixed Range for prior-day LVN/HVN maps).
3. Optional CVD pane; mark prior VAH/VAL/POC · ONH/ONL before the session.
4. Run the 2-week protocol in [[../quant/auction-order-flow-tv-premium-vs-sierra-prop]].
5. Pine later: `request.footprint()` for measurable events — still not Dual46.

## Sierra setup stub (minimal — after TV fluency)

Full DIY recipe: [[../quant/sierra-chart-tpo-volume-diy-template]]

1. Intraday NQ/MNQ chart, RTH session times set correctly.
2. **Analysis → Studies → TPO Profile Chart** (not “Market Profile”) — 30m letters, ~70% VA, show POC/VAH/VAL.
3. Add **Volume by Price (VBP)**; align period to session / TPO; show volume POC + VA.
4. Separate chart: **Numbers Bars** for footprint / delta; optional DOM.
5. Save chartbook `MNQ_Auction_RTH` — do not wire into Dual46 Pine.

## Unresolved: DDY → **resolved 2026-07-21**

**DDY = Delta Dynamics** ([deltady.com](https://deltady.com/)) — third-party **order-flow study pack** for Sierra Chart (and MotiveWave). Their site literally brands studies as “DDY.” Not a Sierra-native study name.

| Piece | Meaning |
|---|---|
| **Sierra Chart** | The platform (often misheard as “Ciara chart”) |
| **DDY template** | Usually a **chartbook / study collection** built around Delta Dynamics studies (volume profile + delta, absorption/aggression, MGI levels, etc.) — vendor convenience, not a CME standard |

Native Sierra equivalents if you skip DDY: **TPO Profile Chart** + **Volume by Price** + **Numbers Bars** — see [[../quant/sierra-chart-tpo-volume-diy-template]].

DDY can be useful for learning absorption/delta visuals; it is **not** required for Dual46 and is **not** a Lab edge by itself.
