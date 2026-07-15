---
updated: 2026-07-15
status: settled
verdict: KEEP_CALENDAR_V0
tags: [phase2.4, cofeature, regime-gate, strategy-dev]
---
# Phase 2.4 — market / path co-feature vs calendar Jul+Oct

> Lane C of [[parallel-impl-sprint2]] · parent [[execution-plan-post-3y]].  
> Script: `vault-app/scripts/analyze-prb-regime-cofeature.ts` · JSON: `vault-app/data/tv-exports/prb-regime-cofeature.json`

## Pre-registered rules (before lift)

| id | Rule |
|---|---|
| `calendar_jul_oct` | STAND_DOWN month ∈ {7,10} — **baseline** |
| `path_cold_3L` | STAND_DOWN next trade after 3 consecutive losses |
| `path_roll10_neg` | STAND_DOWN when sum of prior 10 trade pnls < 0 |
| `gap_vol_top_q` | STAND_DOWN when \|Δlog entry_price\| ≥ p75 of prior 40 gaps |

No external OHLC in vault — gap feature uses **prior entry prices** from the ledger (known before the current fill). Path features use only completed prior trades.

## Verdict

**KEEP_CALENDAR_V0**

Promote only if OOS E[$/wk] ≥ calendar ($147) · bust not worse · n≥25.

No tested co-feature beat calendar Jul+Oct on OOS with the required gates. **Keep `regime-gate-v0` calendar ops.** Path filters may still be useful later as discretionary overlays — not promoted.

## Results (A0a · Lab-engine eval MC)

| Gate | Kind | n full | E[$/wk] full | bust full | n OOS | E[$/wk] OOS | bust OOS | net full |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `ungated` | control | 120 | $13 | 56.9% | 40 | $107 | 17.3% | $8528 |
| `calendar_jul_oct` | calendar | 100 | $27 | 41.1% | 36 | $147 | 8.1% | $13431 |
| `path_cold_3L` | path | 106 | $9 | 61% | 33 | $86 | 14.8% | $6737 |
| `path_roll10_neg` | path | 69 | $4 | 58.6% | 31 | $112 | 10.9% | $5741 |
| `gap_vol_top_q` | price | 98 | $-3 | 74.5% | 30 | $24 | 44.4% | $229 |
| `calendar_and_path_cold_3L` | combo | 94 | $18 | 43.4% | 32 | $99 | 13% | $10515 |

OOS start: **2025-07-14**.

## Implications

- Calendar Jul+Oct remains the default ops overlay unless PROMOTE.
- True market vol/trend from daily bars still needed for a stronger “regime roster” — vault lacks OHLC; this sprint used ledger proxies only.
- Still blocked: March stack · multi-account · claiming income from gated PRB alone.

## Links

- [[findings-prb]] · [[parallel-impl-sprint2]] · [[phase1-autopsy-a0a-d1]] · [[phase2-chain-ev-gated]]
