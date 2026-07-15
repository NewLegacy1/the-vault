---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-gapfade-3y

> JSON: `event-study-trackb-gapfade-3y.json` · `npx tsx scripts/analyze-event-study.ts trackb-gapfade-3y.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 340 | -8.69 | [-26.34, 8.82] | -130.96 | true |
| IS (< 2025-07-14) | 279 | -7.84 | [-27.04, 11.45] | -130.96 | true |
| OOS | 61 | -12.58 | [-52.2, 25.77] | -138.7 | true |
| Random baseline | 340 | 4.53 | [-12.86, 21.93] | 123.72 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 40.6 | 1.32 | 166.67 |
| IS | 40.5 | 1.34 | 167.33 |
| OOS | 41 | 1.23 | 163.56 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
