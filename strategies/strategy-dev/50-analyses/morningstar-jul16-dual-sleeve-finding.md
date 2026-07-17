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

## Actions taken in Pine

- `Require KO in fib OTE to arm (Powell)` → **default ON**
- `Min fib leg (pts) before arm` → **40** (blocks fake OTE on a stub wick)
- `MARK early RB before OTE (eyes)` → **ON** (keeps the ~10:00 finding visible without arming)
- Fill / outcome KPI → **ON**

To re-study the early sleeve alone: turn **Require OTE OFF** (know it steals Powell).

## Bar-replay pass rule (updated)

**Jul 16 control:** with OTE **ON** + 1m chart (or 5m with patience) → expect ARM near the **pullback to KO in discount**, tag `PathB · 10:00 · 1RB`, plus early **eyes** mark near leave — not an early-only plan stealing the day.

## Links

- Checklist: [[Morningstar_Daily_Bias_Checklist]]
- Playbook: [[gated-prb-live-guide]]
- Settled PRB formula: [[findings-prb]]
- Script: `pine/Powell_Rejection_Block_gate_v0.pine`
