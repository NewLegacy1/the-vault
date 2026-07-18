---
topic: nwog-ndog-opening-gaps
researched: 2026-07-17
sources: 7
agent-cycle: wave-1
---
# New Week Opening Gap (NWOG) & New Day Opening Gap (NDOG)

## Key findings

- **NWOG = Friday 5:00 PM ET close → Sunday 6:00 PM ET Globex open.** On CME index futures the weekly close/reopen produces the cleanest NWOG signature of any market (innercircletrader.net NWOG tutorial; FibAlgo TradingView indicator docs).
- **NDOG = daily 5:00 PM ET close → 6:00 PM ET open**, printed Monday–Thursday during the one-hour Globex maintenance halt (ICT 2024 Mentorship Lecture 3 notes; CandelaCharts docs).
- **ICT calls these "the strongest inefficiencies on the chart — stronger than relative equal highs/lows"** in the 2024 Mentorship, Lecture 3. They are treated as *real* fair value gaps because zero trading occurred inside them, so they act as draw-on-liquidity magnets and later as support/resistance.
- **Consequent Encroachment (CE) = the 50% midpoint of the gap**, marked with a 0/0.5/1 fib. ICT frames CE as the single most reactive level inside the gap (multiple secondary sources agree; consistent with ICT's general CE-of-FVG teaching).
- **How many to keep:** the 2024 Mentorship Lecture 3 says annotate **at least four NDOGs**; community convention extends this to **five NDOGs (one per weekday)** and **the last 4–5 NWOGs**, with some traders keeping 8–10 NWOGs because months-old gaps still react (innercircletrader.net; anthonyjohnson.dev). *The "5 NWOGs" figure the community repeats is convention layered on the "at least 4" lecture instruction — treat exact counts beyond 4 as community practice, not ICT canon.*
- **ICT publishes NO statistics.** No respect-rate, fill-rate, or win-rate numbers exist in any ICT lecture. Every percentage attached to NWOG/NDOG in the wild is community folklore or independent research.
- **Best independent numbers (not ICT, and not NWOG-specific):** tradingstats.net, NQ futures 2015–2025: daily RTH gap fills 100% by close **60.3%** of the time (93% for tiny gaps, 8% for large ones); price returns to the **weekly open** later in the week **69.7%** of the time (394 of 565 weeks). These are the closest published proxies for "opening gaps get revisited" — note they measure RTH gaps and the weekly *open*, not the Friday-close-to-Sunday-open void itself.
- **Folklore flag:** claims like "NWOG CE is tested 60–70% of the time" and "NWOG 70–80% partial fill tendency" (arongroups.co and similar) circulate with **no primary source and no published methodology**. Do not treat them as evidence.

## Details / mechanics

### Drawing the NWOG
1. Mark the Friday 5:00 PM ET (16:59 candle close) price and the Sunday 6:00 PM ET opening print on MNQ/NQ.
2. Box the range between them. Direction: Sunday open above Friday close = bullish gap (green), below = bearish (red). Gaps under ~1 tick are ignored.
3. Add the CE line at 50% of the box (fib 0/0.5/1). Some traders also mark the upper and lower quadrants (25%/75%), which ICT references in later 2022–2024 content for FVGs generally.
4. Extend the box right indefinitely — NWOGs stay live for weeks; a *filled* NWOG still acts as S/R on retests.

### Drawing NDOGs
Same mechanic on the daily 5→6 PM ET halt. NDOGs are frequently tiny on MNQ; ICT still treats them as reference levels for "fair value." Keep the trailing week (4–5) on the chart.

### Claimed behavior (ICT framing)
- Price is *drawn* to open gaps to rebalance the inefficiency; delivery through a gap should slow, react, or reverse at the gap edges and especially at CE.
- NWOG > NDOG in hierarchy: the weekly void is the higher-tier draw.
- No fixed deadline: an NWOG may fill Monday or not until Thursday/Friday, or persist for weeks after a large weekend displacement. Community sources stress that "fills same day" is the #1 misuse.
- The 2024 Mentorship model pairs gap approaches with morning session timing (7:00/8:00/9:00 AM checkpoints) and, on no-news days, a post-lunch OTE window (1:30–2:30 PM).

### What is actually evidenced vs. asserted
| Claim | Status |
| --- | --- |
| Gap definition, CE, keep ≥4 | ICT primary (2024 Mentorship Lecture 3) |
| "Strongest inefficiency on chart" | ICT primary (same lecture) — an assertion, not a measurement |
| NQ daily gap fill 60.3% by close, size-dependent | Independent data (tradingstats.net, 2,791 days) — RTH gaps, not NDOG/NWOG |
| Weekly open revisited 69.7% of weeks | Independent data (tradingstats.net, 565 weeks) — weekly open, adjacent to but not identical to NWOG |
| "CE tested 60–70%", "70–80% partial fill" | Folklore — no methodology published anywhere |

## APPLICATION TO THE VAULT

- **Your NWOG-tap census is measuring exactly the thing nobody has published.** There is no public NWOG respect-rate study on MNQ; ICT gives definitions and assertions only. Your June replay tally (2W / 1L / 1 missed ~200–250pt) is already more empirical than anything in the ICT community. Keep censusing — but log *gap size*, *which edge or CE was tapped*, and *days since the gap printed*, because the independent daily-gap data says fill/respect probability varies enormously with gap size (93% tiny vs 8% large). Respect rate on NWOG almost certainly has the same size dependence.
- **Stops "just beyond the gap" match how ICT frames invalidation** — delivery *through* the entire void with displacement means the gap failed as a draw. But note ICT's own CE teaching implies a tighter alternative: if you enter at one edge, CE is the first objective and the *far edge* is the structural invalidation. For a wide NWOG, stop-beyond-far-edge may be very expensive on 10 MNQ; stop-beyond-*near*-edge (a wick-through-and-reclaim rule, like your rejection-block logic) is the community-refined version and worth A/B-ing in the census.
- **Confluence with your 10:00 routine:** one innercircletrader.net note explicitly pairs the NWOG mid-line with the 9:50 NY-AM macro window — the same neighborhood as your 10:00 rejection-block entries. An NWOG edge/CE sitting inside your 10:00 window is the highest-grade version of the "NWOG reversal at HTF level" pattern your June data flagged; consider making "NWOG level within X pts" a tagged column in the Dual46 journal so the sleeve verdict can be split on it.
- **The ~200–250pt missed reversal is consistent with the "old gaps still react" claim** — check whether that tap was on a stale (>1 week old) NWOG; if so, keep more than the current week's gap on chart (community keeps 4–10).
- **Do not import the folklore percentages** into the sleeve's prop math. Per the Vault's own hierarchy (path MC / E[$/wk] first), only your logged taps count.

## Sources

- ICT 2024 Mentorship Lecture 3 notes (NDOG & NWOG definitions, ≥4 NDOGs, "strongest inefficiencies") — https://innercircletrader.net/tutorials/ict-2024/ict-2024-mentorship-lecture-3/
- ICT NWOG tutorial (Friday close/Sunday open, CE via fib, NQ/ES cleanest, keep 4+) — https://innercircletrader.net/tutorials/ict-new-week-opening-gap-nwog/
- ICT NDOG tutorial (5–6 PM NY daily gap, keep 5, filled gaps still act as S/R) — https://innercircletrader.net/tutorials/ict-new-day-opening-gap-ndog/
- FibAlgo "ICT Opening Gaps" TradingView indicator docs (NWOG/NDOG/OPG mechanics, CE, gap-fill tracking) — https://www.tradingview.com/script/MzGvCTpQ-FibAlgo-ICT-Opening-Gaps/
- CandelaCharts NDOG docs (community implementation reference) — https://docs.candelacharts.com/toolkits/imbalance-concepts-tm/new-day-opening-gap
- TradingStats — Gap Fill Strategy, 2,791 NQ days 2015–2025 (60.3% full fill by close; size-dependent 8–93%) — https://tradingstats.net/gap-fill-strategy/
- TradingStats — Weekly mean reversion, 565 NQ weeks (weekly open revisited 69.7%) — https://tradingstats.net/mean-reversion-trading-strategy/
- (Folklore examples, cited to flag not to rely on): arongroups.co NWOG article ("70–80% partial fill", "60%+ stabilisation at CE" with no methodology) — https://arongroups.co/technical-analyze/ict-nwog-new-week-opening-gap/
