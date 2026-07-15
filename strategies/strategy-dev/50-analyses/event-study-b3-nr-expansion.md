---
updated: 2026-07-15
status: stage-0-draft
tags: [stage-0, event-study, b3, nr-expansion]
---
# Event study — B3 NR → RTH expansion

> Pre-registered **2026-07-15**. Fill results only after Deep BT CSV + `analyze-event-study.ts`.  
> Candidate: [[track-b-b3-nr-expansion-v0]] · Constraints: [[kill-lessons-track-b]]

## Meta

| Field | Value |
|---|---|
| Idea class | breakout |
| Purpose tags | event / reference / outcome |
| Instrument / TF | MNQ continuous · 5m (+ daily for NR flag) |
| Pre-registered date | 2026-07-15 |
| Artifact JSON | `vault-app/data/tv-exports/event-study-trackb-nr-exp-3y.json` (pending) |

## Hard constraints pasted

No ICT/PRB clone · no ORB · no ER xor · no PD morning sweep-fade · loss shape first · no retune kills · ≥2 axes vs gated PRB · neg EV CI excl. 0 → kill.

## Model / edge (predictive claim)

Prior-day **narrowest range in 20 RTH days** predicts that next session’s **first break of PDH/PDL** has positive barrier EV at 1.5R / ATR stop.

### Event-defining feature

| Field | Value |
|---|---|
| Definition | Binary: yesterday’s RTH range = min(range of last 20 completed RTH days) |
| Value type | binary |
| Transform | N fixed = 20 (no search in v0) |
| Expected frequency band | ~1 / 20 sessions → ~0.25/wk · ok if n≥40 / 3y |

### Outcome label

| Field | Value |
|---|---|
| Kind | barrier (stop / TP) via TV strategy measure |
| Spec | First PDH or PDL break next RTH · stop 1×ATR(14) · TP 1.5R · risk $150 · flat 15:55 |

### Contextual features (do not slice until full EV known)

1. Direction of break (long vs short)  
2. Absolute prior-day range in ATR units  

## Execution / risk protocol

See candidate note — Stage-0 measure only; no Lab income claim.

## Results (filled 2026-07-15)

| Window | n | EV | EV CI 95% | Median | Verdict |
|---|---:|---:|---|---:|---|
| Full | 27 | −17.99 | [−78.28, 44.05] | −125.22 | covers 0 |
| IS | 21 | −15.68 | [−82.91, 50.54] | −126.72 | |
| OOS | 6 | −26.08 | [−140.45, 92.04] | −125.22 | mean ≤0 |
| Path | | sum −$486 · maxL=4 · maxDD −$847 | | | shape OK |

## Scorecard closeout

- [x] **away** / **KILL** — [[SCORECARD]] · [[event-study-trackb-nr-exp-3y]] · [[kill-lessons-track-b]]
- Pine Lab allowed? **no**
- Do not retune N
