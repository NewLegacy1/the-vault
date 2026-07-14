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
6. **`regime-gate-v0` PASS (2026-07-14)** — STAND_DOWN Jul+Oct on 3y A0a/D1. Lab-engine MC (`buildMcParamsForLab`, max 220, buffer 2000): E[$/wk] ↑ and bust ↓ on full + OOS vs ungated. Provisional **ops overlay** (calendar), not a causal market regime. Do **not** stack March into v0.

## Phase 1–2 regime gate (3y · settled PASS)

Full autopsy: [[phase1-autopsy-a0a-d1]] · confirm JSON: `vault-app/data/tv-exports/regime-gate-v0-lab-confirm.json` · script: `vault-app/scripts/lab-confirm-regime-gate-v0.ts`.

| Claim | Status |
|---|---|
| PRB 3y edge is **non-stationary** (IS weak / OOS strong) | **settled** |
| Red-folder stand-down helps PRB | **FAIL** (do not use) |
| Year×month Jul/Oct hygiene (0 winners every year cell) | **PASS** |
| **`regime-gate-v0`** Jul+Oct STAND_DOWN | **PASS** (Lab-engine · both A0a + D1) |
| Jul+Oct+Mar as v0 | **hold** — do not stack |

### Lab-engine confirm (TPT50 · max 220 · buf 2000)

| Book | Window | Ungated E[$/wk] | Gated E[$/wk] | Bust ungated → gated | n gated |
|---|---|---:|---:|---|---:|
| A0a | full 3y | $16 | **$26** | 57.9% → **42.5%** | 100 |
| A0a | OOS 12m | $112 | **$144** | 15.7% → **8.3%** | 36 |
| D1 | full 3y | $33 | **$37** | 42.4% → **32.7%** | 100 |
| D1 | OOS 12m | $116 | **$152** | 9.3% → **6.3%** | 36 |

Cohorts: `strategies/cohorts/eval/*regime_gate_v0*` · `strategies/cohorts/funded/*regime_gate_v0*`.

**Honesty:** Gate removes barren calendar months; does **not** prove forever PRB edge. Income still thin (~$26–37/wk) — not Phase 4 / multi-account.

**Blocked until explicit next ask:** min-day pad (2.2), chain EV (2.3), March stack, Track B.

## Open questions

- Optional Phase 2.4: can a pre-session market co-feature explain barren Jul/Oct better than calendar alone?
- Does trail 2.0/1.5 beat BE-only specifically in give-back months (Feb–Mar type)?
- Long-only vs short-only bias splits by regime?
- Does the PRB entry (rejection block + limit retest) work inside the 9:50–10:10 macro window? → feeds [[roadmap]] hybrid (deferred per [[execution-plan-post-3y]]).

## What failed (graveyard — don't resurrect)

- Trail-on as a permanent setting (regressed vs BE-only outside give-back regimes)
- See F3 strategy page graveyard and `vault-app/lib/lab-findings.ts` (`CHART_FINDINGS`) for the settled A/B reference table.
