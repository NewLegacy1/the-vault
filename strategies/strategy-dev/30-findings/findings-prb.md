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

Purpose tags: **event** = pattern/detect · **context** = when to take · **reference** = levels · **outcome** = result label.

1. **BE@2R > BE@1R** — *(outcome management)* +12pt pass rate; +1R BE scratched too many eventual winners.
2. **Auto PDH/PDL direction filter** — *(context)* earns its trade-count cost — fewer trades, better quality.
3. **Skip Monday** — *(context)* holds.
4. **1 trade/day** — *(context / slot)* holds — slot discipline beats volume.
5. Win profile is low win-rate / high payoff — formula depends on **losses staying small** (BE = *outcome*), not on WR as KPI.
6. **`regime-gate-v0` PASS (2026-07-14)** — *(context · calendar)* STAND_DOWN Jul+Oct on 3y A0a/D1. Lab-engine MC: E[$/wk] ↑ and bust ↓ on full + OOS vs ungated. Provisional **ops overlay**, not a causal market regime. Do **not** stack March into v0. Pine: `pine/Powell_Rejection_Block_gate_v0.pine`.
7. **Chain EV A0a→D1 × gate PASS (2026-07-14)** — see [[phase2-chain-ev-gated]]. Ungated **−$18/wk** → gated **−$6/wk**. OOS: $32 → **$50/wk**. Absolute full-3y chain still ≤0. JSON: `vault-app/data/tv-exports/chain-ev-gated-vs-ungated.json`.

**RB detect / leave-retest / confirming close** — *(event)*. **PDH/PDL / PM H/L / key opens** — *(reference)*.

## Phase 1–2 regime gate (3y · settled PASS)

Full autopsy: [[phase1-autopsy-a0a-d1]] · confirm JSON: `vault-app/data/tv-exports/regime-gate-v0-lab-confirm.json` · script: `vault-app/scripts/lab-confirm-regime-gate-v0.ts`.  
Chain: [[phase2-chain-ev-gated]] · `vault-app/scripts/analyze-chain-ev-gated.ts`.

| Claim | Status |
|---|---|
| PRB 3y edge is **non-stationary** (IS weak / OOS strong) | **settled** |
| Red-folder stand-down helps PRB | **FAIL** (do not use) |
| Year×month Jul/Oct hygiene (0 winners every year cell) | **PASS** |
| **`regime-gate-v0`** Jul+Oct STAND_DOWN (single-leg) | **PASS** (Lab-engine · both A0a + D1) |
| **Chain EV A0a→D1 × gate** (full-loop) | **PASS** relative (−$18→−$6/wk; OOS $32→$50) · absolute full-3y still ≤0 |
| **Phase 2.4 co-feature** vs calendar | **KEEP calendar v0** — path/gap proxies did not beat Jul+Oct on OOS ([[phase2-4-cofeature]]) |
| Jul+Oct+Mar as v0 | **hold** — do not stack |

### Lab-engine confirm (TPT50 · max 220 · buf 2000)

| Book | Window | Ungated E[$/wk] | Gated E[$/wk] | Bust ungated → gated | n gated |
|---|---|---:|---:|---|---:|
| A0a | full 3y | $16 | **$26** | 57.9% → **42.5%** | 100 |
| A0a | OOS 12m | $112 | **$144** | 15.7% → **8.3%** | 36 |
| D1 | full 3y | $33 | **$37** | 42.4% → **32.7%** | 100 |
| D1 | OOS 12m | $116 | **$152** | 9.3% → **6.3%** | 36 |

Cohorts: `strategies/cohorts/eval/*regime_gate_v0*` · `strategies/cohorts/funded/*regime_gate_v0*`.

**Honesty:** Gate removes barren calendar months; does **not** prove forever PRB edge. Single-leg income still thin (~$26–37/wk). **Full-loop chain on 3y stays ≤0** even gated (−$6/wk) — see [[phase2-chain-ev-gated]].

**Blocked until explicit next ask:** min-day pad (2.2), March stack. Chain EV (2.3) **done**. Phase 2.4 **KEEP calendar v0**. Track B: B0 ORBreak **KILL** · B1 ERXor **KILL** · **B2 MPSF KILL** ([[event-study-trackb-mpsf-3y]]). Live ops: [[gated-prb-live-guide]].

## Open questions

- True OHLC vol/trend co-feature (vault had no daily bars — 2.4 used ledger proxies only)
- Live forward test with gate ON — **guide shipped** ([[gated-prb-live-guide]])
- Does trail 2.0/1.5 beat BE-only specifically in give-back months (Feb–Mar type)?
- Long-only vs short-only bias splits by regime?
- Next Track B (B3/B4) — only with fresh Stage-0; MPSF closed

## What failed (graveyard — don't resurrect)

- Trail-on as a permanent setting (regressed vs BE-only outside give-back regimes)
- Track B B0 ORBreak ([[track-b-candidate-v0]])
- Track B B1 ERXor ([[track-b-b1-erxor-v0]] — 3y kill)
- See F3 strategy page graveyard and `vault-app/lib/lab-findings.ts` (`CHART_FINDINGS`) for the settled A/B reference table.
