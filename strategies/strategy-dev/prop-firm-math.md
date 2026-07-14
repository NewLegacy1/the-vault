---
updated: 2026-07-14
tags: [prop-math, reference, strategy-dev]
---
# Prop firm math — rules, methodology, leaderboard

> The optimization target. Every strategy decision routes through this file.

## Primary business loop (what we actually optimize)

**Pass % alone is not the product.** The product is cash after fees from:

```text
buy account → pass eval → fund → withdraw (×N) → recycle → buy next
```

| Metric | Meaning | MC field |
|---|---|---|
| Pass rate | Fraction of sims that clear eval (or stay alive enough to extract in funded-only) | `passRate` |
| **P(payout \| pass)** | Of those that pass, who actually withdraw | `payoutRate / passRate` |
| **Median payout $** | Trader take-home on paths that paid (≥1 withdraw) | `medianWithdrawnUsd` / `medianNetPerAccountUsd` |
| Recycle rate | Funded: finished ≥1 withdraw+reset before PRO+ cap | `recycleRate` |
| Weeks / cycle | Calendar time to first payout (or pass) | `weeksToPayoutP50` |
| **E[$/account]** | Mean net after fees across *all* sims (busts count as −fees) | `expectedNetPerAccountUsd` |
| **E[$/calendar week]** | `E[$/account] / weeksToPayoutP50` — the money rate | derived |

**Account churn is fine** if `E[$/calendar week] > 0` after eval/activation/recycle fees. A slower 80% passer can beat a fast 50% passer; a fast passer with tiny extracts can lose to a medium passer with larger withdrawals.

Script: `npx tsx scripts/analyze-payout-cycle.ts` (TPT $50K matrix books).  
Chained eval→funded pairs: `npx tsx scripts/analyze-chain-ev.ts` (see [[chain-ev-spec]]).

### Illative snapshot (TPT $50K, 2000 sims, Jul 2026)

| Book | Mode | Pass | P(pay\|pass) | Median withdraw | E[$/acct] | Wks→pay | **E[$/wk]** |
|---|---|---|---|---|---|---|---|
| A0a PRB | eval→pay | 79% | 91% | ~$3.8k | ~$1.9k | ~18 | **~$104** |
| H0a Hybrid | eval→pay | 63% | 83% | ~$3.7k | ~$1.3k | ~11 | **~$120** |
| H0b Hybrid | funded recycle | — | ~100% of survivors | ~$1.2k | ~$0.7k | ~5 | **~$136** |
| D1 PRB RR6 | funded recycle | — | ~100% | ~$1.5k | ~$1.0k | ~9 | **~$116** |
| M2 Macro vol | funded | — | survivors pay tiny | ~$0.4k | **−$23** | ~5 | **−$5** |

M2 is negative EV even with fast cycles — volume without controlled losses burns fees.

### Ops levers that move E[$/wk] without a new entry model

1. **Min-day padding** — firms with 3–5 day minimums: micro risk ($50–100) on dead days to bank the day count, full size only on A+/best window. MC does *not* model this yet — treat as live overlay after pass MC looks good.
2. **Hyper time-of-day** — already evidence-backed (Macro 9:50 only). Fewer toxic fills → higher pass + larger median extract.
3. **Win cap / consistency pack** — eval: keep best day &lt;50% so P(payout\|pass) doesn't collapse on “passed equity but blocked.”
4. **Recycle before PRO+** — multiple mid payouts beat one long climb if pass rate holds.
5. **Multi-account parallel** — scales E[$/wk] linearly when EV/account &gt; 0.

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
