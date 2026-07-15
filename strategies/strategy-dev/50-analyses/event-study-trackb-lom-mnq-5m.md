---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-lom-mnq-5m

> JSON: `event-study-trackb-lom-mnq-5m.json` · `npx tsx scripts/analyze-event-study.ts trackb-lom-mnq-5m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 465 | -5.21 | [-27.11, 18.17] | -128.48 | true |
| IS (< 2025-07-14) | 318 | -7.45 | [-34.84, 20.16] | -129.72 | true |
| OOS | 147 | -0.36 | [-36.45, 37.56] | -128.48 | true |
| Random baseline | 465 | 10.1 | [-11.76, 32.08] | 79.24 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 25.8 | 2.53 | 243.98 |
| IS | 26.1 | 2.47 | 248.26 |
| OOS | 25.2 | 2.67 | 234.39 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
