# Agent context — The Vault

This folder is the **Obsidian vault** and the **Cursor workspace**. The agent can read everything here directly — no Obsidian plugin or API required.

## Vault layout

```
strategies/
├── AGENT.md                 ← you are here (vault home)
├── Powell_* / Macro_*       ← live SOPs + checklists
├── cohorts/                 ← Lab Monte Carlo auto-saves
│   ├── eval/ funded/ combined/ research/
│   └── _archive_*/
└── strategy-dev/            ← R&D knowledge (sectioned)
    ├── _index.md            ← map of content
    ├── 00-charter/
    ├── 10-templates/
    ├── 20-playbooks/
    ├── 30-findings/
    ├── 40-plans/
    ├── 50-analyses/
    ├── 60-track-b/
    └── 70-firms/
```

Sibling folders outside this note’s parent still matter:

- `pine/` — Pine scripts + `PINE_GUIDE.md`
- `vault-app/` — Lab UI + analysis scripts (raw exports in `vault-app/data/tv-exports/`)

## Where Lab Monte Carlo results live

```
strategies/cohorts/
├── eval/       ← pass-rate experiments (PRB)
├── funded/     ← weekly-edge experiments (Macro / PRB funded)
├── combined/   ← hybrid / portfolio MC
└── research/   ← exploratory
```

Each file is created when you **RUN** in F4 LAB (auto-save on). YAML includes `phase`, `strategy_family`, `mc_pass_pct`, `hypothesis`, etc. See [[cohorts/_index]].

**Save path check:** Local Lab writes straight to these folders. Production (Vercel) commits via GitHub API → Obsidian **GitHub Sync** pulls (~5 min). Notes under `strategy-dev/` are written by agents/scripts to disk — commit + sync so other machines / phone vaults see them.

## Strategy development agent

Dedicated R&D agent — start at [[strategy-dev/_index]].

- **[[execution-plan-post-3y]]** — **ACTIVE BRIEF** (post-3y reset · autopsy → gate or Track B)
- **[[parallel-impl-sprint2]]** — **PARALLEL SPRINT 2** (Lane C co-feature · Lane D Track B)
- [[parallel-impl-gated-prb]] — sprint 1 (ops + chain EV) · DONE
- [[STRATEGY_DEV_AGENT]] — charter, workflow loop, promotion rule
- [[SCORECARD]] · [[event-study-template]] · [[permutation-tests]] · [[track-b-template]] — Stage-0 + four gates
- [[eval-playbook]] — eval-phase (TPT pass optimization)
- [[funded-playbook]] — funded-phase (weekly edge)
- [[hybrid-playbook]] — PRB×Macro combination
- [[gated-prb-live-guide]] — gated PRB paper/live ops
- [[findings-prb]] · [[findings-macro]] — settled formulas
- [[prop-firm-math]] · [[roadmap]] · [[sim-queue]] · [[tier0-3y-checklist]]

## Key strategy docs (live)

- [[Powell_Rejection_Block_SOP]] — Powell/PRB live playbook
- [[PRB_Trade_Checklist]] — PRB execution checklist
- [[Macro_Model_SOP]] — Macro model playbook (separate strategy; test vs PRB in LAB)
- [[Macro_Trade_Checklist]] — Macro execution checklist
- `strategies/legacy-manual/trade-log.csv` — discretionary Macro journal (from All Trades PDF)
- [[cohorts/_index]] — cohort library index

## Promotion rule (reference)

Variant goes live only if: MC pass ≥ baseline · net P&L competitive · forward test holds · regime fit for upcoming month.
