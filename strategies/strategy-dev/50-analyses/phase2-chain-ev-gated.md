---
updated: 2026-07-20
status: settled
settle_full: PASS
settle_oos: PASS
tags: [phase2, chain-ev, regime-gate-v0, strategy-dev]
---
# Phase 2.3 — Chain EV: ungated vs gated A0a→D1

> Lane B of [[parallel-impl-gated-prb]] · parent [[execution-plan-post-3y]].  
> Script: `vault-app/scripts/analyze-chain-ev-gated.ts` · JSON: `vault-app/data/tv-exports/chain-ev-gated-vs-ungated.json`  
> Engine: `buildMcParamsForLab` via `runMcForPreset` · sims 2000 · max trades 220 · buffer 2000.

## Verdict

| Window | Ungated E[$/wk] | Gated E[$/wk] | Δ | Settle |
|---|---:|---:|---:|---|
| **Full 3y** (primary) | **$-15** | **$-6** | **$9** | **PASS** |
| OOS ≥ 2025-07-14 | $32 | $50 | $18 | PASS |

**Rule:** PASS if gated chain E[$/wk] ≥ ungated × (1 − 0.05) (±5% tolerance).

Gated Jul+Oct STAND_DOWN **improves** (or holds within tolerance) the **full business loop** A0a→D1 — not only single-leg Lab stats.

## Lab-engine chain detail

### Full 3y

| Leg | Ungated | Gated |
|---|---|---|
| Eval n (A0a) | 120 | 100 |
| Funded n (D1) | 120 | 100 |
| Eval pass% | 42.6 | 58.5 |
| Eval bust% | 57.5 | 41.6 |
| Eval weeks→pass p50 | 19.5 | 22.5 |
| Funded E[$/acct] | $330 | $508 |
| Funded weeks→payout p50 | 11.7 | 13.5 |
| Funded bust% | 43.4 | 33.6 |
| **Chain weeks p50** | 31.2 | 36 |
| **Chain E[$/acct]** | $-474 | $-222 |
| **Chain E[$/wk]** | **$-15** | **$-6** |

### OOS (last ~12m)

| | Ungated | Gated |
|---|---:|---:|
| Chain E[$/wk] | $32 | $50 |
| Eval pass% | 84.6 | 90.3 |
| Funded bust% | 11.1 | 5.7 |
| n eval / funded | 40 / 40 | 36 / 36 |

## Cohort cross-check (saved Lab notes)

Uses explicit cohort paths (not latest-by-preset — gated would otherwise shadow ungated).

| Pair | Chain E[$/wk] from cohort YAML |
|---|---:|
| Ungated A0a+D1 | -16 |
| Gated A0a+D1 | -7 |

Sources: `eval/2026-07-14_222805698_a0a_prb_control.md` + `funded/2026-07-14_222828594_d1_prb_rr6_funded_raw.md` · gated `eval/2026-07-14_230813710_a0a_prb_control_regime_gate_v0.md` + `funded/2026-07-14_230815341_d1_prb_rr6_funded_raw_regime_gate_v0.md`.

Primary settlement uses **lab-engine dual-run** (same path as Phase 2.1 confirm), not cohort YAML alone.

## Implications

- Ops Jul+Oct STAND_DOWN: **supported** as business-loop overlay.
- Income still modest — gate is survival/EV lift, not Phase 4 multi-account unlock.
- Still blocked: March stack · min-day pad until asked · Track B unless user opens it · Macro/Hybrid polish.

## Links

- [[findings-prb]] · [[parallel-impl-gated-prb]] · [[execution-plan-post-3y]] · [[chain-ev-spec]] · [[phase1-autopsy-a0a-d1]]
