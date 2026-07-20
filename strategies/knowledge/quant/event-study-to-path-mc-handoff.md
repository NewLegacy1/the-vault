---
topic: event-study-to-path-mc-handoff · researched: 2026-07-20 · sources: 6 · agent-cycle: cycle4-75
status: active
tags: [quant, event-study, path-mc, stage0, application, model-builder]
---
# Event-study JSON → firm-rule path MC handoff

**Spine slot:** Stage-0 EV±CI gate → path MC `E[$/wk]` (only after **toward**).  
Hub: [[../hubs/hub-stage0]] · architecture: [[vault-model-builder-architecture]] · authority: `strategy-dev/00-charter/SCORECARD.md`.

## Key findings

- **CLAIM (in-repo):** `analyze-event-study.ts` is a **trade-EV diagnostic gate**, not a promote machine. Its JSON verdict is **toward** or **away** from OOS bootstrap EV±CI only.
- **EVIDENCE:** `scorecard.blockStrategy = OOS CI covers 0 OR OOS mean ≤ 0` → `away`; else `toward` with reason *"still requires prop path MC for promote"* (`vault-app/scripts/analyze-event-study.ts`).
- **CLAIM:** Path MC does **not** consume invented Deep BT scalars from the note. It re-ingests the **same trade PnL series CSV** plus firm rules (fees, trail, timeout/`maxTrades`) via `buildMcParamsForLab` → `runMonteCarlo` → `derivePayoutCycle.expectedUsdPerCalendarWeek`.
- **EVIDENCE:** `lab-confirm-regime-gate-v0.ts` loads matrix CSVs, builds Lab params, reports `E[$/wk]` / pass / bust — reference script path for post-toward confirm.
- **Hard stop:** Dual46 / Morningstar Path B is **chart freeze + journal**, never Lab-promoted from harvest alone (`SCORECARD.md` Dual46 row).

## When ES says toward vs away

| ES JSON field | Condition (executable) | Meaning |
|---|---|---|
| `scorecard.verdict: "away"` | OOS EV 95% CI covers 0 **or** OOS mean ≤ 0 (and n>0) | Do **not** open path MC for income / Lab promote. Harvest / park / kill per human SCORECARD. |
| `scorecard.verdict: "toward"` | OOS EV CI exclusive of 0 and OOS mean > 0 | Closer on **rank-2** metrics only. Unlock **permission** to run firm-rule path MC — not a promote. |
| `scorecard.blockStrategy` | `true` iff away | Explicit stop flag in JSON + markdown. |

**Not in ES JSON:** `kill` is a human SCORECARD graveyard token (do not retune without new Stage-0 evidence). The script never invents `E[$/wk]`, pass%, bust%, or timeout%.

**Geometry footnotes** (WR, RR, trade SD) in the ES report are diagnostics only — never flip toward→away by themselves.

Default OOS cut in the script: `oosStart = "2025-07-14"` (IS = dates before; OOS = on/after). Random-sign baseline is reported for context, not the gate.

## Exact handoff (no invented Deep BT numbers)

```
TV List-of-trades CSV
        │
        ▼
analyze-event-study.ts  →  event-study-<stem>.json + .md
        │                      scorecard.toward | away
        │
        ├─ away / kill  →  harvest · stop  (no Lab MC claim)
        │
        └─ toward       →  SAME CSV  + firm ruleId + phase
                              │
                              ▼
                    buildMcParamsForLab({ trades, dates, fees, trail, … })
                              │
                              ▼
                    runMonteCarlo → derivePayoutCycle
                              │
                              ▼
                    E[$/wk] · pass / bust / timeout  → SCORECARD rank-1
```

### What ES JSON carries (gate only)

| From JSON | Use downstream |
|---|---|
| `ledger` path (`matrix/<file>.csv`) | **Must** re-parse for MC; do not paste EV$ into MC |
| `scorecard.verdict` | Gate: only **toward** may proceed to path MC |
| `windows.*.evCi` / `geometry` | Cohort notes / harvest — not MC inputs |
| `oosStart`, `nBoot` | Reproducibility of the Stage-0 cut |

### What MC still requires (inputs ES does not supply)

