---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-1005-3y

> JSON: `event-study-trackb-1005-3y.json` · `npx tsx scripts/analyze-event-study.ts trackb-1005-3y.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 61 | -5.02 | [-47.82, 37.71] | -123.72 | true |
| IS (< 2025-07-14) | 51 | 1.03 | [-44.12, 46.36] | -122.22 | true |
| OOS | 10 | -35.86 | [-127.69, 60.31] | -123.72 | true |
| Random baseline | 61 | -34.89 | [-74.67, 4.33] | -126.72 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 41 | 1.35 | 164.11 |
| IS | 43.1 | 1.33 | 166.75 |
| OOS | 30 | 1.42 | 146.11 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
