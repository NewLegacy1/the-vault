---
variant: "Macro Model v1 — ghost autopsy (TS/SMT optional)"
strategy_preset: "macro-v0-pine"
strategy_version: "v1"
strategy_config: "MISSED + CONFLUENCE tables · TS/SMT optional live filters · paste into F4 LAB"
hypothesis: ""
regimes: ["baseline", "be-only"]
date_start: "2024-12-31"
date_end: "2026-07-10"
trades: 223
net_pnl: 15876
wins: 125
losses: 98
scratches: 0
max_dd: 13296
trades_per_week: 2.8
weekly_edge_usd: 199
scorecard_verdict: "advance"
composite_score: 67
firm: "TPT $50K Test → PRO"
mc_pass_pct: 30.6
mc_bust_pct: 69.3
mc_payout_pct: 22.8
mc_sims: 2000
weeks_to_pass_p50: 3.9
weeks_to_payout_p50: 5
expected_accounts: 3.3
tags: [cohort, prb, monte-carlo, lab]
created: "2026-07-14T16:18:23.465Z"
dataset: "24–26 · Macro Model v1 — ghost autopsy (TS/SMT optional)"
---
# Macro Model v1 — ghost autopsy (TS/SMT optional)

> Lab cohort · TPT $50K Test → PRO · 2024-12-31 → 2026-07-10
> Pine v1 · preset `macro-v0-pine`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | Macro Model v1 — ghost autopsy (TS/SMT optional) |
| Pine version | v1 |
| Preset ID | `macro-v0-pine` |
| Config | MISSED + CONFLUENCE tables · TS/SMT optional live filters · paste into F4 LAB |
| Hypothesis | — |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 223 |
| Net P&L | $15,876 |
| W / L / Scr | 125 / 98 / 0 |
| Max drawdown | $13,296 |
| Trades/week | 2.8 |
| Sources | Macro_v1_CME_MINI_MNQ1!_2026-07-14 (10).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (9).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (8).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (7).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (6).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (5).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (4).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (3).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (2).csv, Macro_v1_CME_MINI_MNQ1!_2026-07-14 (1).csv |

## Monte Carlo (TPT $50K Test → PRO)

| Metric | Value |
|--------|-------|
| Pass rate | 30.6% |
| Bust rate | 69.3% |
| Payout rate | 22.8% |
| Median weeks to pass | 3.9 |
| Median weeks to payout | 5 |
| Expected accounts | 3.3 |
| Weekly edge (E[$/wk]) | $199 |
| Scorecard vs control | advance (composite 67) |
| Net after fees (median path) | $4,340 |
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
