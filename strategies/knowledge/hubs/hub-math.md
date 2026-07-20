---
updated: 2026-07-20
tags: [knowledge, hub, moc, math]
---
# Hub — Math & validation

Expectancy, sample size, path MC, sizing, leakage, benchmarks.
Executable: `vault-app/lib/monte-carlo.ts` · scripts under `vault-app/scripts/`.

## Start here

1. [[../quant/expectancy-math-wr-rr-capped-payoffs]] — WR/RR → EV under capped payoffs
2. [[../quant/monte-carlo-prop-firm-survival]] · [[../quant/regime-switching-monte-carlo]] — path questions
3. [[../quant/position-sizing-under-trailing-drawdown]] — trail-compatible size
4. [[../quant/vault-model-builder-architecture]] — where math sits in the product spine

## Sizing & survival

- [[../quant/position-sizing-under-trailing-drawdown]]
- [[../quant/losing-streak-math]]
- [[../quant/daily-loss-limits-circuit-breakers]]
- [[../quant/small-sample-drawdown-inference]]
- [[../quant/eval-timeout-fee-drag-modeling]]

## Path MC / prop

- [[../quant/monte-carlo-prop-firm-survival]]
- [[../quant/regime-switching-monte-carlo]]
- [[../quant/deltatrend-monte-carlo-markov-prop-convexity]]
- [[../quant/prop-firm-landscape-2026]]

## Expectancy & exits

- [[../quant/expectancy-math-wr-rr-capped-payoffs]]
- [[../quant/mfe-mae-exit-analysis]]
- [[../quant/break-even-and-trailing-stops]]
- [[../quant/time-stops-retracement-entries]]
- [[../quant/stop-placement-fixed-structure-volatility]]

## Sample size · significance · selection

- [[../quant/minimum-sample-size-statistical-significance]]
- [[../quant/bayesian-beta-binomial-win-rate-updating]]
- [[../quant/multiple-testing-selection-bias-sleeves]]
- [[../quant/benchmark-discipline-naive-baselines]]

## Validation hygiene

- [[../quant/walk-forward-testing-overfitting-prevention]]
- [[../quant/stationarity-era-splitting-event-studies]]
- [[../quant/feature-lag-audits-data-leakage]]
- [[../quant/event-study-methodology-intraday-setups]]
- [[../quant/historical-data-vs-live-markets]]
- [[../quant/stage-0-scorecard-surface]] — Stage-0 closeout checklist (EV±CI · L-checklist · baselines · k-rule · path MC gate)

## Hierarchy (never invert)

Path MC / `E[$/wk]` → trade EV±CI → geometry diagnostics only.
See `strategy-dev/00-charter/SCORECARD.md`.
