---
updated: 2026-07-14
status: active
tags: [impl, parallel-sprint, phase2.4, track-b, strategy-dev]
---
# Parallel sprint 2 — co-feature (2.4) + Track B design

> **Parent:** [[execution-plan-post-3y]] · prior sprint [[parallel-impl-gated-prb]] (both lanes DONE).  
> **Context:** `regime-gate-v0` PASS · chain EV relative PASS but **full-3y loop still ≤0**.  
> **Goal:** (C) test whether a **pre-session market feature** explains barren Jul/Oct better than calendar · (D) design **one** trail-compatible non-ICT Track B candidate — **in parallel**.

## Split (even)

| Lane | Owner | Work | Conflict risk |
|---|---|---|---|
| **C — Phase 2.4 co-feature** | **This chat / Agent C** | Quant: tag ledgers · test 1–3 observables · settle keep/kill calendar | Scripts + research MD |
| **D — Track B design** | **Other chat / Agent D** | Spec + first Pine skeleton for **one** B0/B1-class edge | New pine + design MD |

No shared writes. Merge only when both acceptance checklists are green.

---

## Shared facts (do not re-argue)

- Jul+Oct STAND_DOWN is ops overlay: `pine/Powell_Rejection_Block_gate_v0.pine` · [[phase2-chain-ev-gated]]
- Full-3y chain E[$/wk] gated ≈ **−$6** (better than −$18, still not income)
- OOS chain gated ≈ **$50/wk** — non-stationary
- Locked: `pine/Powell_Rejection_Block_v1.pine` — never edit
- Do **not:** March stack · Macro/Hybrid polish · multi-account · PDRA combo mining · Bookmap rescue

---

## Lane C — Phase 2.4 market co-feature (Agent C)

### Objective
Answer: does a **live-known-before-session** market feature explain PRB barren months better than (or as a refinement of) calendar Jul+Oct?

### Method (required)

1. Start from `prb-a0a-3y.csv` / gated CSV + `phase1-autopsy` month findings.
2. Define **≤3** pre-session observables you can compute from data already in vault or cheap public series (pick what you can actually code today), e.g.:
   - prior-day / overnight range or ATR quartile
   - short trend proxy (e.g. 20d slope / EMAs on daily if available, or session net)
   - realized vol quartile
3. **Pre-register** each feature’s TRADE/STAND_DOWN rule in the MD **before** looking at lift tables (write rules first in script comments / MD draft).
4. Compare gates on **full 3y + OOS**:
   - baseline: calendar Jul+Oct
   - candidate: feature alone
   - candidate: feature **AND** calendar (refinement only if it helps)
5. Settlement:
   - **PROMOTE feature** only if OOS E[$/wk] ≥ calendar gate and bust not worse, with n still useful
   - else **KEEP calendar v0** and document “no better co-feature found”

### Touch allow-list (ONLY)

| Path | Action |
|---|---|
| `vault-app/scripts/analyze-prb-regime-cofeature.ts` | CREATE |
| `vault-app/data/tv-exports/prb-regime-cofeature.json` | WRITE |
| `strategies/strategy-dev/phase2-4-cofeature.md` | CREATE settle note |
| `strategies/strategy-dev/findings-prb.md` | One settled row for 2.4 |
| `strategies/strategy-dev/execution-plan-post-3y.md` | Mark 2.4 done |

### Do not touch

- Any `pine/*.pine` (Lane D)
- `Powell_Rejection_Block_gate_v0.pine`
- Track B design file
- Macro / Hybrid / matrix CSVs (read-only OK)
- March stacking

### Acceptance (Lane C done)

1. [x] Script runs: `npx tsx vault-app/scripts/analyze-prb-regime-cofeature.ts`
2. [x] JSON + `phase2-4-cofeature.md` with pre-registered rules + full/OOS tables
3. [x] Explicit verdict: **KEEP calendar v0**
4. [x] `findings-prb` + execution-plan 2.4 updated

### Copy-paste — Lane C (this agent)

