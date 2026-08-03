---
updated: 2026-08-03
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — jj-f3-mnq-1m-12m

> JSON: `event-study-jj-f3-mnq-1m-12m.json` · `npx tsx scripts/analyze-event-study.ts jj-f3-mnq-1m-12m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 1146 | -4.73 | [-25.56, 17.83] | -306.72 | true |
| IS (< 2025-07-14) | 0 | 0 | [0, 0] | 0 | true |
| OOS | 1146 | -4.73 | [-26.21, 18.06] | -306.72 | true |
| Random baseline | 1146 | -10.03 | [-31.86, 10.7] | -306.72 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 40.6 | 1.43 | 369.21 |
| IS | 0 | 0 | 0 |
| OOS | 40.6 | 1.43 | 369.21 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
