# Morningstar Path B — OHLC fixture bars

Local replay harness: `npx tsx scripts/morningstar-pathb-replay.ts` (from `vault-app/`).

## Files

| File | Role |
|---|---|
| `mnq-1m-fixture-synthetic.csv` | **Committed synthetic** Jul 16–17 scenarios (harness always runs). |
| `mnq-1m-2026-07-15-17.csv` | Optional real TV export — if present, harness also validates against it (warn-only until expect times are calibrated). |

5m bars are aggregated from 1m inside the harness (no separate 5m file required).

## One-time real export (optional, preferred for live parity)

1. TradingView → chart **MNQ1!** (or CME_MINI:MNQ1!) · timeframe **1 minute**.
2. Scroll so visible range covers **2026-07-15 09:00 → 2026-07-17 16:00 America/New_York**.
3. Chart menu → **Export chart data…** → include time, open, high, low, close, volume.
4. Save as:
   `vault-app/data/tv-exports/morningstar-bars/mnq-1m-2026-07-15-17.csv`
5. Re-run: `npx tsx scripts/morningstar-pathb-replay.ts`

### Expected columns

```text
time,open,high,low,close,volume
```

TV may emit `Unix` / `Date` / `;` separators — the harness normalizes common variants.

## Spec lock (teaching RB)

- Wick ≥ min pts · wick ≥ N× body · confirming close  
- **Plus** liquidity take-out: bull `low < lowest(prior N lows)`; bear mirror  
- Soft / looser quality is forbidden  
