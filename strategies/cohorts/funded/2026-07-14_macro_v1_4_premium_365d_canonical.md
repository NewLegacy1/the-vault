---
variant: "Macro Model v1.4 — CE confirm + tiered risk"
strategy_preset: "macro-v14-ce"
strategy_family: "macro"
phase: "funded"
strategy_version: "v1.4"
strategy_config: "TS required · SMT boosts TP · wick 56–80 half risk · CE tap+lift · $800 risk"
hypothesis: "Premium 365d deep backtest — first clean single-export year with tiered Signal IDs"
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
scorecard_verdict: "hold"
composite_score: null
firm: "TPT $50K Test → PRO"
mc_pass_pct: 33.0
mc_bust_pct: 67.0
mc_payout_pct: 0
mc_sims: 2000
weeks_to_pass_p50: null
weeks_to_payout_p50: null
expected_accounts: 3
tags: [cohort, macro, funded, monte-carlo, lab, canonical]
created: "2026-07-14T17:17:05.538Z"
dataset: "Macro v1.4 premium 365d"
---

# Macro Model v1.4 — CE confirm + tiered risk

> Lab cohort · TPT $50K Test → PRO · 2025-07-28 → 2026-07-10
> Pine v1.4 · preset `macro-v14-ce`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | Macro Model v1.4 — CE confirm + tiered risk |
| Family | macro |
| Phase | funded |
| Pine version | v1.4 |
| Preset ID | `macro-v14-ce` |
| Config | TS required · SMT boosts TP · wick 56–80 half risk · CE tap+lift · $800 risk |
| Hypothesis | Premium 365d deep backtest — first clean single-export year with tiered Signal IDs |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | 26 |
| Net P&L | $2,348 |
| W / L / Scr | 13 / 13 / 0 |
| Max drawdown | $2,623 |
| Trades/week | ~0.5 |
| Sources | TV premium deep backtest CSV (21) |

## Tier breakdown (key finding)

| Tier | n | W/L | Net |
|------|---|-----|-----|
| A | 14 | 9/5 | +$4,966 |
| A+ | 8 | 2/6 | −$2,410 |
| H | 4 | 2/2 | −$208 |

**A-tier carries the book.** A+ net negative despite SMT-boosted TP — see [[strategy-dev/findings-macro]].

## Monte Carlo (TPT $50K Test → PRO)

| Metric | Value |
|--------|-------|
| Pass rate | 33.0% |
| Bust rate | 67.0% |
| Expected accounts | 3 |
| Trades to pass (p50) | 11 |

## Regime tags

- #baseline
- #be-only

## Notes

Canonical v1.4 year export. Enriched ledger: `vault-app/data/tv-exports/macro-v1.4-premium-merged.csv`. MC report: `macro-v1.4-premium-mc-report.json`.

## Links

- [[Macro_Model_SOP]]
- [[Macro_Trade_Checklist]]
- [[strategy-dev/findings-macro]]
- [[strategy-dev/prop-firm-math]]
- [[strategy-dev/roadmap]]
- [[strategy-dev/funded-playbook]]
