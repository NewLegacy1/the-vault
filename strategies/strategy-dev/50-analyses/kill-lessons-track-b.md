---
updated: 2026-07-15
tags: [kill-lessons, track-b, strategy-dev]
---
# Kill lessons — Track B (running ledger)

> Source process: [[failure-harvest]]. Ops path unchanged: [[gated-prb-live-guide]].

## Hard constraints (cumulative — next idea must obey all)

1. **No ICT/PRB formal RB / Macro clone** as “new” Track B.  
2. **No ORB / opening-range break** family (B0 dead — trail-hostile).  
3. **No ER/VWAP xor multi-regime costume** (B1 dead — no xor lift).  
4. **No PDH/PDL morning sweep-fade** family (B2 dead — EV −$76, CI excl. 0).  
5. **No NR-day → next-day PDH/PDL expansion breakout** family (B3 dead — full EV −$18, OOS mean ≤0, BLOCK).  
6. **No univariate session-VWAP ±zσ fade** family (B4 dead — EV −$15, OOS −$22, maxL=19 trail-hostile).  
7. **No fixed 10:05 morning impulse** family (B5 dead — EV −$5, OOS −$36, BLOCK).  
8. **No overnight gap fade → prior close** family (B6 dead — EV −$9, n=340, stable IS/OOS drain).  
9. **No loose afternoon AM-continuation @ 12:05** family (B7 dead — EV −$8, n=516, same ~40%/1.3R drain).  
9b. **No MTF-wrapped AM→PM continuation** either (B9 dead — EV −$9, n=425, maxL=13; 15m gate did not help).  
9c. **No late open-magnet fade @ 14:30 → RTH open** (B10 dead — EV −$5, n=465).  
9d. **No overnight gap continuation @ loose ≥1.0×ATR** (B8 dead — n=641, EV −$1, OOS CI covers 0; rarity failed).  
9e. **No BB pierce→reclaim + ADX chop @ 1.0R** (B11 dead — n=775, EV −$1, WR~52% but RR&lt;1; OOS CI covers 0). Do not salvage with hour/ADX/stop retunes.  
9f. **No EMA(20) trend pullback + ADX&gt;25 @ 1.25R** (B12 dead — n=293, EV −$8, OOS −$15). Lane F TA spray paused.  
10. **Loss shape first:** max modeled streak × $risk &lt; $2k trail before cadence claims.  
11. **Do not retune** a killed idea’s free params to “rescue” without a **new** Stage-0 note and new event definition.  
12. **Independence:** next book must differ from gated PRB on ≥2 of {time box, level set, regime feature, barrier geometry}.  
13. **Negative full-sample EV with CI excluding 0 → kill**, even if OOS is thin. OOS mean ≤0 or CI covers 0 with no lift → **BLOCK / away closeout** (no promote; treat as kill for retune purposes).  
14. **Fancy RR with low WR does not save negative EV** — geometry footnotes never overturn trade EV.  
15. After B0–B7: the **~40% WR / ~1.3R / EV≈−$5 to −$15** package on MNQ 5m is a *settled geometry trap* for common TA events — next book must change **event rarity or barrier**, not just clock/label.  
16. Meta: [[track-b-meta-progress]].

## Soft preferences (not blockers)

- Prefer univariate / one free param (Occam).  
- **Two lanes are both allowed** (rarity is not dogma):  
  - **Lane R — rare / private event:** ~0.3–2 / week (PRB-shaped). Escapes our high-n soft-drain cluster.  
  - **Lane F — higher frequency:** allowed if it changes **barrier or information source**, not just the clock/label. Our kills falsified *common TA + ~40%/1.3R/$150 Stage-0*, not “all HF.” Viable HF usually needs higher WR / tighter stop / different exit math, or a non-TA input — still trail-safe.  
