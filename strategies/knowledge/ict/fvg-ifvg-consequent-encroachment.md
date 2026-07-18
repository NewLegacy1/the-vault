---
topic: fvg-ifvg-consequent-encroachment
researched: 2026-07-17
sources: 9
agent-cycle: wave-2
---
# FVG / IFVG (Inversion FVGs), BISI-SIBI & Consequent Encroachment

## Key findings

- **FVG definition (ICT primary, Core Content Month 4 "Fair Value Gaps"):** a three-candle sequence where the middle (displacement) candle is so energetic that the **wicks of candle 1 and candle 3 do not overlap**. Bullish FVG = gap between candle 1's high and candle 3's low; bearish = candle 1's low to candle 3's high. Zero overlap between those wicks is the test — any overlap means no FVG (consistent across every primary-derived and community source).
- **BISI/SIBI are directional labels, not separate patterns.** BISI = Buy-side Imbalance, Sell-side Inefficiency (the bullish FVG — one-way buying left the sell side untraded); SIBI = Sell-side Imbalance, Buy-side Inefficiency (the bearish FVG). ICT's terminology encodes *which side was inefficient* and therefore which direction the rebalancing trade goes (innercircletrader.net SIBI/BISI tutorial; michaeljhuddleston.org notes).
- **Displacement is the qualifier.** An FVG only carries institutional meaning when created by displacement — an energetic move, ideally one that breaks structure or sweeps liquidity. Small drift gaps are noise. In the opening-range context ICT adds an explicit disqualifier: a 9:30–10:00 FVG whose displacement does not break the preceding candles' range is not a valid "1st Presented FVG" (innercircletrader.net 1st-presented-FVG tutorial; see the key-opens note).
- **Consequent encroachment (CE) = the 50% midpoint of any gap or wick**, measured on the **wick boundaries** of the FVG (candle 1 wick ↔ candle 3 wick), not bodies. ICT's core claim: the algorithm does not need to fill a gap fully — repricing to CE is the *minimum* rebalancing, and in strong conditions price reacts at CE and goes (multiple ICT lectures; thesimpleict CE guide; grandalgo CE guide). CE is dual-use: **entry** level when price retraces into a gap you want to trade from, **target/first-objective** when price is trading toward a gap.
- **CE applies to wicks as first-class objects (ICT primary, 2024 Mentorship Lecture 8):** "wicks should be treated the same way as gaps" — divided into quarters with the CE (midpoint) most important. Price unable to trade past the lower half of a bottom wick = sign of strength; unable to reclaim the upper half of a top wick = weakness (ICT Sharks Lecture 8 notes). This is the primary source behind targeting/reading "CE of wicks."
- **IFVG (inversion fair value gap) = a violated FVG flipped to the opposite polarity.** When price **body-closes** through an FVG (not merely wicks through), the failed gap becomes support→resistance or resistance→support: a broken bullish FVG (BISI) becomes a bearish IFVG; a broken bearish FVG (SIBI) becomes a bullish IFVG (ICT "What Validates Inversion Fair Value Gaps" Gems clip from the 2022/2023 mentorship era; innercircletrader.net IFVG tutorial).
- **ICT's own IFVG validation sequence (Gems clip, primary):** the inversion is *validated* by "that first fair value gap that forms after breaking away" — i.e., displacement through the old gap leaves a **new** FVG; you enter on the trade back into that area and "place a stop just above [the old gap's] consequent encroachment." So in ICT's cleanest telling, the old gap's CE is the **risk line**, and the fresh FVG is the entry vehicle. He also warns (2024 L8) that **not every FVG can become an IFVG** — without, unfortunately, giving criteria (ICT Sharks L8 notes; flag as under-specified in primary).
- **Standard IFVG entry conventions (community codification):** wait for the body close through the gap → wait for the retrace into the inverted zone → enter at the IFVG's CE → stop beyond the far edge of the inverted gap (or beyond the sweep extreme that preceded the inversion) → target the next liquidity pool. Preceding liquidity sweep + structure shift substantially upgrade the setup (innercircletrader.net; plancana; fxnx).
- **No statistics.** No ICT-published fill rates, CE-respect rates, or IFVG success rates exist. All percentages circulating online are unsourced.

