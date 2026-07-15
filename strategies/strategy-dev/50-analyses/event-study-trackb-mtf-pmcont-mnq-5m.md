---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-mtf-pmcont-mnq-5m

> JSON: `event-study-trackb-mtf-pmcont-mnq-5m.json` · `npx tsx scripts/analyze-event-study.ts trackb-mtf-pmcont-mnq-5m.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 425 | -9.09 | [-24.15, 6.64] | -114.48 | true |
| IS (< 2025-07-14) | 314 | -6.1 | [-23.46, 10.22] | -113.98 | true |
| OOS | 111 | -17.54 | [-44.33, 11.79] | -120.48 | true |
| Random baseline | 425 | -4.82 | [-19.66, 9.88] | -105.48 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 38.8 | 1.4 | 155.69 |
| IS | 39.8 | 1.4 | 156.28 |
| OOS | 36 | 1.4 | 153.71 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
