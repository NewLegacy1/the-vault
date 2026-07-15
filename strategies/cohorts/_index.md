# Lab cohort library

Monte Carlo + backtest results from **F4 LAB** auto-save here. YAML frontmatter is Dataview-queryable.

## Folder taxonomy

| Folder | Phase | Optimize for |
|---|---|---|
| `eval/` | Evaluation | `mc_pass_pct`, `expected_accounts`, consistency |
| `funded/` | Funded | Weekly edge $, expectancy, payout rate |
| `combined/` | Hybrid / portfolio | Joint MC, PRB×Macro blends |
| `research/` | Exploratory | Bias splits, one-off tests |
| `_archive_pre_premium/` | Archived | Pre-premium / duplicate — **agent ignore** |
| `_archive_365d_jul2026/` | Archived | 1y premium matrix MC — **Lab blank for 3y reset** · do not MC-compare to new `*-3y-*` |

Phase folders refill on every Lab RUN (auto-save). After the 2026-07-14 3y reset they started empty; current active notes are the post-reset / gated / Macro income runs (not the archived 1y matrix).

Legacy flat files at this folder root were moved to `_archive_pre_premium/` (Jul 2026).

## Agent-only hygiene

See [[strategy-dev/00-charter/cohort-hygiene]] — not surfaced in Lab UI.  
3y queue: [[strategy-dev/40-plans/sim-queue]] · [[strategy-dev/40-plans/tier0-3y-checklist]].  
1y baselines: `_archive_365d_jul2026/` (e.g. former Macro canonical note lives there).

## YAML fields (new saves)

- `strategy_family`: `prb` | `macro` | `hybrid` | `datahl` | `custom`
- `phase`: `eval` | `funded` | `combined` | `research`
- `experiment_series`: `premium365` | `hybrid-sleeve` | `macro-income` | `datahl` | `custom` — matrix grouping key
- `mc_pass_pct`, `net_pnl`, `trades`, `hypothesis`, `regimes`

## Experiment series (matrix sections)

| Series | Folder | Branches |
|---|---|---|
| Premium 365d | `eval/` + `funded/` | A0a–A1c, D1, B0–B3b |
| H · PRB × Macro sleeve | `eval/` (H0a, H1a) + `funded/` (H0b, H1b) | Hybrid_Sleeve_v0 |
| M · Macro income | `funded/` (M0, M1, M2) | Macro_Model_v2 — $400 ± BE@2R |
| X · Data H/L | `research/` | X0a |
| Custom | `research/` | custom |

## Dataview — eval leaderboard

```dataview
TABLE net_pnl, mc_pass_pct, trades, expected_accounts, scorecard_verdict
FROM "strategies/cohorts/eval"
SORT mc_pass_pct DESC
```

## Dataview — funded weekly edge

```dataview
TABLE weekly_edge_usd, net_pnl, trades_per_week, mc_pass_pct
FROM "strategies/cohorts/funded"
SORT weekly_edge_usd DESC
```

## Dataview — hybrid sleeve

```dataview
TABLE net_pnl, mc_pass_pct, trades, hypothesis
FROM "strategies/cohorts/combined"
SORT mc_pass_pct DESC
```

## Dataview — by experiment series

```dataview
TABLE experiment_series, phase, net_pnl, mc_pass_pct, created
FROM "strategies/cohorts"
WHERE file.name != "_index" AND file.name != "README"
SORT experiment_series ASC, created DESC
```

## Dataview — all cohorts by family

```dataview
TABLE phase, strategy_family, net_pnl, mc_pass_pct, created
FROM "strategies/cohorts"
WHERE file.name != "_index"
SORT created DESC
```

## Workflow

1. F4 LAB: strategy preset → upload CSV → RUN (auto-save on)
2. Cohort lands in `eval/`, `funded/`, etc. from preset phase
3. Agent updates [[strategy-dev/30-findings/findings-prb]] or [[strategy-dev/30-findings/findings-macro]]
4. Next experiment added to [[strategy-dev/40-plans/roadmap]]

## Playbooks

- [[strategy-dev/20-playbooks/eval-playbook]]
- [[strategy-dev/20-playbooks/funded-playbook]]
- [[strategy-dev/20-playbooks/hybrid-playbook]]
