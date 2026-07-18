---
topic: market-maker-buy-sell-models
researched: 2026-07-18
sources: 6
agent-cycle: cycle3-laneC
---
# ICT Market Maker Buy/Sell Models (MMXM) — the Full-Sequence Template

## Key findings

- **Primary source secured**: "ICT Mentorship 2023 — Market Maker Models" (The Inner Circle Trader YouTube, 2023-11-01, video iKsIbUblSWM, ~55 min). Full auto-caption transcript archived at `vault-app/data/ict-transcripts/market-maker-models-2023.txt`; a community timestamped transcription (quagmyre XWiki) was used for [h:mm:ss] cites. ICT frames it as **"the last teaching lecture on the Inner Circle Trader YouTube channel"** and **"one of the closest viewpoints to how I actually trade… 99% of the time when I'm taking a trade, it's usually something like this — that's the framework behind it"** [0:00:31–0:04:34].
- **The model is a curve, not an entry.** MMXM = "algorithmic price delivery in institutional price swings" [0:05:13] — a V (buy model) or inverted-V (sell model) with a **buy side of the curve** and a **sell side of the curve** [0:05:05]. Sell model sequence: **original consolidation → engineered rally in stages (accumulation of shorts by smart money / engineering liquidity below as higher lows form) → Smart Money Reversal (SMR) at a higher-timeframe premium PD array → distribution legs back down through the curve, through the engineered liquidity, into and beyond the original consolidation.** Buy model = "everything here is shown in reverse" [0:03:38–0:03:49] — ICT teaches only the sell model in the lecture and tells you to mirror it.
- **The lecture is explicitly PD-array-dependent**: "a market maker model is relying on your understanding of every PD array made available… if you don't know what a breaker is, a mitigation block, an inversion fair value gap — the observation of seeing it real time may escape you" [0:00:45–0:01:35]. MMXM is the *container*; the arrays are the touch-points.
- **Symmetry rule (the mechanically interesting part)**: arrays formed on the buy side of the curve are *reused in reverse* on the sell side — "this down-close candle was a bullish order block on the buy side of the curve… used in reverse on the sell side of the curve" as resistance for shorts [0:51:48–0:53:06]. So the left leg writes the map for the right leg.
- **Stage vocabulary**: first-stage distribution (the entry near the SMR — ICT calls the "low-risk short" the one *after* the SMR confirms; the earlier one is "a pyramid entry" [0:50:52–0:53:31]) vs **second-stage redistribution** — the re-short on the retrace during the right-side leg. ICT: "the easiest, high-speed, low-resistance liquidity runs… are always going to be the second-stage redistribution in the market maker sell model… one of the most qualifying factors in my trading" [0:41:38–0:42:08]. The **unicorn** (breaker + FVG overlap) is named as a second-stage-redistribution pattern [0:40:58].
- **Buy-side *delivery* ≠ buy-side *liquidity*** — liquidity is the stagnant resting-stop levels; delivery is the animated directional movement offering that side as it runs [0:09:09–0:10:08]. The engineered leg is delivery *toward* liquidity; the reversal converts it.
- **Entry discipline stated in-lecture**: identify the original consolidation, wait for it to be broken / for the SMR at the HTF array; a low-risk short uses the highest high of the consolidation-area retrace as the stop anchor [0:42:34–0:47:39]. Narrative (why price wants to go there) is prerequisite and "outside the scope" [0:06:45].
- **Zero statistics, and an explicit difficulty warning**: "this is going to be very difficult for a lot of you… multitudes of market maker buy and sell models are going to escape you, you won't see them until after the fact — log them, mark them up, annotate them" [0:02:08–0:02:57]. It is a hindsight-training template like the weekly profiles (cross-ref `weekly-profiles-premium-discount.md`); no frequency, WR, or expectancy claims exist in the primary record. Community tutorials (innercircletrader.net MMBM/MMSM pages, fxnx) add step lists and the four-phase naming (Original Consolidation / Engineering Liquidity / Smart Money Reversal / Liquidity Hunt) but likewise publish no data.

## Details / mechanics

### The sell-model sequence (mirror everything for the buy model)
| Phase | What happens | Arrays involved |
| --- | --- | --- |
| 1. Original consolidation | Price coils in a range; this range is both the launch pad and the final target zone | Range high/low; repeating levels inside it ("levels that constantly repeat… the basis of swing trading" [27:41]) |
| 2. Buy side of the curve (engineering) | Staged rallies leave higher lows = engineered sell-side liquidity; each up-leg leaves bullish OBs/FVGs that will be reused in reverse later | Relative equal highs above = the draw; bullish OBs/FVGs printed on the way up |
| 3. Smart Money Reversal | Price runs the buy-side liquidity into a **higher-timeframe premium array** and rejects; "it will take a long time for beginners to anticipate SMRs as entry points" [42:34] | HTF FVG/OB/breaker/old high; on tape: 60-min FVG rally → inversion FVG confirming the turn [32:20] |
| 4. Sell side of the curve (distribution) | First-stage distribution near the SMR (pyramid), the "low-risk short" after structure breaks lower, then **second-stage redistribution** on the retrace — the fastest, lowest-resistance leg | Left-leg bullish OBs now act as resistance (symmetry rule); mean threshold (50% of OB body) as the touch [49:44] |
| 5. Completion | Delivery back through the engineered higher-lows (liquidity hunt) into the original consolidation and often beyond, toward the opposing HTF draw | Old lows / consolidation range low = targets |

