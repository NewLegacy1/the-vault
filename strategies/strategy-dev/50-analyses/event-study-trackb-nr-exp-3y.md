---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-nr-exp-3y

> JSON: `event-study-trackb-nr-exp-3y.json` · `npx tsx scripts/analyze-event-study.ts trackb-nr-exp-3y.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 27 | -17.99 | [-78.28, 44.05] | -125.22 | true |
| IS (< 2025-07-14) | 21 | -15.68 | [-82.91, 50.54] | -126.72 | true |
| OOS | 6 | -26.08 | [-140.45, 92.04] | -125.22 | true |
| Random baseline | 27 | 27.49 | [-34.8, 88.04] | 125.22 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 37 | 1.35 | 160.35 |
| IS | 38.1 | 1.33 | 161.2 |
| OOS | 33.3 | 1.43 | 157.07 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
