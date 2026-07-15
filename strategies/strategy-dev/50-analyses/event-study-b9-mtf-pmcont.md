---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b9, mtf]
---
# Event study — B9 MTF PM continuation

> Pre-registered **2026-07-15**. [[track-b-b9-mtf-pmcont-v0]] · [[stage-0-mtf-breadth]]  
> Nutrients from [[track-b-b7-pm-continuation-v0]] / [[event-study-trackb-pmcont-3y]].

## Meta

| Field | Value |
|---|---|
| Idea class | momentum · MTF |
| Instrument / TF | MNQ · HTF **15** / fill **5m then 1m** |
| Planned runs | **0a** mnq-5m · **0b** mnq-1m |
| Pre-registered | 2026-07-15 |
| Artifacts | `event-study-trackb-mtf-pmcont-mnq-5m.json` (+ 1m after 0b) |

## Hard constraints pasted

No ICT/PRB · no ORB · no PD/VWAP/gap fades · no B7 loose 5m-only cont retune · rarity target · EV > WR · prop MC later.

## Model / edge

15m morning expansion (rarer ATR threshold) predicts positive EV for 12:05 continuation fills on chart TF.

### Event-defining feature

| Field | Value |
|---|---|
| Definition | Binary: \|15m close@11:45 − open@09:30\| ≥ 1.2 × ATR(14,15) |
| Value type | binary |
| Transform | HTF ATR; mult frozen 1.2 |
| Expected frequency | rarer than B7 — kill if n≥400 / 3y |

### Outcome

Barrier: chart ATR stop · 1.5R · $150 · flat 15:55.

## Export steps

1. Paste `pine/TrackB_MTF_PMCont_measure_v0.pine`  
2. **0a:** MNQ **5m** · Deep BT 2023-07-01 → today → `matrix/trackb-mtf-pmcont-mnq-5m.csv`  
3. Analyze → if not desert, **0b:** same Pine on MNQ **1m** → `…-mnq-1m.csv`  
4. Compare EV / CI / maxL / n — not WR  

## Scorecard

- [x] **0a away / KILL** · [[event-study-trackb-mtf-pmcont-mnq-5m]]
- [x] **0b skipped** (not a rescue path)
- Harvest: [[track-b-b9-mtf-pmcont-v0]]

