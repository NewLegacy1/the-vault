---
updated: 2026-08-03
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — jj-p2-mr-mnq-1m-12m

> JSON: `event-study-jj-p2-mr-mnq-1m-12m.json` · `npx tsx scripts/analyze-event-study.ts jj-p2-mr-mnq-1m-12m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 117 | -7.26 | [-71.35, 57.75] | -306.72 | true |
| IS (< 2025-07-14) | 0 | 0 | [0, 0] | 0 | true |
| OOS | 117 | -7.26 | [-77.83, 63.09] | -306.72 | true |
| Random baseline | 117 | 35.8 | [-33.1, 103.59] | 306.72 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 40.2 | 1.43 | 369.05 |
| IS | 0 | 0 | 0 |
| OOS | 40.2 | 1.43 | 369.05 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
