---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b7]
---
# Event study — B7 PM continuation

> [[track-b-b7-pm-continuation-v0]] · [[track-b-meta-progress]] · [[kill-lessons-track-b]]

## Event

Binary: |AM move 09:30→12:00| ≥ 0.8×ATR → 12:05 continuation entry.

## Outcome

1.5R · ATR stop · $150 · flat 15:55.

## Export

`pine/TrackB_PMCont_measure_v0.pine` → Deep BT → `matrix/trackb-pmcont-3y.csv` → `analyze-event-study.ts`

## Results (filled)

| Window | n | EV | CI | Verdict |
|---|---:|---:|---|---|
| Full | 516 | −8.01 | [−22.24, 5.58] | covers 0 |
| OOS | 137 | −20.49 | [−45.80, 5.21] | mean ≤0 |

## Failure harvest

See [[track-b-b7-pm-continuation-v0]] · [[kill-lessons-track-b]]

## Scorecard

- [x] **away** / **KILL** · [[event-study-trackb-pmcont-3y]]

