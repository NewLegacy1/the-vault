---
updated: 2026-07-17
tags: [morningstar, path-b, findings, jul-16, powell, important]
---
# Morningstar · Jul 16 dual-sleeve finding (IMPORTANT)

> **Superseded for ops freeze by [[morningstar-dual46-lock]]** (`pine/Morningstar_v46.pine`). This note keeps the Dual trail / Jul 16 control history.  
> Chart evidence 2026-07-16 MNQ · Manual Path B study.

## What we saw

On the **5m** chart after widening proximity / loosening the 1m pack, Morningstar armed a **LONG** tagged `PathB · 10:00 · …RB` with roughly:

| Level | ≈ pts |
|---|---|
| FIB LO (0) | 29315 |
| FIB HI (1) | 29509 |
| ENTRY | 29385 |
| STOP | 29372.5 (~17.3 risk) |
| TP 1:5 | 29481.5 |

That arm was **early** — first rejection near the 10:00 KO **right after leave**, not the later **OTE pullback** Powell took (~11:15).

Because **max 1 setup/day** locks after the first ARM, the early sleeve **stole the day** from the Powell OTE retest.

## What changed vs the old (Powell) trigger

| Piece | Old / control (Powell ~11:15) | What fired on this chart (~10:00) |
|---|---|---|
| Fib gate | Wait real leave leg; **KO in 0.62–0.79** | `Require KO in fib OTE` was **OFF** |
| 1m RB pack | Often needed structure / tighter proximity | **No local-extreme**; proximity **50–100** → first wick@KO qualifies |
| Slot | One arm/day | Early arm **blocks** later OTE arm |
| Chart TF | 1m for ARM | 5m + security 1m → easy to catch leave-bar RB |

**Root cause of “wrong” entry:** OTE gate OFF + permissive 1m pack + one-trade lock = **leave-continuation sleeve**, not **OTE retest sleeve**.

## Two sleeves (do not conflate)

1. **Early sleeve (new candidate)** — first RB@KO after leave (~10:00). May catch the impulse leg. Needs its own fill/outcome study; not yet Lab math.
2. **Powell / OTE sleeve (control)** — fib leg prints → KO sits in discount/premium → **1m RB@KO** (~11:15). This is the confirmed video trade we must recover.

Default Morningstar inputs now prefer sleeve **2**. Sleeve **1** is marked **eyes-only** (`EARLY RB · eyes`) while OTE is required.

## Fill / outcome KPI (added)

Script now simulates after ARM:

1. **LIMIT live** from the bar *after* ARM (click lag).
2. **FILLED** when price taps ENTRY.
3. Then **WIN · TP** or **LOSS · STOP** (if both touch same bar → **STOP** wins, conservative).
4. **NO FILL by flat** if never tapped by session end label.

Shown on the ENTRY label + a KPI tag at the arm bar.

## Why OTE still missing after “Require OTE ON”

Two bugs:

1. **Sticky `pbOteLatched`** — a tiny early fib could mark KO “in OTE” forever, so the ~10:00 RB armed as if it were Powell and **1-trade lock** blocked ~11:15.
2. **Single plan slot** — even with a correct OTE gate, Early and Powell could not both stay on the chart.

## Actions taken in Pine (→ MS Dual7)

- **Dual6 regression:** pinning Path B to `eng5` + **formal 5m locL** killed all arms (no leave/retest). Reverted.
- **Dual7 restore:** chart-bar Path B state again. **KO-leave** = soft 5m wick RB@KO (no 12-bar extreme). **KO-retest** = **1m RB@KO** (archive/Powell control).
- **Daily ITL (ICT):** Intermediate Term Low = daily STL with higher STLs on both sides. Plotted as purple dashed **Daily ITL**. Retest may arm if KO/RB is near DIL even when fib-OTE is soft (`KO-retest: allow Daily ITL instead of fib OTE`).
- Plans still freeze at TP/STOP (`xloc.bar_time`).
- Control archive: 1m primary / 5m MARK eyes — Dual7 retest matches that control.

## Dual9 note (Day IL + projection-box arm)

