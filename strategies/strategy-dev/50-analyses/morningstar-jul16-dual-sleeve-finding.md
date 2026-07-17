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

## Dual20 — exact Dual13 restore (2026-07-17)

- Restored byte-for-byte from git `2bd3b85` (`MS Dual13`) — last build that armed **leave + Powell** on Jul 16.
- Stamp: **`MS Dual20 · Dual13 restore`** (logic = Dual13; stamp only renamed so you can verify the paste).
- Archives: Dual17 spray · Dual19 broken under `pine/_archive_*`.
- **Do not edit** until Dual20 acceptance passes on Jul 16 MNQ 5m.
- **Acceptance:** `5m RB·DayIL untapped` box · `LONG · leave` · `LONG · Powell · untapped DayIL`.

## Links

- Checklist: [[Morningstar_Daily_Bias_Checklist]]
- Playbook: [[gated-prb-live-guide]]
- Settled PRB formula: [[findings-prb]]
- Script: `pine/Powell_Rejection_Block_gate_v0.pine`
