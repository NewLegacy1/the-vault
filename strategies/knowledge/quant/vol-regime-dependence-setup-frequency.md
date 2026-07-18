---
topic: vol-regime-dependence-setup-frequency · researched: 2026-07-18 · sources: 6 · agent-cycle: cycle3-laneA
---
# Vol-Regime Dependence: VIX vs Intraday Setup Frequency/Quality, and the Actual May-vs-June 2026 Backdrop

Carry-over of cycle-2 topic #32. Two questions: (a) what does published work say about vol regimes changing intraday setup frequency/quality, (b) what the May-2026 vs June-2026 vol backdrop *actually* was (real data, not vibes). Supplies the empirical input for the regime-MC machinery in `regime-switching-monte-carlo.md`.

## Key findings

- **EVIDENCE (real data, Cboe/Yahoo/YCharts daily closes):** the May-vs-June 2026 contrast is **not** a monthly-mean vol story — the means are nearly identical — it is a **vol-of-vol story**:
  - **May 2026:** 21 sessions, closes 15.32–18.43, mean ≈ **17.2**, monotonic-ish decline all month; closed May 29 at **15.32**, which Cboe's own monthly review called "among the lowest levels observed year-to-date." Smooth, calm, compressing.
  - **June 2026:** 22 sessions, closes 15.40–22.22, mean ≈ **17.1** — but with two distinct spike clusters: **Jun 5 (21.51) → Jun 10 (22.22) → Jun 11 (19.44)**, and **Jun 23–26 (19.49 / 18.63 / 18.89 / 18.41)**, plus single-day jumps of +12.4% (Jun 17) and +12.8% (Jun 23). Choppy, expanding-contracting.
  - Neither month entered the conventional "high-vol" band (VIX > 24); both lived in the 15–22 "normal" corridor. July so far (through Jul 17) is back to the 15–18 range.
- **CLAIM (practitioner consensus, multiple sources):** the standard regime taxonomy is roughly VIX < 16 = low vol (persistent trends, shallow intraday reversals, breakouts follow through, mean-reversion starves), 16–24 = normal, > 24–30 = high/crisis (mean reversion dominates, breakouts fail, ranges explode). One two-year practitioner backtest quantified the flip: momentum +2.1%/mo in low vol vs −0.8% in high vol; mean reversion +0.6% vs +2.4%. Direction is well-attested; the specific numbers are one shop's backtest — treat as illustrative, not importable.
- **CLAIM (CFA Institute research brief, 1990–2019 baseline):** long-run VIX median 17.2, mean 19.1. So both May and June 2026 sat almost exactly *at the historical median* — the "regime" distinctions that matter for the Vault are intra-month day-level spikes, not month-level labels.
- **EVIDENCE (already in vault, third-party):** DeltaTrend's optimizer-found regime filter cut his Powell build's OOS max drawdown from ≈ −$16k to ≈ −$2k — the strongest available datapoint that a single regime gate can transform a marginal intraday system (`deltatrend-guru-quantification-powell-detail.md` §6, with caveats).
- **Mechanism relevant to Dual46 specifically (reasoned, not sourced):** a retracement-entry system with a fixed 100-pt cap has *asymmetric* vol exposure. Higher vol → deeper 10:00 leaves and bigger freeze legs → OTE zones further away, stops wider in points, and the 100-pt cap binds more often (truncating exactly the paydays that fund the 1:5 shape). Lower vol → legs too small to reach OTE or clear the cap meaningfully. Plausibly there is a *goldilocks band* of realized range for setup quality — this is a testable hypothesis, not a finding.

## Details / mechanics

**Recommended regime tagger for the Vault ledger (pre-registered, no sweeping):**

