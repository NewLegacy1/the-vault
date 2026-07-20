---
updated: 2026-07-20
tags: [knowledge, hub, moc, stage0]
---
# Hub — Stage-0 & R&D ops

Thin pointer into `strategies/strategy-dev/`. Knowledge informs; charter + scorecard decide.

## Start here (strategy-dev)

1. `strategy-dev/00-charter/STRATEGY_DEV_AGENT` — promotion rule
2. `strategy-dev/00-charter/SCORECARD` — toward / away / kill
3. `strategy-dev/00-charter/RESEARCH_AGENT_LOOP` — one-cycle protocol
4. `strategy-dev/50-analyses/kill-lessons-track-b` — hard constraints before any idea
5. `strategy-dev/_index` — full MOC

## Knowledge that feeds Stage-0

- [[../quant/event-study-methodology-intraday-setups]]
- [[../quant/feature-lag-audits-data-leakage]]
- [[../quant/benchmark-discipline-naive-baselines]]
- [[../quant/multiple-testing-selection-bias-sleeves]]
- [[../quant/stationarity-era-splitting-event-studies]]
- [[../quant/deltatrend-quant-process-event-first-workflow]]
- [[../quant/vault-model-builder-architecture]] — spine idea→ES→EV±CI→path MC

## Regime splits at Stage-0

- [[../quant/mnq-relevant-regime-variables]]
- [[hub-regimes]]

## Hard stops (do not violate)

- Never edit `pine/Powell_Rejection_Block_v1.pine`
- Never reopen killed Track B (ORBreak, ERXor, MPSF) via param retune
- Never Lab-promote without Stage-0 **toward** + path MC `E[$/wk]`
- Never invent Deep Backtest numbers — ask for CSV or stop at “waiting for export”
- One open Stage-0 candidate at a time

## Parked products (not Stage-0 now)

- JJ Fair-Value: stub [[../quant/jj-simon-fair-value-930-strategy]] → [[../archive/parked/jj-simon-fair-value-930-strategy]]
