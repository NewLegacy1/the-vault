---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b5, impulse]
---
# Event study — B5 10:05 impulse

> Pre-registered **2026-07-15**. [[track-b-b5-1005-impulse-v0]] · [[kill-lessons-track-b]]

## Meta

| Field | Value |
|---|---|
| Idea class | momentum |
| Instrument / TF | MNQ · 5m |
| Pre-registered | 2026-07-15 |
| Artifact | `event-study-trackb-1005-3y.json` (pending) |

## Event

Binary: 10:05 bar impulse aligned with side of 09:30–10:00 midpoint.

## Outcome

Barrier: ATR stop · 1.5R · $150 · flat 15:55.

## Export

1. Paste `pine/TrackB_1005Impulse_measure_v0.pine`  
2. Deep BT 2023-07-01 → today → `matrix/trackb-1005-3y.csv`  
3. `npx tsx scripts/analyze-event-study.ts trackb-1005-3y.csv`

## Results (filled 2026-07-15)

| Window | n | EV | CI | Verdict |
|---|---:|---:|---|---|
| Full | 61 | −5.02 | [−47.82, 37.71] | covers 0 |
| OOS | 10 | −35.86 | [−127.69, 60.31] | mean ≤0 |
| Path | | sum −$306 · maxL=6 · maxDD −$1112 | | |

## Scorecard

- [x] **away** / **KILL** · [[event-study-trackb-1005-3y]]
- Do not retune clock

