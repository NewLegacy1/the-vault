---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-emapull-mnq-5m

> JSON: `event-study-trackb-emapull-mnq-5m.json` · `npx tsx scripts/analyze-event-study.ts trackb-emapull-mnq-5m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 293 | -8.03 | [-18.93, 2.69] | -58.24 | true |
| IS (< 2025-07-14) | 213 | -5.23 | [-17.75, 7.16] | -56.24 | true |
| OOS | 80 | -15.48 | [-35.71, 5.3] | -76.48 | true |
| Random baseline | 293 | -4.22 | [-14.98, 6.79] | -55.24 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 43.3 | 1.09 | 93.25 |
| IS | 44.6 | 1.1 | 93.28 |
| OOS | 40 | 1.07 | 92.77 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
