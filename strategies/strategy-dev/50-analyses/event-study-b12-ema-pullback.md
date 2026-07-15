---
updated: 2026-07-15
status: waiting-for-csv
tags: [stage-0, event-study, b12, lane-f]
---
# Event study — B12 EMA Trend Pullback (Lane F)

> [[track-b-b12-ema-pullback-v0]]  
> **Waiting on human Deep BT CSV** — no inventable numbers.

## Pre-registered event

On MNQ 5m RTH:

1. `ADX(14) > 25`  
2. EMA(20) slope: `EMA > EMA[3]` (long bias) or `EMA < EMA[3]` (short)  
3. Pullback: prior bar closed on the wrong side of EMA  
4. Trigger: current bar **closes back** through EMA in trend direction  
5. Arm **10:05–15:00** NY · &lt; 3 trades/day · flat 15:55  

## Outcome / barriers (frozen)

| Field | Value |
|---|---|
| Stop | Beyond min/max of trigger+prior bar · max 30 pts |
| Target | **1.25R** |
| Risk | $100 |
| Symbol / TF | MNQ continuous · **5m** (0a) |
| Window | Deep BT ~2023-07-01 → today |

## Export checklist

1. Paste `pine/TrackB_EMAPull_measure_v0.pine` (defaults frozen — do not sweep).  
2. Deep Backtest · MNQ · 5m · **2023-07-01 → today**.  
3. Export trades →  
   `vault-app/data/tv-exports/matrix/trackb-emapull-mnq-5m.csv`  
4. Agent: `npx tsx scripts/analyze-event-study.ts trackb-emapull-mnq-5m.csv`

## SCORECARD (blank until CSV)

| Window | n | EV $ | CI | Verdict |
|---|---:|---:|---|---|
| Full | | | | |
| OOS (≥ 2025-07-14) | | | | |

- [ ] toward / away / kill  
- [ ] Harvest into [[kill-lessons-track-b]] on closeout
