---
updated: 2026-07-16
status: stage-0-active
tags: [lane-s, s3, reaper, macro-a, stage-0]
---
# Lane S · S3 — Reaper × Macro A union v0

> **Not Track B “new edge.”** Selective sleeve Stage-0 under [[lane-s-sleeve-stack-brief]].  
> Goal: more fills than desert S2 Reaper alone by unioning **widened Reaper** with Hybrid’s **Macro A 9:50** cadence piece — **no PRB legs**.

## Hard constraints

- Do **not** edit locked PRB v1.  
- Do **not** include H0a PRB engine (overlap live gated PRB; H0a eval trail-weak).  
- Do **not** Lab-promote without SCORECARD **toward** + path MC.  
- Frozen params — no post-hoc sweep to rescue.  
- Max **1 trade/day** across both engines (first fill wins).

## Engines (frozen)

### A — Macro A-tier (Hybrid sleeve)

| Field | v0 |
|---|---|
| Window | **9:50–10:10 NY only** (10:50 OFF) |
| Logic | TS + CE confirm · A-tier wick skip · prem/disc align — from [[Hybrid_Sleeve_v0]] |
| Risk / TP | $800 · 40 pt TP (matrix sleeve geometry) |
| Signals | `Long_A` / `Short_A` |

### B — Widened Reaper (vs S2 desert)

| Field | v0 |
|---|---|
| Structure TF | **1H** via `request.security` |
| Chart / entry TF | **5m** tap of **full inverted FVG** (not CE-only) |
| Discount | CE in **lower 60%** of impulse (bull) / upper 60% (bear) |
| Risk / target | **$200** · **2.0R** |
| Pivot L/R | **2** frozen |
| Signals | `RPR_L` / `RPR_S` |

## Conflict

Same as Hybrid sleeve: Macro morning usually arms first; Reaper may take leftover days. `dayTrades` shared.

## Independence note

This measure **excludes** gated PRB. Live ops stay on [[gated-prb-live-guide]]. S3 tests Macro A ∪ Reaper only.

## Hypothesis

Union of Macro A 9:50 + widened Reaper on MNQ 5m has positive Stage-0 trade EV on ~3y + OOS (beats Lane F null and S2 desert underpower).

## Stage-0

- [[event-study-lane-s-s3-reaper-macroa]]  
- CSV: `vault-app/data/tv-exports/matrix/lane-s-reaper-macroa-mnq-5m.csv`  
- Pine: `pine/LaneS_ReaperMacroA_measure_v0.pine`  
- Analyze: `npx tsx scripts/analyze-event-study.ts lane-s-reaper-macroa-mnq-5m.csv`

## Kill / away

- OOS mean ≤0 or CI covers 0 with no lift → away/kill for sleeve promote  
- Soft-drain geometry (~40%/1.3R) → kill  
- Do not retune windows / RR / discount % without new Stage-0 note  
