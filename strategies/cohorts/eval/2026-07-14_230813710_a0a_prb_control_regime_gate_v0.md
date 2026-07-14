---
variant: "A0a · PRB control · regime-gate-v0"
strategy_preset: "matrix-a0a"
strategy_family: "prb"
phase: "eval"
experiment_series: "premium365"
strategy_version: "v1.5"
strategy_config: "BE@1R · Both · trail OFF · $400 · RR 5"
hypothesis: "regime-gate-v0 · Jul+Oct STAND_DOWN · Lab confirm"
regimes: ["baseline", "be-only", "regime-gate-v0"]
date_start: "2023-08-08"
date_end: "2026-06-24"
trades: 100
net_pnl: 13431
wins: 16
losses: 47
scratches: 37
max_dd: 3664
trades_per_week: 0.7
weekly_edge_usd: 94
scorecard_verdict: "hold"
composite_score: null
firm: "TPT $50K Test → PRO (reference) · multi-firm matrix"
mc_pass_pct: 59.3
mc_bust_pct: 40.8
mc_payout_pct: 57.1
mc_sims: 2000
weeks_to_pass_p50: 22.5
weeks_to_payout_p50: 39
expected_accounts: 1.7
tags: [cohort, prb, eval, monte-carlo, lab]
created: "2026-07-14T23:08:13.712Z"
dataset: "regime-gate-v0"
mc_max_trades: 220
payout_buffer: 2000
mc_engine_version: 2
mc_rule_pack: ["eod_trail","consistency_total"]
firm_mc: {"tpt50":{"passPct":57.1,"bustPct":42.9,"payoutPct":54.6,"medianNetPerAccountUsd":1128,"expectedNetPerAccountUsd":971,"medianWithdrawnUsd":3748,"mcMode":"eval","weeksToPassP50":22.5,"weeksToPayoutP50":36,"passAt":4000,"trailingDD":2000,"consistencyPct":50,"firmName":"TPT $50K Test → PRO"},"topstep50":{"passPct":0,"bustPct":39.4,"payoutPct":0,"medianNetPerAccountUsd":-98,"expectedNetPerAccountUsd":-98,"medianWithdrawnUsd":0,"mcMode":"eval","weeksToPassP50":null,"weeksToPayoutP50":null,"passAt":3000,"trailingDD":2000,"consistencyPct":50,"firmName":"Topstep $50K (Combine → XFA)"},"alpha-zero-50":{"passPct":64.6,"bustPct":35.4,"payoutPct":59.7,"medianNetPerAccountUsd":734,"expectedNetPerAccountUsd":512,"medianWithdrawnUsd":1350,"mcMode":"eval","weeksToPassP50":15,"weeksToPayoutP50":28.5,"passAt":3000,"trailingDD":2000,"consistencyPct":0,"firmName":"Alpha Zero $50K Eval"},"apex50-eod":{"passPct":61.2,"bustPct":38.8,"payoutPct":55.3,"medianNetPerAccountUsd":1204,"expectedNetPerAccountUsd":571,"medianWithdrawnUsd":1500,"mcMode":"eval","weeksToPassP50":15,"weeksToPayoutP50":28.5,"passAt":3000,"trailingDD":2000,"consistencyPct":0,"firmName":"Apex $50K EOD Trail"}}
trade_pnls: [-416.88,-424.8,-22.62,-412.08,-406.12,-34.8,-29.58,1893.9,-412.08,-431,-33.06,-416.36,-432.06,-19.14,-22.62,-168.6,-368.88,-22.62,-429.08,-280.06,-19.14,-198.12,-392.4,-19.14,1891.42,1907.64,-152.62,-423.6,-59.84,-19.14,-26.1,1872.64,-404.88,-22.62,-146.88,-24.36,-27.84,-120.54,-17.4,-402.4,-402.4,-212.88,-24.36,-143.52,-434.8,1962.6,-382.4,1845.12,-434.28,-423.6,-412.62,-431.02,-29.58,-17.4,-19.14,-412.08,-423.28,-32.88,-392.88,-20.88,-29.58,-38.08,-22.62,-20.88,1887.6,-22.62,-24.36,-22.62,-26.1,1975.2,1916.4,-418.32,1935.12,-410.88,-17.4,1935.12,1905.12,-27.84,-403.84,-17.4,-177.4,-337.4,-230.62,-427.32,1942.64,-402.36,-20.88,-22.62,-17.4,-409.36,-398.64,-117.4,-26.1,1924.16,-20.88,1937.6,1938.86,-404.14,-404.88,-410.88]
trade_dates: ["2023-08-08","2023-08-09","2023-08-18","2023-08-31","2023-09-05","2023-11-08","2023-11-09","2023-11-16","2023-11-21","2023-12-06","2023-12-12","2023-12-14","2023-12-19","2024-02-01","2024-02-02","2024-02-08","2024-02-09","2024-02-23","2024-03-08","2024-03-15","2024-03-21","2024-03-28","2024-04-03","2024-04-12","2024-04-16","2024-04-30","2024-05-07","2024-05-10","2024-05-22","2024-08-13","2024-08-15","2024-08-21","2024-08-22","2024-08-30","2024-09-04","2024-09-10","2024-09-12","2024-09-13","2024-09-18","2024-09-20","2024-11-01","2024-11-21","2024-12-03","2024-12-10","2024-12-18","2024-12-19","2024-12-31","2025-01-08","2025-01-14","2025-01-28","2025-01-30","2025-02-28","2025-03-13","2025-03-18","2025-03-25","2025-03-26","2025-04-02","2025-04-24","2025-05-07","2025-05-28","2025-06-10","2025-06-17","2025-06-26","2025-06-27","2025-08-07","2025-08-08","2025-08-13","2025-09-03","2025-09-23","2025-09-30","2025-11-04","2025-11-05","2025-11-18","2025-11-25","2025-11-26","2025-12-16","2026-01-02","2026-01-06","2026-01-07","2026-01-15","2026-01-16","2026-01-21","2026-01-22","2026-01-28","2026-02-10","2026-02-17","2026-03-19","2026-03-20","2026-03-26","2026-04-02","2026-04-21","2026-04-28","2026-04-30","2026-05-21","2026-05-26","2026-05-29","2026-06-05","2026-06-10","2026-06-17","2026-06-24"]
payout_given_pass_pct: 96.4
median_withdrawn_usd: 3775
expected_net_per_account_usd: 1048
expected_usd_per_calendar_week: 27
recycle_pct: null
---
# A0a · PRB control · regime-gate-v0