- Prefer 1.0–2.0R for Lane R Stage-0; Lane F may use tighter targets if loss shape still fits $2k trail.  
- Calendar Jul/Oct is **ops for PRB**, not a free “edge” to copy onto every book.  
- Desert (&lt;40 / 3y) still weak for Stage-0 power — rarity ≠ invisibility.

## Per-kill cards

### B0 — ORBreak · KILL

| Extract | Content |
|---|---|
| Falsified | Opening-range break + hard stop is income / trail-safe on 3y MNQ |
| Structural | Trail-hostile streaks (max L=11) · negative expectancy |
| Hard constraint | No ORB / first-range breakout as Track B v0 |
| Soft | Time/vol session ideas need stricter loss budgets |
| Breadth | Distinct from PRB — still killed on trail math |

### B1 — ERXor · KILL

| Extract | Content |
|---|---|
| Falsified | Kaufman ER TREND/CHOP xor (VWAP reclaim vs σ fade) lifts EV |
| Structural | No xor lift · OOS negative · DD ~$2k |
| Hard constraint | No multi-regime VWAP±σ xor costume without private Stage-0 lift |
| Soft | Univariate VWAP distance may still be tested as **B4** — must not rebuild xor |
| Breadth | Distinct session logic — still dead |

### B2 — MPSF · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | 9:30–10:00 PDH/PDL sweep+reclaim fade has positive trade EV |
| Structural | Full EV −$76 CI [−121,−21] · WR ~20% · n=30 · OOS also negative |
| Hard constraint | No PD morning extreme-fade as next Track B |
| Soft | Overnight extremes may need **continuation** hypothesis, not fade — or different level set |
| Breadth | Independent of PRB time box — still dead (independence ≠ edge) |

### B3 — NRExp · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | Prior-day NR (min range / 20) → next RTH PDH/PDL break has positive trade EV @ 1.5R ATR stop |
| Structural | Full EV −$18 CI [−78, +44] covers 0 · OOS EV −$26 n=6 · n=27 thin · sum −$486 · maxL=4 OK vs trail · random baseline not worse |
| Hard constraint | No NR→PDH/PDL expansion breakout costume; do **not** sweep N lookback to rescue |
| Soft | Compression ideas need a different break definition (not prior H/L) or different outcome |
| Breadth | Independent of PRB — still dead |

### B4 — VWAPz · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | Fixed z=2 session-VWAP band fade → VWAP has positive trade EV / trail-safe shape |
| Structural | Full EV −$15 CI [−52,+27] · OOS −$22 n=30 · n=147 · WR~26% / RR~2.3 trap · maxL=**19** · maxDD −$4.3k · sum −$2.2k |
| Hard constraint | No VWAP±zσ fade costume; do **not** sweep z or re-add ER to rescue |
| Soft | MR-to-VWAP barriers need different event def if ever revisited |
| Breadth | Univariate vs ERXor — still dead; confirms B1 CHOP sleeve wasn’t hiding an edge |

### B5 — 1005Impulse · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | 10:05 bar impulse vs 09:30–10:00 mid has positive trade EV @ 1.5R ATR |
| Structural | Full EV −$5 CI [−48,+38] · OOS −$36 n=10 · n=61 · maxL=6 OK · sum −$306 |
| Hard constraint | No fixed 10:05 / morning-mid impulse costume; do not retune clock |
| Soft | Next books should avoid PRB-adjacent morning clocks |
| Breadth | Not RB — still dead |

### B6 — GapFade · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | Overnight gap ≥0.35ATR fade toward prior close has positive trade EV |
| Structural | Full EV −$9 CI [−26,+9] · OOS −$13 n=61 · **n=340** high-n soft reject · maxL=8 · maxDD −$5.4k · sum −$3.0k |
| Hard constraint | No open→prior-close gap fade costume; do not sweep gapMult |
| Soft | High-n slight-negative MR is a *settled drain* — don’t “almost” rescue with filters |
| Breadth | Distinct from B2 PDH sweep — still dead |

