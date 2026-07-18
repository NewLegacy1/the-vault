---
topic: draw-on-liquidity
researched: 2026-07-17
sources: 10
agent-cycle: wave-3
---
# Draw on Liquidity (DOL): PDH/PDL, Internal vs External Liquidity & Daily Bias

## Key findings
- **ICT canon: price only moves for two reasons** — to rebalance an inefficiency (FVG) or to take liquidity (stops). The "draw on liquidity" is the next significant pool price is gravitating toward, and its direction *is* the daily bias in ICT's framing (innercircletrader.net daily-bias tutorial, paraphrasing 2022 Mentorship).
- **Internal vs external range liquidity (IRL/ERL)**: ERL = buy/sell stops resting beyond the swing high/low of the current dealing range; IRL = liquidity *inside* the range, chiefly unfilled FVGs. Price alternates: take IRL → run to ERL → rebalance back to new IRL, in a repeating cycle (innercircletrader.net IRL/ERL guide).
- **PDH/PDL are the nearest IRL-class draws** inside the weekly dealing range — they are usually consumed *before* price can reach the weekly external draw. Community sites assign them three roles: Judas-swing target, first draw-on-liquidity target, and dealing-range reference (midpoint = prior-day equilibrium) (ictkillzone.com PDH/PDL guide).
- **Equal highs/lows are the highest-density stop pools** because they are visible to everyone; ICT treats relative equal highs/lows as engineered liquidity that the algorithm is drawn to, not as support/resistance (SwapHunt; innercircletrader.net sweep-vs-run).
- **Sweep vs run (vs "raid"/"grab")**: a *sweep* takes the stops and closes back inside (reversal signal); a *run* takes the stops and keeps going (continuation). "Raid," "grab," and "stop hunt" are near-synonyms for the taking itself; the sweep/run distinction is only knowable *after* the candle closes (innercircletrader.net sweep-vs-run; Zeiierman).
- **Swing hierarchy STH → ITH → LTH** (and STL/ITL/LTL): a short-term high is a 3-candle pivot; an intermediate-term high is an STH flanked by lower STHs; a long-term high is an ITH flanked by lower ITHs, usually formed at a HTF PD array. ICT taught this in the 2022 Mentorship; internal highs/lows at ITH/ITL rank are the ones worth using as targets (innercircletrader.net advanced-structure; TradingView ICT Swing Structure indicator).
- **The daily-bias recipe every source converges on**: (1) daily/weekly order-flow read, (2) unfilled HTF imbalances, (3) next significant draw on liquidity, cross-checked against premium/discount. When all three agree, bias is high-conviction; when they conflict, ICT's own advice is *no bias, no trade* (innercircletrader.net daily-bias; arongroups).
- **Community warning that matches the user's June loss**: "Price often sweeps the closer liquidity pool first, then reverses to the dominant direction" — trading the first touch of a confluence level against the larger draw is the classic failure mode (innercircletrader.net daily-bias).

## Details / mechanics

### The two-reason model and what "draw" means
ICT's core claim (2022 Mentorship, restated across the tutorials): the interbank price delivery algorithm alternates between *seeking liquidity* and *rebalancing inefficiency*. The DOL is whichever objective is next. Practically: mark every unfilled FVG (IRL) and every untaken old high/low, equal high/low, and session extreme (ERL-type pools) above and below price; the *larger/nearer-in-sequence* one is the magnet.

### IRL/ERL cycle and bias derivation
1. Define the dealing range on daily (or weekly): last significant swing low to swing high (ITL→ITH or better).
2. ERL = stops beyond that range's extremes. IRL = FVGs (and PDH/PDL) inside it.
3. If price just purged IRL (filled the FVG / took PDL) and the bigger untapped pool is above → bullish bias toward the upper ERL, and vice versa.
4. After ERL is taken, expect reversal back into the range to the next IRL — this is why "target external, expect internal retrace" is the standard sequencing.

### PDH/PDL specifics
- Marked from the RTH or full-session prior-day extremes (be consistent; ICT typically uses the full session for futures but references RTH structure — sources are split, flag: **no clean primary ruling**).
- Once swept, the level is *consumed* — it stops being a draw and becomes a potential inversion/support-resistance reference.
- PDH/PDL midpoint = prior-day equilibrium; above it, favor shorts at premium arrays on bearish days (and mirrored for bullish).

### Sweeps, runs, raids
- Sweep = wick through the pool, close back inside → expect MSS + displacement + FVG entry in the reversal direction.
- Run = body-close beyond and continuation → the pool was consumed as *fuel for trend*, next draw is the following pool in the same direction.
- The user's stop placement lesson from community sources: never park stops 1 tick beyond an obvious pool; buffer beyond the sweep-wick extreme or a structural feature (CrossTrade; Zeiierman).

