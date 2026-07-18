---
topic: time-based-macros
researched: 2026-07-17
sources: 11
agent-cycle: wave-3
---
# ICT Time-Based Macros (9:50–10:10, 10:50–11:10 & the Full Schedule)

## Key findings
- **Primary-source definition**: ICT defines a macro as "a short order of instructions that creates an event in price delivery" — a scheduled window in which the delivery algorithm either *seeks liquidity* (runs a pool) or *reprices to rebalance* an FVG (innercircletrader.net macro guide, quoting Huddleston; ICT Gems lecture clip).
- **Origin is recent and deliberately incomplete**: macros were first taught in the **2023 Mentorship** (e.g. "Algorithmic Price Delivery & Time Macros Intro," Jul 9 2023; "Opening Range Gap Repricing Macro," Jun 26 2023). ICT on tape: "I've recently introduced this year macros… usually 20-minute intervals… I'm going to teach you a few of them this year. I'm not going to teach you all of them" (ICT Gems video transcript; time-price-research source list).
- **The consensus schedule (ET)**: London 2:33–3:00 and 4:03–4:30; NY AM 8:50–9:10, **9:50–10:10**, 10:50–11:10; lunch 11:50–12:10; PM 1:10–1:40; last hour 3:15–3:45. All sources agree on the NY AM windows; the London times' odd minutes (2:33, 4:03) appear nowhere in a verifiable primary lecture — **flag: community-transmitted** (michaeljhuddleston.org; innercircletrader.net; writofinance; GrandAlgo).
- **2024 Mentorship generalization**: ICT later said "a macro happens in every single hour — the last 10 minutes of the closing hour and the first 10 minutes of the opening hour," and "the last hour has four macros" (every 15 min, 3:00–4:00 PM). This makes the :50–:10 windows an hourly rule, not a special list (innercircletrader.net macro guide).
- **Claimed internal anatomy**: sweep (against the true direction, first minutes) → displacement leaving an FVG → delivery into the draw on liquidity. The 9:50–10:10 macro is billed as the most reliable window because it processes the 9:30 open's Judas swing and opens the 10:00–11:00 "Silver Bullet" hour (GrandAlgo; ictkillzone.com).
- **Independent evidence, supporting**: intraday volatility/volume in equity index futures follow a well-documented U-shape with pronounced spikes at the open and at **scheduled 8:30 and 10:00 ET macroeconomic releases** — over three-fifths of S&P futures price jumps in 10:00–10:05 are tied to 10:00 news (Ekman 1992; Bollerslev, Cai & Song 2000 for T-bonds; SSRN jumps study; Örebro 2025 WP on E-mini S&P/NQ). So *elevated, clustered volatility right around 9:50–10:10 is real* — the window straddles post-open repricing and the 10:00 news slot.
- **Independent evidence, contradicting**: no peer-reviewed or exchange-data study finds anything special about the exact :50 and :10 boundaries, the 2:33/4:03 London times, or a *deterministic* sweep→displacement sequence inside them. The academic drivers are the open/close auctions and scheduled announcements — mundane mechanisms that need no "programmed algorithm macro" (Bollerslev et al. 2000; intraday-patterns literature).

## Details / mechanics

### The schedule
| Macro (ET) | Window | Notes |
| --- | --- | --- |
| London 1 | 2:33–3:00 | odd start minute; no primary citation found — community-transmitted |
| London 2 | 4:03–4:30 | same caveat |
| NY AM 1 | 8:50–9:10 | brackets the 8:30 news digestion / pre-open |
| **NY AM 2** | **9:50–10:10** | most-watched; post-open Judas resolution + 10:00 data slot |
| NY AM 3 | 10:50–11:10 | "second bite"; end of Silver Bullet hour |
| Lunch | 11:50–12:10 | lower conviction, thinner tape |
| NY PM | 1:10–1:40 | 30-min, breaks the 20-min pattern |
| Last hour | 3:15–3:45 (plus 15-min sub-macros 3:00–4:00) | MOC-flow driven |
All are New York local time; they shift with US DST, not GMT.

### Claimed behavior inside a window
1. Pre-window: mark unfilled FVGs (15m/5m) and untapped pools (PDH/PDL, session extremes, relative equal highs/lows, open week gaps) above and below.
2. Direction read: if buy-side was just taken, the macro's job is likely sell-side (and vice versa) — a *window-level* bias that can exist even on a no-bias day.
3. Window opens: expect speed ("I'm looking for speed now. I want to see big candles" — ICT, Gems clip). Sweep first, then displacement + MSS on 1m, then delivery.
4. Entry is the retrace into the displacement FVG/OB; stop beyond the displacement extreme; target the next pool. Do not pre-position before the window opens.

### What ICT actually claims vs what is measurable
- Claim: the interbank algorithm runs *scheduled instructions* at these times. Unfalsifiable as stated; ICT provides no data, and the teaching is explicitly partial ("I'm not going to teach you all of them").
- Measurable reality: volatility and volume are strongly time-of-day dependent in NQ/ES. Open (9:30) and close (16:00) are volatility maxima; 10:00 ET carries a distinct announcement spike (ISM, consumer confidence/sentiment, JOLTS, new-home sales all print at 10:00). A 9:50–10:10 window therefore *will* contain outsized moves on many days for reasons that require no proprietary algorithm.
- The honest read: macros are a useful attention schedule overlaid on genuine time-of-day volatility structure; the causal story is unproven, and the precise boundaries are folklore-grade outside the hourly :50–:10 generalization ICT gave in 2024.

