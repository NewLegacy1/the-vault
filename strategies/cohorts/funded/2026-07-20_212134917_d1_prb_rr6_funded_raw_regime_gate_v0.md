---
variant: "D1 · PRB RR6 funded raw · regime-gate-v0"
strategy_preset: "matrix-d1"
strategy_family: "prb"
phase: "funded"
experiment_series: "premium365"
strategy_version: "v1.5"
strategy_config: "Control · RR 6 · eval cap OFF"
hypothesis: "regime-gate-v0 · Jul+Oct STAND_DOWN · Lab confirm"
regimes: ["runner", "baseline", "regime-gate-v0"]
date_start: "2023-08-08"
date_end: "2026-06-24"
trades: 100
net_pnl: 14959
wins: 14
losses: 47
scratches: 39
max_dd: 4434
trades_per_week: 0.7
weekly_edge_usd: 105
scorecard_verdict: "hold"
composite_score: null
firm: "TPT $50K Test → PRO (reference) · multi-firm matrix"
mc_pass_pct: 120.5
mc_bust_pct: 33.8
mc_payout_pct: 120.5
mc_sims: 2000
weeks_to_pass_p50: 13.5
weeks_to_payout_p50: 13.5
expected_accounts: 0.8
tags: [cohort, prb, funded, monte-carlo, lab]
created: "2026-07-20T21:21:34.917Z"
dataset: "regime-gate-v0"
mc_max_trades: 220
payout_buffer: 2000
mc_engine_version: 2
mc_rule_pack: ["intraday_trail"]
firm_mc: {"tpt50":{"passPct":124,"bustPct":32.1,"payoutPct":124,"recyclePct":39.8,"medianNetPerAccountUsd":129,"expectedNetPerAccountUsd":491,"medianWithdrawnUsd":1034,"mcMode":"funded","weeksToPassP50":13.5,"weeksToPayoutP50":13.5,"passAt":4000,"trailingDD":2000,"consistencyPct":0,"firmName":"TPT $50K Test → PRO"},"topstep50":{"passPct":55.5,"bustPct":44.6,"payoutPct":55.5,"recyclePct":0,"medianNetPerAccountUsd":1651,"expectedNetPerAccountUsd":849,"medianWithdrawnUsd":1800,"mcMode":"funded","weeksToPassP50":39,"weeksToPayoutP50":39,"passAt":3000,"trailingDD":2000,"consistencyPct":40,"firmName":"Topstep $50K (Combine → XFA)"},"alpha-zero-50":{"passPct":52,"bustPct":48,"payoutPct":52,"recyclePct":0,"medianNetPerAccountUsd":1350,"expectedNetPerAccountUsd":702,"medianWithdrawnUsd":1350,"mcMode":"funded","weeksToPassP50":30,"weeksToPayoutP50":30,"passAt":3000,"trailingDD":2000,"consistencyPct":40,"firmName":"Alpha Zero $50K Eval"},"apex50-eod":{"passPct":54.2,"bustPct":45.8,"payoutPct":54.2,"recyclePct":0,"medianNetPerAccountUsd":1401,"expectedNetPerAccountUsd":714,"medianWithdrawnUsd":1500,"mcMode":"funded","weeksToPassP50":22.5,"weeksToPayoutP50":22.5,"passAt":3000,"trailingDD":2000,"consistencyPct":50,"firmName":"Apex $50K EOD Trail"}}
trade_pnls: [-416.88,-424.8,-22.62,-412.08,-406.12,-34.8,-29.58,2276.4,-412.08,-431,-33.06,-416.36,-432.06,-19.14,-22.62,-168.6,-368.88,-22.62,-429.08,-280.06,-19.14,-198.12,-392.4,-19.14,2273.92,2292.64,-152.62,-423.6,-59.84,-19.14,-26.1,-24.36,-404.88,-22.62,-146.88,-24.36,-27.84,-120.54,-17.4,-402.4,-402.4,-212.88,-24.36,-143.52,-434.8,-17.4,-382.4,2217.12,-434.28,-423.6,-412.62,-431.02,-29.58,-17.4,-19.14,-412.08,-423.28,-32.88,-392.88,-20.88,-29.58,-38.08,-22.62,-20.88,2267.6,-22.62,-24.36,-22.62,-26.1,2375.2,2298.9,-418.32,2325.12,-410.88,-17.4,2325.12,2289.12,-27.84,-403.84,-17.4,-177.4,-337.4,-230.62,-427.32,2334.64,-402.36,-20.88,-22.62,-17.4,-409.36,-398.64,-117.4,-26.1,2308.16,-20.88,2327.6,2329.36,-404.14,-404.88,-410.88]
trade_dates: ["2023-08-08","2023-08-09","2023-08-18","2023-08-31","2023-09-05","2023-11-08","2023-11-09","2023-11-16","2023-11-21","2023-12-06","2023-12-12","2023-12-14","2023-12-19","2024-02-01","2024-02-02","2024-02-08","2024-02-09","2024-02-23","2024-03-08","2024-03-15","2024-03-21","2024-03-28","2024-04-03","2024-04-12","2024-04-16","2024-04-30","2024-05-07","2024-05-10","2024-05-22","2024-08-13","2024-08-15","2024-08-21","2024-08-22","2024-08-30","2024-09-04","2024-09-10","2024-09-12","2024-09-13","2024-09-18","2024-09-20","2024-11-01","2024-11-21","2024-12-03","2024-12-10","2024-12-18","2024-12-19","2024-12-31","2025-01-08","2025-01-14","2025-01-28","2025-01-30","2025-02-28","2025-03-13","2025-03-18","2025-03-25","2025-03-26","2025-04-02","2025-04-24","2025-05-07","2025-05-28","2025-06-10","2025-06-17","2025-06-26","2025-06-27","2025-08-07","2025-08-08","2025-08-13","2025-09-03","2025-09-23","2025-09-30","2025-11-04","2025-11-05","2025-11-18","2025-11-25","2025-11-26","2025-12-16","2026-01-02","2026-01-06","2026-01-07","2026-01-15","2026-01-16","2026-01-21","2026-01-22","2026-01-28","2026-02-10","2026-02-17","2026-03-19","2026-03-20","2026-03-26","2026-04-02","2026-04-21","2026-04-28","2026-04-30","2026-05-21","2026-05-26","2026-05-29","2026-06-05","2026-06-10","2026-06-17","2026-06-24"]
payout_given_pass_pct: 100
median_withdrawn_usd: 1094
expected_net_per_account_usd: 493
expected_usd_per_calendar_week: 37
recycle_pct: null
---
# D1 · PRB RR6 funded raw · regime-gate-v0

