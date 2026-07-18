---
topic: key-opens-power-of-3
researched: 2026-07-17
sources: 9
agent-cycle: wave-2
---
# Key Opens (00:00 / 8:30 / 9:30 / 10:00 NY) & Power of 3 (AMD)

## Key findings

- **Power of 3 = ICT's claim that every candle, on every timeframe, is built from Accumulation → Manipulation → Distribution.** Accumulation sets the Open, manipulation creates one extreme (against the true direction), distribution creates the other extreme and the Close (ICT primary across multiple series; innercircletrader.net PO3 tutorial; ictflow AMD guide). The Judas swing *is* the manipulation phase — this note and the wave-1 `judas-swing.md` describe the same engine from different angles.
- **Midnight NY (00:00) is the "True Day Open" and the premium/discount pivot for the daily cycle** (ICT primary, taught since the forex era). Bullish day: the algorithm accumulates/manipulates **below** the midnight open (buy at a discount to the true open), then distributes up; bearish day mirrors above it. Opening-price-as-premium/discount is the core logic: above the open = premium, below = discount, *relative to the day's intended direction* (mql5 PO3 guide; fxnx midnight-pivot; ictflow).
- **8:30 is the news-embargo open.** US economic releases (CPI, NFP, etc.) drop at 8:30 ET; ICT's 2024 Mentorship Lecture 4 builds an entire news-day model around being at the screen at 8:30 and 9:30, with NDOG/NWOG clusters as the draw and a 1m MSS at a breaker/FVG as the trigger (innercircletrader.net Lecture 4 notes). In index terms, 8:30 frequently *injects* the manipulation leg.
- **9:30 is the equities cash open — and for index futures ICT treats it as the start of the "true day."** In Core Content Month 10 (Index Futures — Basics & Opening Range Concept) ICT says the true day for S&P is **9:30 to 16:00 NY**, and the **opening range (9:30–10:30 in that lecture) tends to create the high or low of the day** with the day's largest volume in the first 30 minutes (videohighlight transcript summary of Month 10). Later ICT content (2022/2023-era, codified by the community) tightens the index opening range to **9:30–10:00**, the window in which the "1st Presented FVG" is valid (innercircletrader.net 1st-presented-FVG tutorial; writofinance).
- **9:30 also defines the Opening Range Gap (ORG):** prior day's 16:14/16:15 ET futures settlement close vs today's 9:30 open. ICT treats the ORG like other gaps — quarters (0/0.25/0.5/0.75/1) and CE as reference levels (Lecture 4 notes; 1st-presented-FVG tutorial). This is the RTH gap the wave-1 NWOG note's tradingstats data measured (60.3% same-day fill, heavily size-dependent).
- **10:00 is not itself an ICT "open."** Its significance is composite: (1) end of the 9:30–10:00 opening range / 1st-presented-FVG window, (2) the **9:50–10:10 macro** straddles it, (3) the **Silver Bullet window is 10:00–11:00**, and (4) the 10:00 hourly candle open/close is a delivery anchor (ictkillzone macro-times; grandalgo macros; liquidityscan). The community NY-AM template: 9:30 open fires the Judas → MSS ~9:40–9:50 leaves the FVG → 10:00–10:10 retrace fills the entry → distribution into 11:00–12:00. *The pieces are ICT's; the packaged minute-by-minute sequence is community synthesis* (same caveat as wave-1's Judas note).
- **Session template (index day, NY-centric, community-standard):** overnight/pre-market 7:00–9:30 = accumulation range; 8:30 news or 9:30 open = manipulation (sweep of pre-market/London/overnight extremes, often against midnight-open premium/discount); 9:30–11:30 = distribution; 11:00–12:00 = first reversal/target zone; lunch 12:00–13:30 avoided; 13:30–14:30 = afternoon OTE/PO3 echo (2024 Mentorship Lecture 3 pairs no-news days with a 13:30–14:30 OTE window — see wave-1 `ote-optimal-trade-entry.md`).
- **No statistics.** ICT publishes no frequency data for "high/low of day forms in the opening range" or "manipulation resolves by 10:00." Month 10's "opening range tends to create the high or low of the day" is an assertion from the primary lecture, not a measurement. Independent ORB literature exists but tests breakout systems, not ICT's fade-the-manipulation usage.

