---
topic: ops-data-feed-discrepancies-tv-vs-execution
researched: 2026-07-18
sources: 6
agent-cycle: cycle3-laneB
---
# Data-Feed Discrepancies: TradingView Charting vs Tradovate/Rithmic Execution Prints on MNQ — Risk to a Wick-Anchored 1m Limit Strategy

*New execution-reality note. Dual46's entry level is defined off a 1-minute rejection-block wick on TradingView; the order will rest on a different vendor's feed. If the two disagree by a tick, the "limit at the wick extreme" is at the wrong price by construction.*

## Key findings

- **CLAIM (NinjaTrader official support, generic but authoritative): "no data stream is 100% identical."** Vendors differ in tick filtering, throttling, and timestamping; "different data feeds produce different charts... two traders on different data feeds will have minor differences when plotting the same market and time interval" — and discrepancies can occur *even on the same provider* when real-time data lacks native timestamps. This is the vendor-side admission that 1m OHLC equality across feeds is not guaranteed.
- **EVIDENCE (Tradovate forum, tick-level worked example on ES): a user building 5m candles from Tradovate's raw stream found his OPEN consistently ~1 tick off ThinkOrSwim's** — Tradovate's stream contained real ticks in the first second that ToS's aggregated feed dropped. Mechanism identified in-thread: aggregation policy (per-tick delivery vs periodic snapshots) + different upstream sources. The highs/lows "should" match but "may be at different levels due to data discrepancies." This is the exact failure class for a wick-anchored strategy: **bar-boundary and extreme prints are where feeds disagree most**, because they hinge on which single tick a vendor includes and how it stamps the bar boundary.
- **Aggregation architecture is the systematic cause, not random noise.** Rithmic transmits every transaction tick-by-tick; CQG (and browser/cloud delivery layers) aggregate into snapshots; TradingView's chart is a rendering of its own CME feed with its own bar-building rules. Snapshot aggregation can miss the single extreme tick of a wick (it existed for milliseconds between snapshots) → **the wick on the execution feed can be 1 tick shorter or longer than the TradingView wick.** For cumulative-delta/footprint work the gap is "significant" (order-flow sources); for OHLC candles it is occasional and tick-sized.
- **Timestamp skew shifts ticks across 1-minute boundaries.** A trade printed at :59.998 vs :00.001 lands in different bars on different vendors (the ToS example showed exactly this — ticks before the :01 mark present in one feed's bar, absent from the other's). For Dual46 this can change *which bar* is the rejection block, not just the wick price — rarer but worse than a 1-tick wick difference.
- **No published frequency statistic exists for "how often do 1m OHLC prints differ between TradingView and Tradovate/Rithmic on MNQ."** No vendor publishes cross-feed OHLC agreement rates; the forum evidence is existence-proof, not a rate. Measurement protocol below. Practitioner consensus for liquid CME hours: differences are occasional and ±1 tick, clustering at fast tape and bar boundaries — precisely the RB-formation seconds Dual46 cares about.
- **One structural comfort: the fill itself is not ambiguous.** The order rests at CME; the matching engine's prints are the truth; the discrepancy risk is confined to (a) *level definition* (the wick you measured on TV isn't the wick the execution feed saw) and (b) *post-hoc scoring* (did price "touch" the level?). CME's own time-and-sales (via the execution platform) is the arbitration source, not TradingView.

## Details / mechanics

**Where the risk concentrates for Dual46, ranked:**
1. *Wick-extreme definition (±1 tick):* the RB wick low/high on TV may differ 1 tick from the execution feed's. A limit priced off the TV wick may rest 1 tick beyond (never touched on the execution feed → phantom "missed fill") or 1 tick inside (fills "early"). At 20–30 pt stops, 1 tick = ~0.8–1.25% of R — economically small, but it contaminates the fill-rate calibration metric if unrecognized.
2. *Bar-boundary tick migration:* changes RB identification in edge cases where the rejection prints in the boundary second. Detectable in EOD review as "TV shows the signal bar, platform doesn't (or vice versa)."
3. *Trade-through scoring:* the journal rule "fill counts if price traded ≥1 tick beyond the limit" must be scored on the **execution feed's** time-and-sales, not the TV chart — otherwise the calibration data inherits TV's bar-building.
4. *Continuous-contract vs specific-month:* TV's MNQ1! applies its own roll/back-adjust logic; the order rests on the actual front month (e.g. MNQU2026). Around roll week the two can differ by the roll gap — chart the specific contract, not 1!, from live-sim day one (extends `contract-rolls-session-gotchas.md`).

