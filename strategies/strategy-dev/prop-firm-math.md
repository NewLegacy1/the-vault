---
updated: 2026-07-14
tags: [prop-math, reference, strategy-dev]
---
# Prop firm math — rules, methodology, leaderboard

> The optimization target. Every strategy decision routes through this file.

## TPT $50K Test → PRO (primary firm)

Full Zendesk scrape: [[tpt-rules]]. Agent hygiene for cohorts: [[cohort-hygiene]] (not shown in UI).

| Rule | Test (eval) | PRO (funded sim) | Design consequence |
|---|---|---|---|
| Pass / payout line | +$4,000 MC (`passAt`) | Withdraw at **$52,000** balance (80% above buffer) | Eval needs consistency buffer; PRO needs +$2k profit |
| Trailing DD | $2,000 **EOD** | $2,000 **intraday** | PRO is stricter — unrealized peaks raise floor |
| Consistency | Best day < 50% + **5 min days** | **None** | Eval: cap wins ~$1,490; PRO: can size up / higher RR |
| PRO+ trigger | — | **$5,000** cumulative on PRO | Recycle account before opt-in — see [[tpt-rules]] |
| Fees | eval + activation + monthly | No monthly on PRO | Failed evals compound — see `expected_accounts` |

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

- **Eval:** highest-pass-rate strategy (PRB BE@2R target). Enforce 5 min trading days + 50% consistency in MC. Cap win days; never request PRO at $3,001.
- **PRO:** no consistency — step up RR/size after intraday trail cushion. Target $2k–$4.5k profit, withdraw at $52k, **recycle before $5k** PRO+ eligibility.
- **Funded MC:** use intraday DD mode when modeling PRO survival; eval MC stays EOD.

## Other firms (summary)

Detailed phases in `vault-app/lib/prop-firms.ts` — expand Obsidian when those Zendesk/help pages are scraped:

| Firm | Eval consistency | Funded DD | Funded payout quirk |
|---|---|---|---|
| Topstep $50K | None (5 winning days ≥$150) | EOD MLL + $1k DLL | Path choice at activation (Standard vs 40% consistency) |
| Apex $50K EOD | None | EOD + DLL | ~30% payout consistency on many tiers |
| Alpha Premium | 50% (2 min days) | EOD | No funded consistency on Premium |
| Alpha Zero | None | EOD + DLL | ~40% payout consistency on funded |
