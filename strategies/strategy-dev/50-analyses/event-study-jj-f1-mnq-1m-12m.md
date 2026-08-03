---
updated: 2026-08-03
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — jj-f1-mnq-1m-12m

> JSON: `event-study-jj-f1-mnq-1m-12m.json` · `npx tsx scripts/analyze-event-study.ts jj-f1-mnq-1m-12m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 150 | 1.56 | [-58.71, 61.9] | -306.72 | true |
| IS (< 2025-07-14) | 0 | 0 | [0, 0] | 0 | true |
| OOS | 150 | 1.56 | [-53.86, 61.81] | -306.72 | true |
| Random baseline | 150 | -3.84 | [-67.95, 55.36] | -306.72 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 41.3 | 1.43 | 370.7 |
| IS | 0 | 0 | 0 |
| OOS | 41.3 | 1.43 | 370.7 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
