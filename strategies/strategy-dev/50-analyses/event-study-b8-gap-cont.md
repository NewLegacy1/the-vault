---
updated: 2026-07-15
status: waiting-for-csv
tags: [stage-0, event-study, b8]
---
# Event study — B8 gap continuation

> [[track-b-b8-gap-cont-v0]] · Activated after [[track-b-error-synthesis-b0-b10]]  
> **No Deep BT numbers inventable** — waiting on human export.

## Pre-registered event

Binary day event: at RTH open (09:30 NY), `|open − priorClose| ≥ 1.0 × ATR(14)`.  
Direction = sign of gap. Entry = first arm bar in **09:35–10:15** continuing that direction. 1/day.

## Outcome / barriers (frozen)

| Field | Value |
|---|---|
| Stop | 1×ATR · max 40 pts |
| Target | 1.5R |
| Risk | $150 |
| Flat | 15:55 |
| Symbol / TF | MNQ continuous · **5m** (0a) |
| Window | Deep BT ~2023-07-01 → today |

0b MNQ 1m only if SCORECARD **toward** on 0a ([[stage-0-mtf-breadth]]).

## Export

1. Paste `pine/TrackB_GapCont_measure_v0.pine` into TV (measure only — not live).  
2. Inputs: leave Event group at defaults (`gapMult=1.0`, arm 935–1015). **Do not sweep.**  
3. Deep Backtest · MNQ · 5m · from **2023-07-01**.  
4. Export list of trades →  
   `vault-app/data/tv-exports/matrix/trackb-gapcont-3y.csv`  
5. Agent: `npx tsx scripts/analyze-event-study.ts trackb-gapcont-3y.csv`

## SCORECARD (blank until CSV)

| Window | n | EV $ | CI | Verdict |
|---|---:|---:|---|---|
| Full | | | | |
| OOS (≥ 2025-07-14) | | | | |

- [ ] toward / away / kill  
- [ ] If kill/away closeout → five extracts into [[kill-lessons-track-b]]

`BLOCK_STRATEGY` if OOS mean ≤ 0 or OOS CI covers 0 with no registered context plan.
