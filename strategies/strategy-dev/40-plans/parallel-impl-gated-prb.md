---
updated: 2026-07-14
status: active
tags: [impl, parallel-sprint, regime-gate-v0, strategy-dev]
---
# Parallel impl sprint — gated PRB ops + chain EV

> **Parent:** [[execution-plan-post-3y]] · gate settled **PASS** in [[findings-prb]].  
> **Goal:** Ship Jul+Oct STAND_DOWN into live/ops **and** measure gated A0a→D1 business-loop EV — **in parallel**, without file collisions.  
> **Do not:** stack March · reopen Macro/Hybrid polish · start Track B · multi-account.

## Why two lanes (not “one thing”)

“One variable per **experiment**” still holds. These two lanes are **independent deliverables** that do not share files:

| Lane | Owner suggestion | Depends on other lane? |
|---|---|---|
| **A — Ops encode** | Chat / agent working Pine + playbooks | No |
| **B — Chain EV** | Chat / agent working Lab scripts + quant notes | No |

Merge only at the end when both checklists are green.

---

## Shared facts (do not re-argue)

- Gate rule: `STAND_DOWN` if calendar month ∈ `{7, 10}` (Jul, Oct) · America/New_York session calendar.
- Inputs: `vault-app/data/tv-exports/matrix/prb-a0a-3y-gate-jul-oct.csv`, `prb-d1-3y-gate-jul-oct.csv`
- Ungated controls: `prb-a0a-3y.csv`, `prb-d1-3y.csv`
- Lab-confirm cohorts already saved under `strategies/cohorts/eval/*regime_gate_v0*` and `funded/*regime_gate_v0*`
- Locked file: **`pine/Powell_Rejection_Block_v1.pine` — NEVER edit**

---

## Lane A — Ops encode (live stand-down)

### Objective
Make Jul+Oct STAND_DOWN **impossible to miss** in live / replay: Pine input on an unlocked variant + checklist/SOP one-liners.

### Touch allow-list (ONLY these)

| Path | Action |
|---|---|
| `pine/Powell_Rejection_Block_v1_6_gated.pine` **or** `pine/Powell_Rejection_Block_gate_v0.pine` | **CREATE** (copy from unlocked v0/v1 patterns — **not** overwrite v1 locked). Add `Skip July & October (regime-gate-v0)` bool default **true**; when on, block new entries if `month(time, "America/New_York")` is 7 or 10 (same pattern as Skip Monday). |
| `pine/PINE_GUIDE.md` | Short section: gated variant · default on · why |
| `strategies/PRB_Trade_Checklist.md` | One checkbox: Jul/Oct stand-down |
| `strategies/Powell_Rejection_Block_SOP.md` | Short “ops overlay” note pointing at gate (do not rewrite whole SOP) |
| `strategies/strategy-dev/30-findings/findings-prb.md` | One line under PASS: “ops encoded in Pine variant X” when done |

### Do not touch (Lane B / locked)

- `Powell_Rejection_Block_v1.pine`
- `vault-app/scripts/analyze-chain-ev.ts` / chain-ev lib
- `strategies/strategy-dev/50-analyses/phase2-chain-ev-gated.md` (Lane B owns this)
- Macro / Hybrid pines
- Matrix CSVs

### Acceptance (Lane A done when)

1. [x] New Pine file exists; gate input default **true**; Monday skip still works.
2. [x] Funnel / status shows when blocked by Jul/Oct (one table row or label is enough).
3. [x] Checklist + SOP + PINE_GUIDE mention the gate.
4. [x] No edit to locked `…_v1.pine`.

### Copy-paste prompt for Lane A agent

```text
Read strategies/strategy-dev/40-plans/parallel-impl-gated-prb.md — execute ONLY Lane A (Ops encode).
- Create a NEW Pine variant (do NOT edit pine/Powell_Rejection_Block_v1.pine).
- Add Skip July & October (regime-gate-v0) default ON, NY timezone, same spirit as Skip Monday.
- Update PINE_GUIDE, PRB_Trade_Checklist, short SOP note, one line in findings-prb when done.
- Do not touch chain-ev scripts, matrix CSVs, Macro/Hybrid, or March stacking.
Stop when Lane A acceptance checklist is complete. Report files changed.
```

---

## Lane B — Chain EV (gated vs ungated business loop)

### Objective
Answer: **does A0a→D1 full-loop `E[$/wk]` improve under regime-gate-v0 vs ungated?** Document numbers for both.

### Touch allow-list (ONLY these)

