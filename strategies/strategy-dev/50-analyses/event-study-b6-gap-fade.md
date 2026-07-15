---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b6, gap-fade]
---
# Event study — B6 overnight gap fade

> Pre-registered **2026-07-15**. [[track-b-b6-gap-fade-v0]] · [[kill-lessons-track-b]]

## Meta

| Field | Value |
|---|---|
| Idea class | MR |
| Instrument | MNQ 5m |
| Artifact | `event-study-trackb-gapfade-3y.json` (pending) |

## Event

Binary: |RTH open − prior close| ≥ 0.35×ATR(14).

## Outcome

Fade toward prior close · ATR stop · 1.5R · $150 · arm 09:35–10:30.

## Export

1. `pine/TrackB_GapFade_measure_v0.pine`  
2. Deep BT 2023-07-01 → today → `matrix/trackb-gapfade-3y.csv`  
3. `npx tsx scripts/analyze-event-study.ts trackb-gapfade-3y.csv`

## Scorecard

- [ ] toward / away / kill
