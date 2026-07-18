---
topic: liquidity-voids-vs-fvgs
researched: 2026-07-18
sources: 5
agent-cycle: cycle3-laneC
---
# Liquidity Voids vs Fair Value Gaps — Definitions & Delivery Expectations

Companion to `fvg-ifvg-consequent-encroachment.md` (which covers FVG/IFVG/CE mechanics in depth); this note only settles the void/FVG distinction and what each implies about delivery.

## Key findings

- **FVG = the discrete 3-candle unit; liquidity void = the multi-candle displacement container.** All sources agree: an FVG is one three-candle imbalance (candle-1 and candle-3 wicks fail to overlap); a liquidity void is the *entire* one-directional displacement run — typically breaking out of a consolidation — which spans 3+ candles and usually **contains two or more FVGs stacked inside it** (innercircletrader.net; tradingfinder; FXOpen).
- **Formation context differs:** FVGs print constantly in normal delivery; voids form on **strong displacement out of consolidation, news events, or off-hours repricing** — moves where one side of the book was simply absent, so price covered the distance with no internal retracement.
- **Delivery expectations differ (the practical payoff):**
  - *FVGs* are local housekeeping — the algorithm tends to rebalance them relatively quickly (within candles-to-sessions), and per the 2022-mentorship narrative logic, **once an FVG is rebalanced price is "free to expand" toward the next liquidity pool** — rebalanced = expansion cue, open = retracement magnet.
  - *Voids* are slower and less obligatory — they can be repriced **partially** (often only to the nearest internal FVG or the void's CE) and news-driven voids "may remain unfilled indefinitely" (FXOpen). A void is a *map of the path back*, not a promise of full fill.
- **Inside a void, the internal FVGs are the reaction points.** Community synthesis (consistent with ICT's usage of "reclaiming"/repricing runs): when price re-enters a void, expect it to move fast through the empty stretches and stall/react at the embedded FVGs and at the void's origin — the void's own emptiness is why "low-resistance liquidity run" legs are fast (cross-ref `market-maker-buy-sell-models.md` second-stage redistribution).
- **Relation to opening gaps:** NWOG/NDOG are *true* voids (zero trades printed), which is why ICT ranks them above ordinary imbalances (`nwog-ndog-opening-gaps.md`). Ordinary intra-session voids are thin-participation zones, not zero-trade zones — a hierarchy worth keeping when two "gap" levels conflict: NWOG > liquidity void > single FVG.
- **Evidence status:** definitions are stable across ICT-derived sources; **no fill-rate statistics exist for liquidity voids** anywhere (the only adjacent data is the RTH gap-fill study in the NWOG note). Everything about "expect return to the void" is teaching, not measurement.

## Details / mechanics

| | Fair Value Gap | Liquidity Void |
| --- | --- | --- |
| Structure | Exactly 3 candles; wick gap between #1 and #3 | 3+ candles of one-directional displacement; contains ≥1 (usually several) FVGs |
| Typical origin | Any impulsive delivery | Breakout from consolidation; news prints; off-hours repricing |
| Fill expectation | Rebalance is normal housekeeping; often quick | Partial repricing common; full fill can take long or never (news voids) |
| First reaction points on re-entry | The gap itself; CE (50%) | Embedded FVGs, void CE, void origin |
| Signal on completion | Rebalanced FVG ⇒ expansion toward next pool | Repriced void ⇒ displacement fully "audited"; original consolidation back in play |
| Trade use | Precision entry zone (retrace-and-continue) | Context/target map; fast-travel zone for the delivery leg |

## APPLICATION TO THE VAULT

1. **Target realism for Dual46 runners:** if the 10:00 reversal leg enters a prior void, expect *fast* travel through the empty stretch and stalls at embedded FVGs — a void between entry and the 1:5 target is a tailwind; a void that *ends* (origin/consolidation) before 100 pts is a documented stall point. This feeds the structural-TP Stage-0 study (`powell/structural-target-sleeve-evidence.md`) as one of the structural-level types to test, not a rule change.
2. **NWOG sleeve columns stay as designed:** the void/FVG hierarchy confirms the census should treat NWOG taps as a *separate class* from ordinary imbalance taps — do not pool them with FVG-tap anecdotes when the sleeve verdict is computed.
3. **"Rebalanced ⇒ expansion" is a cheap morning read:** during 9:30–10:00 prep, noting whether the overnight leg's FVGs are already rebalanced tells you whether the 10:00 move starts anchored (open FVG behind = retrace risk into the entry window) or free to expand (helps the PDH/PDL story gate, eyes-only).
4. **No numbers exist to import** — any future "void fill-rate" column in the census would be first-of-its-kind data, same as the NWOG respect-rate finding.

## Sources

1. innercircletrader.net — Master ICT Liquidity Void (definition, void-vs-FVG, void contains multiple FVGs) — https://innercircletrader.net/tutorials/master-ict-liquidity-void/
2. FXOpen Market Pulse — FVGs and Liquidity Voids: differences & strategies (fill-speed contrast; news voids may never fill) — https://fxopen.com/blog/en/fair-value-gaps-vs-liquidity-voids-in-trading/
3. TradingFinder — Liquidity Void (LV) in ICT (consolidation-breakout origin; consecutive FVGs inside) — https://tradingfinder.com/education/forex/ict-liquidity-void/
4. michaeljhuddleston.org — ICT 2022 Mentorship Ep. 7 narrative framework ("has the FVG been rebalanced?" ⇒ expansion logic) — https://michaeljhuddleston.org/notes/ict-2022-mentorship-episode-7-master-the-narrative-framework/
5. Cross-refs: `ict/fvg-ifvg-consequent-encroachment.md`, `ict/nwog-ndog-opening-gaps.md`, `ict/market-maker-buy-sell-models.md`
