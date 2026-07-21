---
updated: 2026-07-21
status: PARKED — not the open Stage-0 slot
tags: [stage-0, parked, order-flow, auction, mnq, prop]
---
# Parked — OF / auction sleeve sketches (separate from Dual46)

> **Not active Stage-0.** Open slot stays with [[lane-s-s3-reaper-macroa-v0]] / `sim-queue.md`.  
> Activate **one** of these only after that slot frees and after the [[../../knowledge/quant/auction-order-flow-tv-premium-vs-sierra-prop|2-week TV learn protocol]].  
> Dual46 freeze: do not retune. Disc midnight RB fills ≠ Dual46 script sleeve.

## Product decision (pre-register when activating)

| Lane | When |
|---|---|
| Eyes-only on Dual46 | Always allowed (census) |
| Separate OF Stage-0 | After learn protocol + one sketch chosen |
| Regime-split disc (2 sleeves) | If OF stays manual; separate ledgers / daily stops |

## Sketch 1 — `ON-Midnight RB Failure-to-Accept`

Inspired by forward-test: 1m+5m RB · midnight open · against daily bias · ~1:4.

**Logged evidence 2026-07-21 (not Stage-0 yet):** Long WIN · SL 18pt · TP 73pt @ 10:00 KO · **4.08R** · against short bias — [[../50-analyses/forward-disc-2026-07-21]].

1. Levels marked before entry: midnight open · ONH/ONL · ETH 5m RB zone.
2. Entry: break of level with aggression, then **1m close back through** (fail-to-accept).
3. Stop beyond failed extreme; TP fixed 1:4 **or** opposing overnight liquidity (declare one before sample).
4. Max 1 trade per ETH→RTH window; no revenge entry.
5. **Kill if:** RB zone not mechanical for replay · EV≤0 / CI covers 0 · loss streak×risk trail-hostile · becomes killed Track-B costume.

## Sketch 2 — `RTH LVN Reclaim-to-HVN`

1. Prior RTH LVN/HVN + VAH/VAL/POC marked before open (fixed VP settings).
2. Probe through LVN fails to accept within N×5m bars.
3. Enter on 5m close back through LVN (+ optional CVD/footprint trap confirm — declare yes/no).
4. Stop beyond probe extreme; TP nearest HVN/POC (optional opposite VA if pre-registered).
5. **Kill if:** LVN picked after the fact · EV≤0 · target too small after fees · trail-hostile clusters.

## Sketch 3 — `Footprint Absorption at Pre-Marked Value Edge`

1. Levels: prior VAH/VAL/POC · ONH/ONL · overnight POC (TV footprint or Sierra — **one feed only**).
2. Trigger: aggression into level above declared delta threshold + no close acceptance beyond.
3. Enter opposite after reclaim / close back inside.
4. Stop beyond absorption extreme; TP next magnet (POC/HVN/opposite VA).
5. **Kill if:** absorption not objective · screenshots ≠ replay ledger · n too small and cannot scale · path MC `E[$/wk]` not positive after fees.

## Activation checklist (when slot opens)

- [ ] Finish 2-week TV protocol note outcome
- [ ] Choose **exactly one** sketch
- [ ] Write full Stage-0 note (measure Pine or manual event CSV path)
- [ ] Update `sim-queue.md` — park/kill prior open Stage-0 first
- [ ] No Dual46 / PRB v1 edits