### B7 — PMCont · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | \|AM move\| ≥ 0.8 ATR → 12:05 continuation @ 1.5R has positive trade EV |
| Structural | Full EV −$8 CI [−22,+6] · OOS −$20 n=137 · **n=516** · WR~39% / RR~1.4 · maxL=11 · sum −$4.1k · same drain geometry as B6 |
| Hard constraint | No loose 0.8ATR afternoon AM-continuation costume; do **not** retune moveMult/clock to rescue |
| Soft | If continuation is revisited, require **rare** threshold so n≪200 / 3y; or change barrier entirely |
| Breadth | Afternoon ≠ PRB window — still dead; “continuation vs fade” alone did not break the trap |

### B9 — MTF PMCont · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | 15m AM ≥1.2×ATR15 → 12:05 continuation positive EV |
| Structural | n=425 · EV −$9 · OOS −$18 · ~39%/1.4R · maxL=13 · identical drain family to B7 |
| Hard constraint | Leave AM→PM continuation family (MTF wrapper insufficient) |
| Soft | Pause spray; Track A ops; next class must not be morning-move→afternoon 1.5R |
| Breadth | MTF plumbing validated · edge not |

### B10 — LOM · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | Late 14:30 fade to RTH open after ≥1.5×ATR15 extension has positive EV |
| Structural | n=465 · EV −$5 · ~26% WR / RR~2.5 trap · high-n soft drain |
| Hard constraint | No late open-magnet fade costume; do not retune extMult / 14:30 |
| Soft | Next class outside open-magnet + AM→PM + killed fades |
| Breadth | Independent of PRB — still dead |

### B8 — GapCont · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | ≥1.0×ATR overnight gap **continuation** has positive Stage-0 EV / OOS lift |
| Structural | n=**641** (rarity fail) · EV −$1 · OOS +$0.44 CI covers 0 · ~42%/1.35R · same soft-drain family as B6 fade |
| Hard constraint | No gap-cont costume at loose ATR; do **not** retune `gapMult` to rescue |
| Soft | Polarity flip ≠ edge when event still fires constantly; prefer Track A ops or a *privately* rare event |
| Breadth | Independent of PRB — still dead |

### B11 — BB Reclaim · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | BB pierce→reclaim + ADX&lt;25 @ 1.0R has positive Stage-0 EV / OOS lift |
| Structural | n=775 · EV −$0.93 · WR~52% · RR~0.88 · maxL=7 · losers already ~2.4 bars · 12–14h exploratory drain |
| Hard constraint | No BB-reclaim/ADX costume; do **not** salvage with hour filter / tighter stop / ADX sweep without new Stage-0 |
| Soft | Lane F: fix **payoff asymmetry** or pre-trade regime — mid-trade “cut faster” weak when MAE≈stop already |
| Breadth | Independent of PRB — still dead |

### B12 — EMA Pullback · KILL (2026-07-15)

| Extract | Content |
|---|---|
| Falsified | EMA pullback reclaim + ADX&gt;25 @ 1.25R has positive Stage-0 EV / OOS lift |
| Structural | n=293 · EV −$8 · OOS −$15 · WR~43% / RR~1.09 — returned to soft-drain package |
| Hard constraint | No EMA-trend-pullback costume; do not retune EMA/ADX/RR |
| Soft | **Pause Lane F** common-TA spray; return focus to selective high-RR Track A + optional sleeve research |
| Breadth | Independent of PRB — still dead |

## Implication

| Path | Notes |
|---|---|
| **Track A** | **Primary** — gated PRB / D1; loss-gap mitigation via gates + BE, not HF |
| **Lane F** | Paused after B11–B12 |
| **Lane S** | S2 Reaper v0 **away/desert** (n=7 · no OOS · RR~2 shape interesting) — [[lane-s-s2-reaper-ifvg-v0]] · optional S2b only with new note |
| **0b on kills** | Forbidden |

## Agent use

Print five harvest extracts in chat on kill. Do not auto-draft gap / AM→PM / open-magnet / VWAP retunes.
