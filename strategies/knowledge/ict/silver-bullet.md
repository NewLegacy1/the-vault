---
topic: silver-bullet
researched: 2026-07-17
sources: 9
agent-cycle: cycle2-wave1
---
# ICT Silver Bullet — the 10:00–11:00 AM Time-Based FVG Model

## Key findings

- **Primary source secured**: ICT's own free lecture "2023 ICT Mentorship — ICT Silver Bullet Time Based Trading Model" (YouTube, The Inner Circle Trader, May 14 2023, 19 min, 1.5M views) — full transcript reviewed. His definition: "a time-based algorithmic trading model for all asset classes." Three fixed 60-minute windows, **always New York local time**: 3:00–4:00 AM (London Open SB — "this is my actual model for my son Cameron"), **10:00–11:00 AM (AM session SB)**, 2:00–3:00 PM (PM session SB). The model was first taught free in the 2022 YouTube mentorship era; the 2023 lecture is the canonical consolidated statement.
- **The entry is an FVG that forms *inside* the window** after a shift in market structure, traded on the retrace: "we wait for… a fair value gap… it trades up into it between 10:00 and 11:00, we can sell short there" (2023 lecture, ES example). Entry must occur inside the window; **the hold may extend past it**: "the trade is many times held in duration longer than the window that the framework and entry is derived from."
- **Minimum framework rule (canon, exact numbers)**: the setup must *offer* at least **10 handles (40 ticks) on index futures** / 15 pips forex — "if you can't work out a range move [of] at least [that], the trade is probably not high probability… let it pass." The framework is "the best case price delivery… **not your actual trade entry-to-exit range**"; a new student books ~5 handles inside it.
- **Draw on liquidity is the prerequisite skill, not the entry pattern**: "if you don't know where price is trying to go… whatever entry concept you use is probably going to fail you." His canonical draw list for SB framing: previous day high/low, previous session (London) high/low, previous week high/low, current or old **NWOG**, classic OTE, or an inefficiency (SIBI/BISI) above/below price per the 2022 model. "Not all of these will be in the charts, but most days one of these criteria will be in play."
- **Validation tell**: candle **bodies** should respect the FVG — "the wicks do the damage but the body's telling you the narrative."
- **Frequency claim (canon, unquantified)**: "every single trading day one of these setups are going to form" (across the three windows, maybe not in your instrument), and "it's highly, highly consistent… extremely high probability" — **no statistics are offered anywhere in the lecture**; he explicitly tells viewers "you don't have enough to trade this pattern, so you have to backtest it" and rebukes followers who traded his Twitter call-outs as signals.
- **Community backtests exist but are weak-to-moderate evidence** (see table below): a 180-entry tracked study reporting first-target hit 74% *with* a pre-10:00 sweep vs 51% without (no public data), a "55–65% WR at 1:3" tutorial claim (no ledger), and one open-source NQ 1-minute backtest repo with explicit mechanical rules (reproducible, parameters visible).
- **Relation to the 9:50–10:10 macro**: the macro's back half (10:00–10:10) is the *opening* of the SB hour. In the community NY-AM template the macro delivers the sweep + displacement whose FVG then becomes the Silver Bullet entry on the 10:00–11:00 retrace. The two teachings are the same clock viewed at different zoom levels — macro = the 20-minute impulse window, SB = the 60-minute entry-formation window (cross-ref `time-based-macros.md`, `key-opens-power-of-3.md`).

## Details / mechanics

### The canonical sequence (10:00–11:00 AM, from the 2023 lecture)
1. **Before the window**: establish the next draw on liquidity (from the list above). Direction comes from the draw, "not necessarily the bias."
2. **Inside the window**: price displaces toward/away from the draw, shifting market structure and leaving an FVG (on 1m–5m; "can be found on timeframes as low as 15 seconds, but start on 5-minute and work down").
3. **Entry**: limit into the FVG retrace, inside the window only. Stop per his OTE/FVG rules (beyond the displacement swing; the ES example "would have never stopped you out with the rules I teach" despite a poke above the gap).
4. **Target**: the draw (e.g. sell-side under relative equal lows) — framework must offer ≥10 index handles; book ~5 as a new student.
5. **One market**: "be a specialist… if you just follow one market you can get your setups there."

### Canon vs community
| Claim | Status |
| --- | --- |
| Three 60-min windows (3–4 / 10–11 / 14–15 NY) | **ICT canon** (2023 lecture, on tape) |
| FVG-in-window entry after MSS; hold may outlast window | **ICT canon** (2023 lecture) |
| ≥10 handles framework / book 5; bodies-respect-the-gap | **ICT canon** (2023 lecture) |
| AM (10–11) is "the best of the three windows" | **Community ranking** (tutorial sites); ICT presents the three as parallel |
| Sweep of the 9:00 AM hourly candle range required; target = opposite side of the 9 AM range | **Community formalization** (TTrades AM-SB variant) — clean and testable, but not in the primary lecture |
| Pre-window liquidity sweep as a hard filter | Community; consistent with canon's "sweep→displacement" macro anatomy but ICT does not state it as an SB precondition |
| "55–65% win rate at 1:3" | **Community claim, no ledger** (innercircletrader.net tutorial) |
| 74% vs 51% T1 with/without pre-10:00 sweep (180 entries, NQ+EURUSD 2024–25) | **Community self-reported study** (ictkillzone) — plausible methodology described, data not published |
| Open-source NQ 1m backtest (FVG/OB/breaker entries, ATR-gated displacement, min 2.5 RR, BE at 3R) | **Reproducible community code** (hindsight-finance GitHub) — parameters explicit; results depend on run |

