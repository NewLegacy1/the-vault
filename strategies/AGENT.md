# Agent context — The Vault

This folder is the **Obsidian vault** and the **Cursor workspace**. The agent can read everything here directly — no Obsidian plugin or API required.

## Where Lab Monte Carlo results live

```
strategies/cohorts/
├── eval/       ← pass-rate experiments (PRB)
├── funded/     ← weekly-edge experiments (Macro)
├── combined/   ← hybrid / portfolio MC
└── research/   ← exploratory
```

Each file is created when you **RUN** in F4 LAB (auto-save on). YAML includes `phase`, `strategy_family`, `mc_pass_pct`, `hypothesis`, etc. See [[cohorts/_index]].

## Strategy development agent

Dedicated R&D agent — start here:

- [[strategy-dev/STRATEGY_DEV_AGENT]] — charter, workflow loop, promotion rule
- [[strategy-dev/eval-playbook]] — eval-phase (TPT pass optimization)
- [[strategy-dev/funded-playbook]] — funded-phase (weekly edge)
- [[strategy-dev/hybrid-playbook]] — PRB×Macro combination
- [[strategy-dev/findings-prb]] · [[strategy-dev/findings-macro]] — settled formulas
- [[strategy-dev/prop-firm-math]] · [[strategy-dev/roadmap]]

## Key strategy docs

- [[Powell_Rejection_Block_SOP]] — Powell/PRB live playbook
- [[PRB_Trade_Checklist]] — PRB execution checklist
- [[Macro_Model_SOP]] — Macro model playbook (separate strategy; test vs PRB in LAB)
- [[Macro_Trade_Checklist]] — Macro execution checklist
- `strategies/legacy-manual/trade-log.csv` — discretionary Macro journal (from All Trades PDF)
- [[cohorts/_index]] — cohort library index

## Promotion rule (reference)

Variant goes live only if: MC pass ≥ baseline · net P&L competitive · forward test holds · regime fit for upcoming month.
