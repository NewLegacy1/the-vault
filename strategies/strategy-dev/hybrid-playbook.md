---
phase: combined
updated: 2026-07-14
tags: [playbook, hybrid, strategy-dev]
---
# Hybrid playbook — PRB × Macro combined formula

> **Goal:** Highest **portfolio** output — eval survival + funded edge — possibly as two strategies or one merged Pine variant.

## What each parent contributes

| Parent | Contribution | Mechanism |
|---|---|---|
| **PRB** | Loss control | BE@2R, $400 risk, PDH/PDL draw, limit retest |
| **Macro** | Time + context | 9:50–10:10 window, staging DOL sweep, TS trigger, tier sizing |

## Three development paths (see [[roadmap]] Track 3)

### 3.1 Portfolio blend (analysis first)

- Merge PRB year ledger + Macro year ledger.
- **Same-day correlation check:** if both lose on the same dates, blending doesn't diversify.
- Joint MC in F4 LAB → save with preset `custom`, phase **combined**, hypothesis describes blend weights.
- Cohort path: `strategies/cohorts/combined/`

### 3.2 Macro entries + PRB management

- Hypothesis: BE@2R on Macro trades fixes symmetric $800 W/L bust problem.
- Pine: new file `Macro_Model_v2.pine` (never touch PRB live).
- One variable: exit management only.

### 3.3 PRB inside macro window

- Hypothesis: PRB rejection-block entries only during 9:50–10:10 concentrate edge.
- Pine: new PRB variant with time filter — not the locked live file.

## Agent synthesis workflow

1. Read [[findings-prb]] + [[findings-macro]] winning formulas.
2. List **non-overlapping** edges (time, trigger, management, risk).
3. Propose smallest Pine diff that tests one combination hypothesis.
4. Require cohort in `combined/` before any promotion discussion.

## Success criteria

| Criterion | Target |
|---|---|
| Combined weekly edge | > max(PRB alone, Macro alone) |
| Eval pass (if used for eval) | ≥ PRB BE@2R baseline |
| Same-day loss clustering | Low — true diversification |

## Links

- [[roadmap]]
- [[STRATEGY_DEV_AGENT]]
- [[eval-playbook]] · [[funded-playbook]]
