---
topic: mnq-relevant-regime-variables · researched: 2026-07-20 · sources: 4 · agent-cycle: adhoc-regime-freeze
status: active
tags: [quant, regimes, dual46, frozen]
---
# MNQ-relevant regime variables — frozen top-5 (Phase-0)

**Status:** frozen for Dual46 May walk. Do **not** retune bands mid-walk.
Executable helpers: `vault-app/lib/regime-tags.ts` (see drift note below).
Hub: [[../hubs/hub-regimes]].

## Key findings

- **CLAIM → EVIDENCE path:** vol note + macro options note pre-registered measurable day tags; SaaS/NLP “war tension” without market proxies is out of scope.
- **EVIDENCE (Vault):** May vs June 2026 VIX means nearly identical (~17.2 vs ~17.1) — day-level tags matter, not month labels ([[vol-regime-dependence-setup-frequency]]).
- **Frozen set = 5 tags** used for journal logging, Stage-0 EV splits, and future regime path MC — not Dual46 lock edits.

## Frozen top-5

| # | Field | Definition (frozen) | Bands / rule |
|---|---|---|---|
| 1 | `vixPrevClose` | Prior session VIX close (never same-day close) | **&lt;16** / **16–20** / **&gt;20** → `VixBand` `lt16` \| `16-20` \| `gt20` |
| 2 | `or30ratio` | MNQ 09:30–10:00 range ÷ trailing **20-day median** of that OR | **&lt;0.75** / **0.75–1.25** / **&gt;1.25** |
| 3 | `redFolder` / `release10` | High-impact USD print overlapping Dual46 arm window | `release10` = event time in **09:50–10:10** NY; `redFolder` from calendar auto-match |
| 4 | `megaCapEarnWeek` | Mega-cap earnings that calendar week | **Y/N** if any of AAPL / MSFT / GOOGL / AMZN / META / NVDA reports Mon–Fri |
| 5 | `oilShock` | Crude shock from prior settles | **\|CL 1d %\| ≥ 3** **or** **\|CL 5d %\| ≥ 8** (`OIL_SHOCK_1D_PCT` / `OIL_SHOCK_5D_PCT`) |

### Boundary conventions (match code)

- VIX: `<16` → lt16; `16` and `20` inclusive → `16-20`; `>20` → gt20 (`vixBandFromClose`).
- OR ratio: intended terciles as above (tests expect `or30BandFromRatio`; see drift note).
- Oil: absolute percent moves; either leg fires the binary (`oilShockFromClMoves`).

## What is explicitly out

- War / geopolitics NLP scores without CL/GC/DXY/VIX proxies
- Politician-trade or Reddit alt-data as morning gates
- SaaS “risk-on/off” labels without frozen, auditable defs
- Same-day VIX close as a same-day gate (lookahead)

## Code cross-ref (`regime-tags.ts`)

| Concern | In `regime-tags.ts` today |
|---|---|
| `vixBandFromClose` / `vixBandLabel` | Yes |
| `OIL_SHOCK_*` + `oilShockFromClMoves` | Yes |
| `MEGA_CAP_TICKERS` | Yes (AAPL…NVDA) |
| `or30BandFromRatio` / `or30BandLabel` | **Missing in source** — expected by `regime-tags.test.ts` |
| `release10FromEventTimes` | **Missing in source** — expected by tests; journal uses calendar auto-match separately |

Treat this note as the **doctrine freeze**. If code drifts, either restore helpers to match this table or update this note in the same PR — never silent mid-walk retunes.

## Related notes

- [[vol-regime-dependence-setup-frequency]] — VIX + `or30ratio` rationale
- [[macro-regime-context-data-options]] — build/buy ladder; Phase-0 = $0 DIY
- [[regime-switching-monte-carlo]] — tags → Markov / frequency splits
- [[intraday-regime-detection-session-selection]]
- [[ops-news-print-microstructure-stand-down]] · [[../ict/red-folder-playbooks-1000-window]]
- [[historical-data-vs-live-markets]] · [[feature-lag-audits-data-leakage]]
- [[stationarity-era-splitting-event-studies]]

## APPLICATION TO THE VAULT

1. Log all five on every May-walk day (trade or skip) — frequency cells fill faster than WR cells.
2. Stage-0 / event-study: group EV by the same bands when CSV arrives; do not invent Deep BT numbers here.
3. Path MC: prefer regime-dependent **frequency** until each band has ≥10 trades ([[minimum-sample-size-statistical-significance]]).
4. No Dual46 Pine / freeze changes from these tags; findings → post-May backlog only.
5. Ignore optional sixth tags until Phase-0 cells are actually used.

## Sources

1. `vault-app/lib/regime-tags.ts` + `regime-tags.test.ts`
2. [[vol-regime-dependence-setup-frequency]]
3. [[macro-regime-context-data-options]]
4. Dual46 handoff: `strategy-dev/50-analyses/HANDOFF-cloud-to-local-2026-07-20.md`
