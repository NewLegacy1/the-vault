---
updated: 2026-07-14
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
| **Full 3y** (primary) | **$-18** | **$-6** | **$12** | **PASS** |
| OOS ≥ 2025-07-14 | $32 | $50 | $18 | PASS |

**Rule:** PASS if gated chain E[$/wk] ≥ ungated × (1 − 0.05) (±5% tolerance).

Gated Jul+Oct STAND_DOWN **improves** (or holds within tolerance) the **full business loop** A0a→D1 — not only single-leg Lab stats.

## Lab-engine chain detail

### Full 3y

| Leg | Ungated | Gated |
|---|---|---|
| Eval n (A0a) | 120 | 100 |
| Funded n (D1) | 120 | 100 |
| Eval pass% | 41.5 | 58.8 |
| Eval bust% | 58.6 | 41.2 |
| Eval weeks→pass p50 | 20.8 | 22.5 |
| Funded E[$/acct] | $333 | $520 |
| Funded weeks→payout p50 | 11.7 | 13.5 |
| Funded bust% | 44.3 | 31.5 |
| **Chain weeks p50** | 32.5 | 36 |
| **Chain E[$/acct]** | $-593 | $-209 |
| **Chain E[$/wk]** | **$-18** | **$-6** |

### OOS (last ~12m)

| | Ungated | Gated |
|---|---:|---:|
| Chain E[$/wk] | $32 | $50 |
| Eval pass% | 83.3 | 91.2 |
| Funded bust% | 10.3 | 7.5 |
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

- **Relative PASS:** gate improves full-loop chain vs ungated (−$18 → −$6/wk; OOS $32 → $50/wk). Jul+Oct STAND_DOWN is supported as an ops overlay.
- **Absolute honesty:** full-3y chained E[$/acct] stays **negative** (ungated −$593 · gated −$209) because eval fail fees + long weeksChain dominate. Single-leg funded E[$/wk] (~$28–39) overstates the business loop. **Do not** treat this PASS as “profitable prop income on 3y.”
- OOS last-12m is where the loop prints positive — same non-stationarity as Phase 1.
- Still blocked: March stack · min-day pad until asked · Track B unless user opens it · Macro/Hybrid polish · multi-account off this gate alone.

## Links

- [[findings-prb]] · [[parallel-impl-gated-prb]] · [[execution-plan-post-3y]] · [[chain-ev-spec]] · [[phase1-autopsy-a0a-d1]]
