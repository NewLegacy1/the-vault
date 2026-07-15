---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b10, lom]
---
# Event study — B10 Late Open Magnet

> Pre-registered **2026-07-15**. [[track-b-b10-lom-v0]] · [[stage-0-mtf-breadth]]

## Meta

| Field | Value |
|---|---|
| Idea class | MR · late open magnet |
| Instrument / TF | MNQ · HTF 15 ATR gate / fill 5m (then 1m) |
| Planned runs | 0a mnq-5m · 0b mnq-1m if lift |
| Artifact | `event-study-trackb-lom-mnq-5m.json` (pending) |

## Hard constraints pasted

No ICT/PRB · no ORB · no PD/VWAP/gap fades · no AM→PM continuation (B7/B9) · rarity + **open TP barrier** · EV hierarchy · prop later.

## Event

Binary: at 14:30, |close − RTH open| ≥ 1.5 × ATR15.

## Outcome

Fade to RTH open · chart ATR stop · $150.

## Export

1. `pine/TrackB_LOM_measure_v0.pine` on MNQ **5m**  
2. Deep BT 2023-07-01 → today → `matrix/trackb-lom-mnq-5m.csv`  
3. Analyze · harvest in chat on kill · **skip 0b** if 0a away/high-n drain  

## Scorecard

- [x] **away / KILL** · [[event-study-trackb-lom-mnq-5m]]
- [x] **0b skipped**
- Harvest: [[track-b-b10-lom-v0]]

