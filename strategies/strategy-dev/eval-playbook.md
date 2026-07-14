---
phase: eval
updated: 2026-07-14
tags: [playbook, eval, strategy-dev]
---
# Eval-phase playbook

> **Goal:** Reach +$4,000 before $2,000 trailing DD on TPT $50K. Optimize `mc_pass_pct` and `expected_accounts`, not raw annual P&L.

## Winning formula (current leader)

**PRB v1.5 BE@2R + Auto PDH/PDL** — see [[findings-prb]].

| Lever | Why it matters |
|---|---|
| BE at +2R | Caps loss size; scratched fewer eventual winners than +1R |
| $400 risk | Keeps max loss inside trail budget |
| Auto PDH/PDL | Trades toward untapped pool; fewer but higher-quality fills |
| 1 trade/day | Slot discipline |
| Skip Monday | Settled edge |

## Consistency rule (TPT)

- Best day must stay **< 50%** of total profit at pass request.
- Practical cap: **~$1,490/win day** → plan for **3+ green days**, not one hero day.
- F4 LAB eval consistency checker lives under **Actual replay** (collapsed).

## What to run in F4 LAB

1. Strategy preset: any `prb-*` with phase **eval**
2. Dataset: PRB year export or seed `be2r-pdh-12mo`
3. Firm: TPT $50K
4. RUN → cohort saves to `strategies/cohorts/eval/`

## Experiments queue

See [[roadmap]] Track 1. Next quick win: **win-cap simulation** in MC (consistency-blocked passes).

## Promotion to live eval

Only if: MC pass ≥ BE@2R baseline · forward test 20+ trades · regime fit for upcoming month · cohort saved with `phase: eval`.

## Links

- [[prop-firm-math]]
- [[findings-prb]]
- [[Powell_Rejection_Block_SOP]]
