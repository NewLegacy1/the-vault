---
updated: 2026-08-03
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — jj-f2-mnq-1m-12m

> JSON: `event-study-jj-f2-mnq-1m-12m.json` · `npx tsx scripts/analyze-event-study.ts jj-f2-mnq-1m-12m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 904 | -29.53 | [-52.68, -4.14] | -306.72 | false |
| IS (< 2025-07-14) | 0 | 0 | [0, 0] | 0 | true |
| OOS | 904 | -29.53 | [-52.62, -5.47] | -306.72 | false |
| Random baseline | 904 | 32.06 | [9.18, 56.39] | 306.72 | false |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 37.2 | 1.43 | 363.35 |
| IS | 0 | 0 | 0 |
| OOS | 37.2 | 1.43 | 363.35 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