## Details / mechanics

### Drawing and reading an FVG
1. Find a displacement candle; check candle 1 wick vs candle 3 wick. No overlap → box the gap between them (bullish: c1 high ↔ c3 low; bearish: c1 low ↔ c3 high).
2. Mark CE at 50% of the box; later-era ICT also marks quadrants (0.25/0.75) — same quarters template used on NWOG/NDOG and the ORG (see wave-1 gaps note).
3. Reading retraces: reaction at the near edge or CE with a hold = delivery in the original direction intact; body close through the whole gap = inversion candidate. A **wick** through with a body close back inside = the gap held (that's a sweep of the gap, not an inversion) — judge the close, not the touch (fxnx; consistent with ICT's body-close emphasis everywhere).
4. Balanced price range: when an up-leg and down-leg overlap and fill each other's gaps, the overlapping range is "balanced" and should not be revisited in the current leg — a revisit is a trade-review signal (theicttrader wick/BPR note; ICT-derived).

### CE as target vs entry
| Use | Mechanic |
| --- | --- |
| Entry | Limit at CE of the gap you're trading from (2022-model convention: CE of the 1st Presented FVG / post-MSS FVG). Stop beyond the gap's far edge or the sweep extreme. |
| Target | When price trades toward an opposing gap/wick, CE is the first objective — the minimum rebalancing level. Full fill and far-edge are extensions, not requirements. |
| Bias tell | Respect of CE without deeper penetration = strength of the original displacement; body close through CE degrades it (mean-threshold logic, same as order blocks). |

