---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-gapcont-3y

> JSON: `event-study-trackb-gapcont-3y.json` · `npx tsx scripts/analyze-event-study.ts trackb-gapcont-3y.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 641 | -1.23 | [-14.08, 11.09] | -120.72 | true |
| IS (< 2025-07-14) | 450 | -1.93 | [-17.71, 13.71] | -122.22 | true |
| OOS | 191 | 0.44 | [-22.6, 24.2] | -115.48 | true |
| Random baseline | 641 | 9.67 | [-3.28, 22.97] | 116.26 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 42.1 | 1.35 | 162.71 |
| IS | 42 | 1.35 | 163.24 |
| OOS | 42.4 | 1.37 | 161.45 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
