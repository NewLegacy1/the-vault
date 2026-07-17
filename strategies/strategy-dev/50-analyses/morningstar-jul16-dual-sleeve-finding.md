---
updated: 2026-07-16
tags: [morningstar, path-b, findings, jul-16, powell, important]
---
# Morningstar · Jul 16 dual-sleeve finding (IMPORTANT)

> Chart evidence 2026-07-16 MNQ · Manual Path B study (`Powell_Rejection_Block_gate_v0.pine` / TV **Morningstar**).

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

## Actions taken in Pine (dual sleeve → MS Dual6)

- Input **`Which setups to show`**: `KO-leave + KO-retest` · leave-only · retest-only
- **Dual6 cross-TF identity:** Path B **engine pinned to completed 5m bars** (`request.security` OHLC + formal 5m RB). Plans drawn with `xloc.bar_time`.
- Default sleeve RB TF = **5m** for both leave and retest → **same ENTRY/STOP/TP on 1m and 5m charts**.
- Honest limit: historical **1m RB arms cannot match on a 5m chart** (script evaluates once per 5m bar). Choosing “1m” sleeve TF is study-only.
- **KO-leave:** first formal 5m RB@KO in leave window (before completed return) — recovers the ~17pt risk / ~1:5 (~85–86 TP) leave geometry when that 5m RB is the arm.
- **KO-retest:** away → peak → return → formal 5m RB@KO (local extreme / relative equal lows; stop = extreme − buffer). No fixed clock.
- Control archive (`_archive_…working_before_slim…`): Path B arm was **1m primary / 5m MARK eyes** — good Powell study on **1m chart**, not cross-TF identical.

## Bar-replay pass rule (Dual6 · Jul 16)

Confirm on **both** 1m and 5m after fresh paste (`MS Dual6` stamp):

1. **KO-leave** tags `… · 5RB`, risk ≈ 17pt, TP ≈ 85–86 at 1:5, freezes at WIN·TP (box does not run to session end).
2. **KO-retest** arms on the pullback RB@KO (not ~12:10 junk); stop under the 5m RB equal-low extreme; prices **match** when switching TF.
3. Legend/stamp = **MS Dual6 · 5m-pinned · identical 1m↔5m**.

## Links

- Checklist: [[Morningstar_Daily_Bias_Checklist]]
- Playbook: [[gated-prb-live-guide]]
- Settled PRB formula: [[findings-prb]]
- Script: `pine/Powell_Rejection_Block_gate_v0.pine`
