---
updated: 2026-07-15
status: stage-0-draft
tags: [track-b, b8, gap-cont, stage-0]
---
# Track B candidate — B8 overnight gap continuation v0

> Idea class: **momentum** — continue overnight gap (flip of killed **B6 fade**).  
> Rare threshold so n ≪ B6/B7 bleeders. [[kill-lessons-track-b]] · [[track-b-meta-progress]]

## Hard constraints

Obey B0–B7 ledger. Especially: no gap **fade**, no loose PMCont, no ORB, no retune of dead params.

## Five prior lessons driving this

- B6 killed **fade** → test **continuation** (opposite claim)  
- B7 killed high-n continuation → require **|gap| ≥ 1.0 ATR** (rarer)  
- Same 1.5R/$150 OK for Stage-0 compare; rarity is the lever  

## Independence vs PRB

| Axis | PRB | B8 |
|---|---|---|
| Time | 10:00–11:30 | 09:35–10:15 arm |
| Level | Formal RB | Prior close / open gap |
| Event | RB | Rare overnight gap |
| Barrier | 5–6R | 1.5R |

## Hypothesis

If |RTH open − prior close| ≥ **1.0 × ATR(14)**, **continuing** the gap direction (long if open &gt; prior close) at first arm bar has positive trade EV on ~3y; expected n ≪ 200; maxL×$150 &lt; $2k.

## Stage-0

- [[event-study-b8-gap-cont]]  
- CSV: `matrix/trackb-gapcont-3y.csv`  
- Pine: `pine/TrackB_GapCont_measure_v0.pine`  

## Loss shape

| Param | v0 |
|---|---|
| Risk | $150 |
| Stop | 1×ATR · max 40 pts |
| Target | 1.5R |
| Gap mult | **1.0** frozen |
| Arm | 09:35–10:15 · 1/day · flat 15:55 |

## Kill

OOS mean ≤0 · n still &gt;300 (threshold failed rarity) · maxL≥13 · Lab without toward.
