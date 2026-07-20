---
variant: "D1 · PRB RR6 funded raw · regime-gate-v0 · OOS"
strategy_preset: "matrix-d1"
strategy_family: "prb"
phase: "funded"
experiment_series: "premium365"
strategy_version: "v1.5"
strategy_config: "Control · RR 6 · eval cap OFF"
hypothesis: "regime-gate-v0 · OOS 12m · Jul+Oct STAND_DOWN"
regimes: ["runner", "baseline", "regime-gate-v0"]
date_start: "2025-08-07"
date_end: "2026-06-24"
trades: 36
net_pnl: 17961
wins: 10
losses: 14
scratches: 12
max_dd: 1622
trades_per_week: 0.8
weekly_edge_usd: 399
scorecard_verdict: "hold"
composite_score: null
firm: "TPT $50K Test → PRO (reference) · multi-firm matrix"
mc_pass_pct: 206.1
mc_bust_pct: 6.3
mc_payout_pct: 206.1
mc_sims: 2000
weeks_to_pass_p50: 7.6
weeks_to_payout_p50: 7.6
expected_accounts: 0.5
tags: [cohort, prb, funded, monte-carlo, lab]
created: "2026-07-20T21:21:35.681Z"
dataset: "regime-gate-v0 · OOS · OOS 12m"
mc_max_trades: 220
payout_buffer: 2000
mc_engine_version: 2
mc_rule_pack: ["intraday_trail"]
firm_mc: {"tpt50":{"passPct":210.9,"bustPct":5.4,"payoutPct":210.9,"recyclePct":88.1,"medianNetPerAccountUsd":1168,"expectedNetPerAccountUsd":1150,"medianWithdrawnUsd":1569,"mcMode":"funded","weeksToPassP50":7.6,"weeksToPayoutP50":7.6,"passAt":4000,"trailingDD":2000,"consistencyPct":0,"firmName":"TPT $50K Test → PRO"},"topstep50":{"passPct":93.1,"bustPct":6.9,"payoutPct":93.1,"recyclePct":0,"medianNetPerAccountUsd":1651,"expectedNetPerAccountUsd":1527,"medianWithdrawnUsd":1800,"mcMode":"funded","weeksToPassP50":20.4,"weeksToPayoutP50":20.4,"passAt":3000,"trailingDD":2000,"consistencyPct":40,"firmName":"Topstep $50K (Combine → XFA)"},"alpha-zero-50":{"passPct":92.3,"bustPct":7.8,"payoutPct":92.3,"recyclePct":0,"medianNetPerAccountUsd":1350,"expectedNetPerAccountUsd":1245,"medianWithdrawnUsd":1350,"mcMode":"funded","weeksToPassP50":12.7,"weeksToPayoutP50":12.7,"passAt":3000,"trailingDD":2000,"consistencyPct":40,"firmName":"Alpha Zero $50K Eval"},"apex50-eod":{"passPct":92.3,"bustPct":7.7,"payoutPct":92.3,"recyclePct":0,"medianNetPerAccountUsd":1401,"expectedNetPerAccountUsd":1286,"medianWithdrawnUsd":1500,"mcMode":"funded","weeksToPassP50":11.5,"weeksToPayoutP50":11.5,"passAt":3000,"trailingDD":2000,"consistencyPct":50,"firmName":"Apex $50K EOD Trail"}}
trade_pnls: [2267.6,-22.62,-24.36,-22.62,-26.1,2375.2,2298.9,-418.32,2325.12,-410.88,-17.4,2325.12,2289.12,-27.84,-403.84,-17.4,-177.4,-337.4,-230.62,-427.32,2334.64,-402.36,-20.88,-22.62,-17.4,-409.36,-398.64,-117.4,-26.1,2308.16,-20.88,2327.6,2329.36,-404.14,-404.88,-410.88]
trade_dates: ["2025-08-07","2025-08-08","2025-08-13","2025-09-03","2025-09-23","2025-09-30","2025-11-04","2025-11-05","2025-11-18","2025-11-25","2025-11-26","2025-12-16","2026-01-02","2026-01-06","2026-01-07","2026-01-15","2026-01-16","2026-01-21","2026-01-22","2026-01-28","2026-02-10","2026-02-17","2026-03-19","2026-03-20","2026-03-26","2026-04-02","2026-04-21","2026-04-28","2026-04-30","2026-05-21","2026-05-26","2026-05-29","2026-06-05","2026-06-10","2026-06-17","2026-06-24"]
payout_given_pass_pct: 100
median_withdrawn_usd: 1606
expected_net_per_account_usd: 1144
expected_usd_per_calendar_week: 151
recycle_pct: null
---
# D1 · PRB RR6 funded raw · regime-gate-v0 · OOS

> Lab cohort · TPT $50K Test → PRO (reference) · multi-firm matrix · 2025-08-07 → 2026-06-24
> Pine v1.5 · preset `matrix-d1`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | D1 · PRB RR6 funded raw · regime-gate-v0 · OOS |
| Family | prb |
| Phase | funded |
| Pine version | v1.5 |
| Preset ID | `matrix-d1` |
| Config | Control · RR 6 · eval cap OFF |
| Hypothesis | regime-gate-v0 · OOS 12m · Jul+Oct STAND_DOWN |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 36 |
| Net P&L | $17,961 |
| W / L / Scr | 10 / 14 / 12 |
| Max drawdown | $1,622 |
| Trades/week | 0.8 |
| Sources | prb-d1-3y-gate-jul-oct.csv |

## Business loop (pass → payout → recycle)

| Metric | Value |
|--------|-------|
| **E[$ / calendar week]** | **$151** |
| E[$ / account] after fees | $1144 |
| Pass → P(payout given pass) | 206.1% → 100% |
| Median trader withdraw | $1606 |
| Median weeks to payout | 7.6 |
| Bust rate | 6.3% |
| Expected accounts | 0.5 |

_Raw ledger weekly edge (expectancy×tr/wk, not fee-aware): $399/wk_

## Monte Carlo (TPT $50K Test → PRO (reference) · multi-firm matrix)

| Metric | Value |
|--------|-------|
| Pass rate | 206.1% |
| Bust rate | 6.3% |
| Payout rate | 206.1% |
| Median weeks to pass | 7.6 |
| Median weeks to payout | 7.6 |
| Scorecard vs control | — (composite —) |
| Net after fees (median path) | $1,276 |
| Sims / max trades | 2000 / 220 |
| Payout buffer | $2000 |

## Regime tags

- #runner
- #baseline
- #regime-gate-v0

## Notes

regime-gate-v0 · OOS 12m · Jul+Oct STAND_DOWN

## A/B comparison

_Compare pass rate and net P&L against baseline cohorts in this folder. Promotion rule: MC pass ≥ baseline AND forward test holds 20+ trades._

## Links

- [[Powell_Rejection_Block_SOP]]
- [[PRB_Trade_Checklist]]
- [[strategy-dev/30-findings/findings-prb]]
- [[strategy-dev/70-firms/prop-firm-math]]
- [[strategy-dev/40-plans/roadmap]]
