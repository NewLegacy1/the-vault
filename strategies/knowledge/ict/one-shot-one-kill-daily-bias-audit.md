---
topic: one-shot-one-kill-daily-bias-audit
researched: 2026-07-18
sources: 7
agent-cycle: cycle3-laneC
---
# ICT One-Shot-One-Kill & Daily-Bias Models vs Dual46's One-Trade Cadence — Alignment Audit

## Key findings

- **OSOK is a *weekly* one-trade model, and its skeleton maps onto Dual46 almost 1:1 at day-scale.** The canonical OSOK sequence (community consolidations of ICT's mentorship teaching): mark the **20-week IPDA dealing range** (highest high/lowest low of the last 20 weeks) → weekly bias = which extreme price is drawing toward → pick the bias-aligned PD array → wait for **manipulation against the bias early in the week (Mon–Wed), ideally on a high-impact news event** → enter on a **15m OTE retrace** in a killzone → one order, fixed objective (50 pips, trail remainder to 75). Dual46 runs the same grammar one fractal down: daily bias gates → 10:00 KO manipulation leg → 1m RB limit in OTE → one order, fixed 1:5 objective. **The audit's headline: Dual46 is not merely compatible with the one-trade cadence — it is the day-scale port of ICT's own low-frequency flagship.**
- **The "single order, fixed objective" management is canon, not a Vault simplification.** OSOK explicitly manages with *one* limit order and a pre-set target (50 of 50–75 pips on the bulk) — the closest thing in all of ICT canon to Dual46's fixed 1:5 capped TP. Relevant to the structural-TP debate (`powell/structural-target-sleeve-evidence.md`): ICT's own one-trade model chose the *fixed objective*, precisely because the model is built for traders who can't babysit.
- **Canon's when-NOT-to-take-the-single-trade list is longer than Dual46's** — consolidated from OSOK + Silver Bullet + weekly profiles + MMXM + Powell (details table below). The additions canon offers beyond the frozen skip conditions: no-catalyst weeks (OSOK wants a volatility injection to lean on), late-week entries (Thu/Fri = the move is usually spent), framework-too-small (SB's ≥10-handle room check), entering during the engineering/manipulation phase (MMXM), and session-budget exhaustion (Powell: huge London/Asia expansion ⇒ NY = accumulation).
- **Daily-bias canon adds the "no draw, no trade" veto:** the draw-on-liquidity teaching (`draw-on-liquidity.md`, SB lecture: "if you don't know where price is trying to go… whatever entry concept you use is probably going to fail you") makes an *unidentifiable draw* a stand-down in itself. The user's three daily-bias gates (NWOG → PDH/PDL story → Judas/Cont) already implement this; the audit point is that an ambiguous gate-2 story is canon grounds to pass, not to coin-flip.
- **Powell's cadence sits between the models and agrees with both:** "max two losses a day, two to three trades per day… three trades per week, high quality" (`powell-rb-entry-teachings.md` §7). Dual46's one-trade/day is the conservative end of Powell's band and the aggressive end of OSOK's (one/week) — canon-consistent from both directions. The daily-loss-limit note already showed one-trade/day *is* the circuit breaker.
- **CLAIM vs EVIDENCE:** OSOK's 50–75 pips/week and all "high probability" language are unquantified teachings; no OSOK ledger exists anywhere. The alignment audit is doctrinal, not statistical.

## Details / mechanics — consolidated "do NOT take the single trade" canon

| # | Stand-down condition | Source | Dual46 status |
| --- | --- | --- | --- |
| 1 | No manipulation side at the key open (no wick to lean on) | Powell ("no manipulation below it — longs are out of the question") | ✅ frozen skip condition |
| 2 | Draw on liquidity unidentifiable / bias gates ambiguous | ICT SB lecture; daily-bias canon | ✅ implemented as the 3 gates; treat "gates disagree" as pass |
| 3 | Counter-trend into an unmet draw | Powell ("that's stupid"); DOL canon | ✅ gate logic covers |
| 4 | Framework offers too little room (nearest opposing pool < ~2–3× stop) | ICT SB ≥10-handle rule | ⚠ implicit in 1:5 feasibility — worth an explicit eyes-only check |
| 5 | Red-folder structure: FOMC morning; day before NFP; 10:00-slot prints | Red-folder consensus (see decision table note) | ⚠ journal/census columns; disc-sleeve rules |
| 6 | S&D / no-catalyst consolidation weeks (NFP/rate-wait; ICT's Jul–Aug caveat) | Month 07 canon; OSOK's news-anchor requirement | ⚠ eyes-only; log `week_type` |
| 7 | Late-week single-shot (Thu/Fri) when the weekly move already delivered | OSOK ("do not force late in the week") | ➖ weekly-scale rule; day-scale analog = Powell's #8 |
| 8 | Session budget spent (London/Asia already expanded hugely) | Powell [high-probability-conditions 18:41–19:10] | ⚠ not in Dual46; cheap boolean `overnight_range_xATR` for the census |
| 9 | Price mid-curve / in the engineering phase (no completed manipulation into an array) | MMXM ("stop entering during manipulation") | ✅ the KO-leave requirement is exactly "manipulation completed" at day-scale |
| 10 | Two losses today / three junk trades | Powell cadence | ✅ one-trade/day dominates it |

Rows marked ⚠ are the audit's yield: canon-supported stand-downs Dual46 does *not* encode. None justify touching the freeze — rows 4, 6, 8 become journal columns; row 5 is already handled in the red-folder note.

## APPLICATION TO THE VAULT

1. **The one-trade cadence needs no defense** — it is the load-bearing structure of ICT's own OSOK and the conservative end of Powell's stated band. Any future pressure to "add a second trade" (e.g. post-loss re-entry) is anti-canon from *both* sources: OSOK forbids forcing; Powell's own 2–3/day band exists *with* a 2-loss stop, and the daily-loss-limit note showed the second trade is where circuit-breaker value dies.
2. **Add three zero-cost journal columns** from the audit's ⚠ rows: `room_to_draw_ok?` (nearest opposing pool ≥ 2–3× stop at arm time), `week_type` (normal / news-wait / S&D-risk), `overnight_range_xATR`. All three are pre-trade observables; after the May walk they either show bleed (and graduate to disc-sleeve rules) or die.
3. **"Gates disagree = pass" should be written into the daily checklist verbatim** — it is currently implicit. Canon (DOL prerequisite) makes it doctrine, and it costs nothing on days that were coin-flips anyway.
4. **OSOK's fixed-objective choice is a point for the AGAINST column in the structural-TP debate** — when ICT designed his own one-trade model he picked the pre-set target, same trade-off Dual46 froze. Cross-logged in `powell/structural-target-sleeve-evidence.md`.
5. **No OSOK statistics exist to import.** The audit is qualitative; the May ledger with the three new columns is, as usual, the only path to numbers.

## Sources

1. innercircletrader.net — ICT One Shot One Kill tutorial (20-week IPDA range, news anchor, Mon–Wed window, single-order 50/75-pip management, when-not-to-trade list) — https://innercircletrader.net/tutorials/ict-one-shot-one-kill/
2. TradingFinder — OSOK identifying & trading guide (mistake list: pre-sweep entry, counter-bias, forcing non-conforming weeks) — https://tradingfinder.com/education/forex/ict-one-shot-one-kill/
3. writofinance / tradingpdf — OSOK community restatements (weekly-bias derivation; DOL pool list) — https://www.writofinance.com/one-shot-one-kill-osok-in-forex/
4. **Powell (primary, Vault archive)** — `high-probability-conditions.txt` [18:15–19:10]; cadence quotes per `powell/powell-rb-entry-teachings.md` §7
5. Vault notes — `ict/draw-on-liquidity.md`, `ict/silver-bullet.md` (≥10-handle rule), `ict/weekly-profiles-premium-discount.md` (S&D weeks), `ict/market-maker-buy-sell-models.md` (phase discipline), `ict/red-folder-playbooks-1000-window.md`, `quant/daily-loss-limits-circuit-breakers.md`
6. Cross-ref — `powell/structural-target-sleeve-evidence.md` (OSOK fixed-objective datapoint added to AGAINST)
7. ForexFactory TFlab OSOK guide (management split 80%/trail) — https://www.forexfactory.com/thread/1344100-ict-one-shot-one-kill-comprehensive-guide-to
