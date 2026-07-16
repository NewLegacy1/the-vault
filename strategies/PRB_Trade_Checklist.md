# PRB v1 — Trade Checklist (locked config)

**Config:** 5m MNQ · Auto entry (CE if stop > 20 pts) · leave-then-retest 1R (strict OFF) · confirming close ON · rolling-sweep OFF · window **10:00–13:00** · $400 risk ($300 in fresh eval) · 1:5 target · BE at +1R · 1 trade/day · skip Mondays · **skip July & October** (`regime-gate-v0` · Pine `Powell_Rejection_Block_gate_v0.pine`)

The script finds the setup. **You** are the bias filter. Three checkpoints.

**Morningstar (Manual study path on gate_v0):** shorttitle **Morningstar** · window **10:00–13:00**.

- **Path A:** HTF RB (default **15m**) → leave-retest → ENTRY/STOP/TP. Eyes-only: untested **WFVG / 4HFVG / 1HFVG / 15FVG** · RB/OB · 4H wick · fib OTE + PDA overlap tag — **never arms**.
- **Path B (ON by default):** 10:00 manip → leave through KO → fib OTE (0.62–0.79) with KO inside ± align → **5m/1m RB** near KO → arms ENTRY/STOP/TP tagged `PathB · 10:00 · 5RB` (or `1RB`). Manual only — you click. Path A still wins if both fire same bar.

Journal → **Morningstar study**. OTE ≠ 15m-IFVG-only.

**Letter from journal flags:** `≥6/12 → A+` · `3–5 → B` · `1–2 → C` · `0 → -` (no setup). Chart **LTF n/4** separate from HTF PDA row.

**Lab (Manual OFF):** still **PRB** Chart structure (Deep BT control) — not Morningstar. Do not invent promote numbers from Manual visuals.

---

## 1. Pre-session (before 10:00, ~10 min)

- [ ] **Jul/Oct:** Lab used STAND_DOWN; for Manual discretion you may trade them (gate default **Skip Jul/Oct = OFF**). Log month in the journal either way.
- [ ] **News check (Forex Factory):** red folders today? Time: ______
  - CPI/NFP with a one-sided beat → expect a trend day; **do not fade it** — skip the session or demand A+ context
  - Mixed prints → normal rules apply
- [ ] **Daily → 4H bias (SOP §3):** which daily/4H high or low is price closest to? ______
  - What gets manipulated into first? ______  Draw on liquidity toward: ______
- [ ] **Daily SMT vs ES:** is either index protecting an extreme? Y / N
- [ ] **Key opens marked:** 18:00 ______ · midnight ______ · (10:00 when it prints)
- [ ] **Levels sane:** PDH/PDL and premarket H/L lines on chart make sense vs the story
- [ ] Draw already satisfied overnight? If yes → today's signal is suspect

## 2. When Morningstar arms a setup (LIMIT / STOP / TP · MS grade on chart)

- [ ] **Which path?** Path A tag (`15m · PDH` / …) vs Path B (`PathB · 10:00 · 5RB` / `1RB`) — both need your bias filter
- [ ] **Path A:** structure tag makes sense — not a naked mid-trend micro wick · note `LTF n/4` (eyes only)
- [ ] **Path B:** saw manip above/below 10:00 → leave · `B OTE · 10:00` lines printed · KO in pocket · LTF RB at KO before you click
- [ ] **Direction agrees with the daily/4H draw** (don't short into a clean bullish draw below)
- [ ] The tagged POI / KO story is **real unfinished liquidity** (your read)
- [ ] **4H wick read:** clear wick (~15 pts) = good · ~8 = grey, size down or demand more confluence · speck = skip
- [ ] Not fighting **equal highs/lows** that haven't been swept yet (SOP hard filter)
- [ ] No **NDOG/NWOG magnet** sitting right where the trade needs to travel
- [ ] Gut check: can you instantly list 2–3 reasons it fails? → **not an A setup, skip**
- [ ] Scary-but-clean is good; easy-looking is the trap

**Skip the trade** when 2+ of these fail. Log every skip in **Journal → Morningstar study** (path · MS score · skip reasons · optional chart shot). Skips on “no HTF draw POI” are expected for Path A with Require draw POI ON.

## 3. In-trade / post-trade

- [ ] BE moved at +1R automatically (yellow stop line) — don't override it in a fresh eval
- [ ] Flat by 15:55 always; no adds, no re-entries after the daily lock
- [ ] Log Morningstar: date · LTF n/4 (or journal flags) · structure tag · MFE · skip reasons · snapshot if useful
- [ ] Loss you can't explain in real time = good setup, variance — move on
- [ ] Loss with instant excuses = you took a C; tighten checkpoint 2

---

## Bar Replay fill-validation procedure (one-time audit)

For each 5R winner (May 21 11:25, May 22 12:40, May 29 10:05, Jun 5 10:05):

1. 1m chart → Replay → cursor ~15 min before entry time
2. Step bar-by-bar; note the strategy's entry/stop/TP prices from the 5m position box
3. Verify: price tapped the entry limit, did **not** touch the stop first, then reached the target
4. Verdict per trade: CLEAN / OPTIMISTIC (tester gave a fill/path the 1m disputes)

2+ OPTIMISTIC verdicts → we re-model targets before trusting the equity curve.

## TPT eval guardrails (memorize)

| Rule | Number |
|---|---|
| Trailing DD (EOD in eval) | $2,000 — worst modeled streak was −$1,664 |
| Request pass at | ≥ $4,000 total (consistency: total ≥ 2× best day), never at $3,001 |
| Minimum days | 5 — met naturally |
| Risk until +$1,000 cushion | $300, then $400 |
| Funded (PRO) | intraday trail — keep BE-at-1R on; scale to $600–800 only after $52K buffer |

---

## Eval vs funded — two exit profiles (same entries)

Same PRB entries; eval and funded are different games because of the **50% consistency rule**.

**Eval phase** — pass fastest, survive DD, spread profit across days:
- RR 6 + eval max win cap **$1,490** (or RR **3.75** as alternative)
- BE +1R ON · trail OFF · **$400** risk ($300 until +$1k cushion)
- Check F4 consistency panel before trusting MC pass %
- Expect more winning days, smaller per-day spikes

**Funded / PRO** — maximize TNL after pass (no consistency cap on TPT PRO):
- Target **5–6R** · eval cap **OFF**
- Same entries, filters, BE +1R, trail OFF
- Win rate stays low — one 5R offsets several full losses
- This is where PRB economics actually work

**Remember:** fastest pass ≠ highest RR on eval. MC pass rate = gross path; consistency checker = whether you can click Request Pass. Run both in F4 before trusting either number.
