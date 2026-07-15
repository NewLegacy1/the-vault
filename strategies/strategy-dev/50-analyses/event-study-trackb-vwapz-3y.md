---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-vwapz-3y

> JSON: `event-study-trackb-vwapz-3y.json` · `npx tsx scripts/analyze-event-study.ts trackb-vwapz-3y.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 147 | -14.94 | [-52.23, 27.49] | -134.96 | true |
| IS (< 2025-07-14) | 117 | -13.07 | [-53, 33.83] | -134.96 | true |
| OOS | 30 | -22.21 | [-105.16, 77.39] | -139.96 | true |
| Random baseline | 147 | 30.24 | [-8.78, 68.49] | 123.72 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 25.9 | 2.31 | 246.71 |
| IS | 26.5 | 2.24 | 246.96 |
| OOS | 23.3 | 2.62 | 245.56 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
