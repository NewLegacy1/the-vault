---
topic: ops-mnq-slippage-market-orders-open
researched: 2026-07-18
sources: 6
agent-cycle: cycle3-laneB
---
# MNQ Market-Order Slippage in the 9:50–10:10 ET Window: Benchmarks, the Three-Component Frame, and a Measurement Protocol

*Extends `mnq-microstructure-ny-open.md` (spread/depth profile) with the slippage-specific numbers and the implementation-shortfall measurement method. Feeds the conversion rule's real-R bookkeeping.*

## Key findings

- **CLAIM (NexusFi Academy, community-sourced medians, retail 1–5 lots, normal conditions): NQ median market-order slippage is 0.6–1.5 ticks; ES 0.5–0.8.** No MNQ-specific median is published anywhere found this cycle — MNQ inherits NQ's price ladder but has its own (thinner) book, so treat 0.6–1.5 ticks as the *floor* estimate and practitioner reports of ~1–2 ticks on MNQ in fast moves (Comborb; QuantVPS) as the working range. The distribution is fat-tailed: news windows push costs 5–10×.
- **Slippage is three separable costs, not one** (NexusFi): (1) *spread* — a marketable order pays the 1-tick RTH spread immediately; (2) *execution delay* — 0.3–0.8 s retail order-path latency during which fast tape moves 1–2 ticks; (3) *market impact* — order size consuming book levels; scales ~√size, and the risk threshold is ~10–15% of displayed best-level depth. For 10 MNQ against typical tens-to-low-hundreds per level at the open, impact is usually zero-to-one level.
- **Time-of-day matters 2–3× — and the 9:50–10:10 ET window is NOT the day's calmest.** NexusFi's session map (in CT; converted here): the first hour after the equity open (09:30–10:30 **ET**) is "elevated volatility, spreads 1.5–2 ticks" as overnight positions adjust; peak depth with 1-tick spreads arrives 10:30–11:00 ET. The Dual46 execution window (9:50–10:10 ET) sits in the *late* part of the elevated-volatility hour — better than 9:30:00–9:31:00, worse than 10:30. Slippage budget should be the fast-window number (1–2 ticks), not the mid-morning number (0–1). This slightly tightens the earlier microstructure note, which treated 09:30–11:30 as one uniform deep regime.
- **The 10:00 ET macro releases (ISM, Consumer Confidence, JOLTS, UMich, New/Pending Home Sales) land exactly inside the Dual46 window.** On release days a market/converted order at 10:00:00–10:00:30 faces the news-slippage profile (2–5 ticks on MNQ practitioner estimates; GC/CL analogues show 10–20 ticks as the tail). This is topic 55's subject; the slippage note's contribution is: the budget on 10:00-release days is 3–5× baseline.
- **Implementation shortfall is the correct house metric**: actual fill price vs the mid-price *at decision time* (not vs the limit price, not vs the last trade). It captures spread + delay + impact in one signed number and is comparable across order types. Institutional desks run automated TCA per trade; the retail version is one journal column.
- **No published MNQ-size-bucket slippage study exists** (confirmed again this cycle; matches the microstructure note's finding). Every number above is practitioner-median or inference from ES/NQ. House measurement (protocol below) supersedes all of it within ~30 trades.

## Details / mechanics

**Reference arithmetic for the conversion rule (MNQ, $0.50/tick):**

| Scenario | Ticks | $/contract | 10-lot $ | % of 1R at $150 risk |
|---|---|---|---|---|
| Baseline conversion, normal tape | 1 | $0.50 | $5 | 3.3% |
| Conservative, fast tape 9:50–10:10 | 2 | $1.00 | $10 | 6.7% |
| 10:00-release first 30 s | 3–5 | $1.50–2.50 | $15–25 | 10–17% |
| Tail (spread blowout, thin book) | 8–10 | $4–5 | $40–50 | 27–33% |

Even the tail case never approaches the +5R value of a converted winner — the fill-modeling note's "convert, almost always" verdict survives; the only regime where it needs a carve-out is the release-second cluster (topic 55).

**Measurement protocol (implementation shortfall, manual TCA):**
1. At the moment the conversion decision fires (or the market order is sent), record the **mid-price** (best bid + best ask)/2 from the DOM — this is `P_decision`. If mid is not capturable in the heat, record last-trade price and flag it.
2. Record the volume-weighted **fill price** `P_fill` from the platform's fill report (Tradovate/NinjaTrader report per-level fills for multi-level executions).
3. Shortfall in ticks = (P_fill − P_decision)/0.25, signed so adverse is positive. Log per trade with: timestamp to the second, order type (market / converted / aggressive limit), size, and whether a scheduled release was within ±120 s.
4. Weekly: median + max by bucket (normal vs release-adjacent). After ~30 events the house median replaces every number in this note.
5. Separately track **delay slippage** when measurable: price at click vs price at fill confirmation — isolates the latency component from the spread component.

**Order-type lever (NexusFi):** the *aggressive limit* — a limit placed at the current ask (buy) or bid (sell) — fills like a market order in normal tape but caps the worst case at the stated price and is cancellable if tape runs. NexusFi's community numbers: aggressive limits fill at 0.2–0.4 ticks vs 0.5–0.8 for markets on ES (40–60% better). For the Dual46 conversion rule this is strictly better than a bare market order: the conversion trigger already means price is at/near the level, so an aggressive limit 1–2 ticks through the level nearly always fills and hard-caps the tail scenario in the table above.

## APPLICATION TO THE VAULT

- **Codify the conversion order as an aggressive limit, not a market order**: convert = send limit at (level ± 2 ticks through), not "go market." Same fill probability in practice, but the 8–10-tick tail case becomes a cancel-and-reassess instead of a bad fill. One line in the execution SOP.
- **Slippage budget for the real-R bookkeeping**: charge every converted entry 1 tick expected / 2 ticks conservative in the ledger's real-R column ($5–10 per 10-lot trade); on 10:00-release days charge 4 ticks or stand down per topic 55. Do not let replay-era R (zero slippage) flow into live expectancy untouched.
- **Journal fields (extends the calibration-protocol row):** `P_decision_mid`, `P_fill_vwap`, `shortfall_ticks`, `release_within_120s` (bool). Four fields; the weekly TCA is a 10-minute pivot.
- **The 9:50–10:10 window is not the "deep calm open" — re-tag it.** The earlier microstructure note's 0–1 tick baseline applies from ~10:30 ET; the Dual46 window budget is 1–2 ticks normal, 3–5 release-adjacent. Update any EV math that assumed the 0–1 figure.
- **10-lot impact check, once, with house data**: log displayed best-level depth at each entry for a month. If 10 lots routinely exceeds ~15% of level-1 depth at 9:50–10:10, the conversion order should split (e.g. 5+5 one tick apart) — no evidence yet that this is needed; measure before engineering.

## Sources

1. NexusFi Academy — Slippage in Futures Trading (three-component framework, NQ/ES medians, implementation shortfall, time-of-day map, aggressive-limit numbers): https://nexusfi.com/a/risk-management/slippage-futures-trading
2. Comborb — MNQ vs NQ (MNQ 1–2 tick market-order slippage in fast moves; limit-order irrelevance): https://comborb.com/mnq-vs-nq
3. QuantVPS — Ticks/points on NQ & MNQ (1–2 ticks volatile-condition slippage, $/contract arithmetic): https://www.quantvps.com/blog/how-many-points-are-in-a-tick-on-nasdaq-futures
4. Damn Prop Firms — MNQ glossary (1-tick RTH spread, ADV estimates, commission drag at 10-lot): https://damnpropfirms.com/glossary/mnq-futures/
5. CME Group — Assessing Liquidity (fill-quality-vs-depth framework; ES stress benchmarks; carried over from microstructure note): https://www.cmegroup.com/education/articles-and-reports/assessing-liquidity
6. NexusFi Academy — Futures Broker Technology Infrastructure (0.3–0.8 s retail order path; delay-slippage mechanics): https://nexusfi.com/a/brokers/futures-broker-technology-infrastructure