- **Day IL** = this session’s Path B fib LO (longs) — **not** multi-day ICT ITL.
- **Powell arm** = sticky **1m and/or 5m RB projection box** @ KO after away→return (archive latch model).
- Pass: leave plan + later `Powell · 1RB/5RB` near ~11:15 + purple Day IL at fib LO for that day only.

## Dual18 lean restore (2026-07-17)

- Dual14–19 churn broke the chart. **Aborted.**

## Dual20 failed — Dual13 restore did not match chart memory (2026-07-17 night)

User confirmed Dual20/Dual13: **no RB boxes, no entries**. Stop for the night.

## Dual21 fix protocol (2026-07-17 morning) — superseded

Playbook: [[morningstar-dual21-fix-protocol]] (now Dual22)

- Dual21b removed soft RB. Still **wick-only** teaching pack → Jul 17 fake leave·1RB.
- Calendar midnight deleted leave/Powell drawings → scrolling to Jul 16 looked empty.

## Dual22 (2026-07-17) — superseded by Dual23

- Sweep RB + history kept, but Powell still armed a **later small 5m** near a ratcheting Day IL (~12:15 LOSS) instead of the **09:45 Day-IL rejection** that led the reaction.

## Dual28 — Powell-first (superseded by Dual29)

- Default sleeve: **KO-retest only** (leave optional).
- Dots OFF — they were every teaching 1m/5m wick, not the OTE.
- Leave RB box (if leave on) anchors to **RB candle time**, not the 10:00 arm bar.

## Dual29 (2026-07-17) — two-candle RB spec + frozen-leg OTE (superseded by Dual30)

User-confirmed RB definition (see canvas `powell-rb-two-candle-spec`):

- **Bull RB = candle A bearish → candle B bullish block.** Zone = A body end → B wick low.
- Fib freeze + Powell OTE arm. Day-IL pool removed.

## Dual30 (2026-07-17) — manip-leg fib + OTE-required + key opens

Chart diagnosis vs Dual29 on Jul 16/17:

| Bug | What Dual29 did | What should happen |
|---|---|---|
| Fib HI freeze | Locked first ~100pt micro-spike at 10:00 | Expand ≥20m + min 80pt leg, then freeze on pullback |
| Fib LO | Post-10 session low | Pierce under KO / morning low **near KO** (≤150pt) — not a distant 09:30 crash |
| Powell arm | `near KO` alone → early LOSS above real OTE | **Require OTE**; KO/NWOG only grade the tag (`OTE+KO`, `OTE+NWOG`) |
| Key opens | Yellow wash only | Draw **18:00 · 00:00 · 10:00** price lines |

NWOG stays the week magnet (eyes + soft `+NWOG` grade when RB zone overlaps the gap). Not a fib LO force.

Aim: restore **~11:15** Powell entry in the frozen manip-leg OTE (user FibTool: Day-IL pocket → first away peak).

## Dual31 — Powell TP = wick CE of leg high (superseded)

Fixed 5R was banking early. Dual31 used CE of the **external** leg-high wick — too far (~150 pts / 1:11).

## Dual34 — strict OTE+KO + wait for deep KO

**Today's LOSS class:** KO sat *below* the OTE floor; script armed a shallower OTE RB and tagged `OTE+KO` via the loose 50pt leave pad. Real delivery was the RB whose zone sat on 10:00.

**Fix:**
- `OTE+KO` only when **10:00 lies inside the RB zone** (±3 pts) — Thursday stack.
- If KO is deeper than OTE: **defer OTE-only arms**; arm when an RB's zone contains KO (tag `KO` or `OTE+KO` if also in band).

## Dual46 — RB wick live; fib 0.62/0.705 = eyes only (control restore)

**What you saw on Dual45 control:** tag `OTE+KO-0.62 · R-1.5 · 1:1.5`, stop ~22pts at **0.705 of the morning leg**. That is the **fib-limit model** (SOP: limit 0.62 / stop 0.705), not the **rejection-block** model. Wide fib stop crushed Fixed-R math and double-tagged RR.

