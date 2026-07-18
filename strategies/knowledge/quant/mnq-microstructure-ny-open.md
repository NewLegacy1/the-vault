---
topic: mnq-microstructure-ny-open
researched: 2026-07-17
sources: 8
agent-cycle: cycle2-wave1
---
# MNQ Microstructure at the NY Open: Spread, Depth, and Slippage for 8–15 Lot Orders

## Key findings

- **09:30–11:30 ET is MNQ's deepest window: ~70% of daily volume prints in the US open + first two hours.** Spread sits at 1 tick (0.25 pt = $0.50) essentially continuously through RTH; 2-tick spreads appear overnight and in news spikes, not in the ordinary open (Damn Prop Firms liquidity glossary; PropScorer; Comborb). Practitioner consensus, directionally reliable.
- **MNQ average daily volume is on the order of 1–1.8M contracts (sources range 250k–500k "active session" to ~1.5M avg); NQ ~700k.** In *notional* terms NQ still carries ~4–7× the liquidity (10:1 contract ratio). Numbers vary by source and month — treat all ADV figures as approximate and **verify against CME volume data before quoting**. Flagged as soft.
- **For 8–15 contract market orders during 09:30–10:30 RTH, expect 0–1 tick slippage in normal conditions, 2–5 ticks in the seconds after scheduled news (CPI/FOMC) or in the opening-rotation burst at 09:30:00–09:30:30** (TraderVerdict funded-account reports; Comborb). No published academic slippage study specific to MNQ size buckets was found — these are practitioner estimates, not measured data.
- **No rigorous public micro-vs-mini fill-quality research exists.** CME's own liquidity research (2019, 2020, 2025 series) covers E-mini ES and establishes the framework — fill quality (execution vs arrival price) beats book depth as the liquidity measure — but does not publish MNQ-specific numbers. Key CME finding worth internalizing: in the March 2020 stress, ES book depth fell 90% yet volume doubled and fill-quality degradation maxed at ~7.5 ticks on 275-lot clips; in Dec 2018, depth −75%, volume +65%, fill degradation ≤1.5 ticks. Depth on screen understates executable liquidity when flow is high (CME, "Assessing Liquidity"; "Reassessing Liquidity" 2025). Peer-quality exchange research, ES not MNQ.
- **Scaling implication of CME's fill-quality framework: a 8–15 lot MNQ order is ~1–1.5 NQ-equivalents — trivially small.** ES absorbed 275-lot E-mini clips at ≤7.5 ticks in the worst week of March 2020. A 15-lot micro order is two orders of magnitude below the size where price impact becomes measurable in exchange data. Inference from CME research, not a direct measurement.
- **The limit-to-market conversion rule caps the realistic worst case at ~1–2 ticks** ($0.50–1.00/contract, $4–15 per trade at 8–15 lots): the conversion triggers near an already-touched level, so the order crosses at most a 1-tick spread plus occasionally one level of walk. Consistent with the fill-modeling note's $0.50–1.00/contract conversion-cost estimate. Inference.

## Details / mechanics

**Intraday liquidity profile (Damn Prop Firms glossary, consistent with common intuition):**
- 09:30–11:30 ET: peak volume (~70% of day), 1-tick spread, deepest book.
- 12:00–13:30 ET: volume −50–70%, occasional spread widening.
- 13:30–16:00: volume recovers into the close.
- Overnight: 5–20% of day-session liquidity; MNQ spreads 2–3 ticks (0.50–1.50 pts) vs NQ holding 0.25–0.50 pts (Volatility Box afterhours table).

**The first 60 seconds are their own regime.** The 09:30:00 opening rotation clears the pre-open book and repopulates it over ~30–60 s; spreads can flicker to 2–3 ticks and top-of-book size is thin while market makers re-quote. Practitioner guidance is uniform: for market-order entries in 09:30:00–09:31:00, expect the news-event slippage profile (2–5 ticks), not the RTH baseline. From ~09:32 onward the 1-tick / deep-book regime applies. (Synthesis of TraderVerdict, Comborb; no exchange data located for this specific claim — treat as experienced-based.)

