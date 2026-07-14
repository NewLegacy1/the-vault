# PRB v1 — Trade Checklist (locked config)

**Config:** 5m MNQ · Auto entry (CE if stop > 20 pts) · leave-then-retest 1R (strict OFF) · confirming close ON · rolling-sweep OFF · window 10:00–13:00 · $400 risk ($300 in fresh eval) · 1:5 target · BE at +1R · 1 trade/day · skip Mondays

The script finds the setup. **You** are the bias filter. Three checkpoints:

---

## 1. Pre-session (before 10:00, ~10 min)

- [ ] **News check (Forex Factory):** red folders today? Time: ______
  - CPI/NFP with a one-sided beat → expect a trend day; **do not fade it** — skip the session or demand A+ context
  - Mixed prints → normal rules apply
- [ ] **Daily → 4H bias (SOP §3):** which daily/4H high or low is price closest to? ______
  - What gets manipulated into first? ______  Draw on liquidity toward: ______
- [ ] **Daily SMT vs ES:** is either index protecting an extreme? Y / N
- [ ] **Key opens marked:** 18:00 ______ · midnight ______ · (10:00 when it prints)
- [ ] **Levels sane:** PDH/PDL and premarket H/L lines on chart make sense vs the story
- [ ] Draw already satisfied overnight? If yes → today's signal is suspect

## 2. When the script arms a setup (pending lines appear)

- [ ] **Direction agrees with the daily/4H draw** (don't short into a clean bullish draw below)
- [ ] The swept level is **real liquidity** (PDH/PDL, premarket, key open — check which line was souped)
- [ ] **4H wick read:** clear wick (~15 pts) = good · ~8 = grey, size down or demand more confluence · speck = the script shouldn't have fired, skip
- [ ] Not fighting **equal highs/lows** that haven't been swept yet (SOP hard filter)
- [ ] No **NDOG/NWOG magnet** sitting right where the trade needs to travel
- [ ] Gut check: can you instantly list 2–3 reasons it fails? → **not an A setup, skip**
- [ ] Scary-but-clean is good; easy-looking is the trap

**Skip the trade** (remove strategy or flatten manually) when 2+ of these fail. Log every skip and its reason — that's the discretion dataset.

## 3. In-trade / post-trade

- [ ] BE moved at +1R automatically (yellow stop line) — don't override it in a fresh eval
- [ ] Flat by 15:55 always; no adds, no re-entries after the daily lock
- [ ] Log: date · grade (A+/B/C) · checklist items failed · outcome · MFE
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
