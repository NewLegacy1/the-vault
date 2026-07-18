---
topic: time-stops-retracement-entries · researched: 2026-07-18 · sources: 5 · agent-cycle: cycle3-laneA
---
# Time Stops for Retracement Entries: Max-Holding-Time Research vs the 13:00 Flat Rule

Carry-over of cycle-2 topic #28; companion to `mfe-mae-exit-analysis.md` (the MFE/MAE ledger this note's calibration rule consumes) and `break-even-and-trailing-stops.md` (which found BE-at-1R damages retracement entries most — time stops are the *other* commonly proposed mid-trade intervention).

## Key findings

- **CLAIM (practitioner-systematic consensus):** intraday setups have a natural edge window tied to their catalyst; a position still open far beyond that window "has exited the strategy's edge window and is now random walk exposure." Typical published windows: momentum day trades realize edge in the first 60–90 min (2-hour hard stop); mean-reversion 30–60 min (90-min stop); breakouts 90–120 min (4-hour or end-of-session stop). Consensus default for day trades: **90–120 min max hold**, always with a separate end-of-session force-flat.
- **CLAIM (calibration rule, two independent sources):** set max hold ≈ **2× the median time from entry to peak MFE of historical winners**. "Any trade still open at 2× the median time-to-peak is likely a failed setup, not a delayed winner." This makes the time stop a *derived* statistic of the MFE ledger, not a new free parameter.
- **EVIDENCE (largest published sweep found, KJ Trading, 567,000 backtests across markets/bar sizes):** time-based exits were **worse than stop-and-reverse exits in every market sector and at every parameter value tested**; very short time exits (5 bars) were much worse than long ones (45 bars). Author's conclusion: time exits "many times… just add system complexity without adding any real value." Caveats: entries were generic (channel/momentum), most configs lost money overall, and the comparison is vs stop-and-reverse (not vs fixed-target brackets) — directional lesson only: **time stops are not a free lunch, and short ones actively destroy value**.
- **EVIDENCE (Concretum Group, intraday trend on SOXX, 4 exit policies, 2,406+ trades):** all four exits profitable (Sharpe 0.92–1.16); holding to session end gave the *highest* per-trade return (6.8 bps) at the cost of the deepest intra-trade adverse excursion (−89 bps). Pattern: patient exits monetize more; the price is sitting through drawdown — the same trade-off `break-even-and-trailing-stops.md` found for price-based tightening.
- **CLAIM (asymmetry warning):** the retail failure mode is asymmetric holding — winners cut at ~12 min, losers nursed for ~47 min (illustrative numbers from one journaling guide). A time stop, if used, must be **symmetric** (same clock for winners and losers) or it just codifies loss-aversion.
- **Net reading for retracement entries specifically:** a limit fill in OTE is a *reversion-to-trend* entry whose thesis (the leg resumes) either activates within the impulse's rhythm or doesn't. The literature's honest summary: time stops protect attention/capital and cap stale-trade risk, but the measured EV effect ranges from mildly negative (KJ sweep) to neutral; the only quantified positive case is cutting trades that exceed 2× median time-to-peak — i.e., a *long* time stop calibrated from data, never a short one.

## Details / mechanics

**Dual46's existing time structure (audit, nothing new proposed):** entries arm after the 10:00 key-open leave; the 13:00 flat rule already caps holding at ~3 hours and is a hard session time stop of exactly the kind every source recommends for prop accounts (overnight and afternoon-regime exposure are structurally excluded). So the open question is narrower than the literature's: *is there value in an intra-window time stop tighter than 13:00?*

**How to answer it with data already being logged (no new fields needed beyond MFE/MAE timestamps):**

1. From the June+May ledger, record for each trade: entry time, time-to-peak-MFE (winners), time-to-stop/target/13:00 (all trades).
2. Compute median time-to-peak of winners → the candidate time stop is 2× that. If 2× median lands at or beyond 13:00, the flat rule already *is* the correctly-calibrated time stop and the question closes with a documented answer.
3. Counterfactual replay: apply the candidate stop to the ledger — count trades that would have been cut, and their actual outcomes. With ~15 trades/month, expect this table to stay inconclusive for several months (per `minimum-sample-size-statistical-significance.md`); log it anyway so the sample accumulates with zero marginal effort.

**Prior expectation (stated to avoid hindsight bias later):** for a 65–70% WR system with fixed bracket exits, most trades resolve at target or stop well before 13:00; the time-stop question likely touches only the minority of "limbo" trades that drift sideways. The KJ result predicts cutting them early is net-negative or neutral; the tradewink 2×-median rule predicts a *long* stop might rescue a few points of dead-capital. Either way the effect size is likely small — this is a low-priority backlog item, researched here mainly to close the queue question with evidence.

## APPLICATION TO THE VAULT

1. **No change to Dual46 — and specifically, do not add an intra-window time stop.** The freeze aside, the best large-sample evidence says time exits underperform, and short ones badly. The 13:00 flat rule already implements the defensible version (end-of-session force-flat).
2. **May-walk logging addition (cheap, immediate):** timestamp entry, peak-MFE, and exit for every trade — three timestamps per row. This makes the 2×-median calibration computable for free at month-end and extends the MFE/MAE ledger spec in `mfe-mae-exit-analysis.md` with the time axis it currently lacks.
3. **Month-end harvest line:** report median time-to-peak (winners), median time-to-stop (losers), and count of trades still open at 12:30. If the loser median substantially exceeds the winner median, that is the asymmetric-holding signature worth knowing about — in a *mechanical* system it would instead indicate the stop distance, not psychology, and would be a post-May geometry observation.
4. **For candidate sleeves (NWOG etc.):** Stage-0 event studies should report the time-to-peak-MFE distribution alongside EV, and any proposed time stop must be ≥ 2× median time-to-peak, symmetric, and counted as a free parameter in the multiple-testing budget (topic 51 note). A sleeve that needs a *short* time stop to show positive EV is curve-fit by the KJ evidence.
5. **Closes queue question #28/46:** verdict — the 13:00 flat rule is likely the whole answer for Dual46; the residual question is empirical and now has a zero-cost measurement path.

## Sources

- Tradewink glossary, "Time decay exit" (edge windows by setup type; 2× median time-to-peak rule; 90–120 min day-trade default) — https://www.tradewink.com/glossary/time-decay-exit
- Traders Second Brain, "Trade Hold Time Analysis" (hold-range table; symmetric-application warning; prop-firm session flat) — https://traderssecondbrain.com/guides/trade-hold-time-analysis
- KJ Trading Systems, "What 567,000 Backtests Taught Me About Algo Trading Exits" (time exits vs stop-and-reverse, all sectors/bar sizes) — https://kjtradingsystems.com/algo-trading-exits.html
- Concretum Group, "How to Manage an Intraday Trend Trade" (four exit policies on SOXX; patience vs intra-trade drawdown trade-off) — https://concretumgroup.substack.com/p/how-to-manage-an-intraday-trend-trade
- The Paper Trading Journal, 59-trade exit case study (test one exit variable at a time; journal-as-database method) — https://papertradingjournal.com/2026/07/12/how-to-improve-trading-exit-strategy/
- Cross-refs: `mfe-mae-exit-analysis.md`, `break-even-and-trailing-stops.md`, `minimum-sample-size-statistical-significance.md`
