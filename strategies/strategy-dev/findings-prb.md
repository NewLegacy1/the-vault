---
strategy: PRB
updated: 2026-07-14
tags: [findings, prb, strategy-dev]
---
# PRB — Settled findings & winning trade formula

> Source of truth for what PRB experiments have proven. Update after every settled cohort.

## Winning trade formula (current best: v1.5 BE@2R + Auto PDH/PDL)

- **Setup:** Powell rejection block, limit retest entry, 1 trade/day, skip Monday
- **Risk:** $400/trade
- **Management:** BE at **+2R** (moving from +1R was the single biggest MC improvement)
- **Direction:** Auto PDH/PDL draw filter (trade toward the untapped pool)
- **Trail:** OFF in baseline; trail 2.0/1.5 only a give-back-regime candidate

## Cohort leaderboard (TPT $50K, 2000 sims)

| Variant | Trades | Net | Max DD | MC pass | Expected accts | Verdict |
|---|---|---|---|---|---|---|
| **v1.5 BE@2R + PDH/PDL** | 96 | $19,152 | $4,964 | **54.9%** | 1.8 | ADVANCE |
| v1.5 BE-only (live locked) | 69 | $12,345 | $4,585 | 42.5% | 2.4 | baseline |

Full YAML records: `strategies/cohorts/`.

## Settled (do not retest without new evidence)

1. **BE@2R > BE@1R** — +12pt pass rate; +1R BE scratched too many eventual winners.
2. **Auto PDH/PDL direction filter earns its trade-count cost** — fewer trades, better quality.
3. **Skip Monday** holds.
4. **1 trade/day** holds — slot discipline beats volume.
5. Win profile is low win-rate / high payoff (13W/44L/12scr still nets $12k+) — the formula depends on **losses staying small** (BE mechanism), not on win rate.

## Phase 1 regime autopsy (3y · 2026-07-14) — pending Lab settle

Full write-up: [[phase1-autopsy-a0a-d1]] · script `vault-app/scripts/analyze-prb-3y-autopsy.ts`.

| Claim | Status |
|---|---|
| PRB 3y edge is **non-stationary** (IS weak / OOS strong) | **settled** on ledger splits |
| Red-folder stand-down helps PRB | **fails** (A0a red days profitable) |
| **`regime-gate-v0`:** STAND_DOWN Jul+Oct | **script proxy pass** · Lab MC confirm = Phase 2 |
| Jul+Oct+Mar as v0 | **hold** — optional aggressive only |

Gated CSVs ready for Lab: `matrix/prb-a0a-3y-gate-jul-oct.csv`, `prb-d1-3y-gate-jul-oct.csv` · hypothesis `regime-gate-v0`.

## Open questions

- Lab: does `regime-gate-v0` hold on A0a/D1 after official MC (full + OOS)?
- Does trail 2.0/1.5 beat BE-only specifically in give-back months (Feb–Mar type)?
- Long-only vs short-only bias splits by regime?
- Does the PRB entry (rejection block + limit retest) work inside the 9:50–10:10 macro window? → feeds [[roadmap]] hybrid (deferred per [[execution-plan-post-3y]]).

## What failed (graveyard — don't resurrect)

- Trail-on as a permanent setting (regressed vs BE-only outside give-back regimes)
- See F3 strategy page graveyard and `vault-app/lib/lab-findings.ts` (`CHART_FINDINGS`) for the settled A/B reference table.