### Claim vs evidence
| Claim | Status |
| --- | --- |
| Full curve sequence, stage names, symmetry rule, unicorn = 2nd-stage redistribution | **ICT canon** (2023 lecture, on tape, transcript archived) |
| "2nd-stage redistribution = easiest, high-speed runs" | **ICT canon assertion** — no measurement offered |
| Four-phase naming (OC / Engineering / SMR / Liquidity Hunt), fib staging of targets | Community formalization (innercircletrader.net) — consistent with the lecture, cleaner packaging |
| Any respect-rate / WR / frequency number for MMXM | **Does not exist anywhere** — hindsight-training template by ICT's own framing |

## APPLICATION TO THE VAULT

1. **Dual46 is a fragment of the sell/buy model's right side.** The 10:00 KO Judas + manipulation wick = a micro Smart Money Reversal; the 1m RB limit in OTE = the first-stage entry on the fresh curve side; the run toward 1:5 = the delivery leg. Naming which MMXM phase the day's trade occupied is a free journal tag that requires no rule change — and ICT's own claim that **second-stage** (the *second* retrace after the reversal) is the fastest leg is a testable hypothesis for why some Dual46 winners hit 100 pts fast and others grind: log "1st-stage vs 2nd-stage entry" per fill.
2. **The symmetry rule upgrades the NWOG sleeve's context read.** A filled NWOG acting as S/R (the June finding) is exactly "left-leg array reused in reverse on the right side of the curve." When a tap candidate appears, check which side of the current curve price is on: an NWOG tap *with* the curve (right-side continuation) is the canon-favored variant; a tap against an unfinished engineering leg is the trap ICT warns about ("stop entering during manipulation").
3. **Targets:** canon says the delivery leg aims at the engineered liquidity, then the original consolidation, then the HTF draw — i.e. structural targets, aligning with the structural-TP Stage-0 question (see `powell/structural-target-sleeve-evidence.md`). The 100-pt cap frequently truncates the run to the original consolidation; that's a cost the structural-TP study should price, not a reason to touch the freeze.
4. **Adopt the logging instruction literally.** ICT's "log them, mark them up, annotate as if you saw it coming — pseudo-experience" is the same replay-journal mechanism the Vault already runs; add an MMXM sketch (which phase, where's the OC, where was the SMR array) to the daily prep on days the curve is legible. Eyes-only; no gate changes.
5. **Do not build an MMXM detector.** With no canonical quantification and heavy narrative dependence ("outside the scope"), this is the least mechanizable ICT concept reviewed so far — strictly a context lens, unlike the RB/OTE mechanics that Dual46 froze.

## Sources

1. **ICT (primary)** — "ICT Mentorship 2023 — Market Maker Models," The Inner Circle Trader, YouTube, 2023-11-01 — https://www.youtube.com/watch?v=iKsIbUblSWM — transcript archived: `vault-app/data/ict-transcripts/market-maker-models-2023.txt`
2. quagmyre XWiki — timestamped transcription + outline of the same lecture (used for [h:mm:ss] cites) — https://info.quagmyre.com/xwiki/bin/view/Forex/The-Inner-Circle-Trader/ICT-Youtube-Series-2023/ICT-YT-2023-11-01-ICT-Mentorship-2023-Market-Maker-Models/
3. innercircletrader.net — ICT Market Maker Buy Model tutorial (four-phase naming, MMBM steps) — https://innercircletrader.net/tutorials/ict-market-maker-buy-model/
4. innercircletrader.net — ICT Market Maker Sell Model tutorial (fib staging of targets; MMSM steps) — https://innercircletrader.net/tutorials/ict-market-maker-sell-model/
5. michaeljhuddleston.org — MMXM notes (PD-array-transition framing; accumulation/manipulation/distribution packaging) — https://michaeljhuddleston.org/notes/ict-market-maker-model-mmxm-trade-with-smart-money/
6. fxnx.com — Market Maker Playbook (V / inverted-V curve framing; second-stage re-accumulation/redistribution emphasis) — https://fxnx.com/en/blog/mastering-the-ict-market-maker-model