**Measurement protocol (house data, ~1 week of effort spread over a month):**
- Each live-sim session, at EOD, export or eyeball the 09:45–10:15 window's 1m OHLC from both TradingView and the execution platform (Tradovate/NinjaTrader both expose bar data; 30 bars/day).
- Count per session: bars with any OHLC field differing (`n_diff`), max difference in ticks, and specifically whether the *signal bar's wick extreme* differed.
- After 20 sessions (~600 bars) the house agreement rate exists. Decision rule: if signal-bar wick disagreement >5% of setups, price the limit off the execution platform's chart instead of TV's (or 1 tick inside the TV wick, which dominates both feeds' readings).
- Free instant check: Tradovate's TradingView integration means the TV chart *with Tradovate data connection* shows the execution feed — compare TV-native vs TV-Tradovate-connected symbols side by side without exports.

**The 1-tick-inside placement doubles as feed insurance.** The fill-modeling note already floated placing the limit 1 tick inside the wick extreme for queue reasons; feed discrepancy adds a second argument: a limit 1 tick inside the TV wick is at-or-beyond the true extreme on either feed's reading in almost all disagreement cases. Post-May backlog item, not a freeze change.

## APPLICATION TO THE VAULT

- **Chart the specific front-month contract (MNQU2026 etc.), not MNQ1!, once live-sim starts** — eliminates roll-logic divergence, costs nothing.
- **When executing via Tradovate: use the TradingView-with-Tradovate-connection chart for level definition.** Same charts, same workflow, but the wick you measure is the wick your order's venue feed prints. This dissolves most of the discrepancy risk without changing any Dual46 rule.
- **Score fills and trade-throughs from the execution platform's time-and-sales, never from the TV bar** — one line in the calibration SOP; protects metrics 3–4 of the calibration sheet from feed contamination.
- **Journal field:** `feed_diff` (bool + ticks) on any trade where EOD review shows the signal-bar wick differing between feeds. Feeds the >5% decision rule above.
- **Don't over-engineer:** the discrepancy is ±1 tick and occasional; Rithmic-grade tick data is not needed for a bar-close strategy. The two zero-cost mitigations (specific contract + Tradovate-connected TV chart) plus the journal field cover the entire exposure.

## Sources

1. NinjaTrader Support Forum + official help guide — Discrepancies Between Different Data Feeds (vendor filtering/throttling/timestamping; same-provider caveat): https://forum.ninjatrader.com/forum/ninjatrader-8/platform-technical-support-aa/1157170-prices-in-trading-view-do-not-match-those-in-ninja-trader-8
2. Tradovate Community Forum — Tick-stream discrepancy between Tradovate and ToS (worked ES example: open ~1 tick off, extra boundary ticks, aggregation cause): https://community.tradovate.com/t/why-is-there-a-tick-stream-discrepancy-between-tradovate-and-tos/2630
3. El Trader Financiado — Rithmic Tutorial 2026 (tick-by-tick vs snapshot aggregation; CQG/Rithmic delta discrepancies; platform-feed mapping): https://www.eltraderfinanciado.com/en/blog/rithmic-tutorial
4. Apex Trader Funding — Rithmic vs Tradovate (MBO vs MBP; browser rendering delay 50–100 ms during fast markets): https://apextraderfunding.com/resources/day-trading/rithmic-vs-tradovate/
5. proptradingvibes — Rithmic vs Tradovate (TradingView connects only to Tradovate for futures as of Mar 2026; fill-quality anecdotes during CPI): https://proptradingvibes.com/blog/rithmic-vs-tradovate
6. Vault notes — `limit-order-fill-modeling-queue-position.md` (1-tick-inside placement), `contract-rolls-session-gotchas.md` (roll weeks): internal
