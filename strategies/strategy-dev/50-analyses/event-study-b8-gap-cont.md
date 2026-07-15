---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b8]
---
# Event study — B8 gap continuation

> [[track-b-b8-gap-cont-v0]] · Pre-registered 2026-07-15

## Event

Binary: |open930 − priorClose| ≥ 1.0×ATR → continue gap direction.

## Outcome

1.5R · ATR stop · $150 · arm 09:35–10:15.

## Export

`pine/TrackB_GapCont_measure_v0.pine` → Deep BT → `matrix/trackb-gapcont-3y.csv`

## Scorecard

- [ ] toward / away / kill

On kill: print five harvest extracts in chat.