### Canon vs community
| Claim | Status |
| --- | --- |
| Price moves to rebalance imbalance or take liquidity | **ICT canon** (2022 Mentorship, repeated verbatim in lectures) |
| STH/ITH/LTH nested swing hierarchy | **ICT canon** (2022 Mentorship) |
| "IRL = FVGs, ERL = range-extreme stops" as a tidy dichotomy | Canon-derived; the crisp two-bucket labeling is largely **community packaging** of scattered ICT remarks |
| PDH/PDL "three roles" framework, T1/T2 partial-profit ladders | **Community packaging** (ictkillzone) — useful checklist, not ICT's words |
| Sweep-vs-run close-based distinction | Canon in spirit ("turtle soup," "run on liquidity"); the strict candle-close rule is **community formalization** |
| Equal highs/lows as engineered liquidity magnets | **ICT canon** (liquidity-pool lectures, Market Maker series) |
| "Bias = direction of next major DOL" as a single-factor shortcut | **Community simplification**; ICT layers order flow + imbalance + DOL together |

Flag: none of the liquidity claims come with published fill data from ICT; the mechanism (stop clusters at visible extremes) is microstructure-plausible and consistent with stop-hunting literature, but the "algorithm seeks it deliberately" causal story is unfalsifiable as taught.

## APPLICATION TO THE VAULT
- **Daily-bias checklist upgrade (three-gate rule)**: before the 10:00 window, require alignment of (1) daily order flow (HH/HL vs LH/LL), (2) unfilled daily/4H FVG direction, (3) nearest untapped major pool (PDH vs PDL vs old week high/low). If the three disagree → no-bias day, script stands down. This directly addresses the **06-19 against-bias loss**: that trade violated gate 1 while chasing a level; a hard three-gate rule would have filtered it.
- **Reclassify swept levels immediately.** The June loss at the *filled* NWOG + PDL confluence fits the "consumed liquidity" trap: once the NWOG was filled and PDL swept, both had already delivered their draw — the confluence was stale. Rule: a level that has been swept/filled this week is no longer a draw; it may only serve as an inversion reference with fresh displacement confirmation.
- **Target selection matches what already works.** The winning trades running to CE of FVGs/wicks and internal highs/lows = taking IRL targets. Keep T1 at the nearest IRL (CE / internal ITH-ITL), and only hold a runner toward ERL (PDH/PDL or week extreme) when the daily bias gates all agree.
- **Stop placement**: the ticks-early stop-out at the PDL confluence is the textbook "stops 1 tick beyond the obvious pool" failure. For rejection-block limit entries near a known pool, the stop must sit beyond the *sweep-wick projection* (beyond the RB wick extreme plus a volatility buffer), not at the pool itself — accept smaller size, not tighter stops.
- **Use the swing hierarchy to rank targets**: only ITH/ITL-grade internal levels count as draws for the 10:00 trade; STH/STL pivots are noise and should not anchor targets or bias.

## Sources
1. ICT Daily Bias Explained — innercircletrader.net — https://innercircletrader.net/tutorials/ict-daily-bias-explained/
2. ICT Internal & External Range Liquidity (IRL & ERL) — innercircletrader.net — https://innercircletrader.net/tutorials/ict-internal-external-liquidity/
3. ICT Daily Bias: How to Determine Direction — ictkillzone.com — https://www.ictkillzone.com/ict-daily-bias
4. ICT Previous Day High and Low (PDH/PDL) — ictkillzone.com — https://www.ictkillzone.com/ict-previous-day-high-low
5. Liquidity Sweep vs Liquidity Run — innercircletrader.net — https://innercircletrader.net/tutorials/ict-liquidity-sweep-vs-liquidity-run/
6. What Is a Liquidity Sweep? Stop Hunt Explained — SwapHunt — https://swaphunt.dev/articles/liquidity-sweeps-explained
7. ICT Advanced Market Structure: STH, ITH & LTH — innercircletrader.net — https://innercircletrader.net/tutorials/ict-advance-market-structure/
8. ICT STL, ITL & LTL — innercircletrader.net — https://innercircletrader.net/tutorials/ict-stl-itl-ltl/
9. ICT Daily Bias: Complete Guide — Aron Groups — https://arongroups.co/technical-analyze/ict-daily-bias-complete-trading-guide/
10. Liquidity Sweeps — CrossTrade / Zeiierman (stop-placement mechanics) — https://crosstrade.io/learn/price-action/liquidity-sweeps ; https://www.zeiierman.com/blog/liquidity-sweeps-in-trading