## Details / mechanics

### The four reference opens
| Open (NY time) | What it is | ICT's taught role |
| --- | --- | --- |
| 00:00 midnight | True Day Open | Daily premium/discount pivot; accumulation forms around it; manipulation trades to the wrong side of it (ICT primary, forex-era onward) |
| 8:30 | News embargo release | Volatility injection; 2024 L4 news-day model anchor; frequently the manipulation catalyst on index days (ICT primary, 2024 L4) |
| 9:30 | NYSE cash open | Start of the index "true day" (Month 10); defines ORG; opens the opening-range window where the 1st Presented FVG prints (ICT primary + later refinement) |
| 10:00 | (not an open) | Opening-range close + 9:50–10:10 macro + Silver Bullet window start; where the 9:30 manipulation typically stands resolved (composite; community packaging) |

- ICT also references a 7:00 AM checkpoint (2024 L2/L3: at the screen by 7:00, AM-session retrace model) and the 18:00 Globex reopen (NDOG print — see wave-1 `nwog-ndog-opening-gaps.md`).

### Opening-price premium/discount logic (PO3 execution)
1. Establish HTF daily bias first — PO3 is unreadable without it (every source, primary and community).
2. Mark the midnight open. Bullish bias: treat prices **below** it as the algorithm's buy zone; refuse longs chased above it early in the day (they're paying premium to the true open). Bearish mirror.
3. On index days, layer the 9:30 open the same way intraday: a bearish 9:30–10:00 sequence wants a sweep **above** opens/pre-market highs before delivering down.
4. The manipulation extreme (Judas wick) becomes the day's stop-anchor; distribution targets the opposite external liquidity (previous day/week highs-lows, gap CEs).
5. Weekly PO3: same anatomy with Monday-Tuesday accumulation/manipulation and Wednesday-Thursday distribution (ICT's weekly-profile teaching; community-summarized).

### Index opening range specifics
- Month 10 canon: opening range 9:30–10:30, largest volume 9:30–10:00, "tends to create the market high or low of the day." True day 9:30–16:00 — midnight open matters less for indices than forex in that lecture's framing; later ICT usage keeps both references alive.
- 2022/2023-era refinement: 9:30–10:00 is *the* opening range for NQ/ES; the first FVG printed on the 1m inside it (that breaks the prior candles' range) is the "1st Presented FVG," extended right until ~15:45 as an all-day reference. After 10:00, new FVGs are ordinary.
- ORG quarters: settlement close ↔ 9:30 open, marked 0/0.25/0.5/0.75/1. Partial-fill behavior at the quarters is a bias tell (Lecture 4).

### Canon vs community
| Element | Status |
| --- | --- |
| PO3/AMD anatomy; open→manipulation→distribution builds the candle; fractal | ICT primary (multiple series) |
| Midnight = True Day Open, premium/discount vs the open | ICT primary (forex-era core content onward) |
| Index true day 9:30–16:00; opening range creates HoD/LoD; biggest volume first 30 min | ICT primary (Core Content Month 10) |
| 8:30/9:30 news-day model with NDOG/NWOG draws | ICT primary (2024 Mentorship Lecture 4) |
| 1st Presented FVG valid only 9:30–10:00, extend to 15:45 | ICT later-era teaching, community-documented (innercircletrader.net, writofinance) — no single free primary transcript located; flag |
| 9:50–10:10 macro, Silver Bullet 10:00–11:00 | ICT concepts (macros, Silver Bullet are his); exact minute-packaging and "highest probability" ranking = community |
| "HoD/LoD forms in opening range X% of the time" | No data anywhere — assertion only |

## APPLICATION TO THE VAULT

- **Your 10:00 anchor sits at the resolution point of three ICT clocks simultaneously:** the 9:30–10:00 opening range closes, the 9:50–10:10 macro is live, and the Silver Bullet window opens. A 1m rejection block printing at ~10:00 is, in this framework, the manipulation leg's footprint right where the framework expects manipulation to stand resolved. This is the strongest confirmation wave 2 found for the timing half of your model — with the caveat that the minute-level packaging is community synthesis, and nobody (including ICT) has published base rates.
- **Add the two opens as directional filters, not new levels to trade.** Concretely: at your 10:00 decision point, check (a) which side of the **midnight open** price sits, and (b) which side of the **9:30 open** it sits. A long whose rejection-block wick swept a low *below both opens* is the textbook PO3 discount-manipulation long; a long taken *above* the midnight open early in the day is paying premium against the framework. These are two boolean journal columns — cheap to log, and your census can later say whether they separate winners from losers on your own data.
- **The opening-range assertion cuts both ways for a 10:00 entry.** Month 10 canon says the 9:30–10:30 window tends to print the high or low of the day. When your rejection block forms on a sweep of the pre-market/overnight extreme, your entry is positioned *at* the candidate HoD/LoD — best case for the fixed 1:5. But if the day's manipulation already completed at 8:30 (news days), the 10:00 block may print mid-leg instead of at the extreme. Tagging "8:30 red-news day: Y/N" would let you split the census on the one variable ICT himself splits his 2024 models on (L4 news-day vs L2/L3 no-news models).
- **ORG quarters are a natural target overlay for your CE-based targets.** You already target CE of FVGs/wicks; the ORG (16:15 settlement → 9:30 open) has ICT-taught quarter levels including its own CE, and on gap days it often sits inside your 100-pt target envelope. Marking ORG CE alongside FVG/wick CEs costs one extra line on the chart and gives the 1:5 target a documented draw to aim at.
- **Respect the 11:00 boundary.** Both macro and Silver Bullet sources treat 11:00 as the end of the primary AM distribution, with reversals common at/near it. For a 10:00 entry aiming 100 pts, the framework's implied clock is roughly one hour — a "still open at 11:00" tag would test whether stale runners underperform.

## Sources

- ICT Mentorship Core Content — Month 10 — Index Futures Basics & Opening Range Concept (primary; video ORbtHOUzAIM transcript summary: true day 9:30–16:00, opening range creates HoD/LoD, volume profile) — https://videohighlight.com/v/ORbtHOUzAIM
- ICT 2024 Mentorship Lecture 4 notes — 08:30 News & 09:30 Open model (primary-derived; NDOG/NWOG draws, ORG quarters, A-plus 9:30 setup) — https://innercircletrader.net/tutorials/ict-2024/ict-2024-mentorship-lecture-4/
- innercircletrader.net — ICT Power of 3 tutorial (AMD phases, midnight-open anchor, bullish/bearish day templates) — https://innercircletrader.net/tutorials/ict-power-of-3/
- ictflow.com — Power of Three / AMD Model (True Daily Open, AMD on daily/weekly/monthly, session mapping) — https://ictflow.com/blog/power-of-three-amd-model
- mql5.com — Complete Guide to ICT PO3 & AMD (midnight open as premium/discount baseline; index timing: pre-market accumulation, 8:30/9:30 manipulation, 9:30–11:30 distribution) — https://www.mql5.com/en/blogs/post/771729
- innercircletrader.net — ICT 1st Presented FVG / Opening Range (9:30–10:00 window, ORG definition, extend-to-15:45 charting) — https://innercircletrader.net/tutorials/master-ict-1st-presented-fvg/
- ictkillzone.com — ICT Macro Times (9:50–10:10 setup macro, 10:10 Silver Bullet core macro, 11:00 close macro; community packaging) — https://www.ictkillzone.com/ict-macro-times
- grandalgo.com — ICT Macros Explained (macro schedule incl. 8:50–9:10, 9:50–10:10; macro-inside-killzone framing) — https://grandalgo.com/blog/ict-macros-explained
- fxnx.com — ICT PO3 Midnight Pivot (premium/discount vs 00:00 open worked example; community) — https://fxnx.com/en/blog/ict-power-3-xauusd-master-midnight-pivot