### IFVG lifecycle
1. FVG prints via displacement → initially expected to hold.
2. Violation: candle **body closes** beyond the entire gap in the opposite direction. Wick pokes don't invert.
3. Context filters (community, consistent with ICT's examples): a liquidity sweep preceding the violation, alignment with HTF draw, and an MSS on the same timeframe make the inversion trustworthy; a drifting close through a stale gap does not.
4. Validation (ICT Gems): displacement away leaves a fresh FVG → that new gap is the entry zone; old gap's CE is the stop reference.
5. Entry/stop (community standard): limit at the IFVG's CE on the retest; stop beyond the far edge of the inverted gap plus buffer; never inside the zone.
6. IFVGs are the entry mechanism in ICT's 2024 Lecture 2 model: first FVG prior to the stop hunt becomes "the most sensitive" IFVG, entered at its CE after the sweep (innercircletrader.net 2024 L2 notes).

### Canon vs community
| Element | Status |
| --- | --- |
| 3-candle FVG, wick-to-wick, no-overlap test; BISI/SIBI labels | ICT primary (Core Content Month 4 FVG lecture) |
| CE = 50% of gap; minimum-rebalancing claim; quarters | ICT primary (multiple lectures, incl. 2024 mentorship) |
| Wicks treated as gaps; wick CE; half-wick strength/weakness read | ICT primary (2024 Mentorship Lecture 8) |
| IFVG = body-close-violated FVG flips polarity; validated by the first new FVG after break; stop vs old CE | ICT primary (Gems clip from mentorship-era teaching; 2024 L2 model) |
| "Not every FVG can become an IFVG" | ICT primary assertion (2024 L8) — criteria never specified; treat as open question |
| Enter IFVG at CE, stop beyond far edge, sweep+MSS filters | Community codification consistent with ICT examples |
| Any respect/fill percentages | Folklore — no methodology anywhere |

## APPLICATION TO THE VAULT

- **Targeting CE of FVGs/wicks is squarely ICT canon — including the wick half.** Your habit of referencing CE of wicks as targets was, until 2024, community practice; Lecture 8 made it primary ("wicks should be treated the same way as gaps," CE most important). For the fixed 1:5/100-pt cap, the practical import is the *minimum-rebalancing* framing: price owes the CE, not the full gap. If a projected 1:5 target sits **beyond** an opposing gap's CE but short of its far edge, the framework says the reliable draw ends at CE — a "target beyond nearest opposing CE: Y/N" tag would show whether those trades disproportionately die at CE just short of target.
- **Your rejection-block entry and the FVG entry are the same trade in different clothing.** The 2022-model NY-AM sequence enters at the CE of the post-MSS FVG; your model enters at the 1m rejection-block wick-start. Both are limit entries into the manipulation leg's footprint with stops beyond the sweep extreme. When both exist (block + fresh FVG from the same displacement), the FVG CE is usually the deeper fill — same A/B question as the wick-CE tag in the rejection-block note, and the journal can answer it.
- **The half-wick rule is a live trade-management signal for your entries.** Entered at the wick-start, price pushing past the wick's CE against you is ICT's own strength/weakness tell (L8) *before* your stop at the extreme is hit. Logging "wick CE crossed against position: Y/N" per trade would tell you whether the half-wick line is an early-exit edge or noise on 1m MNQ — nobody has data on this; yours would be first.
- **IFVGs give your stop-outs a second life.** A rejection-block failure (body close through the block) frequently coincides with an FVG inversion in the same leg. ICT's validated-IFVG sequence — displacement through, fresh FVG, retest — is a defined re-entry template in the *opposite* direction rather than a revenge re-entry in the original one. Worth a "post-stop inversion setup appeared: Y/N" census column before ever trading it live.
- **Displacement is the missing explicit gate in your checklist.** Every FVG/IFVG source (primary and community) requires displacement — range-breaking energy, ideally with a sweep — for the gap to mean anything. Your 10:00 blocks inherit displacement implicitly when the wick swept a real level; making it explicit ("did the leg leave a valid FVG: Y/N") keeps 1m noise-wicks out of the sample and matches the disqualifier ICT applies to opening-range FVGs.
- **Body close vs wick poke is the universal invalidation grammar.** Blocks, FVGs, IFVGs, CISD — in every case ICT's line between "swept/held" and "failed/inverted" is the body close. Your stop lives beyond the block extreme; consider requiring a *body close* beyond it (not a tick-through) in replay grading, since a wick-through-and-reclaim is, in this grammar, the level holding.

## Sources

- ICT Mentorship Core Content — Month 04 — Fair Value Gaps (primary; the 3-candle wick-to-wick definition; per the ICT 2022 study-guide PD-array reading list) — https://www.scribd.com/document/875628134/ICT-GUIDE-1
- ICT Gems — "What Validates Inversion Fair Value Gaps" (primary clip; inversion on closing basis, validation by first new FVG, stop just above old CE) — https://www.youtube.com/watch?v=Osyo_GxNolU
- ICT 2024 Mentorship Lecture 8 notes (wicks = gaps, wick CE/quarters, half-wick strength/weakness, "not every FVG can become an IFVG") — https://forum.ictsharks.com/t/2024-ict-mentorship-lecture-8-august-14/561
- innercircletrader.net — ICT 2024 Mentorship Lecture 2 notes (IFVG-at-CE entry model, first FVG prior to stop hunt, fib −2/−2.5 targets) — https://innercircletrader.net/tutorials/ict-2024/mentorship-lecture-2/
- innercircletrader.net — SIBI and BISI tutorial (directional FVG labels, zones, stop conventions) — https://innercircletrader.net/tutorials/sibi-and-bisi-the-ict-concepts/
- innercircletrader.net — ICT Inverse Fair Value Gap tutorial (body-close requirement, bullish/bearish IFVG, premium/discount context, mistakes) — https://innercircletrader.net/tutorials/ict-inversion-fair-value-gap/
- thesimpleict.com — Consequent Encroachment guide (CE on wick boundaries, minimum-rebalancing framing; community) — https://thesimpleict.com/consequent-encroachment-ce-guide/
- grandalgo.com — Consequent Encroachment explained (CE as entry, target, and bias filter; applies to any range; community) — https://grandalgo.com/blog/consequent-encroachment-explained
- theicttrader.com — "Wicks Require Special Consideration" (wick-as-inefficiency, wick CE stop/strength usage, balanced price range; ICT-derived community) — https://theicttrader.com/2024/03/05/wicks-require-special-consideration/
