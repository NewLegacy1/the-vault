---
updated: 2026-07-14
tags: [prop-math, reference, strategy-dev]
---
# Prop firm math — rules, methodology, leaderboard

> The optimization target. Every strategy decision routes through this file.

## TPT $50K Test → PRO (primary firm)

| Rule | Value | Design consequence |
|---|---|---|
| Pass target | +$4,000 | ~5 avg Macro wins or ~2 good PRB runners |
| Trailing DD | $2,000 | **2–3 max losses ≈ bust.** Loss size matters more than win rate |
| Consistency | Best day < 50% of total | Cap win days ~$1,490; need 3+ green days minimum |
| Fees | eval + activation + monthly | Failed attempts compound — see `expected_accounts` |

## Why raw P&L lies

Macro v1.2: +$16,749/yr but 30.5% pass — symmetric $800 wins/losses inside a $2,000 trail means routine 3-loss streaks bust the account. PRB v1.5 BE@2R: smaller net but 54.9% pass because BE mechanism caps losses. **The trail DD punishes loss size, not low win rate.**

## Expectancy math (per-strategy targets)

- Expectancy/trade = WR × avgWin − (1−WR) × avgLoss
- Eval survival ≈ f(max consecutive-loss run × avgLoss vs $2,000)
- `expected_accounts` = 1 / pass_rate → dominant fee driver
- Weekly edge $ = expectancy × trades/week (funded-phase metric)

## Current leaderboard (2000 sims, TPT $50K)

| Strategy | MC pass | Bust | Net/yr | Exp. accts | Role candidate |
|---|---|---|---|---|---|
| **PRB v1.5 BE@2R + PDH/PDL** | **54.9%** | 45.1% | $19,152 | 1.8 | **Eval phase** |
| PRB v1.5 BE-only (live) | 42.5% | 57.5% | $12,345 | 2.4 | eval fallback |
| Macro v1.3 tiered | 42.1% | 58% | $4,969 | — | — |
| Macro v1.4 (365d) | 33.0% | 67% | $2,348 | 3 | funded add-on (A-tier only?) |
| Macro v1.2 CE confirm | 30.5% | 69.6% | $16,749 | 3.3 | funded phase (raw edge) |

## MC methodology (F4 LAB)

- Week-block bootstrap over dated trade ledger · 2000 sims · max 80 trades/path
- Consistency-aware pass when firm has the rule
- Inputs from TV CSV via `vault-app/lib/csv.ts` (now enriched: tier, MFE/MAE, qty, duration)
- Engine: `vault-app/lib/monte-carlo.ts` · firm rules: `vault-app/lib/prop-firms.ts`

## Phase-split implication

- **Eval:** run the highest-pass-rate strategy exclusively (currently PRB BE@2R). Cap win days for consistency. Stop trading day after target buffer reached.
- **Funded:** blend in higher-expectancy trades (Macro A-tier, PRB runners) once payout buffer ($1,000+) established. DD room grows with equity.
