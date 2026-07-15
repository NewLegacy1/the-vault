---
updated: 2026-07-15
tags: [permutation, overfitting, strategy-dev]
---
# Price-permutation tests vs Lab prop MC

> Two different Monte Carlos. Do not conflate.

## Comparison

| Family | Resamples | Question | Vault |
|---|---|---|---|
| **Prop path MC** (F4 Lab) | Historical **trade PnLs** (week/trade bootstrap) | Pass/bust/timeout / `E[$/wk]` under firm barriers | `lib/monte-carlo.ts` |
| **Price-permutation MC** | **OHLC bar paths**, then re-optimize | Was IS/WF excellence mostly data mining? | `lib/permute-bars.ts` + scripts below |

Prop MC remains **promotion economics**. Price-perm gates **research entry** for optimizable edges.

## Four-gate flow

1. In-sample excellence (not obviously overfit)  
2. **IS price-permutation** → quasi-p  
3. Walk-forward (reoptimize on train, evaluate future)  
4. **WF price-permutation** (permute only after first train fold)

Do **not** burn OOS / Lab OOS narrative until IS-perm passes.

## Quasi-p

```text
quasi_p = (# permutations with objective ≥ real objective) / N
```

Guidance (measures, not fiddled targets): IS ≈ p < 1% with N ≥ ~1000 when feasible; WF more lenient on short horizons (~5% on ~1y, ~1% on ≥2y). Prefer parameter **plateaus** over peaky lookback champions.

## Scripts

```bash
cd vault-app
npx tsx scripts/analyze-is-permutation.ts          # Donchian demo on synthetic OHLC
npx tsx scripts/analyze-walkforward-permutation.ts
npx tsx scripts/analyze-event-study.ts             # ledger Event EV + CI
```

## Locked PRB v1

Exempt from re-optimize permutation loops (no free param search). Still subject to OOS / decay scorecard hygiene.

## References

- Timothy Masters — *Permutation and Randomization Tests for Trading System Development*  
- Bar-level position × forward returns — *Testing and Tuning Market Trading Systems*
