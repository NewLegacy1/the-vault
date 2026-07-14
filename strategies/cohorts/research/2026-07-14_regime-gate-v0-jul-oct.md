---
variant: "regime-gate-v0 · Jul+Oct STAND_DOWN"
strategy_family: "prb"
phase: "research"
hypothesis: "regime-gate-v0"
experiment_series: "phase1-autopsy"
date_start: "2023-07-14"
date_end: "2026-07-08"
trades_a0a_gated: 100
trades_d1_gated: 100
gate: "STAND_DOWN calendar month in {7,10}"
source_ungated: ["prb-a0a-3y.csv", "prb-d1-3y.csv"]
source_gated: ["prb-a0a-3y-gate-jul-oct.csv", "prb-d1-3y-gate-jul-oct.csv"]
script_proxy: "vault-app/scripts/analyze-prb-3y-autopsy.ts"
lab_status: "pending — upload gated CSVs to Lab A0a/D1 presets"
tags: [cohort, research, regime-gate, prb, phase1]
created: "2026-07-14"
---
# regime-gate-v0 · Jul+Oct STAND_DOWN

> Research placeholder until Lab auto-save replaces this. Parent: [[phase1-autopsy-a0a-d1]] · [[execution-plan-post-3y]].

## Rule

Trade PRB only when calendar month is **not** July or October.

## Script-proxy MC (TPT50 · max 220 · buffer 2000 · not Lab source of truth)

| Book | n gated | E[$/wk] ungated → gated | OOS E[$/wk] | bust ungated → gated |
|---|---:|---|---|---|
| A0a eval | 100 | ~$1 → **~$17** | ~$103 → **~$139** | ~66% → ~48% |
| D1 funded | 100 | ~$28 → **~$36** | ~$119 → **~$150** | ~45% → ~32% |

## Lab TODO

1. Upload `vault-app/data/tv-exports/matrix/prb-a0a-3y-gate-jul-oct.csv` → preset **A0a · PRB control** · RUN full · OOS 12m.
2. Upload `prb-d1-3y-gate-jul-oct.csv` → preset **D1 · PRB RR6 funded raw** · same.
3. Hypothesis field: `regime-gate-v0`.
4. Compare to ungated 3y cohorts; settle [[findings-prb]].
