# The Vault — Futures Prop Terminal

Bloomberg-terminal-style operations hub for the Powell Rejection Block strategy and futures prop-firm trading.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## Pages

| Tab | Purpose |
|-----|---------|
| F1 TODAY | Morning checklist (from `strategies/PRB_Trade_Checklist.md`), active account snapshot, locked config strip |
| F2 ACCOUNTS | Prop account tracker: fee/payout ledger, per-account trading P&L, DD headroom, total net cash P&L |
| F3 STRATEGY | Locked PRB v1 config, A/B graveyard, changelog, experiment profile with TradingView sync diff |
| F4 LAB | Monte Carlo prop-pass simulator: bootstrap real trade P&L vs firm trailing-DD rules, equity fan chart, TV CSV upload |
| F5 JOURNAL | Forward-test log (trades + skips), give-back counter for the trail regime toggle |

## Data

Everything persists in browser `localStorage` (no backend). Seed backtest data lives in `lib/prb-data.ts`;
prop firm rules in `lib/prop-firms.ts` (TPT verified from own guardrails, other firms marked "verify").
