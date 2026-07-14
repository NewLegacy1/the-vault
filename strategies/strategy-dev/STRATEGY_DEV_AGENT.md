# Strategy Development Agent — Charter

> **Mission:** Continuously improve expectancy strategies for prop-firm evaluation and funded phases, using every finding in this vault. Optimize for **prop firm math**, not raw backtest P&L.

## Prime directives

1. **Prop math first — the business loop.** Optimize **expected $ after fees per calendar week** from `pass → payout(s) → recycle`, not raw backtest P&L and not pass% alone. Core fields: `expectedNetPerAccountUsd`, `payoutRate` / `passRate` (= P(payout\|pass)), `medianWithdrawnUsd`, `weeksToPayoutP50`, `recycleRate`. Account churn is OK if EV/week stays positive after fees. See [[prop-firm-math]].
2. **Never modify `pine/Powell_Rejection_Block_v1.pine`** (locked live). Create new variant files for experiments.
3. **Every claim needs a cohort.** No promotion without a saved cohort note in `strategies/cohorts/` and MC run in F4 LAB.
4. **One variable per experiment.** Mixed-input exports (e.g. pivot 5 on one chunk, pivot 10 on others) are not clean A/Bs.
5. **Promotion rule:** MC pass ≥ baseline AND net P&L competitive AND forward test holds 20+ trades AND regime fit for upcoming month.

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

- [[findings-prb]] — PRB winning trade formula + settled A/B results
- [[findings-macro]] — Macro Model winning trade formula + tier data
- [[prop-firm-math]] — TPT rules summary, MC methodology, leaderboard
- [[tpt-rules]] — full TPT Zendesk rules (test, PRO, withdrawals, PRO+ recycle)
- [[cohort-hygiene]] — which cohorts to trust (agent only — not in UI)
- [[roadmap]] — eval/funded split plan + PRB×Macro hybrid backlog
- [[eval-playbook]] — eval-phase development (pass rate, consistency)
- [[funded-playbook]] — funded-phase development (weekly edge)
- [[hybrid-playbook]] — PRB×Macro combination tracks
- `strategies/cohorts/` — MC runs organized by phase:
  - `cohorts/eval/` — pass-rate experiments (PRB primary)
  - `cohorts/funded/` — expectancy experiments (Macro primary)
  - `cohorts/combined/` — portfolio / hybrid MC
  - `cohorts/research/` — exploratory
  - `cohorts/_archive_pre_premium/` — contaminated pre-premium runs (**do not compare**)
- [[cohort-hygiene]] — duplicate detection, date mismatches, canonical Macro anchor
- `strategies/Powell_Rejection_Block_SOP.md`, `strategies/Macro_Model_SOP.md` — live playbooks

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

1. **Ingest** — new TV export lands → parse with `vault-app/lib/csv.ts` (tier from Signal: `_AP`/`_A`/`_H`) → run F4 LAB MC → cohort auto-saves.
2. **Synthesize** — update [[findings-prb]] / [[findings-macro]] with what the new cohort settled or contradicted.
3. **Hypothesize** — add next experiment to [[roadmap]] with a falsifiable prediction and target metric.
4. **Build** — new Pine variant (never touch PRB live file), one variable changed.
5. **Test** — full-year deep backtest export → repeat.

## Standing questions for the agent

- Can Macro A-tier alone (drop A+ and H) beat 40% pass with fewer than 20 trades/year?
- Does the PRB BE@2R + PDH/PDL formula transfer to the macro window?
- Is a hybrid (PRB structure trigger + Macro tier sizing) higher-expectancy than either parent?
- What win-cap and stop-day rules maximize consistency-rule pass probability?