> Lab cohort · TPT $50K Test → PRO (reference) · multi-firm matrix · 2023-08-08 → 2026-06-24
> Pine v1.5 · preset `matrix-a0a`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | A0a · PRB control · regime-gate-v0 |
| Family | prb |
| Phase | eval |
| Pine version | v1.5 |
| Preset ID | `matrix-a0a` |
| Config | BE@1R · Both · trail OFF · $400 · RR 5 |
| Hypothesis | regime-gate-v0 · Jul+Oct STAND_DOWN · Lab confirm |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 100 |
| Net P&L | $13,431 |
| W / L / Scr | 16 / 47 / 37 |
| Max drawdown | $3,664 |
| Trades/week | 0.7 |
| Sources | prb-a0a-3y-gate-jul-oct.csv |

## Business loop (pass → payout → recycle)

| Metric | Value |
|--------|-------|
| **E[$ / calendar week]** | **$27** |
| E[$ / account] after fees | $1048 |
| Pass → P(payout given pass) | 59.3% → 96.4% |
| Median trader withdraw | $3775 |
| Median weeks to payout | 39 |
| Bust rate | 40.8% |
| Expected accounts | 1.7 |

_Raw ledger weekly edge (expectancy×tr/wk, not fee-aware): $94/wk_

## Monte Carlo (TPT $50K Test → PRO (reference) · multi-firm matrix)

| Metric | Value |
|--------|-------|
| Pass rate | 59.3% |
| Bust rate | 40.8% |
| Payout rate | 57.1% |
| Median weeks to pass | 22.5 |
| Median weeks to payout | 39 |
| Scorecard vs control | — (composite —) |
| Net after fees (median path) | $2,392 |
| Sims / max trades | 2000 / 220 |
| Payout buffer | $2000 |

## Regime tags

- #baseline
- #be-only
- #regime-gate-v0

## Notes

regime-gate-v0 · Jul+Oct STAND_DOWN · Lab confirm

## A/B comparison

_Compare pass rate and net P&L against baseline cohorts in this folder. Promotion rule: MC pass ≥ baseline AND forward test holds 20+ trades._

## Links

- [[Powell_Rejection_Block_SOP]]
- [[PRB_Trade_Checklist]]
- [[strategy-dev/findings-prb]]
- [[strategy-dev/prop-firm-math]]
- [[strategy-dev/roadmap]]