None of the community numbers meet the Vault's evidence bar (no path MC, no fill modeling, mostly no public trade ledgers). Treat them as existence proofs that the setup *can* be mechanized, not as expectancy estimates.

### How it interlocks with the already-noted ICT clock
- 9:30 open fires the Judas → MSS ~9:40–9:50 → **9:50–10:10 macro** produces speed/displacement → the FVG left behind is retraced 10:00–11:00 = **Silver Bullet entry** → distribution into the 10:50–11:10 macro / 11:00 boundary. The user's 10:00 anchor sits precisely at the hand-off between the macro impulse and the SB retrace.
- SB targets and the draw-on-liquidity note use the same pool list (PDH/PDL, session extremes, NWOG, CE of imbalances) — nothing new to mark.

## APPLICATION TO THE VAULT

1. **Dual46's window is Silver Bullet-adjacent but its entry is not an SB entry.** SB = retrace into a *displacement FVG formed inside 10:00–11:00*; Dual46 = limit at a *rejection-block wick* formed into 10:00. Both are retracement entries at the same clock position toward the same draws. Do not blend the trigger definitions — the freeze stays; this note exists so the journal can *name* which pattern actually printed.
2. **The SB "framework must offer 10 NQ handles" rule is a useful pre-trade sanity check already implicit in the 1:5.** A 100-pt capped target with a ~20-pt stop demands far more room than SB's 10-handle minimum — if the nearest opposing pool is closer than the stop distance ×2–3, ICT himself would call the trade low-probability and pass. This is a cheap "is there room to the draw?" gate that matches the daily-bias PDH/PDL story gate.
3. **The window legitimizes patience past 10:10.** Canonically the entry may form *any time* inside 10:00–11:00, and the 10:50–11:10 macro is the sanctioned second bite (per the macros note). If the 10:00 RB doesn't fill, the SB teaching argues for waiting for the FVG retrace rather than chasing — consistent with the frozen limit-only discipline.
4. **Hold-past-the-window is canon.** SB trades "many times held" beyond 11:00; Dual46 runners toward 1:5 at ~11:00+ are not off-model by ICT's own statement. Combine with the macros note's "still open at 11:00" journal tag to test staleness on Vault data instead of lore.
5. **Community stats offer a testable hypothesis for the Vault census**: pre-10:00 sweep present vs absent (the 74/51 split). The user's daily-bias process (NWOG → PDH/PDL story → Judas/Cont) already encodes "was a pool swept before the window" — one boolean column in the journal would replicate the only quantified SB filter claim on the user's own fills.

## Sources

1. **ICT (primary)** — "2023 ICT Mentorship — ICT Silver Bullet Time Based Trading Model," The Inner Circle Trader, YouTube, 2023-05-14 — https://www.youtube.com/watch?v=tRq1hyGGtl4 (full transcript reviewed; all direct quotes above)
2. innercircletrader.net — ICT Silver Bullet Strategy tutorial (times table, 55–65% WR claim, NQ/ES origin) — https://innercircletrader.net/tutorials/ict-silver-bullet-strategy/
3. ictkillzone.com — ICT Silver Bullet step-by-step guide (180-entry tracked study; pre-window sweep filter 74% vs 51% T1) — https://www.ictkillzone.com/ict-silver-bullet
4. ictkillzone.com — ICT Backtesting guide (SB as first backtest target; 50–100-trade minimum-sample methodology) — https://www.ictkillzone.com/ict-backtesting
5. TTrades — "The AM Silver Bullet Strategy on NQ" (9:00 AM hourly-range variant; community formalization) — https://ttrades.com/the-am-silver-bullet-strategy-on-nq/
6. hindsight-finance — Silver-Bullet-AM-Session (open-source NQ 1m backtest; explicit ATR/RR/BE parameters) — https://github.com/hindsight-finance/Silver-Bullet-AM-Session
7. FXOpen Market Pulse — ICT Silver Bullet mechanics (window times incl. DST note; FVG/liquidity definitions) — https://fxopen.com/blog/en/what-is-the-ict-silver-bullet-strategy-and-how-does-it-work/
8. Medium (tradingstrategycourses) — ICT Silver Bullet summary ("forms every single day between 10 and 11"; five-handles-as-new-student framing; 15-second-to-5-minute timeframe guidance) — https://medium.com/@tradingstrategycourses/ict-silver-bullet-simplifying-the-trading-strategy-approach-2a99ccc1985b
9. arongroups.co — Silver Bullet as constrained execution framework (no-sweep-no-trade / no-MSS-no-trade decision tree; community synthesis) — https://arongroups.co/technical-analyze/ict-silver-bullet-strategy/
