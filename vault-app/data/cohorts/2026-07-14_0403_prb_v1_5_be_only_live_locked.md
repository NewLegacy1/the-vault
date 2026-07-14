---
variant: "PRB v1.5 — BE-only (live locked)"
strategy_preset: "prb-v15-be-live"
strategy_version: "v1.5"
strategy_config: "BE +1R · trail OFF · limit retest · 1/day · skip Mon · Both bias manual"
hypothesis: ""
regimes: ["baseline", "be-only"]
date_start: "2024-12-31"
date_end: "2026-07-10"
trades: 108
net_pnl: 13232
wins: 17
losses: 59
scratches: 32
max_dd: 5123
firm: "TPT $50K Test → PRO"
mc_pass_pct: 42.6
mc_bust_pct: 57.4
mc_payout_pct: 35.4
mc_sims: 2000
weeks_to_pass_p50: 7.4
weeks_to_payout_p50: 10.3
expected_accounts: 2.3
tags: [cohort, prb, monte-carlo, lab]
created: "2026-07-14T04:03:52.429Z"
dataset: "PRB YTD Jul 14 — 1/day dedupe · PRB v1 — YTD merged from TV exports (108 trades)"
---
# PRB v1.5 — BE-only (live locked)

> Lab cohort · TPT $50K Test → PRO · 2024-12-31 → 2026-07-10
> Pine v1.5 · preset `prb-v15-be-live`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | PRB v1.5 — BE-only (live locked) |
| Pine version | v1.5 |
| Preset ID | `prb-v15-be-live` |
| Config | BE +1R · trail OFF · limit retest · 1/day · skip Mon · Both bias manual |
| Hypothesis | — |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 108 |
| Net P&L | $13,232 |
| W / L / Scr | 17 / 59 / 32 |
| Max drawdown | $5,123 |
| Trades/week | 1.4 |
| Sources | Downloads 40 CSVs · vault data/tv-exports |

## Monte Carlo (TPT $50K Test → PRO)

| Metric | Value |
|--------|-------|
| Pass rate | 42.6% |
| Bust rate | 57.4% |
| Payout rate | 35.4% |
| Median weeks to pass | 7.4 |
| Median weeks to payout | 10.3 |
| Expected accounts | 2.3 |
| Net after fees (median path) | $4,160 |
| Sims / max trades | 2000 / 80 |
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