**Teaching / what actually worked on the Thursday control:**
1. **Gate** = 1m RB zone in frozen-leg **golden pocket** + **10:00 inside the RB** (OTE+KO).
2. **Geometry** = LIMIT @ RB **wick-start**, STOP **beyond RB extreme** (+ buffer) — tight risk, high RR.
3. Fib 0.62 / 0.705 lines stay on chart for **eyes / confluence**, not as entry/stop.
4. Default TP = **Fixed 1:5**, hard-capped at **100 pts** (wide ~30pt Monday RB → ~1:3 reachable, not 150+ fantasy).
5. Tag = single plan RR from actual entry/stop/TP — no `R·1.5 · 1:1.5`.

**Chart harvest (Jul week):** Direction filter = **Long & Short** (Auto PDH/PDL **OFF**). Sparse Powell arms, mostly WINs when stop ~14–24pts. One Monday SHADOW LOSS had ~33pt stop → uncapped 1:5 asked ~167pts; with 100pt cap that plan stays in play. Mondays already SHADOW via Skip Mondays.

**Bias baseline for multi-month replay:** start with **Long & Short** (you + checklist decide take/skip). Auto PDH/PDL stays an optional A/B eyes pass — do not treat Auto as the version that produced these wins.

**Keep from Dual44/45:** away-only leave · Cont/Judas · lookback origin · Auto eyes tag · last arm 13:00 · structure TP clamp when studying Origin shelves.

Script: `pine/Morningstar_v46.pine`.

## Dual45 — Auto bias win + Fixed R clamp (chart harvest)

**What you saw:** Manual Long&Short allowed a **Judas short** that LOST. **Auto PDH/PDL** flipped the day → trade **WON**. Origin CE/high sat ~150pts away (never fills). Plan RR looked “stuck” off Fixed intent.

**Kept:** Auto vs Manual A/B; structure TP clamp (minR/maxR/maxPts).  
**Superseded by Dual46:** fib live geom + Fixed 1.5 default + double RR tags.

Script: was `pine/Morningstar_v45.pine` → now `pine/Morningstar_v46.pine`.

## Dual44 — seven high-impact fixes

1. **leaveDir ≠ tradeDir** — Cont (same side) and/or Judas reverse (dump→long OTE). Tags: `Cont` / `Judas`.
2. **Away-only leave** — reclaim @ KO is entry, not leave.
3. **Origin lookback (120m)** — not all-morning envelope glue.
4. **Fib-geom needs 1m RB** in the 0.62 pocket (no naked tap).
5. **TP default Origin CE / 2R** — not 1:5 highlight-reel.
6. **Last arm 13:00**.
7. **Auto PDH/PDL + manual** — eyes tag A/B; checklist study protocol.

Script: `pine/Morningstar_v44.pine`. Honest take: this raises *grade quality*, not guaranteed WR. Edge is still rare A+ + trail math.

## Dual43 — biggest morning move (not a 10:00 clock lock)

**User correction:** locking origin to 09:30–10:00 is too rigid — Judas can print 8:45 / 9:25 / open / post-10.

**Fix:** scan HI/LO from **08:30 → leave** (input). Short origin = scan high (+ 09:30 open candidate). Long origin = scan low. After leave tip-only still; break of origin still voids. Script: `pine/Morningstar_v44.pine`.

## Dual42 — fib origin locked to 09:30–10:00

**Bug:** Dual41 still let post-10 pierce highs and wrong-side seeds rewrite the leg; tip extension could turn a reclaim-during-dump into a fake full-range long fib (knife-catch). Control HI sat on the 10:00 bounce.

**Fix:**
- Origin window = **09:30 through 10:00 only** (`origWinHi` / `origWinLo`)
- After leave: **origin never moves**; only tip extends (long→HI, short→LO)
- Break of origin → `void` (no Powell arm / no fib lines)
- Superseded by Dual43 scan-from-08:30.

## Links

- Checklist: [[Morningstar_Daily_Bias_Checklist]]
- Playbook: [[gated-prb-live-guide]]
- Settled PRB formula: [[findings-prb]]
- Script: `pine/Morningstar_v44.pine`
