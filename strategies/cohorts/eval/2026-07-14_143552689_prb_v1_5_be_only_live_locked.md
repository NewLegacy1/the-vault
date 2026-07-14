---
variant: "PRB v1.5 — BE-only (live locked)"
strategy_preset: "prb-v15-be-live"
strategy_version: "v1.5"
strategy_config: "BE +1R · trail OFF · limit retest · 1/day · skip Mon · Both bias manual"
hypothesis: ""
regimes: ["baseline", "be-only"]
date_start: "2024-12-31"
date_end: "2026-07-08"
trades: 69
net_pnl: 12345
wins: 13
losses: 44
scratches: 12
max_dd: 4585
trades_per_week: 0.9
weekly_edge_usd: 161
scorecard_verdict: "regress"
composite_score: 45
firm: "TPT $50K Test → PRO"
mc_pass_pct: 42.5
mc_bust_pct: 57.5
mc_payout_pct: 35.6
mc_sims: 2000
weeks_to_pass_p50: 9.2
weeks_to_payout_p50: 11.5
expected_accounts: 2.4
tags: [cohort, prb, monte-carlo, lab]
created: "2026-07-14T14:35:52.689Z"
dataset: "PRB BE@2R PDH Jul14 — 12mo · PRB v1.5 — BE@2R + Auto PDH/PDL (69 trades) ★"
---
# PRB v1.5 — BE-only (live locked)

> Lab cohort · TPT $50K Test → PRO · 2024-12-31 → 2026-07-08
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
| Trades | 69 |
| Net P&L | $12,345 |
| W / L / Scr | 13 / 44 / 12 |
| Max drawdown | $4,585 |
| Trades/week | 0.9 |
| Sources | Jul 14 TV exports · same 12mo windows · fewer fills (BE@2R + PDH/PDL filter) |

## Monte Carlo (TPT $50K Test → PRO)

| Metric | Value |
|--------|-------|
| Pass rate | 42.5% |
| Bust rate | 57.5% |
| Payout rate | 35.6% |
| Median weeks to pass | 9.2 |
| Median weeks to payout | 11.5 |
| Expected accounts | 2.4 |
| Weekly edge (E[$/wk]) | $161 |
| Scorecard vs control | regress (composite 45) |
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
