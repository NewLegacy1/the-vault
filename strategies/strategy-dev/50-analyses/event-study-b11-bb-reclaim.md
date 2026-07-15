---
updated: 2026-07-15
status: settled
verdict: kill
tags: [stage-0, event-study, b11, lane-f]
---
# Event study — B11 BB Reclaim (Lane F)

> [[track-b-b11-bb-reclaim-v0]] · Closed → [[event-study-trackb-bbreclaim-mnq-5m]] (**away / BLOCK** · n=775 · EV −$0.93 · WR~52% / RR~0.88).

## Pre-registered event

On MNQ 5m RTH:

1. `ADX(14) < 25`  
2. Prior bar **closed outside** BB(20, 2) (above upper or below lower)  
3. Current bar **closes back inside** that band (reclaim)  
4. Arm window **10:05–15:00** NY · day count &lt; 3 · flat by 15:55  

Direction: long after lower-band reclaim · short after upper-band reclaim.

## Outcome / barriers (frozen)

| Field | Value |
|---|---|
| Stop | Beyond extremum of pierce+reclaim bar · max 30 pts |
| Target | **1.0R** |
| Risk | $100 |
| Symbol / TF | MNQ continuous · **5m** (0a) |
| Window | Deep BT ~2023-07-01 → today |

0b 1m only after SCORECARD **toward**.

## Export checklist

1. Paste `pine/TrackB_BBReclaim_measure_v0.pine` into TradingView (measure only).  
2. Leave Event / Risk defaults — **do not sweep** ADX, BB, RR.  
3. Deep Backtest · MNQ · 5m · **2023-07-01 → today**.  
4. Export list of trades →  
   `vault-app/data/tv-exports/matrix/trackb-bbreclaim-mnq-5m.csv`  
5. Agent: `npx tsx scripts/analyze-event-study.ts trackb-bbreclaim-mnq-5m.csv`

## SCORECARD (blank until CSV)

| Window | n | EV $ | CI | Verdict |
|---|---:|---:|---|---|
| Full | | | | |
| OOS (≥ 2025-07-14) | | | | |

- [ ] toward / away / kill  
- [ ] Harvest five extracts into [[kill-lessons-track-b]] on closeout
