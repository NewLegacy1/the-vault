# Lab cohorts

Monte Carlo + backtest results saved from **F4 LAB** appear here automatically.

Each file has YAML frontmatter for Obsidian search and Dataview queries.

## A/B workflow

1. Run variant in TradingView bar replay → export CSV
2. Upload to Lab → RUN Monte Carlo
3. Tag variant + regime → **Save to Obsidian**
4. Compare `mc_pass_pct` and `net_pnl` across files
5. Promote winner only after forward-test confirmation

## Regime tags (suggested)

- `runner` — trend months, BE-only shines
- `give-back` — pop-and-fade, trail toggle candidate
- `chop` — low-quality setups dominate
- `news` — CPI/FOMC/tariff weeks
- `baseline` — locked live config reference

## Dataview example

\`\`\`dataview
TABLE net_pnl, mc_pass_pct, trades, regimes
FROM "strategies/cohorts"
SORT created DESC
\`\`\`