- Day-level tag from two inputs: (1) VIX close of the *prior* day (predictive, avoids leakage — see `feature-lag-audits-data-leakage.md`), banded < 16 / 16–20 / > 20 (the 16–24 "normal" band split at 20 because 2026's action lives inside it); (2) MNQ 09:30–10:00 realized range as a fraction of its trailing 20-day median — the instrument-local vol measure that matters for a 10:00 setup.
- Log both tags per ledger row in the May-walk journal. Two tags, no free parameters beyond the pre-registered bands.

**What to measure once tagged (setup frequency vs quality separately):**

| Metric | Question |
|---|---|
| valid-setup days / regime days | does frequency depend on vol? |
| WR by regime band | does quality? |
| avg MFE (pts) and cap-hit rate by band | does the 100-pt cap bind in high vol? |
| stop distance (pts) by band | does risk-per-trade scale with vol? |

With ~15 trades/month these cells will be thin for a long time — report counts, not percentages, until a band has ≥ 10 trades (per `minimum-sample-size-statistical-significance.md`). The *frequency* rows fill faster than the WR rows because every session contributes a row, trade or no trade.

**June sample-interpretation note:** the June replay ledger spans both June's quiet days and its two spike clusters (Jun 5–11, Jun 23–26). Any June trades falling on the spike days should be flagged now, while the ledger is fresh — they are the only high-band observations the Vault owns.

## APPLICATION TO THE VAULT

1. **Kill the "May was a different vol month" narrative preemptively.** May mean VIX 17.2 vs June 17.1 — if May-walk results differ from June replay results, monthly vol backdrop is *not* an available excuse. The honest regime variable is day-level (prior-day VIX band + opening-range ratio), and it must be logged from day one of the May walk.
2. **May-walk logging change (concrete, immediate):** add two columns to the walk ledger — `vixPrevClose` and `or30ratio` (09:30–10:00 range ÷ 20-day median). Zero code needed; both are 30 seconds of manual lookup per day, or scriptable later.
3. **Feeds the regime MC (topic 42):** the transition matrix should be estimated from the *daily VIX-band series* over 2024–2026 (hundreds of transitions), while the per-regime trade distributions come from the tagged ledger — the decoupling trick. Until ledger cells have ≥10 trades each, run the regime MC with pooled outcome distributions and regime-dependent *frequency* only (frequency is estimable from setup-scan data long before WR is).
4. **No trading rule changes.** The taxonomy's "stand down above VIX 24" instinct is not a Dual46 rule and must not become one via the back door — Dual46 is frozen. If the tagged data eventually shows a regime with materially negative expectancy, that goes to the post-May backlog as a Stage-0-style question with its own note.
5. **Event-study script hook:** `analyze-event-study.ts` output should group event EV by the same two regime tags whenever a Track-B CSV arrives — the ES-sweep era lesson (significant 2023, dead pooled) suggests some Vault candidates live or die by regime, and the tags make that visible at Stage-0 instead of post-mortem (ties to `stationarity-era-splitting-event-studies.md`).

## Sources

- Daily VIX closes May–July 2026 — Yahoo Finance ^VIX history (https://finance.yahoo.com/quote/%5EVIX/history/), YCharts VIX daily (https://ycharts.com/indicators/vix_volatility_index), FRED VIXCLS (https://fred.stlouisfed.org/series/VIXCLS)
- Cboe, "Index Insights: May 2026" (VIX ended May at 15.32, near YTD low) — https://www.cboe.com/insights/posts/index-insights-may-2026
- Moran, "The VIX Index and Volatility-Based Global Indexes and Trading Instruments," CFA Institute Research Foundation brief (1990–2019 median 17.2 / mean 19.1) — https://rpc.cfainstitute.org/sites/default/files/-/media/documents/article/rf-brief/rfbr-moran-vix-volatility.pdf
- Regime taxonomy & strategy-by-regime backtests (practitioner sources; illustrative) — https://volatilitybox.com/research/volatility-regimes-explained/ ; https://algos.pro/posts/2026-01-16-volatility-regime-detection-switching-strategies/
- Cross-refs: `regime-switching-monte-carlo.md`, `intraday-regime-detection-session-selection.md`, `deltatrend-guru-quantification-powell-detail.md` (regime-filter OOS result), `minimum-sample-size-statistical-significance.md`
