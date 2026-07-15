---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-bbreclaim-mnq-5m

> JSON: `event-study-trackb-bbreclaim-mnq-5m.json` · `npx tsx scripts/analyze-event-study.ts trackb-bbreclaim-mnq-5m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 775 | -0.93 | [-7.26, 5.18] | 53.26 | true |
| IS (< 2025-07-14) | 529 | -1.47 | [-8.94, 5.8] | 53.26 | true |
| OOS | 246 | 0.21 | [-10.28, 10.51] | 52.51 | true |
| Random baseline | 775 | 0.91 | [-4.9, 7.56] | 50.76 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 52 | 0.88 | 88.58 |
| IS | 51.6 | 0.88 | 90.51 |
| OOS | 52.8 | 0.87 | 84.27 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
