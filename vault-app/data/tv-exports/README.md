# TradingView PRB exports

## `prb-ytd-2026-07-13/`

40 chunk CSVs from Downloads (`PRB_v1_CME_MINI_MNQ1!_2026-07-13*.csv`), imported 2026-07-14.

## Merged outputs

| File | Description |
|------|-------------|
| `prb-ytd-merged.csv` | Clean ledger: 1 trade/day after dedupe (PRB max 1/day) |
| `prb-ytd-mc-report.json` | Stats + TPT $50K Monte Carlo + consistency check |

## `macro-v1-ce-confirm-2026-07-14/`

11 chunk CSVs (Macro v1 CE confirm, MNQ), imported 2026-07-14.

| File | Description |
|------|-------------|
| `macro-v1-ce-confirm-merged.csv` | Clean ledger: 1 trade/day after dedupe |
| `macro-v1-ce-confirm-mc-report.json` | Stats + TPT $50K Monte Carlo |

Re-run: `npx tsx scripts/merge-macro-mc.ts`

Re-run: `npx tsx scripts/merge-and-mc.ts`

## Dedupe rules

1. Drop identical `date + pnl` across overlapping chunk exports (307 dupes).
2. **One trade per calendar day** when same day has conflicting P&L (41 collisions) — prefer vault seed match, else full win/loss over scratch.

Raw naive merge was **149 trades / +$55k** (inflated). Clean merge is **108 trades / +$13.2k**.

Seed cross-check (Dec 9 2025 – Jul 1 2026): **37/37 matched** `prb-data.ts`.