| Input | Source | Why |
|---|---|---|
| Trade PnL series + dates | `parseLabLedger` on the **CSV** named in `ledger` | MC bootstrap resamples trades; JSON has aggregates only |
| Firm rules | `ruleId` → `ruleById` / phase (eval vs funded) | passAt, trailing DD mode, consistency, winning-days |
| Fees | `buildMcParamsForFirm` `fees.{evalFee,activationFee,monthlyFee,payoutBuffer}` | Net path EV ≠ gross trade EV |
| Trail | `trailingDD` + `rulePack.trailingMode` (eod/intraday) | Bust geometry under firm trail |
| Timeout | `maxTrades` → MC `timeoutRate` | Paths that never pass before trade budget |
| Sims / buffer | Lab defaults (e.g. confirm script: sims=2000, maxTrades=220, payoutBuffer=2000) | Stable cohort compare |
| Phase | `strategyPhase` eval \| funded | Separate MC books — never mix |

Reference wiring: `vault-app/scripts/lab-confirm-regime-gate-v0.ts` (`buildMcParamsForLab` → `runMonteCarlo` → `derivePayoutCycle`). Param assembly: `vault-app/lib/mc-params-builder.ts`.

### Outputs that settle promote language

| Metric | Role |
|---|---|
| `expectedUsdPerCalendarWeek` (`E[$/wk]`) | Rank-1 promote / kill authority after fees |
| `passRate` / `bustRate` / `timeoutRate` | Path shape vs SCORECARD eval/funded targets |
| Cohort markdown under `strategies/cohorts/` | Reproducible Lab artifact |

## Blockers (stop language)

| Blocker | Agent / human action |
|---|---|
| Missing matrix CSV | Stop: *"waiting for export — drop TV List of trades into `vault-app/data/tv-exports/matrix/`"* — **never invent** Deep BT / path numbers |
| ES not run yet | Run `npx tsx scripts/analyze-event-study.ts <file>` from `vault-app/` |
| Verdict **away** | No path MC promote; update SCORECARD / kill-lessons if closeout |
| Verdict **toward** but no firm/phase chosen | Hold MC until ruleId + eval\|funded registered |
| Dual46 chart / journal harvest only | **Never** Lab-promote; Path B stays freeze + multi-month journal per lock note |

## Dual46 (manual Path B)

Per SCORECARD: Morningstar Dual46 = **toward study (geometry locked)** with Lab MC / `E[$/wk]` **not claimed**. Chart harvest and Dual46 journal inform ops and sleeve hygiene; they do **not** substitute for Stage-0 toward on a Lab ledger **plus** firm-rule path MC. Do not treat replay P&L canvas totals as Lab promote authority.

## APPLICATION TO THE VAULT

1. **Gate first:** only open path MC when `event-study-*.json` → `scorecard.verdict === "toward"`.
2. **Re-read CSV:** MC inputs = `trades[]` + `dates[]` from the ledger path in JSON — never type EV or invent Deep BT fills.
3. **Script template:** copy the confirm pattern in `lab-confirm-regime-gate-v0.ts` (or Lab UI using the same `buildMcParamsForLab`) for any Track B / PRB cohort after toward.
4. **Claim language:** say "Stage-0 toward — waiting path MC" until cohort has `E[$/wk]` after fees; Dual46 stays "chart freeze, not Lab promote."
5. **Layer discipline:** ES markdown in `strategy-dev/50-analyses/` = state; this note = doctrine; `lib/` + scripts = executable ([[vault-model-builder-architecture]]).

## Sources

1. `vault-app/scripts/analyze-event-study.ts` — OOS EV±CI → toward/away
2. `vault-app/scripts/lab-confirm-regime-gate-v0.ts` — Lab-engine path MC confirm pattern
3. `vault-app/lib/mc-params-builder.ts` — `buildMcParamsForLab` / fees / trail / phase
4. `vault-app/lib/payout-cycle.ts` — `expectedUsdPerCalendarWeek`
5. `strategies/strategy-dev/00-charter/SCORECARD.md` — hierarchy + Dual46 freeze
6. [[vault-model-builder-architecture]] · [[event-study-methodology-intraday-setups]] · [[monte-carlo-prop-firm-survival]]
