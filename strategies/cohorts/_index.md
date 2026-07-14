# Lab cohort library

Monte Carlo + backtest results from **F4 LAB** auto-save here. YAML frontmatter is Dataview-queryable.

## Folder taxonomy

| Folder | Phase | Optimize for |
|---|---|---|
| `eval/` | Evaluation | `mc_pass_pct`, `expected_accounts`, consistency |
| `funded/` | Funded | Weekly edge $, expectancy, payout rate |
| `combined/` | Hybrid / portfolio | Joint MC, PRB×Macro blends |
| `research/` | Exploratory | Bias splits, one-off tests |

Legacy flat files at this folder root are still valid; new saves land in subfolders.

## YAML fields (new saves)

- `strategy_family`: `prb` | `macro` | `hybrid` | `datahl` | `custom`
- `phase`: `eval` | `funded` | `combined` | `research`
- `mc_pass_pct`, `net_pnl`, `trades`, `hypothesis`, `regimes`

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
3. Agent updates [[strategy-dev/findings-prb]] or [[strategy-dev/findings-macro]]
4. Next experiment added to [[strategy-dev/roadmap]]

## Playbooks

- [[strategy-dev/eval-playbook]]
- [[strategy-dev/funded-playbook]]
- [[strategy-dev/hybrid-playbook]]