> Lab cohort · TPT $50K Test → PRO (reference) · multi-firm matrix · 2023-08-08 → 2026-06-24
> Pine v1.5 · preset `matrix-d1`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | D1 · PRB RR6 funded raw · regime-gate-v0 |
| Family | prb |
| Phase | funded |
| Pine version | v1.5 |
| Preset ID | `matrix-d1` |
| Config | Control · RR 6 · eval cap OFF |
| Hypothesis | regime-gate-v0 · Jul+Oct STAND_DOWN · Lab confirm |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 100 |
| Net P&L | $14,959 |
| W / L / Scr | 14 / 47 / 39 |
| Max drawdown | $4,434 |
| Trades/week | 0.7 |
| Sources | prb-d1-3y-gate-jul-oct.csv |

## Business loop (pass → payout → recycle)

| Metric | Value |
|--------|-------|
| **E[$ / calendar week]** | **$37** |
| E[$ / account] after fees | $493 |
| Pass → P(payout given pass) | 120.5% → 100% |
| Median trader withdraw | $1094 |
| Median weeks to payout | 13.5 |
| Bust rate | 33.8% |
| Expected accounts | 0.8 |

_Raw ledger weekly edge (expectancy×tr/wk, not fee-aware): $105/wk_

## Monte Carlo (TPT $50K Test → PRO (reference) · multi-firm matrix)

| Metric | Value |
|--------|-------|
| Pass rate | 120.5% |
| Bust rate | 33.8% |
| Payout rate | 120.5% |
| Median weeks to pass | 13.5 |
| Median weeks to payout | 13.5 |
| Scorecard vs control | — (composite —) |
| Net after fees (median path) | $784 |
| Sims / max trades | 2000 / 220 |
| Payout buffer | $2000 |

## Regime tags

- #runner
- #baseline
- #regime-gate-v0

## Notes

regime-gate-v0 · Jul+Oct STAND_DOWN · Lab confirm

## A/B comparison

_Compare pass rate and net P&L against baseline cohorts in this folder. Promotion rule: MC pass ≥ baseline AND forward test holds 20+ trades._

## Links

- [[Powell_Rejection_Block_SOP]]
- [[PRB_Trade_Checklist]]
- [[strategy-dev/30-findings/findings-prb]]
- [[strategy-dev/70-firms/prop-firm-math]]
- [[strategy-dev/40-plans/roadmap]]
