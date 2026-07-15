---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b4, vwap-z-fade]
---
# Event study — B4 VWAP z fade

> Pre-registered **2026-07-15**. Results only after Deep BT CSV + `analyze-event-study.ts`.  
> Candidate: [[track-b-b4-vwap-z-fade-v0]] · Constraints: [[kill-lessons-track-b]]

## Meta

| Field | Value |
|---|---|
| Idea class | MR |
| Purpose tags | event / reference / outcome |
| Instrument / TF | MNQ continuous · 5m |
| Pre-registered date | 2026-07-15 |
| Artifact JSON | `vault-app/data/tv-exports/event-study-trackb-vwapz-3y.json` (pending) |

## Hard constraints pasted

No ICT/PRB · no ORB · no ER xor · no PD morning sweep-fade · no NR→PDH/PDL expansion · loss shape first · no retune kills · ≥2 axes vs gated PRB · SCORECARD hierarchy.

## Model / edge (predictive claim)

Extreme session-VWAP standardized distance (|z|≥2) with rejection predicts mean-reversion toward VWAP with positive barrier EV.

### Event-defining feature

| Field | Value |
|---|---|
| Definition | Binary: touch session VWAP ± 2σ + rejection wick in arm window |
| Value type | binary |
| Transform | z threshold **frozen = 2.0** (no sweep) |
| Expected frequency band | ~0.5–2 / week if 1/day cap · ok if n≥40 / 3y |

### Outcome label

| Field | Value |
|---|---|
| Kind | barrier via TV strategy measure |
| Spec | Fade to VWAP · stop = extreme+0.5ATR · risk $150 · flat 15:55 |

### Contextual features (do not slice until full EV known)

1. Signed z at entry  
2. Time of day bucket (morning vs afternoon)  

## Human export steps (Deep BT)

1. Paste `pine/TrackB_VWAPz_measure_v0.pine` on MNQ 5m.  
2. Deep BT **2023-07-01 → today**.  
3. Export → `vault-app/data/tv-exports/matrix/trackb-vwapz-3y.csv`.  
4. `npx tsx scripts/analyze-event-study.ts trackb-vwapz-3y.csv`

## Results (filled 2026-07-15)

| Window | n | EV | EV CI 95% | Median | Verdict |
|---|---:|---:|---|---:|---|
| Full | 147 | −14.94 | [−52.23, 27.49] | −134.96 | covers 0 |
| IS | 117 | −13.07 | [−53.00, 33.83] | −134.96 | |
| OOS | 30 | −22.21 | [−105.16, 77.39] | −139.96 | mean ≤0 |
| Path | | sum −$2196 · maxL=19 · maxDD −$4253 | | | **trail-hostile** |

## Scorecard closeout

- [x] **away** / **KILL** — [[event-study-trackb-vwapz-3y]] · [[kill-lessons-track-b]]
- Do not sweep z · do not re-add ER
- Pine Lab allowed? **no**
