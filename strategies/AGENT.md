# Agent context — The Vault

This folder is the **Obsidian vault** and the **Cursor workspace**. The agent can read everything here directly — no Obsidian plugin or API required.

## Where Lab Monte Carlo results live

```
strategies/cohorts/*.md
```

Each file is created automatically when you **RUN** in F4 LAB (if auto-save is on). YAML frontmatter includes:

- `variant`, `strategy_version`, `strategy_preset`
- `regimes`, `hypothesis`
- `net_pnl`, `trades`, `mc_pass_pct`, `mc_bust_pct`, `mc_payout_pct`
- `date_start`, `date_end`, `firm`

## How to ask the agent for strategy analysis

In Cursor chat, say something like:

- *"Review all cohorts in strategies/cohorts and compare BE-only vs trail variants"*
- *"Which regime tags have the best MC pass rate?"*
- *"Should we promote trail-on for give-back months based on saved cohorts?"*

The agent reads the markdown files in this repo — same files Obsidian shows.

## Key strategy docs

- [[Powell_Rejection_Block_SOP]] — live playbook
- [[PRB_Trade_Checklist]] — execution checklist
- [[cohorts/_index]] — cohort library index

## Promotion rule (reference)

Variant goes live only if: MC pass ≥ baseline · net P&L competitive · forward test holds · regime fit for upcoming month.
