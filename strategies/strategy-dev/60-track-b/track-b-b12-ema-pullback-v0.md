---
updated: 2026-07-15
status: stage-0-active
tags: [track-b, b12, ema-pullback, lane-f, stage-0]
---
# Track B candidate — B12 EMA Trend Pullback v0 (Lane F)

> Idea class: **momentum / trend pullback** — not BB reclaim (B11), not AM→PM cont, not ORB.  
> Activated after B11 kill: WR~52% worked-ish; **RR&lt;1** killed EV → raise Stage-0 target to **1.25R** and flip regime to **trend**.

## Hard constraints from prior kills

Obey [[kill-lessons-track-b]] through B11. Especially: no BB-reclaim salvage · no VWAP±z · no gap · no AM→PM · no ORB · no ICT/PRB clone · no Lab without toward.

## Why this is a *new* event (not B11 retune)

| Axis | B11 (dead) | B12 |
|---|---|---|
| Event | BB pierce → reclaim | **Close back through EMA(20) after pullback** |
| Regime | ADX **&lt;** 25 (chop) | ADX **&gt;** 25 (trend) |
| Level | BB bands | **EMA(20)** |
| Barrier | 1.0R (avgW &lt; avgL) | **1.25R** |
| Hypothesis | Fade extremes in chop | Continue trend after shallow pullback |

## Hypothesis (falsifiable)

When ADX(14) &gt; 25 and EMA(20) slope agrees with direction, a pullback that temporarily closes on the wrong side of EMA then **closes back through EMA** has positive trade EV on MNQ 5m ~3y + OOS at **1.25R** / $100; maxL×$100 &lt; $2k trail.

## Stage-0

- [[event-study-b12-ema-pullback]]  
- CSV: `vault-app/data/tv-exports/matrix/trackb-emapull-mnq-5m.csv`  
- Pine: `pine/TrackB_EMAPull_measure_v0.pine`  
- Analyze: `npx tsx scripts/analyze-event-study.ts trackb-emapull-mnq-5m.csv`

## Loss shape (frozen)

| Param | v0 |
|---|---|
| Risk | $100 |
| Stop | Beyond 2-bar pullback extreme · max 30 pts · min 2 pts |
| Target | **1.25R** |
| EMA | 20 frozen |
| ADX | 14 · min **25** frozen |
| Slope | EMA &gt; EMA[3] (long) / &lt; (short) |
| Arm | 10:05–15:00 · flat 15:55 · **max 3/day** |

Modeled: 15L × $100 = $1,500 &lt; $2k (kill if maxL≥18).

## Kill / away

- OOS mean ≤0 or OOS CI covers 0 with no lift → away/kill  
- Same soft-drain as B11 (WR≥50% but RR≪1 after fees) → kill  
- Do not retune ADX/EMA/RR to rescue — new Stage-0 required  
- No Lab without SCORECARD **toward**
