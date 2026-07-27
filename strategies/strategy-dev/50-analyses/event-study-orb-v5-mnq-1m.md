---
updated: 2026-07-27
status: stage-0
verdict: away
tags: [stage-0, event-study, orb, strategy-dev]
---
# Event study — orb-v5-mnq-1m

> JSON: `event-study-orb-v5-mnq-1m.json` · `npx tsx scripts/analyze-event-study.ts orb-v5-mnq-1m.csv`  
> ORB Strategy v5 · chart **1m** · same inputs as 5m twin.  
> Compare: [[event-study-orb-v5-5m-vs-1m]] · 5m twin: [[event-study-orb-v5-mnq-5m]]

## Caveats

- Same ~1y window / empty default IS as 5m twin.  
- Analyzer $ are **10-contract**. ÷10 → EV ~+$82, CI covers 0.  
- **88** near-BE scratches vs **18** on 5m — 1m BE tax.

## Results (raw export · qty 10)

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | 182 | 819.19 | [-1101.14, 2848.04] | -12.4 | true |
| IS (< 2025-07-14) | 0 | 0 | [0, 0] | 0 | true |
| OOS | 182 | 819.19 | [-1048.39, 2832.11] | -12.4 | true |
| Random baseline | 182 | ~0 (varies) | covers 0 | — | true |

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | 18.7 | 2.14 | 13500.42 |

Half-sample (1-ctr): IS EV +$100 · OOS EV +$64 · both CI cover 0 · maxL=**15** · maxL×\|avgL\| ~$7.1k.

## SCORECARD

**away** — worse than 5m twin on EV and loss streak · no MTF lift · ORB family stays killed.

`BLOCK_STRATEGY`: **true**
