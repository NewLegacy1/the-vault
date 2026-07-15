---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — lane-s-reaper-mnq-1h

> JSON: `event-study-lane-s-reaper-mnq-1h.json` · `npx tsx scripts/analyze-event-study.ts lane-s-reaper-mnq-1h.csv`  
> Ledger fills as events — confirm purpose before promoting.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 7 | 54.73 | [-62.59, 179.39] | 47.26 | true |
| IS (< 2025-07-14) | 7 | 54.73 | [-69.38, 175.39] | 47.26 | true |
| OOS | 0 | 0 | [0, 0] | 0 | true |
| Random baseline | 7 | -22.49 | [-146.18, 110.12] | -74.74 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 42.9 | 1.97 | 164.38 |
| IS | 42.9 | 1.97 | 164.38 |
| OOS | 0 | 0 | 0 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

Path promote still requires F4 Lab trade-bootstrap MC.
