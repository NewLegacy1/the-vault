---
variant: "A0a · PRB control · regime-gate-v0 · OOS"
strategy_preset: "matrix-a0a"
strategy_family: "prb"
phase: "eval"
experiment_series: "premium365"
strategy_version: "v1.5"
strategy_config: "BE@1R · Both · trail OFF · $400 · RR 5"
hypothesis: "regime-gate-v0 · OOS 12m · Jul+Oct STAND_DOWN"
regimes: ["baseline", "be-only", "regime-gate-v0"]
date_start: "2025-08-07"
date_end: "2026-06-24"
trades: 36
net_pnl: 14078
wins: 10
losses: 14
scratches: 12
max_dd: 1622
trades_per_week: 0.8
weekly_edge_usd: 313
scorecard_verdict: "hold"
composite_score: null
firm: "TPT $50K Test → PRO (reference) · multi-firm matrix"
mc_pass_pct: 90.5
mc_bust_pct: 9.5
mc_payout_pct: 90.5
mc_sims: 2000
weeks_to_pass_p50: 12.7
weeks_to_payout_p50: 17.8
expected_accounts: 1.1
tags: [cohort, prb, eval, monte-carlo, lab]
created: "2026-07-14T23:08:14.502Z"
dataset: "regime-gate-v0 · OOS · OOS 12m"
mc_max_trades: 220
payout_buffer: 2000
mc_engine_version: 2
mc_rule_pack: ["eod_trail","consistency_total"]
firm_mc: {"tpt50":{"passPct":90.7,"bustPct":9.3,"payoutPct":90.7,"medianNetPerAccountUsd":2794,"expectedNetPerAccountUsd":2570,"medianWithdrawnUsd":3859,"mcMode":"eval","weeksToPassP50":11.5,"weeksToPayoutP50":17.8,"passAt":4000,"trailingDD":2000,"consistencyPct":50,"firmName":"TPT $50K Test → PRO"},"topstep50":{"passPct":0,"bustPct":8.8,"payoutPct":0,"medianNetPerAccountUsd":-98,"expectedNetPerAccountUsd":-98,"medianWithdrawnUsd":0,"mcMode":"eval","weeksToPassP50":null,"weeksToPayoutP50":null,"passAt":3000,"trailingDD":2000,"consistencyPct":50,"firmName":"Topstep $50K (Combine → XFA)"},"alpha-zero-50":{"passPct":91.4,"bustPct":8.7,"payoutPct":91,"medianNetPerAccountUsd":1119,"expectedNetPerAccountUsd":1004,"medianWithdrawnUsd":1350,"mcMode":"eval","weeksToPassP50":7.6,"weeksToPayoutP50":15.3,"passAt":3000,"trailingDD":2000,"consistencyPct":0,"firmName":"Alpha Zero $50K Eval"},"apex50-eod":{"passPct":91.3,"bustPct":8.8,"payoutPct":90.7,"medianNetPerAccountUsd":1204,"expectedNetPerAccountUsd":1073,"medianWithdrawnUsd":1500,"mcMode":"eval","weeksToPassP50":7.6,"weeksToPayoutP50":15.3,"passAt":3000,"trailingDD":2000,"consistencyPct":0,"firmName":"Apex $50K EOD Trail"}}
trade_pnls: [1887.6,-22.62,-24.36,-22.62,-26.1,1975.2,1916.4,-418.32,1935.12,-410.88,-17.4,1935.12,1905.12,-27.84,-403.84,-17.4,-177.4,-337.4,-230.62,-427.32,1942.64,-402.36,-20.88,-22.62,-17.4,-409.36,-398.64,-117.4,-26.1,1924.16,-20.88,1937.6,1938.86,-404.14,-404.88,-410.88]
trade_dates: ["2025-08-07","2025-08-08","2025-08-13","2025-09-03","2025-09-23","2025-09-30","2025-11-04","2025-11-05","2025-11-18","2025-11-25","2025-11-26","2025-12-16","2026-01-02","2026-01-06","2026-01-07","2026-01-15","2026-01-16","2026-01-21","2026-01-22","2026-01-28","2026-02-10","2026-02-17","2026-03-19","2026-03-20","2026-03-26","2026-04-02","2026-04-21","2026-04-28","2026-04-30","2026-05-21","2026-05-26","2026-05-29","2026-06-05","2026-06-10","2026-06-17","2026-06-24"]
payout_given_pass_pct: 99.9
median_withdrawn_usd: 3876
expected_net_per_account_usd: 2549
expected_usd_per_calendar_week: 143
recycle_pct: null
---
# A0a · PRB control · regime-gate-v0 · OOS

> Lab cohort · TPT $50K Test → PRO (reference) · multi-firm matrix · 2025-08-07 → 2026-06-24
> Pine v1.5 · preset `matrix-a0a`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | A0a · PRB control · regime-gate-v0 · OOS |
| Family | prb |
| Phase | eval |
| Pine version | v1.5 |
| Preset ID | `matrix-a0a` |
| Config | BE@1R · Both · trail OFF · $400 · RR 5 |
| Hypothesis | regime-gate-v0 · OOS 12m · Jul+Oct STAND_DOWN |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 36 |
| Net P&L | $14,078 |
| W / L / Scr | 10 / 14 / 12 |
| Max drawdown | $1,622 |
| Trades/week | 0.8 |
| Sources | prb-a0a-3y-gate-jul-oct.csv |

## Business loop (pass → payout → recycle)

| Metric | Value |
|--------|-------|
| **E[$ / calendar week]** | **$143** |
| E[$ / account] after fees | $2549 |
| Pass → P(payout given pass) | 90.5% → 99.9% |
| Median trader withdraw | $3876 |
| Median weeks to payout | 17.8 |
| Bust rate | 9.5% |
| Expected accounts | 1.1 |

_Raw ledger weekly edge (expectancy×tr/wk, not fee-aware): $313/wk_

## Monte Carlo (TPT $50K Test → PRO (reference) · multi-firm matrix)

| Metric | Value |
|--------|-------|
| Pass rate | 90.5% |
| Bust rate | 9.5% |
| Payout rate | 90.5% |
| Median weeks to pass | 12.7 |
| Median weeks to payout | 17.8 |
| Scorecard vs control | — (composite —) |
| Net after fees (median path) | $2,882 |
| Sims / max trades | 2000 / 220 |
| Payout buffer | $2000 |

## Regime tags

- #baseline
- #be-only
- #regime-gate-v0

## Notes

regime-gate-v0 · OOS 12m · Jul+Oct STAND_DOWN

## A/B comparison

_Compare pass rate and net P&L against baseline cohorts in this folder. Promotion rule: MC pass ≥ baseline AND forward test holds 20+ trades._

## Links

- [[Powell_Rejection_Block_SOP]]
- [[PRB_Trade_Checklist]]
- [[strategy-dev/findings-prb]]
- [[strategy-dev/prop-firm-math]]
- [[strategy-dev/roadmap]]
