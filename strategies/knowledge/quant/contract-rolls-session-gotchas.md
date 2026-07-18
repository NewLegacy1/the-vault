---
topic: contract-rolls-session-gotchas
researched: 2026-07-18
sources: 9
agent-cycle: cycle2-wave2
---
# Contract Rolls & Session-Structure Gotchas for a 09:30–13:00 NQ/MNQ Strategy

## Key findings

- **NQ/MNQ expire quarterly on the third Friday of Mar/Jun/Sep/Dec; the roll date is the Thursday 8 days before expiry** (usually the second Thursday of the month — the "quarterly IMM date"). MNQ tracks NQ's calendar exactly. Concrete dates around the Vault's walks: **Sep U25 roll Thu 2025-09-11 (expiry Fri 2025-09-19); Dec Z25 roll Thu 2025-12-11 (expiry Fri 2025-12-19); Mar H26 roll Thu 2026-03-12 (expiry 2026-03-20); Jun M26 roll Thu 2026-06-11 (expiry 2026-06-19).** (Fact — CME-published dates, corroborated across 4 sources.)
- **Volume migration is fast but not instant.** Roll begins ~8–10 trading days pre-expiry, peaks around roll Thursday, and completes over Thu→Monday. Empirical observations differ slightly: some report ES/NQ volume nearly complete at Globex open of roll Thursday (data vendors switch Wednesday evening); NexusFi community data says NQ volume decisively shifts on the **Sunday/Monday after** roll Thursday. Either way, by the Monday of expiry week the old contract is thin, and by expiry Friday it is dead. (Fact with a flagged 1–2 day uncertainty band.)
- **During roll week the *new* front month is fine; the *old* one decays.** For a 09:30–13:00 RTH strategy the practical rule is: trade the new contract from roll Thursday onward. Trading the expiring contract into expiry week means widening spreads, thinning depth, and worse stop slippage — an unforced error since the new month is already liquid. Expiry Friday itself is a quad-witching day: the expiring contract settles via the Special Opening Quotation at the 09:30 cash open and index-arb flows make 09:30–10:00 noisier than normal. (Fact for mechanics; "noisier" is a widely reported regularity, not verified quantitatively this cycle.)
- **TradingView continuous contracts (NQ1!/MNQ1!) splice by volume, and the splice leaves artifacts either way.** With back-adjustment OFF (default), the chart shows a roll gap at the switch equal to the calendar basis (new contract typically at a premium — rates minus dividends). With B-ADJ ON, TradingView shifts *all* prior history by the close-to-close difference at the switch, so historical prices no longer match what actually traded (round-number levels, prior-day H/L, VWAP anchors are all offset in the pre-splice segment). TradingView's switch date is volume-triggered and can differ by days from other platforms' roll rules (documented NQ example: TV rolled ~Jun 14, TradersPost Jun 19 for the same 2024 expiry). (Facts — TradingView primary docs + TradersPost.)
- **CME equity index futures halt at 12:00 CT = 13:00 ET on in-week holidays** (MLK, Presidents Day, Memorial Day, Juneteenth, July 3/Independence, Labor Day, Thanksgiving Day) — exactly the strategy's session end, but the whole morning is a thin holiday tape. Day-after-Thanksgiving and Christmas Eve close slightly later, commonly reported 12:15 CT = 13:15 ET. Full closures: New Year's Day, Good Friday, Christmas Day. One 2026 secondary source claims 12:15 CT for equities on all early closes — the CME primary page shows 12:00 CT for equity index on the holiday itself; **treat exact minutes as verify-before-trading.** (Fact with flagged minor conflict.)

## Details / mechanics

**Roll timeline for one quarter (e.g., Z25):**
1. ~Mon of roll week (Dec 8, 2025): back month (H26) volume growing, Z25 still dominant.
2. Roll Thursday (Dec 11): official roll date; data vendors/platforms switch around Wed evening–Thursday; both contracts liquid; calendar-spread volume spikes.
3. Thu–Mon (Dec 11–15): open interest and volume finish migrating to H26.
4. Expiry week: Z25 spreads widen day by day; final trading is the SOQ settlement at 09:30 ET Fri Dec 19 (quad witching).

**Basis/gap size:** the new contract trades above the old by cost-of-carry (financing minus dividend yield). In the 2024–2026 rate regime this has been on the order of tens of NQ points per quarter — large enough that an unadjusted continuous chart shows a visible "phantom gap" at the splice that no live trader ever saw as tradeable price action. (Order-of-magnitude statement; exact basis varies with rates — not verified per-quarter this cycle.)

**TradingView replay specifics:**
- NQ1! switch condition is *next-contract daily volume exceeding current* (TradingView docs) — i.e., roughly roll Thursday, but not guaranteed to match the CME calendar date.
- B-ADJ coefficient = close(new) − close(old) on the daily bar before the switch, applied to *all* earlier bars.
- Consequences for bar replay: within a month that contains no splice, replay on NQ1!/MNQ1! is clean. In a splice month, the day of the switch shows either an overnight gap that never traded (B-ADJ off) or a whole pre-splice history offset from true prices (B-ADJ on). Intraday structure (bar shapes, rejection blocks, relative levels) survives back-adjustment; *absolute* price levels (round numbers, actual fills a live trader would remember) do not.
- Cleanest practice for a walk month containing a roll: replay the **specific contract** (e.g., `NQZ2025`) rather than the continuous — replay then matches exactly what a live trader saw, and you consciously switch symbol on roll Thursday like you would live.

