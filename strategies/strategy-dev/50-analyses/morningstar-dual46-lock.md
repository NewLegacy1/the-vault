---
strategy: Morningstar Path B
updated: 2026-07-17
status: LOCKED — Dual46 freeze for multi-month bar-replay
tags: [morningstar, path-b, dual46, manual-study, freeze]
---
# Morningstar Dual46 — locked freeze

> **Not Lab-settled MC.** Chart + checklist study only. Do not invent Deep Backtest / E[$/wk] numbers from this note.  
> Script: `pine/Morningstar_v46.pine` · Checklist: [[Morningstar_Daily_Bias_Checklist]] · History: [[morningstar-jul16-dual-sleeve-finding]]

## Freeze inputs (do not retune mid-walk)

| Input | Value |
|---|---|
| Direction | **Long & Short** (Auto PDH/PDL **OFF**) |
| Which setups | **KO-retest only** |
| Geometry | **1m RB wick** |
| Fixed R | **5** |
| Max TP distance | **100 pts** |
| Powell model | **Both** (score Cont vs Judas in journal) |
| Last arm | **13:00** |
| Skip Mondays | **OFF for May walk** (decided 07-17 — June Mondays 2W/0L + two would-haves; June ledger already included Mondays so months stay comparable · tag Monday trades for a sub-scorecard) |
| Fib 0.62 / 0.705 | **Eyes only** — never entry/stop |

## Winning logic (what we teach)

1. **Leave** (away from 10:00) → freeze manip leg (amber LO/HI).
2. **Gate** = 1m RB zone overlaps frozen-leg **OTE** + (preferably) **10:00 inside RB** → tag `OTE+KO`.
3. **Geometry** = LIMIT @ RB **wick-start** · STOP beyond **RB extreme** (+ buffer).
4. **TP** = Fixed 1:5, hard-capped at **100 pts** (wide ~30pt stop → ~1:3 reachable).
5. **You** take/skip with [[Morningstar_Daily_Bias_Checklist]] — script proposes only.

**Killed / do not reopen mid-study:** fib live geom (LIMIT@0.62 · STOP@0.705 of morning leg) · Origin CE far shelves as default TP · reclaim-as-leave · naked 0.62 arms.

## Jul-week harvest (seed — already seen)

Sparse Powell arms · mostly **WIN** when stop ~14–24 pts · Monday SHADOW LOSS became reachable with 100pt TP cap · Auto was **off**.

Control day: **2026-07-16** Cont · `1RB · OTE+KO` · RB stop · 1:5.

## June walk status (2026-07-17) — **COMPLETE**

Priority 1 done — 06-02 → 06-29 (21 rows). **+$17,020 gross @ 10 MNQ**, 10W/4L (71% WR).
**Script sleeve finally live: 3 arms · 2 fills · 2W/0L (+$3,990)** — 06-23 Judas·KO,
06-29 Cont·OTE+KO with the 100-pt TP cap validated on a 33.5-pt stop. A+ capture arc fixed
mid-month (0/3 late limits → pre-stage → 1/1). Full ledger + patterns:
[[morningstar-dual46-june-week1-harvest]]. **Next: Priority 2 — May 2026.**

## Multi-month replay plan (NEW data)

Walk **Tue–Fri**, **09:30 → 13:00** NY. Bias on **5m**, arm check on **1m**.

**App (preferred):** vault-app → **F5 Journal** only (paste chart → OCR Powell tag → confirm bias → log). F1 Today is account pulse + link. Data in `localStorage` (`vault.journal`).

| Priority | Window | Why |
|---|---|---|
| **1 — do first** | **2026-06** (full month Tue–Fri) | Newest month we barely have Dual46 on — fresh OOS vs Jul harvest |
| **2** | **2026-05** | Second recent month — rate / Cont vs Judas / skip quality |
| **3** | **2025-11 → 2025-12** | Outside Lab Jul/Oct stand-down; different year half |
| **4 (optional stress)** | **2025-08 → 2025-09** | “Good” Lab calendar months — does Path B still print sparse A+? |
| **Skip for now** | More **2026-07** deep-dive | Already seeded; don’t overfit July |
| **Eyes only** | Any **October** week | Lab barren month — count skips / SHADOW, don’t chase WR |

**Stop rule for retunes:** finish Priority 1 + 2 before changing pine. If something looks broken, screenshot + journal — don’t flip geom mid-month.

**May-walk logging additions (2026-07-17, from quant research — logging only, no logic change):**
- Log **ATR(14, 1-min) at entry** for every take/arm; backfill June's 15 takes from replay when
  convenient. June's losses at stops ≤9.75 pts vs wins at 11.5–33.5 pts match the published
  ~1.5×ATR wick-out floor — ~100 logged trades confirms or kills a stop/ATR validity floor
  as a Stage-0 candidate ([[../../knowledge/quant/stop-placement-fixed-structure-volatility|stop research]]).