### Canon vs community
| Claim | Status |
| --- | --- |
| "Macro = short order of instructions creating an event in price delivery" | **ICT canon** (2023 Mentorship, on tape) |
| 9:50–10:10 and 10:50–11:10 NY AM windows | **ICT canon** (taught 2023; referenced repeatedly in live NQ sessions) |
| Hourly rule: last 10 min + first 10 min of every hour | **ICT canon** (2024 Mentorship quote) |
| London 2:33–3:00 / 4:03–4:30 exact times | **Community-transmitted**; no verifiable primary lecture citation found |
| Sweep → displacement → delivery as the fixed internal sequence | Canon in spirit; the rigid 3-phase template is **community formalization** |
| "Macros work because the algo is programmed to run them" | **Unfalsifiable claim**; independent data supports time-of-day volatility clustering but not scheduled intent |
| Full "macro trading strategy" with entries/exits | **Community packaging** — ICT frames macros as confluence, not a standalone model |

## APPLICATION TO THE VAULT
- **The 9:50–10:10 macro fully contains the user's 10:00 entry routine.** The rejection-block wick that forms into 10:00 is, in macro language, the window's *sweep phase*; the limit fill at the RB wick is effectively a bet that displacement follows. Practical rule: treat 9:50–10:10 as one unit — an RB wick printed 9:50–9:59 that sweeps a marked pool is the same setup as one at 10:00–10:05, so widen the scan to the whole window rather than anchoring only on the 10:00 stamp.
- **Check the 10:00 news calendar before every session.** ISM/consumer-confidence-type releases print at exactly 10:00 ET and are the documented driver of 10:00–10:05 price jumps in index futures. A limit order resting at a 1-minute RB wick into a scheduled 10:00 release is a fill-on-the-spike risk — the ticks-early stop-out failure mode. Rule: on 10:00 red-news days, either stand down until 10:05 or size down with the wider sweep-buffer stop from the draw-on-liquidity note.
- **Macro direction read as a bias tiebreaker, not a bias substitute.** The **06-19 against-bias loss** would not have been saved by macros — the window-level read ("buy-side just taken → expect sell-side") is exactly the seduction that pulls a trader against the daily draw. Hierarchy stays: daily-bias gates first; the macro window only times the entry *within* that bias. Never let intra-window speed override a failed bias checklist.
- **10:50–11:10 is the sanctioned second bite.** If the 10:00 window misfires or the user misses the fill, the next valid attempt is 10:50–11:10 toward the *same* daily draw — not a revenge trade at 10:20 in the dead zone between macros.
- **Log by window.** Tag each journal entry with its macro window (9:50–10:10 vs 10:50–11:10 vs outside) so the Dual46/journal data can eventually test whether the window boundary carries edge for this exact setup — that would be the first falsifiable evidence either way.

## Sources
1. ICT Macro Times — 09:50 NY-AM Macro, Schedule + PDF — innercircletrader.net — https://innercircletrader.net/tutorials/ict-macro-time-based-strategy/
2. ICT Macro Time Strategy — michaeljhuddleston.org — https://michaeljhuddleston.org/notes/ict-macro-time-strategy-trade-with-the-algorithm-every-session/
3. ICT Macro Times: The Complete Guide — ictkillzone.com — https://www.ictkillzone.com/ict-macro-times
4. ICT Macros Explained: The Algo's 20-Minute Windows — GrandAlgo — https://grandalgo.com/blog/ict-macros-explained
5. ICT Macros — Smart Money Time-Based Trading — WritoFinance — https://www.writofinance.com/ict-macros-times-in-forex/
6. ICT Gems — ICT Teaches Algorithmic Time Delivery and Macro (lecture clip w/ direct quotes) — https://www.youtube.com/watch?v=m61WKbJCKck
7. ICT Time Macros & Quarterly Theory (primary-video source list: Jul 9 2023 & Jun 26 2023 mentorship lectures) — time-price-research — https://time-price-research-astrofin.blogspot.com/2024/07/ict-macros-quarterly-theory-during.html
8. Bollerslev, Cai & Song (2000), Intraday periodicity & macroeconomic announcements, US T-bond futures (8:30/10:00 ET spikes) — https://public.econ.duke.edu/~boller/Published_Papers/joef_00.pdf
9. S&P 500 Index-Futures Price Jumps and Macroeconomic News (10:00–10:05 jumps tied to 10:00 releases) — SSRN — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1920401
10. Volume-driven time-of-day effects in intraday volatility models (E-mini S&P/NQ U-shape, 2025 WP) — Örebro University — https://www.oru.se/globalassets/oru-sv/institutioner/hh/workingpapers/workingpapers2025/wp-14-2025.pdf
11. Intraday patterns in the S&P 500 index futures market (Ekman 1992 lineage; U-shaped returns/volume) — https://www.academia.edu/33142183/Intraday_patterns_in_the_S_and_P_500_index_futures_market
