---
variant: "Macro Model v1.3 — tiered TS/SMT"
strategy_preset: "macro-v0-pine"
strategy_version: "v1.3"
strategy_config: "A+/A/B tiers · Vault TS · SMT at sweep · CE confirm · ghost autopsy"
hypothesis: ""
regimes: ["baseline", "be-only"]
date_start: "2025-07-28"
date_end: "2026-07-10"
trades: 26
net_pnl: 2348
wins: 13
losses: 13
scratches: 0
max_dd: 2623
trades_per_week: 0.5
weekly_edge_usd: 45
scorecard_verdict: "regress"
composite_score: 24
firm: "TPT $50K Test → PRO"
mc_pass_pct: 33.8
mc_bust_pct: 66.0
mc_payout_pct: 27.4
mc_sims: 2000
weeks_to_pass_p50: 21
weeks_to_payout_p50: 26.7
expected_accounts: 3
tags: [cohort, prb, monte-carlo, lab]
created: "2026-07-14T17:33:26.338Z"
dataset: "25–26 · Macro Model v1.3 — tiered TS/SMT"
---
# Macro Model v1.3 — tiered TS/SMT

> Lab cohort · TPT $50K Test → PRO · 2025-07-28 → 2026-07-10
> Pine v1.3 · preset `macro-v0-pine`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | Macro Model v1.3 — tiered TS/SMT |
| Pine version | v1.3 |
| Preset ID | `macro-v0-pine` |
| Config | A+/A/B tiers · Vault TS · SMT at sweep · CE confirm · ghost autopsy |
| Hypothesis | — |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 26 |
| Net P&L | $2,348 |
| W / L / Scr | 13 / 13 / 0 |
| Max drawdown | $2,623 |
| Trades/week | 0.5 |
| Sources | Macro_v1_CME_MINI_MNQ1!_2026-07-14 (21).csv |

## Monte Carlo (TPT $50K Test → PRO)

| Metric | Value |
|--------|-------|
| Pass rate | 33.8% |
| Bust rate | 66.0% |
| Payout rate | 27.4% |
| Median weeks to pass | 21 |
| Median weeks to payout | 26.7 |
| Expected accounts | 3 |
| Weekly edge (E[$/wk]) | $45 |
| Scorecard vs control | regress (composite 24) |
| Net after fees (median path) | $3,440 |
| Sims / max trades | 2000 / 140 |
| Payout buffer | $1000 |

## Regime tags

- #baseline
- #be-only

## Notes

_No notes._

## A/B comparison

_Compare pass rate and net P&L against baseline cohorts in this folder. Promotion rule: MC pass ≥ baseline AND forward test holds 20+ trades._

## Links

- [[Powell_Rejection_Block_SOP]]
- [[PRB_Trade_Checklist]]
