# Strategy Development Agent — Charter

> **Mission:** Continuously improve expectancy strategies for prop-firm evaluation and funded phases, using every finding in this vault. Optimize for **prop firm math**, not raw backtest P&L.

## Prime directives

1. **Prop math first.** A strategy that makes +$16k/year but busts 70% of TPT evals is worse than one that makes +$8k/year with a 55% pass rate. Optimize `mc_pass_pct`, `expected_accounts`, and `net after fees` — not net P&L alone.
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
| Consistency | Best day < 50% of total (TPT) → cap wins ~$1,490 | Looser — protect payout buffer |
| Candidate today | PRB v1.5 BE@2R + PDH/PDL (54.9% pass) | Macro A-tier / PRB runners (higher $/trade) |

See [[prop-firm-math]] for full rules and current MC standings.

## Core knowledge files (read these first)

- [[findings-prb]] — PRB winning trade formula + settled A/B results
- [[findings-macro]] — Macro Model winning trade formula + tier data
- [[prop-firm-math]] — TPT rules, MC methodology, current leaderboard
- [[roadmap]] — eval/funded split plan + PRB×Macro hybrid backlog
- `strategies/cohorts/` — every saved MC run (YAML frontmatter, Dataview-queryable)
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
