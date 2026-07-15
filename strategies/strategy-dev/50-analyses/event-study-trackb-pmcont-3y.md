---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-pmcont-3y

> JSON: `event-study-trackb-pmcont-3y.json` · `npx tsx scripts/analyze-event-study.ts trackb-pmcont-3y.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 516 | -8.01 | [-22.24, 5.58] | -114.48 | true |
| IS (< 2025-07-14) | 379 | -3.5 | [-19.28, 11.78] | -113.48 | true |
| OOS | 137 | -20.49 | [-45.8, 5.21] | -122.22 | true |
| Random baseline | 516 | 2.2 | [-11.51, 15.33] | 77.99 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 39.3 | 1.39 | 155.79 |
| IS | 40.6 | 1.4 | 156.85 |
| OOS | 35.8 | 1.36 | 152.13 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
