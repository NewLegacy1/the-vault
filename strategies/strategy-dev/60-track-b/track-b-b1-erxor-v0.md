---
updated: 2026-07-14
status: killed
owner: strategy-dev
idea_class: B1
tags: [track-b, b1, erxor, vwap, strategy-dev, killed]
---
# Track B candidate · B1 · ERXor v0

> **Idea class:** **B1** (mean-rev **xor** continuation with regime switch) — *not* Lab Macro `matrix-b1a`.  
> **Pine:** `pine/TrackB_ERXor_v0.pine`  
> **Export:** `vault-app/data/tv-exports/matrix/trackb-erxor-3y.csv`  
> **Status:** **KILL** (2026-07-14) — do not promote · do not ICT-rescue · do not retune ER+entries jointly.  
> **Prior:** [[track-b-candidate-v0]] B0 ORBreak = **KILL**.

Parent: [[execution-plan-post-3y]] Phase 3 · queue [[sim-queue]].

## Kill criteria — **HIT**

| # | Criterion | Result |
|---|---|---|
| 1 | Full-3y expectancy ≤ 0 | **HIT** · exp **−$5.10**/trade · net **−$1,510** · n=296 · WR 43.9% |
| 2 | Max L ≥ 16 @ $100 **or** DD ≥ $2k | **HIT** · max L=10 · equity DD **−$2,029** |
| 3 | OOS exp ≤ 0 **or** n < 25 | **HIT** · OOS n=75 · exp **−$7.59** (worse than IS) |
| 4 | Xor E/trade ≤ max(sleeve) | **HIT** · xor −$5.10 ≤ chop −$0.66 ≤ trend −$9.86 (no xor lift) |
| 5 | n < 40 | Miss (n=296) |
| 6 | Regime thrash | Not required for verdict |

**Verdict: KILL ERXor v0.** Both sleeves negative; CHOP least bad but still ≤0; combining them hurts vs chop-alone. OOS does not rescue.

| Window | n | net | exp | WR | max L | DD |
|---|---:|---:|---:|---:|---:|---:|
| Full 3y | 296 | −$1510 | −$5.10 | 43.9% | 10 | −$2029 |
| IS | 221 | −$941 | −$4.26 | 45.2% | 9 | −$1473 |
| OOS 12m | 75 | −$569 | −$7.59 | 40% | 10 | −$802 |
| TREND only | 143 | −$1409 | −$9.86 | 39.2% | 6 | −$2209 |
| CHOP only | 153 | −$101 | −$0.66 | 48.4% | 7 | −$1413 |

JSON: `vault-app/data/tv-exports/trackb-erxor-stats.json`

**Do not** Lab-grind, retune ER thresholds with entries, stack ICT, or reopen ORBreak.

## Why B1 (not B0 / not ICT)

- ORBreak (naked open continuation) failed trail math and full-3y expectancy.
- B1 addresses non-stationarity with a **live bar-computable** regime gate (ER), not calendar.
- No rejection blocks, FVG, SMT, Macro staging, or mentorship confluence.

## Hypothesis (falsifiable) — falsified

On MNQ RTH, **ER-gated xor** — session-VWAP pullback **reclaim** in TREND **or** ±2σ VWAP **fade** in CHOP — has full-~3y expectancy > 0 and trail-compatible loss shape with OOS support. **Failed on K1–K4.**

## Regime gate (as tested)

| Mode | Rule | Action |
|---|---|---|
| **TREND** | ER ≥ **0.40** | continuation sleeve only |
| **CHOP** | ER ≤ **0.30** | mean-rev sleeve only |
| Sticky | hysteresis | start FLAT until first cross |

## Next (after this kill)

Track B B0 + B1 both dead. Pick **ops** (gated PRB live/paper) or a **new** Track B idea class that is neither ORBreak nor this ERXor — do not farm 2.1 variants.

## Naming collision note

- Idea class **B1** = Track B regime xor.  
- Lab Macro `matrix-b1a` = A-tier Macro sleeve — unrelated.  
- Pine prefix **`TrackB_`** required.

## Links

- [[track-b-candidate-v0]] (B0 killed) · [[execution-plan-post-3y]] · [[sim-queue]] · [[findings-prb]]
