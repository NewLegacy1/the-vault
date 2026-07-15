---
updated: 2026-07-15
status: stage-0-active
tags: [track-b, b11, bb-reclaim, lane-f, stage-0]
---
# Track B candidate — B11 BB Reclaim scalp v0 (Lane F)

> Idea class: **mean-reversion scalp** with regime filter — **not** session-VWAP ±z fade (B4), **not** ER xor (B1).  
> Activated after [[lane-f-research-cycle-2026-07-15]].

## Hard constraints from prior kills

Obey [[kill-lessons-track-b]] B0–B10 + B8. Especially: no VWAP±z retune · no gap costume · no AM→PM · no ORB · no PDH sweep · no ICT/PRB clone · no Lab without toward.

## Why this is Lane F (barrier + info change)

| Axis | Killed cluster (B4 / trap) | B11 |
|---|---|---|
| Event | Distance-to-VWAP ≥ z | **Pierce outside BB then reclaim close inside** |
| Level | Session VWAP | **BB(20,2) mid / bands** |
| Regime | None / ER xor costume | **ADX(14) &lt; 25** (chop only — frozen) |
| Barrier | 1.5R–2.3R trap | **1.0R** (high-WR geometry target) |
| Risk / cadence | $150 · often 1/day spam events | **$100 · max 3/day** |
| Time | Various open magnets | **10:05–15:00** (skip open spread) |

Independence vs gated PRB ≥2 of {time, level, regime, barrier}: time, level, regime, barrier all differ.

## Hypothesis (falsifiable)

When ADX(14) &lt; 25 and MNQ 5m **closes outside** Bollinger(20, 2) then **closes back inside** the band, fading back toward the BB mid with stop beyond the 2-bar extreme and **1.0R** target has positive trade EV on ~3y + OOS; max consecutive losses × $100 fits $2k trail; commissions included in measure Pine.

## Stage-0

- [[event-study-b11-bb-reclaim]]  
- CSV: `vault-app/data/tv-exports/matrix/trackb-bbreclaim-mnq-5m.csv`  
- Pine: `pine/TrackB_BBReclaim_measure_v0.pine`  
- Analyze: `npx tsx scripts/analyze-event-study.ts trackb-bbreclaim-mnq-5m.csv`

## Loss shape (frozen)

| Param | v0 |
|---|---|
| Risk | $100 |
| Stop | Beyond min/max of pierce+reclaim bars · max 30 pts · min 2 pts |
| Target | **1.0R** |
| BB | length 20 · mult 2.0 frozen |
| ADX | length 14 · max **25** frozen |
| Arm | 10:05–15:00 · flat 15:55 · **max 3/day** |

Modeled: 15L × $100 = $1,500 &lt; $2k trail (still hostile if maxL≫15 — kill if maxL≥18).

## Kill / away

- OOS mean ≤0 or OOS CI covers 0 with no lift → away/kill  
- Full EV CI excludes 0 on negative side → kill  
- Geometry still ~40%/1.3R soft drain despite 1.0R label → kill (barrier lever failed)  
- Do not retune ADX/BB length to rescue — new Stage-0 required  
- No Lab promote without SCORECARD **toward**