```text
Read strategies/strategy-dev/parallel-impl-sprint2.md — execute ONLY Lane C (Phase 2.4 co-feature).
- Pre-register ≤3 pre-session observables, then test vs calendar Jul+Oct on A0a (full + OOS).
- Create vault-app/scripts/analyze-prb-regime-cofeature.ts + JSON + strategies/strategy-dev/phase2-4-cofeature.md.
- Settle PROMOTE feature vs KEEP calendar v0 in findings-prb; mark execution-plan 2.4.
- Do not edit any pine files or Track B docs. No March stack, no Macro polish.
Stop at Lane C acceptance. Report the verdict and key numbers.
```

---

## Lane D — Track B design + Pine skeleton (other agent)

### Objective
Because full-3y gated chain is still ≤0, open **Track B**: one falsifiable non-ICT edge with **trail-compatible loss shape**, not another PRB/Macro clone.

### Constraints (from execution-plan Phase 3)

1. Loss shape first vs $2k trail (document assumed max L-streak × $risk).
2. Entry rule ≤10 lines; no narrative confluence stack.
3. Design for later 3y + OOS — skeleton may be empty of trades until deep BT exists.
4. Family later: `strategy_family: custom` · research cohorts.
5. Pick **exactly one** idea class: **B0** (time/vol session + hard stop) **or** **B1** (regime switch mean-rev xor continuation). State which in the MD title.

### Touch allow-list (ONLY)

| Path | Action |
|---|---|
| `strategies/strategy-dev/track-b-candidate-v0.md` | CREATE — hypothesis, rules, loss math, kill criteria, export plan |
| `pine/TrackB_<name>_v0.pine` | CREATE skeleton (inputs + entry/exit stubs + funnel). **Not** ICT RB/FVG soup. |
| `pine/PINE_GUIDE.md` | Short “Track B v0” pointer only |
| `strategies/strategy-dev/findings-prb.md` | Optional one-liner “Track B opened — see track-b-candidate-v0” (no fake PASS) |
| `strategies/strategy-dev/execution-plan-post-3y.md` | Mark Phase 3 started / Track B open |

### Do not touch

- Lane C cofeature scripts / `phase2-4-cofeature.md`
- Locked PRB v1 · do not turn gate_v0 into Track B
- Macro_Model_* · Hybrid_Sleeve_*
- Claiming MC PASS without a real 3y export + Lab run (design only this sprint)

### Acceptance (Lane D done)

1. [ ] `track-b-candidate-v0.md` complete: one idea · rules · trail math · kill criteria · next export steps
2. [ ] Pine skeleton with inputs/state/entry/exit stubs · name `TrackB_…` (avoid Lab Macro `B0`/`B1a` collision)
3. [ ] PINE_GUIDE pointer
4. [ ] Execution plan notes Track B open (no spurious PASS)

### Copy-paste — Lane D (other agent)

```text
Read strategies/strategy-dev/parallel-impl-sprint2.md — execute ONLY Lane D (Track B design).
- Pick exactly one: B0 (time/vol session + hard stop) OR B1 (regime switch). Not an ICT/PRB/Macro clone.
- Write strategies/strategy-dev/track-b-candidate-v0.md with rules, $2k-trail loss math, kill criteria.
- Create pine/TrackB_<name>_v0.pine skeleton + short PINE_GUIDE pointer.
- Mark Track B open on execution-plan. Do NOT claim Lab PASS without a 3y export.
- Do not touch Lane C cofeature scripts, phase2-4-cofeature.md, or locked Powell_Rejection_Block_v1.pine.
Stop at Lane D acceptance. Report files changed and the chosen idea class.
```

---

## Merge (after C + D green)

1. [ ] Confirm 2.4 verdict + Track B skeleton both exist.
2. [ ] One paragraph on [[execution-plan-post-3y]] sprint board.
3. [ ] User picks next single track:
   - If 2.4 PROMOTE → encode feature into gate Pine (new small lane)
   - If Track B skeleton ready → Deep Backtest export → Lab research cohort
   - Live forward gated PRB can run in parallel as ops (not R&D)

## Anti-collision

1. Exclusive touch lists — no helping the other lane.
2. Track B idea IDs **B0/B1** ≠ Lab Macro presets `matrix-b0` / `matrix-b1a` — name Pine `TrackB_…`.
3. No multi-account / March / Hybrid.

## Status

| Lane | Status |
|---|---|
| C Co-feature 2.4 | **DONE · KEEP calendar v0** · [[phase2-4-cofeature]] |
| D Track B design | **ready** (other agent) |
| Merge | waiting on D |
