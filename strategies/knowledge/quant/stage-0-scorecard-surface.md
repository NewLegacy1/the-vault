---
topic: stage-0-scorecard-surface · researched: 2026-07-20 · sources: 7 · agent-cycle: cycle4-model-builder
---
# Stage-0 Scorecard Surface: One Closeout Checklist (EV±CI · Leakage · Baselines · k-Adjusted · Path MC Gate)

Distills existing Cycle-3 doctrine into **one closeout surface** for every Stage-0 event study. Does **not** invent new Track-B ideas, retune Dual46, or claim `E[$/wk]` — it only says which fields must be filled before a toward/away/kill token is honest.

## Key findings

- **CLAIM (SCORECARD hierarchy, in-repo):** promote/kill authority is path MC + net EV after fees (`E[$/wk]`, pass/bust/timeout). Trade EV ± bootstrap CI is Stage-0 / ledger diagnostics. WR / RR / SD are geometry footnotes only — never KPIs. (`strategy-dev/00-charter/SCORECARD.md`)
- **EVIDENCE (script outputs today):** `analyze-event-study.ts` already emits Full / IS / OOS windows with `bootstrapEvCi` (nBoot=2000), a sign-flip **random_baseline** (abs PnL × coin-flip — the B-FLIP null), geometry footnotes, and a binary `scorecard.verdict` (`toward` iff OOS EV CI excludes 0 and OOS mean > 0). It explicitly states path promote still requires Lab trade-bootstrap MC. It does **not** yet print L-checklist status, vsRandom percentile, vsBuyHold, or `kAtTest`.
- **CLAIM (leakage, Cycle-3):** look-ahead biases results optimistic; Stage-0 must file the **L1–L8 checklist** before quoting EV. Exposure is upstream in Pine / joins, not in the TS ledger consumer. (`feature-lag-audits-data-leakage.md`)
- **CLAIM (baselines, Cycle-3):** three naive columns — vsRandom pctile / vsBuyHold $Δ / vsFlip pctile — are mandatory before “edge” language; B-FLIP is the weakest null and is what the script already computes. (`benchmark-discipline-naive-baselines.md`)
- **CLAIM (multiplicity, Cycle-3):** after k Track-B looks, family-wise noise odds rise (~51% at k≈14, α=0.05); **kills need no deflation**; **survivors** need k-adjusted CI or OOS replication, plus honest `kAtTest`. (`multiple-testing-selection-bias-sleeves.md`)
- **CLAIM (hard stop, charter):** Stage-0 **toward** alone never Lab-promotes; path MC `E[$/wk]` remains required. Dual46 freeze / chart walk stays outside Lab promote. Never invent Deep BT numbers.

## Details / mechanics

### One Stage-0 closeout checklist (file with every candidate note)

| # | Field | Pass / fail rule | Source of truth today |
|---|---|---|---|
| S0-1 | **EV ± CI (Full, IS, OOS)** | OOS: CI exclusive of 0 **and** mean > 0 → eligible for **toward**; else **away** / kill per kill-lessons | `analyze-event-study.ts` → `windows.*.evCi`, `coversZero` |
| S0-2 | **Leakage L-checklist (L1–L8)** | Table filed; L5 lag-shift marked “pending export” if not run — never silently skipped | Human table in Stage-0 note; cite `feature-lag-audits-data-leakage.md` |
| S0-3 | **vsFlip** | Real EV distinguishable from sign-flip null (script’s `random_baseline`); label as **weakest** null | Script `windows.randomBaseline` |
| S0-4 | **vsRandom (pctile)** | Prefer real EV > B-RAND p90 under same session/geometry; ≤ p50 → kill | Not automated yet — TV random-entry script or bar-data loop; cite `benchmark-discipline-naive-baselines.md` |
| S0-5 | **vsBuyHold ($Δ)** when timestamps allow | If beats random but ≤ time-matched hold → session-beta, reframe or kill | Not in script yet — needs entry time + session flat |
| S0-6 | **k-adjusted survivor rule** | Record `kAtTest` (Track-B trials completed before this look). **Kill:** unchanged (CI excl. 0 / negative EV). **Toward→proceed:** CI excl. 0 at ~1−0.05/k **or** pre-registered OOS replication; best-of-(k+1) random bar when claiming selection | `multiple-testing-selection-bias-sleeves.md` + kill-lessons header counter |
| S0-7 | **Execution haircut stated** | Gross-only EV flagged; slip/fee band named before “edge” language (presets: sibling note `fill-haircut-defaults-stage0-lab.md`) | SCORECARD “Execution haircut” row |
| S0-8 | **Path MC still required** | Even after S0-1…S0-7 pass → verdict language = **toward study**, not promote. Lab promote waits for path MC `E[$/wk]` under firm rules | SCORECARD rank 1; script reason string already says this |

