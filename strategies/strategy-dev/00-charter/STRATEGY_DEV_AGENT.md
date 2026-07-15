# Strategy Development Agent — Charter

> **Mission:** Continuously improve expectancy strategies for prop-firm evaluation and funded phases, using every finding in this vault. Optimize for **prop firm math**, not raw backtest P&L.

## ACTIVE BRIEF (read first)

**[[execution-plan-post-3y]]** — post–3y matrix execution plan (2026-07-14).  
3y deep BT showed current mechanized PRB/Macro/Hybrid are not a durable income product. **Next work = ledger autopsy → regime gate (Track A) or one new non-ICT coded edge (Track B).** Do not polish Macro/Hybrid toggles or invent ICT clones until that plan’s Phase 1 clears.

## Prime directives

1. **Prop math first — the business loop.** Optimize **expected $ after fees per calendar week** from `pass → payout(s) → recycle`, not raw backtest P&L and not pass% alone. Core fields: `expectedNetPerAccountUsd`, `payoutRate` / `passRate` (= P(payout\|pass)), `medianWithdrawnUsd`, `weeksToPayoutP50`, `recycleRate`. Account churn is OK if EV/week stays positive after fees. See [[prop-firm-math]] · [[SCORECARD]].
2. **Never modify `pine/Powell_Rejection_Block_v1.pine`** (locked live). Create new variant files for experiments.
3. **Every claim needs a cohort.** No promotion without a saved cohort note in `strategies/cohorts/` and MC run in F4 LAB.
4. **One variable per experiment (Occam).** Mixed-input exports are not clean A/Bs. Start univariate / one free param; idea-class tag `MR | momentum | breakout | other`.
5. **Promotion rule:** Path MC + `E[$/wk]` ≥ baseline AND net competitive AND forward test holds AND regime fit. WR/avg RR alone never promote. Apply execution haircut / slippage band before “edge” language.
6. **Loss shape before cadence.** Any new or gated book must document trail-compatible loss math ($2k DD) before treating frequency / hybrid sleeves as income levers.
7. **Stage-0 before new Pine.** No new Track B / optimizable edge Pine until [[event-study-template]] artifact exists with EV/CI. Events ≠ signals. Public/published SOP claims are **default-null** (inspiration only) until private lift shown.
8. **Four gates for optimizable edges.** IS excellence → IS **price-permutation** → walk-forward → WF price-permutation ([[permutation-tests]]). Do not burn OOS until IS-perm passes. Lab **trade-bootstrap** MC ≠ price-perm MC — both required for promote on new searchable-param strategies. Locked PRB v1 exempt from re-optimize loops.
9. **Model ≠ strategy.** Predictive feature/event study first; then execution/risk protocol. Both required.

## The two-phase objective (eval vs funded)

The same strategy is NOT optimal for both phases. Development targets:

| | Evaluation phase | Funded phase |
|---|---|---|
| Goal | Reach +$4,000 before $2,000 trailing DD | Maximize $/week; survive to payouts |
| Enemy | Bust (2–3 max losses ≈ dead) | Give-back, oversized losses |
| Favors | High win rate, small losses, asymmetric R | Expectancy, runners, higher R multiples |
| Consistency | Best day < 50% + 5 min days (TPT) → cap wins ~$1,490 | **None on PRO** — higher RR / size OK; recycle before $5k PRO+ |
| Candidate today | PRB v1.5 BE@2R + PDH/PDL (54.9% pass) | Macro A-tier / PRB runners (higher $/trade) |

See [[prop-firm-math]] for full rules and current MC standings.

## Core knowledge files (read these first)

Map of content: [[strategy-dev/_index]] (section folders `00-charter` … `70-firms`).