| Path | Action |
|---|---|
| `vault-app/scripts/analyze-chain-ev-gated.ts` **or** extend `analyze-chain-ev.ts` with a `--gated` / pair flag | Compute chain EV for ungated A0a+D1 **and** gated A0a+D1 (use cohort files under `eval/*regime_gate_v0*` / `funded/*regime_gate_v0*` and/or gated matrix CSVs + `buildMcParamsForLab` — same engine as Lab confirm). |
| `vault-app/data/tv-exports/chain-ev-gated-vs-ungated.json` | Write machine-readable compare |
| `strategies/strategy-dev/50-analyses/phase2-chain-ev-gated.md` | **CREATE** human summary table + PASS/FAIL vs “gated chain EV ≥ ungated” |
| `strategies/strategy-dev/30-findings/findings-prb.md` | Add settled claim: gated chain EV ↑ / flat / ↓ with numbers |
| `strategies/strategy-dev/40-plans/execution-plan-post-3y.md` | Mark 2.3 done or fail; do not invent 2.2 |

### Do not touch (Lane A / locked)

- Any `pine/*.pine`
- `PINE_GUIDE.md`, `PRB_Trade_Checklist.md`, `Powell_Rejection_Block_SOP.md`
- Locked PRB v1
- March stacking, min-day pad implementation

### Method (required)

1. Pair **ungated**: cohort or MC for A0a-3y + D1-3y → chain `E[$/wk]` (baseline).
2. Pair **gated**: A0a regime_gate_v0 full + D1 regime_gate_v0 full → chain `E[$/wk]`.
3. Optional: same for OOS-only cohorts (report separately; do not mix with full).
4. Use existing chain math in `vault-app/lib/chain-ev.ts` / `analyze-chain-ev.ts` — prefer reuse over rewrite.
5. **PASS criterion for 2.3:** gated full-loop `E[$/wk]` **≥** ungated (tolerance ±5% OK). If gated loses on chain despite single-leg wins, document FAIL and do not promote ops as “business upgrade.”

### Acceptance (Lane B done when)

1. [ ] Script runnable: `npx tsx vault-app/scripts/analyze-chain-ev-gated.ts` (or documented flag on existing script).
2. [ ] JSON + `phase2-chain-ev-gated.md` with ungated vs gated table.
3. [ ] `findings-prb` has one settled row for chain EV.
4. [ ] Execution plan 2.3 checked PASS or FAIL.

### Copy-paste prompt for Lane B agent

```text
Read strategies/strategy-dev/40-plans/parallel-impl-gated-prb.md — execute ONLY Lane B (Chain EV).
- Compare chained E[$/wk] ungated A0a→D1 vs gated regime-gate-v0 A0a→D1.
- Reuse vault-app/lib/chain-ev.ts / analyze-chain-ev.ts; add a small gated script or flag if needed.
- Write vault-app/data/tv-exports/chain-ev-gated-vs-ungated.json and strategies/strategy-dev/50-analyses/phase2-chain-ev-gated.md.
- Update findings-prb + mark execution-plan 2.3 PASS/FAIL.
- Do not edit any pine files, SOP, checklist, or PINE_GUIDE. No March stack, no min-day pad, no Track B.
Stop when Lane B acceptance checklist is complete. Report numbers in the chat.
```

---

## Merge (after both lanes green)

Either agent (or user) does this once:

1. [ ] Confirm Lane A file list + Lane B numbers both exist.
2. [ ] One paragraph in [[execution-plan-post-3y]] sprint board: ops encoded + chain EV result.
3. [ ] **Next decision (user picks):**
   - If chain **PASS** → optional Phase **2.4** (one market co-feature) **or** live forward test with gate on.
   - If chain **FAIL** → keep single-leg gate as caution-only; do not claim business-loop upgrade; consider Track B.
   - **Still blocked:** multi-account, March stack, Hybrid income.

---

## Anti-collision rules

1. **No shared file writes** across lanes (lists above are exclusive).
2. If something seems to need a shared file → put a `TODO(merge)` note in your lane’s MD; do not edit the other lane’s files.
3. Do not “help” by starting the other lane.
4. Max 1 hour of scope creep — if blocked, stop and report.

## Status

| Lane | Status |
|---|---|
| A Ops encode | **DONE** (other agent) · `pine/Powell_Rejection_Block_gate_v0.pine` |
| B Chain EV | **DONE** · settle **PASS** (relative) · [[phase2-chain-ev-gated]] |
| Merge | **ready** — both lanes green |