**Holiday sessions:** on early-close days the Globex overnight session runs normally, then the day session halts at 12:00 CT (13:00 ET) and reopens 17:00 CT for the next trade date. The morning is a real but thin tape — event-study samples from these days are drawn from a different liquidity regime and prop firms sometimes restrict or discourage holiday trading (check firm rules).

## APPLICATION TO THE VAULT

**Walk-month audit — which walks contain roll weeks and early closes:**

| Walk month | Roll week? | Early-close / holiday days |
|---|---|---|
| **May 2026** (current) | **No** — M26 has been front since ~Mar 12; no roll until Jun 11 | **Mon May 25, 2026 Memorial Day: halts 13:00 ET**, thin tape all morning |
| **Nov 2025** | No | **Thu Nov 27 Thanksgiving: halts 13:00 ET** (thin); **Fri Nov 28: ~13:15 ET close** (thin half-day) |
| **Dec 2025** | **YES — roll Thu Dec 11, 2025** (Z25→H26); Z25 expires Fri Dec 19 (quad witching, SOQ at open) | **Wed Dec 24: ~13:15 ET close**; Thu Dec 25 closed; Dec 31 verify (some products close early) |
| **Aug 2025** | No | None (no CME holidays in August) |
| **Sep 2025** | **YES — roll Thu Sep 11, 2025** (U25→Z25); U25 expires Fri Sep 19 (quad witching) | **Mon Sep 1 Labor Day: halts 13:00 ET**, thin tape |

- **May 2026 (the current walk) is roll-free.** The only flag is Memorial Day May 25: the session ends at exactly 13:00 ET, and the morning is holiday-thin. Recommend excluding (or separately tagging) May 25 in the event-study sample — its fills and follow-through come from a different liquidity regime.
- **Sep 2025 and Dec 2025 walks each contain a full roll sequence.** If replaying on MNQ1!/NQ1!: expect the splice around Sep 11 / Dec 11. Decide the B-ADJ convention *before* the walk and record it in the harvest note; better, replay `MNQU2025`→`MNQZ2025` (switch on roll Thursday) so levels are live-true. Also tag Sep 19 and Dec 19 (quad-witching Fridays) — the 09:30–10:00 window that the strategy trades is structurally noisier there, and the *expiring* contract shouldn't be the replay symbol that day at all.
- **Roll-week days (Sep 8–12, Dec 8–12) are tradeable but regime-tagged**: front-month depth is migrating; a limit-fill model calibrated on normal weeks slightly overstates queue depth on the old contract and understates it on the new one those days. Not a reason to skip; a reason to tag.
- **For future live forward-testing:** platform front-month defaults differ (documented TradingView-vs-executor mismatch). During roll week, confirm the executed symbol matches the charted contract, and if any copier is in play (see `trade-copiers-prop-accounts.md`), confirm leader and followers rolled the same day.
- **Holiday early-closes barely clip the 09:30–13:00 window** (halt = session end) — the real cost is thin-tape mornings, not lost minutes. Nov 27–28 and Dec 24 sessions in the Nov–Dec 2025 walks should carry the same exclusion/tag treatment as May 25, 2026.

## Sources

1. CME Group holiday & trading hours (PRIMARY — 12:00 CT equity halts on holidays; full-close list) — https://www.cmegroup.com/trading-hours.html
2. Discount Trading 2026 CME holiday schedule (equity index 12:00 CT halts; Black Friday & Christmas Eve 12:15 CT) — https://www.discounttrading.com/futures-holiday-schedule.html
3. proptradingvibes CME hours 2026 (claims 12:15 CT equity early closes — conflicts with #1/#2; flagged) — https://proptradingvibes.com/blog/cme-trading-hours
4. FuturesHive: E-mini rollover dates 2026 (roll-Thursday table: Mar 12, Jun 11, Sep 10, Dec 10, 2026) — https://www.futureshive.com/blog/futures-rollover-dates-explained
5. CrossTrade: contract rollover mechanics (Thursday-before-third-Friday convention, volume migration steps) — https://crosstrade.io/learn/futures-trading/contract-rollover
6. NexusFi Academy: futures contract rolls (8-business-day rule, NQ volume shifting Sunday after roll Thursday, vendor Wednesday-evening switches) — https://nexusfi.com/a/market-structure/futures-contract-rolls and https://nexusfi.com/a/exchanges/futures-contract-rollover
7. Derivatives Journal: NASDAQ futures roll calendar (OI migration timeline, expiry-Friday illiquidity) — https://derivativesjournal.com/indices/nasdaq-futures-roll-calendar
8. TradingView support (PRIMARY): continuous 1!/2! mechanics + back-adjustment coefficient — https://www.tradingview.com/support/solutions/43000483493 and https://www.tradingview.com/support/solutions/43000685266
9. TradersPost: TradingView NQ1! volume-based switch vs executor roll date mismatch (2024 NQ example) — https://blog.traderspost.io/article/trading-continuous-futures-contracts-from-tradingview-on-traderspost