**Verdict tokens** stay SCORECARD language: **toward** / **away** / **kill**. Geometry (WR%, RR, trade SD) may appear only under a “footnotes — not KPIs” heading — matching the script’s `geometryFootnote`.

### Map: SCORECARD hierarchy ↔ script fields

| SCORECARD rank | Metric | `analyze-event-study.ts` today | Closeout action |
|---|---|---|---|
| 1 | Path MC / `E[$/wk]` | **Not computed** — reason string defers | Block promote; queue CYCLE-4 item 75 wiring when toward |
| 2 | Trade EV $ + bootstrap CI | `evCi.mean` / `ciLow` / `ciHigh` on Full, IS, OOS | Drive toward/away |
| 2b | Baselines | `randomBaseline` = B-FLIP only | Record vsFlip; mark vsRandom/vsBuyHold pending if missing |
| 3 | Risk geometry | `geometry.winRatePct`, `rr`, `tradePnlSd` | Diagnostic only |
| Hygiene | Leakage | None printed | File L1–L8 before quoting row S0-1 |
| Hygiene | Multiplicity | None printed | Stamp `kAtTest` on survivors |

### What this surface is *not*

- Not a generator of new Track-B sleeves.
- Not a Dual46 Lab promote or freeze edit.
- Not permission to invent Deep Backtest or `E[$/wk]` numbers — stop at “waiting for export / waiting for path MC.”

## APPLICATION TO THE VAULT

1. **Use this checklist as the Stage-0 closeout template** (one table in the candidate’s Stage-0 markdown under `strategy-dev/50-analyses/`). Orchestrator / research loop: refuse “toward” language if S0-2 or S0-8 is blank.
2. **Script backlog (wiring, not new lore):** banner `LEAKAGE AUDIT: filed | pending`; rename `random_baseline` → `vsFlip` in MD; add optional `kAtTest` / `vsRandomPctile` fields to JSON when available — aligns with CYCLE 4 item 74 intent and architecture spine (`vault-model-builder-architecture.md`).
3. **Survivor asymmetry:** any future Track-B that clears OOS EV CI still hits S0-6 before path MC; Dual46/PRB multiplicity family stays separate (pre–Track-B evidence path) — do not fold Dual46 into the k=13 kill counter.
4. **Hubs:** Stage-0 hub points here; math hub links for validation hygiene.

## Sources

- `strategies/strategy-dev/00-charter/SCORECARD.md` — hierarchy, verdict tokens, execution-haircut gate
- `vault-app/scripts/analyze-event-study.ts` — EV±CI windows, B-FLIP baseline, toward/away reason, path-MC deferral
- `quant/feature-lag-audits-data-leakage.md` — L1–L8 checklist
- `quant/benchmark-discipline-naive-baselines.md` — vsRandom / vsBuyHold / vsFlip
- `quant/multiple-testing-selection-bias-sleeves.md` — k-adjusted survivor rule
- `quant/vault-model-builder-architecture.md` — idea → ES → Stage-0 → path MC spine
- `strategies/knowledge/RESEARCH_CHARTER.md` — Cycle-4 item 74; Dual46 freeze guardrail
