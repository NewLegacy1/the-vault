---
updated: 2026-07-15
status: stage-0-active
tags: [track-b, b8, gap-cont, stage-0]
---
# Track B candidate — B8 overnight gap continuation v0

> Idea class: **momentum** — continue overnight gap (flip of killed **B6 fade**).  
> Activated 2026-07-15 after [[track-b-error-synthesis-b0-b10]].  
> Rare threshold so n ≪ B6/B7/B9/B10 bleeders. [[kill-lessons-track-b]] · [[track-b-meta-progress]]

## Hard constraints from prior kills (B0–B10)

1. No ICT/PRB formal RB / Macro clone.  
2. No ORB · no ER xor · no PD morning sweep-fade · no NR→PDH/PDL · no VWAP±z fade.  
3. No fixed 10:05 impulse · no gap **fade** · no AM→PM cont (incl. MTF) · no late open-magnet fade.  
4. Do not retune dead params (`gapMult` for fade, `moveMult`, `extMult`, z, clocks).  
5. Loss shape first · independence ≥2 axes vs gated PRB · geometry footnotes ≠ KPIs.  
6. Jul/Oct calendar is **PRB ops only** — not part of this event definition.

## Synthesis (why this book, not a new costume)

| Settled analytic | Source | Encoded in B8 |
|---|---|---|
| Fade family drained | B6 / B2 / B4 / B10 | Test **continuation** claim instead |
| High-n soft reject | B6 n=340 · B7 n=516 · B10 n=465 | Force rare \|gap\| ≥ **1.0×ATR** (kill if n&gt;300) |
| ~1.3R / slight-neg EV trap | Meta after B0–B7 | Keep Stage-0 barrier simple — **1.5R**, do not chase RR5 |
| 1/day slot discipline | Track A PRB context | `dayTrades` in measure Pine |
| Small fixed risk vs trail | Track A loss-shape habit | **$150** risk · maxL×$150 &lt; $2k |
| MTF ready but not edge | B9 | Deferred until SCORECARD **toward** |

Rejected stacks this cycle: calendar×gap, MTF×PMCont, VWAP×ER, rarer open-magnet.

## Independence vs gated PRB

| Axis | Gated PRB | B8 |
|---|---|---|
| Time | 10:00–11:30 (+ Jul/Oct STAND_DOWN ops) | 09:35–10:15 arm |
| Level | Formal RB / PDH-PDL auto | Prior close ↔ RTH open gap |
| Regime feature | Calendar ops overlay | Overnight gap ≥ 1.0×ATR |
| Barrier | BE@2R · 5–6R book | Hard stop · **1.5R** |

## Hypothesis (falsifiable)

If |RTH open − prior close| ≥ **1.0 × ATR(14)**, **continuing** the gap direction (long if open &gt; prior close) on the first arm bar has **positive trade EV** on ~3y MNQ 5m; expected n ≪ 200; OOS mean &gt; 0 or a registered context plan; max consecutive losses × $150 fits $2k trail.

## Stage-0

- Event study: [[event-study-b8-gap-cont]]  
- CSV: `vault-app/data/tv-exports/matrix/trackb-gapcont-3y.csv`  
- Pine (measure only): `pine/TrackB_GapCont_measure_v0.pine`  
- Analyze: `npx tsx scripts/analyze-event-study.ts trackb-gapcont-3y.csv`

## Loss shape (frozen)

| Param | v0 |
|---|---|
| Risk | $150 |
| Stop | 1×ATR · max 40 pts |
| Target | 1.5R |
| Gap mult | **1.0** frozen |
| Arm | 09:35–10:15 · 1/day · flat 15:55 |
| Soft (not frozen) | Skip Monday only if toward + new note — not in v0 export |

## Kill / away closeout

- OOS mean ≤ 0 or OOS CI covers 0 with no lift → **away/kill** (no promote)  
- Full n still &gt; 300 → rarity threshold failed → **kill**  
- maxL ≥ 13 at $150 → trail-hostile → **kill**  
- Do not Lab-promote without SCORECARD **toward**  
- On kill: five harvest extracts → [[kill-lessons-track-b]]
