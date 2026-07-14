# Pine Script guide

## Powell Rejection Block v1 (`Powell_Rejection_Block_v1.pine`)

Rebuilt from the full SOP (`strategies/Powell_Rejection_Block_SOP.md`, transcripts 01–07).

**Coded:** formal RB (sweep + rejection wick; level = wick start, alt = wick CE) · key opens 18:00/00:00/10:00 as soup liquidity + optional proximity filter · sweep pool (PM H/L, PDH/PDL, key opens, 20-bar swing) · 4 entry modes (wick-start limit / CE limit / Auto / **CISD trigger for 1m**) · stop tiers (max 20, min 5 for commission drag) · 1:5 target, BE at +1R · TPT $50K engine.

**NOT codeable — trade these manually:**
- Daily→4H→1H top-down bias, draw on liquidity, open-proximity discretion ("which high/low are we closest to?")
- Forex Factory fundamentals read; CPI/NFP one-sided-trend-day caution
- Data H/L "prominent swing" quality + volume-balance RB marking
- Equal highs/lows recognition; NDOG/NWOG magnets; market-maker buy/sell models
- Daily SMT vs ES bias check
- Fib valid-leg anchoring and 0.62/0.705/0.79 judgment
- A+/B/C grading, "2–3 instant excuses = not an A setup" loss psychology

**v1 first-run postmortem (why 21 trades bled −$565):** 12 of 16 losses were duration-0, $0-MFE fills — price broke *through* the RB and swept the limit on the way (not retests). Causes: rolling 20-bar swing polluted the sweep pool, confirming close was dropped, and limits armed instantly at RB detection. Fixed:
- `Require confirming close` (default on) — bear RB must close down
- Rolling 20-bar sweep now **off** by default (real liquidity only: PM H/L, PDH/PDL, key opens)
- **Leave-then-retest** (default 1×risk): limit only arms after price moves 1R away from the entry — the SOP's "wait for price to leave, then retest". Set to 0 to restore old behavior.

**v1.2 — out-of-sample fixes (Dec '25–Mar '26 bar-replay, 23 trades, +$6,005, PF 2.69):** the edge held on unseen data (5 winners, all ≈ +4.8R) but two leaks showed:
- **Approach guard FAILED A/B (Run B, Feb 8–Mar 31 export):** −$803 / 8 trades vs control subset. Softened Feb 17 & Feb 26 losses (−$402/−$289 → −$164/−$146) and skipped Mar 31 blow-through, but **killed the Feb 10 +$1,943 winner**. Same pattern as strict leave: the edge lives in fast fills. Default reverted to **0 (off)** — do not re-enable.
- **Feb 17–Mar 31 went 0-for-9, seven of them longs into a falling market** — this is the SOP's manual daily-bias gap, not a code bug. New **Direction filter** input (Both / Long only / Short only) so the live trader can apply the morning top-down read. Leave on "Both" for backtests.
- **v1.3 — Auto PDH/PDL draw bias:** fourth **Direction filter** option. Tracks prior-day H/L soups through the session (SOP §3: PDH souped + close back below → shorts only; PDL souped + close back above → longs only; neutral until one fires; latest soup wins if both). Funnel row **Blocked (bias)** counts RB setups that passed every other filter but failed bias. A/B: **Both** vs **Auto PDH/PDL draw** on Apr–Jul first, then Dec–Apr spot-check. the new material (Powell Models cards) is mostly discretionary — HTF breaker + engineered liquidity, HTF OB → LTF FVG/IFVG + OTE overlap, TF-match table, data-H/L trio all need chart-reading the script can't do. Two things did carry over: (1) optional **8:30/9:00/9:30 opens** in the sweep pool (off by default — they matter mainly on news days and the script can't read the calendar); (2) the mechanical card's **10–15 pt stop guidance** → test `Max stop 15` vs the current 20. Candidate for v1.3 after the current A/Bs settle: require ≥2 prior touches of the swept level (the cards define engineered liquidity as repeated equal highs/lows).
- **R-trail ratchet — FAILED the full A/B, default reverted to 0 (BE-only).** The Apr–Jul BE-only run exposed an analysis trap: the CSV's "favorable excursion" is measured only until exit, so trail-truncated trades hid their true peaks. May 22 and Jun 5 both ran to the full 5R target minutes after the 2.0/1.5 trail would have cut them (+$1,969/+$1,939 BE-only vs +$1,294/+$1,262 trailed). Corrected 8-month ledger: conversions ≈ +$2,820 vs demotions ≈ −$3,860 (Jan 2, Jan 8, Feb 10, May 22, Jun 5) → net ≈ −$1,040. BE at +1R stays on; trail stays available as an input for future regimes but ships off. Original (superseded) rationale below:
- **R-trail ratchet** (replaces the hard-BE-only management): BE still moves at +1R, then once peak favorable excursion ≥ `Trail: activate at +N R` (default 2R) the stop ratchets to peak − gap (default 1.5R) and never retreats. Rationale: 7 scratches in the replay window peaked at 1.3–3.8R before returning to BE; a 2R/1.5R trail converts the four that reached 2.5R+ into +1.0 to +2.3R exits (~+$2,500 on the window). **The cost**: any 5R winner that pulls back more than the gap after +2R gets cut early (≈ −$1,400–1,700 per occurrence), so two demoted winners wipe out the gain. Encouraging sign: 4 of 5 winners finished within 5 bars. Trail measured on bar close (process_orders_on_close), so the lock applies from the next bar — intrabar spikes don't over-tighten it. A/B trail 2.0/1.5 vs trail 0 (BE-only) on **both** the Dec–Mar replay and the May–Jul window before locking; the winners count must stay identical.

