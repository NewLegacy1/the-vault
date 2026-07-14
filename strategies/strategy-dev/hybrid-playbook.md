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

### 3.1 Portfolio blend (settled 2026-07-14)

Ledger join: `vault-app/data/tv-exports/matrix/*` + `scripts/analyze-hybrid-matrix.ts` / `analyze-hybrid-conflicts.ts`.

| Pair | Shared days | Read |
|---|---|---|
| **A0a × B1a** | **0** | True diversifiers — never same-day. Best blend candidate. |
| A0a × B0 | 5 | Conflicts toxic: 2026-04-21 both L (−$399/−$815 on red-folder); 2 of 5 conflicts are A+. |
| A0b × B1a | 0 | Same as A0a×B1a structure; weaker PRB baseline (A0b regressed vs A0a). |

**Union A0a+B1a (54 trades):** net +$17.7k · WR 25%→35% · RR 5.5→3.3 · maxLStreak still 4 · MC pass ~76% vs A0a alone ~78%. Macro wins interrupt PRB cold patches 4× chronologically but do **not** cut max streak. **AND-gate (both must fire) = 0 trades — dead.**

**News split (missing FF day = quiet):** PRB makes money on red (+$3.5k / 10) *and* quiet. Macro B1a edge is quiet (+$5.0k / 12); red ≈ flat (−$38 / 2). Candidate rule: **PRB any day + Macro quiet-only**.

- Joint MC in F4 LAB → save with preset `custom`, phase **combined**.
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
