---
topic: ote-optimal-trade-entry
researched: 2026-07-17
sources: 7
agent-cycle: wave-1
---
# OTE (Optimal Trade Entry) & the 0.62–0.705–0.79 Fib Zone

## Key findings

- **Primary source exists and is free:** ICT Market Maker Primer Course, video 18, "OTE Primer — Intro To ICT Optimal Trade Entry" (YouTube Cg0-CFJOJvg; full transcript mirrored on quagmyre.com XWiki). In it ICT states OTE "is really based on buying retracements … as the market makes an impulse price move higher. That impulse price move has to be [incorporating a break in market structure]."
- **Definition:** OTE is the fib retracement zone **between 62% and 79%** of the most recent impulse leg, with **70.5% as the precise/central level**. ICT calls 0.705 the sweet spot; 0.62 and 0.79 bracket the zone (OTE Primer transcript; innercircletrader.net fib settings note).
- **Preconditions ICT teaches:** (1) HTF directional bias first (monthly/weekly in the primer; any HTF for intraday), (2) an *impulse* leg — energetic displacement that **breaks market structure**, not an arbitrary swing, (3) price trading back below equilibrium (0.5) into the 0.62–0.79 discount before entry.
- **Anchoring:** fib drawn on the impulse leg — for longs, **swing low = 1.0 (100%) to swing high = 0.0**, so the OTE zone sits below current price in discount; mirror for shorts. The anchor low is ideally the low that *swept liquidity / started the displacement*. (Community argues wick-vs-body anchoring; ICT's own charts anchor the wick extremes of the leg — the "body-to-body" variant is community interpretation, flag accordingly.)
- **Stop convention:** just beyond the 1.0 anchor — below the swing low for longs, above the swing high for shorts; ICT's forex-era guidance was ~10–20 pips beyond. Logic: if price trades back through the origin of the impulse, the setup premise is dead. Some later ICT examples tighten the stop below an order block/FVG *inside* the OTE zone, accepting earlier invalidation for better R.
- **Targets:** 0.0 (first scale) then symmetrical-price extensions. ICT's fib template includes negative extensions; sources report two variants of his settings — **(-0.27, -0.62, -1.0)** and **(-0.5, -1.0, -2.0)** — both appear in ICT-derived material from different eras. The constant is: first partial at the old high/low (0.0), runner to a measured-move projection.
- **The 0.705 number is ICT-specific, not standard Fibonacci.** It is the midpoint of 0.62 and 0.79. Standard fib packages ship 0.618/0.786; ICT deliberately rounds to 0.62/0.79 and adds 0.705. Any claim that 0.705 has independent mathematical significance is folklore.
- **No statistics.** ICT publishes no hit-rate for OTE. Claimed win rates attached to OTE setups online are folklore with no methodology.

## Details / mechanics

### Setup sequence (as taught in the OTE Primer)
1. Determine direction from HTF (primer uses monthly/weekly; the concept is fractal).
2. Wait for an impulse leg in that direction that breaks a recent structural high (bullish) or low (bearish).
3. Draw the fib from the origin of the impulse (1.0) to its terminus (0.0). Do not redraw on every wiggle — the leg must be the displacement leg.
4. Wait for the retracement to cross under equilibrium (0.5) and enter the 0.62–0.79 zone; 0.705 is the preferred single entry.
5. Confirmation (later-era ICT layering): the OTE zone is highest grade when it overlaps a PD array — order block, FVG, breaker — and when the retrace happens inside a kill zone. In the raw primer, the fib zone alone plus structure break is the model.
6. Stop beyond 1.0; first target 0.0; runner to the extension(s).
7. Invalidation nuance: a *wick* through 0.79 toward 1.0 is tolerated (liquidity grab into the deepest zone); a *close* through the anchor kills the setup.

### ICT fib template (per innercircletrader.net settings note)
| Level | Label |
| --- | --- |
| 1.0 | Start / invalidation (anchor swing) |
| 0.79 | Deep edge of OTE |
| 0.705 | OTE — central level |
| 0.62 | Near edge of OTE |
| 0.5 | Equilibrium (must be below for discount entry) |
| 0.0 | First profit scale (leg extreme) |
| −0.27 / −0.62 / −1.0 | Extension targets (variant: −0.5 / −1 / −2) |

### Canon vs. community
| Element | Status |
| --- | --- |
| 62–79 zone, 0.705 sweet spot, impulse-leg + structure-break precondition, stop beyond anchor | ICT primary (Market Maker Primer 18, transcript available) |
| 2024-era: OTE window 1:30–2:30 PM NY on no-news days | ICT primary (2024 Mentorship Lecture 3) |
| Body-to-body fib anchoring | Community interpretation — ICT's charts use wick extremes |
| "0.705 is mathematically special" / OTE win-rate claims | Folklore — no primary source |

## APPLICATION TO THE VAULT

- **Your "eyes-only" use of 0.62/0.705 is a conservative subset of what ICT teaches, and that's fine.** ICT's actual model uses the zone as the *entry* mechanism; you use it as confluence for a 1m rejection-block entry. The practical consequence: when your rejection block prints *inside* the 0.62–0.79 zone of the morning's displacement leg, you are effectively taking ICT's full OTE-with-PD-array setup (rejection block ≈ the PD array, fib ≈ the zone). When the block prints outside the zone (shallower than 0.62 or deeper than 0.79), you're trading the block alone. Tagging which case each fill was would tell you cheaply whether the fib confluence carries any weight in your own data — the honest answer today is that nobody has published evidence it does.
- **Anchor discipline matters more than the level.** The primer is explicit: the fib goes on the *impulse leg that broke structure*, anchored at its wick extremes. For your 10:00 workflow that means the 9:30–10:00 manipulation leg's extreme (the Judas wick) to the displacement terminus — not the overnight range. A mis-anchored fib silently moves 0.705 by many MNQ points; if fib tags in the journal disagree with replay, check the anchor first.
- **Your stop convention is already ICT-compliant.** Stop beyond the rejection-block extreme is the tighter, later-era variant (stop beyond the PD array inside the zone) rather than the primer's stop-beyond-1.0. Expected trade-off per the framework: more stop-outs from deep 0.79-area wicks, better R when it works. The 0.79 tolerance rule is the useful import: a wick through your block extreme that would have reached only the 0.79 level of the leg is, in ICT's own terms, still valid OTE behavior — that's an argument the census should track "stopped by wick that held 0.79" as a distinct failure mode before widening anything.
- **For the NWOG sleeve:** an NWOG edge or CE that lands inside the 0.62–0.79 retracement of the current HTF leg is the double-confluence version of your gap-tap entry (gap draw + discount zone). Given your June sample showed NWOG reversals specifically at HTF levels, adding a "gap tap inside OTE zone of the governing leg: Y/N" column costs nothing and directly tests the confluence claim.

## Sources

- ICT Market Maker Primer Course 18 — "OTE Primer — Intro To ICT Optimal Trade Entry" (primary; full transcript) — https://info.quagmyre.com/xwiki/bin/view/Forex/The-Inner-Circle-Trader/srt/ICT-Market-Maker-Primer-Course-18-OTE-Primer-Intro-To-ICT-Optimal-Trade-Entry-srt/ (original video: https://www.youtube.com/watch?v=Cg0-CFJOJvg)
- Video summary of the same lecture (structure-break precondition, 62–79 zone) — https://videohighlight.com/v/Cg0-CFJOJvg
- innercircletrader.net — ICT Fibonacci settings (full level table incl. 0.705 and extensions, stop 10–20 pips beyond 1.0) — https://innercircletrader.net/tutorials/ict-fibonacci-levels/
- innercircletrader.net — ICT OTE pattern guide (0.705 precise level, alternate extension set −0.5/−1/−2) — https://innercircletrader.net/tutorials/ict-optimal-trade-entry-ote-pattern/
- ICT 2024 Mentorship Lecture 3 notes (1:30–2:30 PM OTE window on no-news days) — https://innercircletrader.net/tutorials/ict-2024/ict-2024-mentorship-lecture-3/
- TradingStrategyGuides — OTE with Fibonacci (level table, invalidation-on-close convention; community) — https://tradingstrategyguides.com/understanding-ict-optimal-trade-entry-ote/
- FXNX — ICT Fibonacci OTE precision entry guide (anchoring walkthrough, stop logic; community) — https://fxnx.com/en/blog/ict-fibonacci-ote-your-precision-entry-guide