**v1.4 — give-back regime toggle:** one-click `Give-back regime: trail ON (2.0/1.5)` input overrides the Risk trail settings for pop-and-fade months (Mar '26 pattern: 3 high-MFE scratches → trail nets +$684 vs BE on Feb–Mar). Rolling give-back counter (real fills + ghost scratches, peak ≥2R but exit <1R) shows in the funnel table with a "Consider trail" suggestion at ≥2 in 10 sessions. Default stays BE-only.

**v1.5 — chart declutter + live order zones:** soup triangles and ghost `G#` labels now **off by default** (tables unaffected). While a limit is armed, the old three pending lines are replaced by semi-transparent boxes — red = entry→stop, teal = entry→target — plus a label with the exact LIMIT / STOP / TP prices to copy into the broker DOM. Boxes delete on fill/cancel; position boxes take over after fill.

**v1.6 — manual / discretionary mode (no auto orders):** toggle **Manual levels only — NO orders (you click)** under *Manual / discretionary replay*. Same PRB logic, same boxes — but `strategy.entry` / `strategy.exit` never fire. You form morning bias first, set **Direction filter** to match, replay the session, and only click when the funnel row reads **ARMED — you click** (or **CISD GO — you click** on 1m). Orange **BIAS?** crosses mark RBs that passed every filter except your direction read — the discretionary dataset the automated backtest can't see.

| Goal | Pine setting | Where data lands |
|---|---|---|
| 12mo automated baseline (prop-pass MC) | Manual OFF → Strategy Tester CSV | F4 LAB |
| Discretionary replay / live | Manual ON → boxes only, you click | F2 Journal |
| Compare "what script wanted" vs "what I took" | Run both passes on same window | LAB + Journal bias panel |

**Morning workflow (manual ON):**
1. F7 NEWS — note red-folder / calendar context.
2. Form top-down bias (daily → 4H → 1H draw). Log it in **F2 Journal** → *Morning bias* + *PRB filter* (the Direction filter you set in Pine).
3. Set Pine **Direction filter** to match (Both / Long only / Short only / Auto PDH/PDL draw).
4. Bar replay (or live). Wait for state machine: `WAIT leave` → `WAIT approach` → **ARMED — you click**.
5. When boxes appear: take or skip. Log in F2: direction (long/short/skip), P&L if taken, notes.
6. Optional: enable **Alert when limit level arms** for a ping without staring at the chart.

**Two-chart setup (recommended):** keep one chart with Manual OFF for periodic CSV exports (12mo control study), and a second chart with Manual ON for discretionary replay. Same inputs otherwise — only the manual toggle differs. Do not expect one Strategy Tester run to produce both datasets.

**F2 Journal fields to fill every session:**
- `morningBias` — your read before the window (long / short / neutral / skip)
- `prbFilter` — what you set in Pine Direction filter that day
- `direction` — what you actually did (long / short / skip)
- `redFolder` — if F7 flagged the day

The F2 bias panel then compares filter mismatches, "Both filter on a bearish read" bleed, and aligned win rate — the discretionary edge on top of mechanical PRB.

**v1.7 — eval win cap + consistency-aware exports:** `Eval max win cap (USD)` hard-caps TP distance (`min(Target R, cap ÷ risk $)`). TPT eval: **1490** at $400 risk ≈ 3.73R per winner — keeps best day under 50% while building toward **$4k** pass request. Set **0** after PRO pass and use full 6R. F4 LAB **Eval consistency checker** flags oversized daily wins on uploaded CSVs (MC still shuffles trades — use checker for TPT/Alpha eval paths).
 every RB candle that fails **exactly one** filter is simulated as a "ghost" — same leave-then-retest, fill, BE and 5R rules — and tallied in a bottom-right table by rejection reason (window / Monday / slot used / 4H wick / no sweep / no confirming close / stop bounds / daily lock / KO proximity / bias). Read it as: **green rows** = that filter is blocking net-profitable trades → candidate to relax; **white/red rows** = the filter is earning its keep. Ghost fills are slightly conservative (same-bar stop+target counts as a loss; same-bar fill+target defers the win a bar), so a marginally positive row is not a green light — only clearly positive rows with several wins matter. Chart labels `G#` mark each ghost with its reason number. Multi-filter failures are ignored on purpose: relaxing one filter wouldn't have freed those.

**v1.10 — BE +1R retest audit (bottom-center table):** after BE moves stop to entry at +1R, tracks **scratch** (exited at entry), **missed 5R** (counterfactual — original stop still in place would have hit target), and **retest→win** (touched entry after +1R, still reached 5R). Paste with the MISSED table into Vault F4 LAB. High **missed 5R** = explicit cost of BE — not a signal to disable filters; compare to **retest→win** and give-back counter.

**Timeframe playbook:**
| Chart | Mode | Why |
|---|---|---|
| 5m (primary) | Auto (CE if stop too big) | SOP's home TF; CE fallback replaces skipped oversized wicks |
| 1m | **CISD trigger** + min stop 5 | Blind limits get run through in 1m noise; trigger = SOP's 1m package; min stop caps commission drag (a 5-pt stop = 40 micros ≈ $50 round-trip fees = 12% of risk) |

**MNQ vs NQ:** MNQ outperformed by ~$3K purely from sizing granularity — NQ rounds $400 risk down to 1 contract (or 0 when stop > 20 pts). Stay on MNQ until risk unit ≥ ~$1,000. **v1.8 — Instrument / contract size** input: `Auto (chart symbol)` reads MNQ1! vs NQ1! from the chart; override `MNQ micro ($2/pt)` or `NQ mini ($20/pt)` for what-if only. NQ auto-caps at **6 contracts** (TPT 60-micro equivalent). Funnel row **Sizing** shows tag + max contracts. For real NQ backtests: chart `CME_MINI:NQ1!` + Auto, or stay on MNQ1! (recommended for $400 risk). **v1.9:** Auto now checks **ticker/root for MNQ/NQ** before `syminfo.pointvalue` — bar replay on `MNQ1!` sometimes reported `tv=20` and sized like NQ (~2 contracts instead of ~20). Funnel shows `tv=` raw value when Auto is on; if tag ≠ chart, lock **MNQ micro ($2/pt)** for the 12mo run.

## Powell Data H/L v0 (`Powell_DataHL_v0.pine`)

**Manual replay only** — not a live strategy. Pine cannot read Forex Factory, so the script cannot know which days deserve an 8:30 trade. You pick CPI/PPI/NFP days in TV bar replay yourself.

**Before spending replay time here:** open F7 NEWS → **PRB on red-folder days**. That panel splits your actual PRB P&L on news vs quiet days and tells you whether 8:30 is worth studying at all.

**Coded (mechanics only):** 8:30–9:15 formation locks data high/low · first side soup sets opposing draw · RB + CISD entry · target = opposing data pool · TPT $50K engine · BE at +1R.

**NOT codeable:** FF day filter · prominent-swing quality · SMT vs ES · engineered liquidity for wick CE.

**Workflow:** F7 tags a day as red-folder → bar replay that session → load DataHL v0 → export CSV → F4 LAB preset `datahl-v0-cisd` only if F7 showed PRB missed news-day edge.

## Vault v1 (`Vault_TS_SMT_v1.pine`)

## Why v0.5 never traded

Every gate was ANDed and two were sequenced wrong:

1. **SMT lagged 10 bars** (needed two confirmed pivots) — real ICT SMT is read *at the sweep*: NQ takes its level, ES fails to take its own.
2. Entry required IFVG close *after* SMT armed → by the time SMT confirmed, the inversion had already happened. (Per the 2022 Model, SMT is optional confluence, not a hard gate.)
3. Only the **first FVG after 9:30** was tracked — the correct entry zone is the FVG created by the **displacement leg after the sweep**.
4. Turtle Soup ignored **prior day H/L and premarket H/L** — the most-swept liquidity.
5. Essential ≈ 10,000 1m bars ≈ 5–7 sessions → near-zero sample.

## v1 model (ICT 2022-style state machine)

1. **Liquidity pool**: prior day H/L + premarket H/L + confirmed swing pivots (strength 10)
2. **Turtle Soup**: wick sweeps a level ≥ min pts, **body closes back inside** (close beyond = breakout, level consumed, no trade)
3. **SMT at the sweep** (no lag): NQ swept its level while ES held its own swing → aqua/orange SMT label. Modes: Off / **Prefer (label only, default)** / Require
4. **MSS**: close breaks the last minor swing (strength 3) against the sweep, with displacement ≥ 10 pts from the sweep extreme, within 30 bars
5. **Entry modes**:
   - **Market on MSS** (default — confirmed + always fills)
   - **Retrace to FVG CE** (limit at the displacement FVG midpoint; cancelled if unfilled in 20 bars)
   - **Market on sweep close** (loosest — most trades, use for data gathering)
6. Stop beyond sweep wick + 2 pt buffer; target = **2R** (input). Flat 15:55. Max 1 trade/day (toggle).

## The diagnostic funnel table (top right)

Reads top-down; each row should be smaller than the one above. Whichever row collapses to ~0 is the gate killing trades:

| Row | If it's ~0… |
|---|---|
| Days in history | not enough bars loaded — scroll chart left to load more |
| Swing pivots | pivot strength too high for the timeframe |
| Turtle Soups | raise/lower min sweep pts, or widen detect window |
| SMT at sweep | normal to be a minority — only matters if SMT mode = Require |
| MSS confirms | displacement/timeout too strict |
| Orders placed | time-of-day gates (last entry 12:00) or 1-trade/day cap |
| Trades filled | retrace limit never touched — switch to Market on MSS |

## How to get trade data fast

1. Load `CME_MINI:MNQ1!` **1m**, add v1, defaults → should produce trades.
2. Not enough sample? Switch chart to **5m** (same script works; ~6 weeks of history on Essential vs ~1 week on 1m).
3. Still thin? Entry mode → "Market on sweep close" and/or turn off "Require displacement".
4. Once data flows, tighten: SMT Require, retrace entries, displacement on — and compare funnel + tester stats per change.

## Load / reload

1. Paste `Vault_TS_SMT_v1.pine` into a **blank strategy** in Pine Editor → Save → Add to chart.
2. Strategy Tester tab → Overview / List of trades.
3. Inputs gear to tweak. Set calc to **on bar close**.

## Plan limits (Essential)

| Feature | Essential |
|---|---|
| Strategy Tester | Yes |
| Historical bars | ~10,000 (~5–7 days on 1m, ~6 weeks on 5m) |
| Export trades CSV | No (Plus+) |
| Deep Backtesting | No (Premium+) |

## v1.1 — TPT $50K risk engine

First backtest (Jun 2–Jul 10, 5m, 10 MNQ fixed): 9 trades, PF 0.94, net −$607, max DD −$4,770. Fatal vs TPT: avg stop-out ≈ $2,100 > the entire $2,000 trailing DD. v1.1 adds:

| Input | Default | Why |
|---|---|---|
| Risk per trade (USD) | $400 | 20% of TPT DD = 5 losses of runway; contracts auto-sized from stop distance |
| Max stop distance | 60 pts | Skips sweeps with wicks too far away (counted in funnel as "Skipped") |
| Daily loss stop | $800 | No new entries after −$800 on the day |
| Daily profit lock | $1,400 | Consistency rule: no day ≥ 50% of the $3,000 target |
| Max contracts | 60 | TPT $50K cap (6 minis = 60 micros) |

## Known gotcha: orders placed but zero fills

Pine **v6 defaults `margin_long`/`margin_short` to 100%**. 10 MNQ ≈ $480k notional vs $50k capital → the broker emulator silently skips every order. v1 sets both to **0** (no margin check), matching real intraday futures margin. If you ever clone this script, keep those two params.

## Lint rules

- One `//@version=6` + one `strategy()` only.
- Same-TF `request.security`: `lookahead_off` (daily prev-H/L uses `high[1]` + `lookahead_on`, standard non-repainting pattern).
- `calc_on_every_tick = false`.
