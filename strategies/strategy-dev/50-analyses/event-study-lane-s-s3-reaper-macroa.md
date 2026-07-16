---
updated: 2026-07-16
status: waiting-for-csv
tags: [stage-0, event-study, lane-s, reaper, macro-a]
---
# Event study — Lane S · S3 Reaper × Macro A

> [[lane-s-s3-reaper-macroa-v0]] · Brief [[lane-s-sleeve-stack-brief]]  
> Waiting on human Deep BT CSV — no inventable numbers.

## Pre-registered

MNQ **5m** · Macro A 9:50–10:10 ∪ widened Reaper (1H zone → 5m full-IFVG tap) · max 1/day · both sides.

## Export

1. Paste `pine/LaneS_ReaperMacroA_measure_v0.pine`.  
2. Chart: **MNQ** · **5m**. Defaults frozen — do not sweep.  
3. Deep Backtest · **2023-07-01 → today**.  
4. Save as `vault-app/data/tv-exports/matrix/lane-s-reaper-macroa-mnq-5m.csv`  
5. `npx tsx scripts/analyze-event-study.ts lane-s-reaper-macroa-mnq-5m.csv`

## SCORECARD (blank)

| Window | n | EV $ | CI | Verdict |
|---|---:|---:|---|---|
| Full | | | | |
| OOS (≥ 2025-07-14) | | | | |

- [ ] toward / away / kill  
- [ ] Optional post-split: `Long_A`/`Short_A` vs `RPR_*` in harvest  
