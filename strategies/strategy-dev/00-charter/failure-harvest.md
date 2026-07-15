---
updated: 2026-07-15
tags: [charter, failure-harvest, strategy-dev]
---
# Failure harvest — learning from killed experiments

> Every **kill** must leave transferable constraints, not just a graveyard tag.  
> Retuning the same idea without a new Stage-0 note is **forbidden**.

## When this runs

Immediately after SCORECARD **kill** or **away** that closes a Track B / Stage-0 candidate (same session as the analyze script).

## Five extracts (fill all)

| # | Extract | Question |
|---|---|---|
| 1 | **Falsified claim** | What exact hypothesis died? |
| 2 | **Structural fault** | Loss shape? Frequency? Overlap with dead classes? Non-stationarity? |
| 3 | **Hard constraint** | What must the *next* idea never do? (one sentence) |
| 4 | **Soft preference** | What should the next idea prefer? (optional) |
| 5 | **Breadth check** | Was this independent of gated PRB, or correlated costume? |

Write them into:

1. The kill note itself (`60-track-b/…`)  
2. Running ledger: [[kill-lessons-track-b]]  
3. Next candidate’s Stage-0 note — paste **Hard constraints from prior kills** before defining the event

## Anti-patterns (do not “learn” these)

- “Raise threshold until n looks better” without new pre-registration  
- “Add another filter on the same fills” and call it breadth  
- Reviving ICT/ORB/VWAP-xor because a video or mentor used it  
- Optimizing WR/RR after EV CI already excludes 0 on the negative side

## Feed into next Stage-0

```text
Prior kills → hard constraints
        ↓
New idea class (must differ on ≥2 of: time box, level set, regime feature, outcome barrier)
        ↓
event-study note (pre-register) → measure Pine → Deep BT CSV → analyze-event-study
        ↓
SCORECARD toward | away | kill → harvest again
```

## Prop math still owns promote

Harvest improves **idea search**. Promotion still requires path MC `E[$/wk]` + gates — [[SCORECARD]] · [[STRATEGY_DEV_AGENT]].
