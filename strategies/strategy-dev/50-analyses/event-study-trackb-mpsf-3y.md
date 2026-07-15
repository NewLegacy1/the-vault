---
updated: 2026-07-15
status: stage-0
verdict: away
tags: [stage-0, event-study, strategy-dev]
---
# Event study — trackb-mpsf-3y

> JSON: `event-study-trackb-mpsf-3y.json` · `npx tsx scripts/analyze-event-study.ts trackb-mpsf-3y.csv`  
> Stage-0 B2 MPSF measure export — barrier PnL from TrackB_MPSF_measure_v0.

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 30 | -75.98 | [-121.43, -21.39] | -140.71 | false |
| IS (< 2025-07-14) | 24 | -74.27 | [-129.61, -14.97] | -143.33 | false |
| OOS | 6 | -82.8 | [-141, 26.29] | -132.84 | true |
| Random baseline | 30 | -35.93 | [-88.37, 17.83] | -128.97 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 20 | 1.36 | 136.54 |
| IS | 20.8 | 1.35 | 140.02 |
| OOS | 16.7 | 1.37 | 121.36 |

## SCORECARD

**away** — OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone

`BLOCK_STRATEGY`: **true**

**Settle: KILL B2 MPSF** (2026-07-15). Full-sample EV is negative with CI excluding 0 — not a thin-n fluke to retune. Parent: [[track-b-b2-mpsf-v0]].

Path promote still requires F4 Lab trade-bootstrap MC — **not reached**.