**Size vs top-of-book.** No public MNQ depth snapshots were located this cycle. Rough practitioner anchors: liquid CME front months carry tens-to-hundreds of contracts per level in RTH (Damn Prop Firms cites "hundreds" for ES; MNQ levels are typically tens-to-low-hundreds). A 15-lot market order therefore usually clears within the first level, occasionally the second. **House data beats all of this: the DOM is visible at trade time — log top-3-level depth at entry for a month and this note's estimates become measured numbers.**

**Why book depth understates MNQ executable liquidity at the open**: CME's fill-quality series shows volume and depth decouple under volatility — resting depth thins because quoting risk rises, but *flow* (the aggressive volume your conversion order joins) is at its daily maximum at the open. The queue-position note's adverse-selection logic also runs in reverse for takers: paying the spread at the open buys participation in the deepest two-sided flow of the day.

**News windows are the exception that matters.** CPI (08:30) pre-dates the open but FOMC days (14:00) and opening drives on data days produce the 2–5+ tick market-order slippage practitioners report on MNQ specifically, because micro books thin faster than mini books when volatility spikes (PropScorer; Volatility Box; TraderVerdict). If a converted entry would execute inside the first seconds after a scheduled release, the slippage budget should be 3–5× baseline.

## APPLICATION TO THE VAULT

- **The standing limit-to-market conversion rule is safe at current size (8–15 MNQ) in the 09:30–10:30 window.** Budget 1 tick ($0.50/contract) as the expected conversion cost and 2 ticks as conservative: $8–15 total per trade at worst, i.e. ~2–5% of one R at $150 fixed risk with 10–30 pt stops. The fill-modeling note's EV argument (conversion buys back multiple R per missed winner for ~0.02R of slippage) survives contact with open-hours microstructure comfortably.
- **Add one carve-out to the conversion rule: 09:30:00–09:31:30 and the first 30 s after scheduled releases.** In those windows either accept a 3–5 tick slippage budget explicitly or require the limit to fill passively. This is the only regime where a 15-lot MNQ market order plausibly costs more than 2 ticks.
- **Do not switch to NQ for fill quality.** The measurable fill-quality edge of NQ's deeper book applies to news-spike market orders and sub-minute scalps; rejection-block entries with minutes-long holding periods and mostly-limit entries see no practical difference (TraderVerdict, Comborb, PropScorer all converge here).
- **Start logging execution data now — the public record is thin and house data is strictly better.** Per trade: intended price, fill price, order type (limit / converted / market), time, and visible top-3 depth at entry. After ~2 months (~30 trades) the Vault will hold a better MNQ-at-the-open slippage dataset than anything found in this research cycle. This also feeds the fill-mode column the queue-position note already prescribes.
- **Sizing headroom check: nothing in the microstructure caps size before ~20–30 MNQ.** The binding constraints on size remain risk math and prop-firm contract limits (most 50k plans cap at 4–10 minis-equivalent), not liquidity.

## Sources

1. CME Group — Assessing Liquidity: book depth vs fill quality, March 2020 ES stress data — https://www.cmegroup.com/education/articles-and-reports/assessing-liquidity
2. CME Group — Alternative Liquidity Measures (Dec 2018 ES episode: depth −75%, volume +65%, ≤1.5-tick fill degradation) — https://www.cmegroup.com/education/articles-and-reports/alternative-liquidity-measures
3. CME Group — Reassessing Liquidity: Beyond Order Book Depth (2025 update of the framework) — https://www.cmegroup.com/articles/2025/reassessing-liquidity-beyond-order-book-depth.html
4. Damn Prop Firms — Liquidity glossary (intraday volume profile, spread/depth by session, ADV table) — https://damnpropfirms.com/glossary/liquidity/
5. Damn Prop Firms — MNQ glossary (specs, ADV estimate, RTH spread) — https://damnpropfirms.com/glossary/mnq-futures/
6. TraderVerdict — Trading the Micro Nasdaq / Micro E-minis on prop accounts (funded-account slippage experience at 5–15 lots) — https://traderverdict.com/blog/trading-mnq-micro-nasdaq
7. Comborb — MNQ vs NQ (spread behavior in fast markets, limit-order irrelevance of book-depth gap) — https://comborb.com/mnq-vs-nq
8. Volatility Box — NQ Futures Volatility (afterhours spread table MNQ vs NQ, slippage-drag arithmetic) — https://volatilitybox.com/research/nq-futures-volatility/
