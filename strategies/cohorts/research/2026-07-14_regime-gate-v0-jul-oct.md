---
variant: "regime-gate-v0 · Jul+Oct STAND_DOWN"
strategy_family: "prb"
phase: "research"
hypothesis: "regime-gate-v0"
experiment_series: "phase1-autopsy"
gate: "STAND_DOWN calendar month in {7,10}"
lab_status: "PASS"
settled: "2026-07-14"
confirm_json: "vault-app/data/tv-exports/regime-gate-v0-lab-confirm.json"
confirm_script: "vault-app/scripts/lab-confirm-regime-gate-v0.ts"
source_gated: ["prb-a0a-3y-gate-jul-oct.csv", "prb-d1-3y-gate-jul-oct.csv"]
tags: [cohort, research, regime-gate, prb, phase2, pass]
created: "2026-07-14"
---
# regime-gate-v0 · PASS

> Settled [[findings-prb]]. Parent: [[phase1-autopsy-a0a-d1]] · [[execution-plan-post-3y]].

## Rule

Trade PRB only when calendar month is **not** July or October.

## Lab-engine result (TPT50 · max 220 · buffer 2000)

| Book | Window | E[$/wk] ungated → gated | Bust |
|---|---|---|---|
| A0a | full | $16 → **$26** | 57.9% → 42.5% |
| A0a | OOS | $112 → **$144** | 15.7% → 8.3% |
| D1 | full | $33 → **$37** | 42.4% → 32.7% |
| D1 | OOS | $116 → **$152** | 9.3% → 6.3% |

Saved cohorts: `strategies/cohorts/eval/*regime_gate_v0*` · `funded/*regime_gate_v0*`.

**Provisional ops overlay** — calendar stand-down, not causal regime. Do not stack March. Do not open 2.2/2.3 until asked.