- Tag each session: opening-range percentile · ADX(7) read · first-30-min direction —
  census only, no gating ([[../../knowledge/quant/intraday-regime-detection-session-selection|regime research]]).
- **Pre-registered evaluation rule** (avoids the optional-stopping trap — monthly "is it
  working?" checks inflate false alarms to ~25%+): verdicts on the Dual46 script sleeve only
  at **fixed horizons — end of May walk, then end of Nov–Dec walk** — not mid-month; the
  discretionary sleeve is judged on the same schedule
  ([[../../knowledge/quant/minimum-sample-size-statistical-significance|sample-size research]]).

## Journal fields (lock)

```
Date: ____
NWOG: unfilled above / below / filled / inside
Week bias: L / S / none
Day bias: L / S / none
Script arm?: Y / N · Cont / Judas · grade (OTE+KO / OTE / KO) · stop pts ____ · plan RR ____
Fill?: Y / N / no-arm
Take or skip: ____
Outcome if taken: WIN / LOSS / no fill · R ____
Why (one sentence): ____
```

## Pine backlog — hold until May walk completes (do NOT apply mid-walk)

June findings queued as candidate changes, ranked. None are approved yet; the point of
freezing through May is that June↔May stay comparable on identical code.

1. **Arm alert / earlier print** — biggest measured leak was limit latency (0/3 A+ captured
   before pre-staging, 1/1 after). An alert when the arm prints is process tooling, not a
   logic change — first candidate after May.
2. ~~NWOG eyes-only lines~~ — **not needed**: user's existing NWOG indicator already draws
   the gap + CE. Census logging continues off that ([[morningstar-dual46-june-week1-harvest]]).
3. **Min-stop floor (~10 pts / ≥1.5×ATR)** — 06-23 disc loss: 9.75-pt stop wicked before TP
   ran. One data point; May ATR logging decides before touching geometry.
5. **RB anchoring audit** — ICT's original 2016 rejection-block lecture anchors the block to
   the highest open/close of the **entire swing** (multi-candle), not the single sweep candle.
   Our wick-start limit + stop-beyond-extreme is canon; the anchor may not be. Audit June's
   1m fills against swing-anchored blocks after May
   ([[../../knowledge/ict/rejection-blocks-vs-order-blocks|RB research]]).
6. **CE-of-wick early exit** — 2024 Mentorship L8: wicks trade like gaps, CE is the key level.
   Candidate discretionary rule: body-cross of the entry wick's midpoint against position =
   warning/exit. Census in May notes first; no mechanical rule yet.
7. **Fib leg-validity rule (Powell, from transcript)** — a leg dies once rebalanced 50%;
   fib must re-anchor from the last unrebalanced extreme. Mechanizable check for the frozen
   manip-leg fib; audit June/May charts for anchor drift after the walk
   ([[../../knowledge/powell/powell-rb-entry-teachings|Powell RB teachings]]).

**Freeze validation (Powell transcripts, 07-17):** his own recorded 10AM KO trade confirms
stop-beyond-RB-extreme is his stated *ideal* ("ideally your stop should be at the end of the
rejection block") — he personally used a tighter PD-array-midpoint stop for 1:8, but the
frozen stop-at-extreme + fixed 1:5 is his conservative variant priced honestly. Nothing in
the free content justifies touching the lock.
4. ~~Monday un-skip~~ — **decided 07-17, effective for May walk** (settings toggle, not a
   pine edit). Mondays are normal sessions; tag them for a Monday sub-scorecard.

**Replay latency caveat (user, 07-17):** in bar replay candles form in one tick, so reaction
time is artificially compressed vs live (where you watch the candle build). June's capture
misses are therefore a *pessimistic* bound on live capture — one of the few replay artifacts
that biases against the strategy. Live forward-sim after May is where that thesis gets tested;
live also adds slippage/spread/psychology that replay hides, so treat it as a hypothesis.

## Honest status

| Claim | Status |
|---|---|
| Dual46 geometry matches Powell teaching | **LOCKED** for study |
| Sparse high-quality setups on Jul week | Chart harvest — **promising** |
| Income / Lab promote / E[$/wk] | **NOT claimed** — waiting for multi-month journal |
| Fixed 10-MNQ sizing | **Study convention only** — vs a trailing-DD buffer a 33.5-pt stop at 10 MNQ risks ~27% of a $2.5k buffer (above full Kelly on June's n=15). Live sizing must be **fixed-$ risk, contracts flex with stop** — see [[../../knowledge/quant/position-sizing-under-trailing-drawdown\|sizing research]] |
| Auto PDH/PDL as default | **OFF** for this walk (optional later A/B) |