- **[[execution-plan-post-3y]]** — **ACTIVE BRIEF** (post-3y · autopsy → gate or Track B)
- [[SCORECARD]] — success/failure / metric hierarchy / toward·away·kill
- [[event-study-template]] · [[track-b-template]] · [[permutation-tests]] — Stage-0 + four gates
- [[findings-prb]] — PRB winning trade formula + settled A/B results
- [[findings-macro]] — Macro Model winning trade formula + tier data
- [[prop-firm-math]] — TPT rules summary, MC methodology, leaderboard
- [[tpt-rules]] — full TPT Zendesk rules (test, PRO, withdrawals, PRO+ recycle)
- [[cohort-hygiene]] — which cohorts to trust (agent only — not in UI)
- [[roadmap]] — backlog archive · defer per execution plan
- [[sim-queue]] · [[tier0-3y-checklist]] — 3y matrix queue + evidence snapshot
- [[eval-playbook]] — eval-phase development (pass rate, consistency)
- [[funded-playbook]] — funded-phase development (weekly edge)
- [[hybrid-playbook]] — PRB×Macro combination tracks
- `strategies/cohorts/` — MC runs organized by phase:
  - `cohorts/eval/` — pass-rate experiments (PRB primary)
  - `cohorts/funded/` — expectancy experiments (Macro primary)
  - `cohorts/combined/` — portfolio / hybrid MC
  - `cohorts/research/` — exploratory / Track B / gates
  - `cohorts/_archive_pre_premium/` — contaminated pre-premium runs (**do not compare**)
  - `cohorts/_archive_365d_jul2026/` — 1y premium (**do not MC-compare to 3y**)
- `strategies/Powell_Rejection_Block_SOP.md`, `strategies/Macro_Model_SOP.md` — live playbooks (not Lab promotion authority)

## Data inventory (raw evidence)

| Location | Contents |
|---|---|
| `vault-app/data/tv-exports/macro-v1.4-premium-merged.csv` | Macro v1.4 365d enriched ledger (tier, MFE/MAE, qty, duration) |
| `vault-app/data/tv-exports/macro-v1.4-premium-mc-report.json` | Macro v1.4 MC + tier breakdown |
| `vault-app/data/tv-exports/macro-v1-ce-confirm-merged.csv` | Macro v1.2 baseline ledger (229 trades) |
| `vault-app/data/tv-exports/macro-v1-ce-confirm-mc-report.json` | Macro v1.2 MC report |
| `vault-app/data/tv-exports/macro-v1-tiered-mc-report.json` | Macro v1.3 vs v1.2 comparison |
| `strategies/legacy-manual/trade-log.csv` | 22 discretionary Macro trades (manual journal) |
| `vault-app/lib/prb-*.ts` | PRB seed datasets used by F4 LAB |
| `pine/Macro_Model_v1.pine` | Macro v1.4 (tiered entry IDs export to CSV Signal column) |

## Workflow loop

0. **Stage-0 (new ideas)** — fill event study → `npx tsx scripts/analyze-event-study.ts` → price-perm gates if searchable params → SCORECARD toward.
1. **Ingest** — new TV export lands → parse with `vault-app/lib/csv.ts` (tier from Signal: `_AP`/`_A`/`_H`) → run F4 LAB MC → cohort auto-saves.
2. **Synthesize** — update [[findings-prb]] / [[findings-macro]] with what the new cohort settled or contradicted; SCORECARD toward/away/kill.
3. **Hypothesize** — add next experiment to [[roadmap]] with a falsifiable prediction and target metric (`event | context | reference | outcome` purpose tag).
4. **Build** — new Pine variant (never touch PRB live file), one variable changed.
5. **Test** — full-year deep backtest export → Lab prop MC → repeat. Weekly review includes OOS **decay check**.

## Standing questions for the agent

**Primary (post Phase 2.1 PASS):** Optional next only if user asks — 2.2 min-day pad, 2.3 chain EV, or 2.4 market co-feature for barren months. `regime-gate-v0` is settled PASS as calendar ops overlay.

**Settled Phase 1–2.1:** Edge non-stationary; Jul/Oct WR 0% across years; red-folder stand-down fails; Lab-engine gate lift holds on A0a+D1 full+OOS. See [[findings-prb]] · [[phase1-autopsy-a0a-d1]].

**Deferred:**
- Can Macro A-tier alone (drop A+ and H) beat 40% pass with fewer than 20 trades/year?
- Does the PRB BE@2R + PDH/PDL formula transfer to the macro window?
- Is a hybrid (PRB structure trigger + Macro tier sizing) higher-expectancy than either parent?
- What win-cap and stop-day rules maximize consistency-rule pass probability?

**Track B:** closed for now (gate PASSed). Reopen only if live OOS falsifies Jul+Oct.
