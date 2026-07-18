---
topic: feature-lag-audits-data-leakage · researched: 2026-07-18 · sources: 6 · agent-cycle: cycle3-laneA
---
# Feature Lag Audits & Data-Leakage Checks: Contemporaneous vs Predictive, and a Checklist for the Event-Study Pipeline

Direct follow-up to the DeltaTrend "78× collapse" (`deltatrend-quant-process-event-first-workflow.md`: reproducing Cont et al.'s order-flow-imbalance R² ≈ 63–65% *same-window*, then lagging the feature one 10-second bin — "the explanatory power collapses by 78 times"). Question: a systematic audit protocol so that leakage is caught by checklist, not by luck, in the Vault's Pine → TV-CSV → `analyze-event-study.ts` workflow.

## Key findings

- **CLAIM (definitional, consistent across sources):** look-ahead/leakage = any input to a simulated decision that was not knowable at decision time. It is "a fundamental violation of temporal causality," not one coding bug — it enters through feature construction, preprocessing scope, target alignment, execution semantics, and validation design, not just through obvious future prices.
- **CLAIM (arXiv 2026, "When Alpha Disappears"):** leakage inflation cannot be attributed by comparing two different backtests — pipelines are entangled (changing a feature changes turnover, costs, rankings). The clean method is the **one-switch benchmark**: hold data, split, model, portfolio rule, horizon, and cost convention fixed; toggle exactly one protocol element (e.g. feature lag on/off) and measure the paired performance difference. That difference *is* the leakage premium of that element.
- **CLAIM (asymmetry, hedgefundalpha):** every classical backtest error — look-ahead, survivorship, restatement joins, same-bar fills — biases results *optimistic*. "None of them make a strategy look worse than it is… treat a good-looking backtest not as evidence but as permission to investigate."
- **CLAIM (practical tests):** (1) **lag-shift sensitivity** — delay every input by one extra period; if performance craters, the edge was living in the timestamp, not the market. (2) **Same-bar audit** — a signal computed from a bar's close cannot fill inside that bar; daily signals trade next open, intraday signals trade the *next* bar (or a limit resting before the bar). (3) **Normalization scope** — z-scores/percentiles fit on the full sample leak the future's distribution into the past; fit on trailing windows only.
- **EVIDENCE (already in vault, the anchor case):** the 78× R² collapse is the cleanest demonstration on record that a *contemporaneous* correlation (feature and outcome share a window) is a statement about **price formation, not predictability**. Rule: every "contextual" feature must be computable *strictly before* the entry decision; every same-window statistic is diagnostic only.

## Details / mechanics

**Where leakage can enter the Vault's specific pipeline** (Pine strategy → TradingView "List of trades" CSV → `vault-app/scripts/analyze-event-study.ts`):

The TypeScript stage is largely leakage-proof by construction — it consumes realized fills and PnL. **The exposure is upstream in Pine** and in any feature columns later joined to the ledger:

1. Pine `calc_on_every_tick` / intrabar assumptions — a condition on `close` of the signal bar with an entry on that same bar is same-bar leakage unless bar magnifier or next-bar entry is enforced. (DeltaTrend independently banned same-bar entries off a just-formed PD array in his Powell build.)
2. `request.security()` HTF pulls without `lookahead=barmerge.lookahead_off` — the classic Pine leak: today's *unclosed* daily bar values visible intraday.
3. Levels defined by the session's own completed range (e.g. conditioning a 10:20 entry on the full 09:30–10:00 leave *is fine*; conditioning it on the 09:30–13:00 session range *is not*).
4. Join-stage leaks: tagging ledger rows with regime/vol features (topic 45's `vixPrevClose`, `or30ratio`) must use *prior-day* VIX and the *completed* opening range — both were chosen predictive-lagged for exactly this reason.
5. Restated/backfilled externals (economic calendar revisions) joined by event date rather than release timestamp.

**The checklist (run per candidate, file with the Stage-0 note):**

| # | Check | Method | Pass criterion |
|---|---|---|---|
| L1 | Feature timestamps | for each feature: latest data timestamp it uses vs decision timestamp | strictly earlier, for every feature |
| L2 | Same-bar entries | count fills on the signal bar | zero (or bar-magnifier justified) |
| L3 | HTF lookahead | grep Pine for `request.security` without `lookahead_off` | none |
| L4 | Normalization scope | any z-score/percentile fit over the full sample? | trailing-window only |
| L5 | Lag-shift test | re-run with all features lagged +1 bar | EV degrades gracefully, not catastrophically |
| L6 | One-switch attribution | if L5 craters: toggle features one at a time | identify + remove the leaking feature |
| L7 | External joins | calendar/VIX/fundamental joins keyed by release time | yes |
| L8 | Sanity bound | WR/Sharpe implausibly high (e.g. Sharpe > 3 intraday) | triggers L1–L7 re-audit before any excitement |

**Contemporaneous features have a legitimate role** — as *diagnostics*. MFE/MAE, e-ratio, same-window regime tags explain *how* trades behaved. The discipline is labeling: the Stage-0 note's feature table gets a `timing` column with values `predictive` (usable for entry conditioning) or `contemporaneous` (diagnostics only), and the assumption log (per the DeltaTrend note's convention, already adopted) records the lag of each.

## APPLICATION TO THE VAULT

1. **Adopt the L1–L8 checklist as a mandatory Stage-0 section.** One table per candidate, filed in the Stage-0 note before any EV number is quoted. Most rows take a minute; L5 (lag-shift rerun) is the only one costing a TV re-export — mark it "pending export" rather than skipping silently, per the no-invented-numbers hard stop.
2. **`analyze-event-study.ts` additions (post-May backlog, small):** (a) print a "LEAKAGE AUDIT: not yet filed / filed at <path>" banner in the report so an unaudited study is visibly unaudited; (b) when feature columns are present in the CSV, compute feature-vs-outcome correlation *twice* — as-is and lagged one event — and print both (the 78×-collapse test, automated).
3. **Dual46 replay-vs-live angle:** the replay's one-tick-candle advantage (lane B topic 52) is execution-side leakage of the same species — the replayer sees intra-bar sequencing a live trader wouldn't. Classifying it as a leakage channel means the L5 logic applies: measure the paired difference (replay fills vs pre-staged-limit fills) rather than arguing about it.
4. **Retro-audit the survivors, not the corpses.** Killed Track-B candidates are dead regardless. The gated PRB / Dual46 lineage is the one worth a one-time L1–L8 pass — value: either a clean bill (documented) or a caught leak (existential). The 10:00 KO leave and freeze-leg fib are computed from completed structures, so the prior expectation is a clean pass on L1–L3; the audit's job is to write that down as verified fact instead of folklore.
5. **Cross-link into kill-lessons:** aligrithm's four-cause OOS taxonomy (see `stationarity-era-splitting-event-studies.md`) puts leakage as cause #2 — an OOS collapse after a stellar IS should trigger the L-checklist *before* being harvested as "no edge" (the lesson written should name the actual failure).

## Sources

- "When Alpha Disappears: A One-Switch Benchmark for Decision-Time Leakage in Financial Backtests" (arXiv, 2026) — https://arxiv.org/html/2605.23959v1
- xglamdring, "Look-Ahead Bias: 7 Pitfalls & Checklist" (lag-everything rule; verification table; Sharpe>3 sanity flag) — https://xglamdring.com/what-is-look-ahead-bias/
- pfolio academy, "Look-ahead bias in backtesting" (point-in-time data; reporting lags; distinct from survivorship) — https://www.pfolio.io/academy/look-ahead-bias
- Hedge Fund Alpha, "Backtesting Mistakes That Kill Quant Strategies" (optimism asymmetry; lag-your-signals robustness test) — https://hedgefundalpha.com/education/backtesting-mistakes-kill-quant-strategies-guide/
- Bhaskar Das, "Stop Faking Your Results" (feature-engineering leaks; time-aware splits; same-day open/close misuse) — https://medium.com/algorithmic-and-quantitative-trading/stop-faking-your-results-the-most-common-backtesting-pitfalls-to-avoid-f8dd94d1ca8e
- DeltaTrend 78× collapse — `deltatrend-quant-process-event-first-workflow.md` (Cont et al. OFI reproduction)
- Cross-refs: `event-study-methodology-intraday-setups.md`, `stationarity-era-splitting-event-studies.md`, `vault-app/scripts/analyze-event-study.ts` (audited pipeline)
