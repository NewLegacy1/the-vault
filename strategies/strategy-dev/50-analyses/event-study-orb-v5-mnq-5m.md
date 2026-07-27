---
updated: 2026-07-27
status: stage-0
verdict: away
tags: [stage-0, event-study, orb, strategy-dev]
---
# Event study — orb-v5-mnq-5m

> JSON: `event-study-orb-v5-mnq-5m.json` · `npx tsx scripts/analyze-event-study.ts orb-v5-mnq-5m.csv`  
> ORB Strategy v5 · chart **5m** · swing stop in OR · TP 2R · BE@1R · qty=10 in export.  
> Compare: [[event-study-orb-v5-5m-vs-1m]] · 1m twin: [[event-study-orb-v5-mnq-1m]]

## Caveats

- Sample **2025-07-28 → 2026-07-24** (~1y). Default `OOS_START=2025-07-14` → IS n=0 (all trades land in OOS).  
- Analyzer $ are **10-contract** TV size. ÷10 for 1-contract Stage-0 language (~EV +$153, CI still covers 0).

## Results (raw export · qty 10)

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 182 | 1532.65 | [-348.66, 3433.2] | -1012.4 | true |
| IS (< 2025-07-14) | 0 | 0 | [0, 0] | 0 | true |
| OOS | 182 | 1532.65 | [-392.07, 3557.65] | -1012.4 | true |
| Random baseline | 182 | ~0 (varies) | covers 0 | — | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 33 | 2.43 | 13321.75 |

Half-sample (1-ctr): IS EV +$209 CI covers 0 · OOS EV +$97 CI covers 0 · maxL=11 · maxL×\|avgL\| ~$6.1k.

## SCORECARD

**away** — EV CI covers 0 · trail-hostile · ORB family already killed (B0). No Lab promote.

`BLOCK_STRATEGY`: **true**
