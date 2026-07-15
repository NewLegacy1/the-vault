---
updated: 2026-07-15
status: pilot
verdict: toward
tags: [stage-0, event-study, pilot, strategy-dev]
---
# Event study pilot — PRB A0a fills

> **Tooling pilot only.** Events = existing Trade List fills. Not a new edge claim.
> JSON: `vault-app/data/tv-exports/event-study-prb-a0a-pilot.json`
> Script: `npx tsx scripts/analyze-event-study.ts`

## Model / edge

| Field | Value |
|---|---|
| Event | Fill timestamp from PRB A0a 3y ledger *(event)* |
| Outcome | Net PnL USD *(outcome)* |
| Idea class | breakout-adjacent (PRB) — legacy book |

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 120 | 71.06 | [-58.64, 216.11] | -81.74 | true |
| IS (< 2025-07-14) | 80 | -52.83 | [-171.59, 81.58] | -132.03 | true |
| OOS | 40 | 318.84 | [38.72, 615.77] | -26.1 | false |
| Random baseline | 120 | -61.19 | [-190.56, 69.91] | -19.14 | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 13.3 | 5.63 | 743.22 |
| IS | 7.5 | 5.62 | 581.05 |
| OOS | 25 | 5.53 | 943.29 |

## SCORECARD

**toward** — OOS EV CI exclusive of 0 — still requires prop path MC for promote

`BLOCK_STRATEGY` (for inventing new Pine from this study alone): **false**

Path promote still requires F4 Lab trade-bootstrap MC ([[SCORECARD]] · [[permutation-tests]]).
