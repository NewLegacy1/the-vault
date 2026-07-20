---
updated: 2026-07-20
tags: [knowledge, hub, moc, regimes]
---
# Hub — Regimes & day tags

Frozen measurable day tags for Dual46 May walk + Stage-0 / path-MC splits.
**Do not retune bands mid-walk.** Code: `vault-app/lib/regime-tags.ts`.

## Start here

1. [[../quant/mnq-relevant-regime-variables]] — **frozen top-5** (canonical)
2. [[../quant/vol-regime-dependence-setup-frequency]] — VIX bands + `or30ratio` rationale
3. [[../quant/macro-regime-context-data-options]] — build/buy ladder; no NLP war scores
4. [[../quant/regime-switching-monte-carlo]] — how tags feed path MC

## Frozen tags (Phase-0)

| Tag | Note |
|---|---|
| `vixPrevClose` bands | [[../quant/mnq-relevant-regime-variables]] · [[../quant/vol-regime-dependence-setup-frequency]] |
| `or30ratio` bands | same |
| `redFolder` / `release10` | [[../ict/red-folder-playbooks-1000-window]] · [[../quant/ops-news-print-microstructure-stand-down]] |
| `megaCapEarnWeek` | [[../quant/macro-regime-context-data-options]] |
| `oilShock` | [[../quant/mnq-relevant-regime-variables]] (`regime-tags.ts`) |

## Detection & session

- [[../quant/intraday-regime-detection-session-selection]]
- [[../quant/mnq-microstructure-ny-open]]
- [[../quant/contract-rolls-session-gotchas]]
- [[../quant/historical-data-vs-live-markets]]

## Era / stationarity

- [[../quant/stationarity-era-splitting-event-studies]]
- [[../quant/walk-forward-testing-overfitting-prevention]]

## Ignore (by design)

War NLP scores, politician-trade feeds, SaaS “risk-on” labels without frozen defs.
