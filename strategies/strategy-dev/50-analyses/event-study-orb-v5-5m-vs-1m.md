---
updated: 2026-07-27
status: stage-0-closeout
verdict: away
tags: [stage-0, event-study, orb, mtf, strategy-dev, b0-reinforcement]
---
# Event study — ORB v5 · MNQ 5m vs 1m

> Ledgers: `matrix/orb-v5-mnq-5m.csv` · `matrix/orb-v5-mnq-1m.csv`  
> JSON: `event-study-orb-v5-mnq-5m.json` · `event-study-orb-v5-mnq-1m.json`  
> Protocol: [[stage-0-mtf-breadth]] 0a/0b · family already killed as [[track-b-candidate-v0]] B0.

## Setup (locked)

| Field | Value |
|---|---|
| Script | ORB Strategy v5 (swing-stop in OR + 1m confirm + BE@1R + TP 2R) |
| Symbol | `CME_MINI:NQ1!` continuous (export label) · qty **10** in TV |
| OR | 09:30 NY · **15 min** |
| Stop | Most recent 1m swing in OR · TP = **2R** · BE @ 1R |
| Max trades | 1/day |
| Window | **2025-07-28 → 2026-07-24** (~1y — **not** 3y) |
| Compare | Chart TF only (same Pine / same inputs) |

TV export used `default_qty_value = 10`. Numbers below are **1-contract scaled** (`PnL/10`) so they compare to B0 / Stage-0 notes. Analyzer JSON still shows raw 10× dollars.

## Results (1-contract)

| Window | TF | n | EV $ | EV CI 95% | Covers 0? | maxL | maxL×\|avgL\| |
|---|---|---:|---:|---|---|---:|---:|
| Full | **5m** | 182 | **+153** | [−32, +353] | **yes** | **11** | **~$6.1k** |
| Full | **1m** | 182 | **+82** | [−110, +284] | **yes** | **15** | **~$7.1k** |
| Half IS | 5m | 91 | +209 | [−24, +491] | yes | — | — |
| Half OOS | 5m | 91 | +97 | [−194, +402] | yes | — | — |
| Half IS | 1m | 91 | +100 | [−156, +399] | yes | — | — |
| Half OOS | 1m | 91 | +64 | [−211, +353] | yes | — | — |

Default analyzer `OOS_START=2025-07-14` → **IS empty** on this sample (all bars ≥ start). Half-split above is the diagnostic OOS.

### Geometry footnotes (not KPIs)

| TF | WR% | ~BE scratches (\|pnl\|≤$2.5) | avgW | avgL | RR (raw) |
|---|---:|---:|---:|---:|---:|
| 5m | 33.5 | 18 | $1,565 | −$558 | ~2.8 |
| 1m | 18.7 | **88** | $2,503 | −$474 | ~5.3 |

Same 182 day×direction keys on both TFs (corr PnL **0.88**, sign agree **85%**). 1m is not a different book — it is the same ORB events with noisier BE/exit path.

## SCORECARD

| Token | Call |
|---|---|
| **Verdict** | **away** (both TFs) |
| Path MC / `E[$/wk]` | **Not run** — Stage-0 not toward |
| vs B0 kill | Reinforces — still ORB family, still trail-hostile |
| 1m vs 5m | **No lift** — 1m EV worse, maxL worse, more BE scratches |

**BLOCK.** Do not Lab-promote. Do not retune swing/BE/RR to rescue (kill-lesson #11 + B0 hard constraint).

## Why 1m underperforms 5m here

1. **BE@1R on 1m** turns many path winners into commission scratches (88 vs 18) — fancy RR, low WR.  
2. Fat left tail unchanged: worst losses still ~$1.9k/contract (~95 pts) when swing stop is wide.  
3. maxL 11→15 fails `$2k` trail at any realistic per-trade risk near observed \|avgL\|.

Positive *mean* EV with CI covering 0 + trail fail = classic Stage-0 **away**, not a mean story.

## Harvest (five extracts)

1. **Falsified (again):** ORB v5 swing-stop + 2R + BE does **not** produce Stage-0 toward on MNQ ~1y; 1m chart does not rescue 5m.  
2. **Structural:** CI covers 0 · maxL 11/15 · maxL×avgL ≫ $2k · 1m BE-scratch tax.  
3. **Hard constraint:** unchanged — **no ORB / opening-range break family** (B0).  
4. **Soft:** MTF 0b on a dead family is diagnostic only; finer TF + BE ≠ edge.  
5. **Breadth:** 5m vs 1m = correlated one-bet (same events) — do not claim √N.

## Compare to B0 ORBreak v0

| | B0 (3y, older Pine) | ORB v5 5m (~1y) | ORB v5 1m |
|---|---|---|---|
| EV | −$7 | +$153 (CI covers 0) | +$82 (CI covers 0) |
| maxL | 11 | 11 | 15 |
| Verdict | **KILL** | **away** | **away** |

Mean EV flipped positive on this shorter window / new stop costume — **insufficient** under SCORECARD (CI + trail). Not a reopen.

## Do next

- **No further ORB TV exports** for promote.  
- Research loop idle → continue **Lane S S3** / Track A ops per [[sim-queue]].  
- Human: none required for ORB.

## Related

[[kill-lessons-track-b]] · [[SCORECARD]] · [[stage-0-mtf-breadth]] · [[event-study-orb-v5-mnq-5m]] · [[event-study-orb-v5-mnq-1m]] · [[track-b-candidate-v0]]
