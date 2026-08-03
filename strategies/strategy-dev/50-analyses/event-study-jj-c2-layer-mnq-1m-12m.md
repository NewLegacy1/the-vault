---
updated: 2026-08-03
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — jj-c2-layer-mnq-1m-12m

> JSON: `event-study-jj-c2-layer-mnq-1m-12m.json` · `npx tsx scripts/analyze-event-study.ts jj-c2-layer-mnq-1m-12m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 1999 | -19.32 | [-34.95, -2.76] | -306.72 | false |
| IS (< 2025-07-14) | 0 | 0 | [0, 0] | 0 | true |
| OOS | 1999 | -19.32 | [-35.93, -3.3] | -306.72 | false |
| Random baseline | 1999 | -1.36 | [-17.26, 14.4] | -67.56 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 38.8 | 1.41 | 363.9 |
| IS | 0 | 0 | 0 |
| OOS | 38.8 | 1.41 | 363.9 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
