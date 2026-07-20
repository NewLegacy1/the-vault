# Morningstar — Daily bias checklist (plain English)

Use this **every session** before you click a trade.  
The script finds candidates. **You** pick the day bias, then take or skip.

**Freeze:** [[morningstar-dual46-lock]]  
**Chart:** MNQ · **5m for bias** · **flip to 1m to ARM** (Path B entry is a 1m RB).  
**Script:** `pine/Morningstar_v46.pine`  
**Inputs:** Path B ON · **KO-retest only** · geom **1m RB wick** · Fixed R **5** · **Max TP 100** · model **Both** · last arm **13:00** · Direction **Long & Short** (Auto OFF) · fib 0.62/0.705 = **eyes only**.

---

## Multi-month walk (do this now)

Walk each weekday **09:30 → 13:00** NY. Bias on **5m**; arm check on **1m**.
**Mondays are IN** (decided 07-17 — June Mondays 2W/0L; tag them for a Monday sub-score).
**Monday nuance (ICT canon, flag not veto):** in a bullish week with an unreached HTF
discount array *below* Monday's range, canon expects Tuesday to drive down into it —
a Monday **long** in that spot fights the template; note it in the journal if you take it.
The exact 4-cell scoring protocol lives in `ict/monday-htf-discount-array-flag.md`; per that
note the 06-29 NWOG tap was likely template-**CONSISTENT** (array tapped Monday = flag dead).
**Pre-stage the limit** the moment an OTE+KO stack forms — June's misses were latency.
**May 2026 calendar:** clean month, no roll — except **Mon May 25 Memorial Day** (13:00 ET
halt, thin holiday tape) → skip it, count as holiday not as a Monday data point.

| Order | Month | Why |
|---|---|---|
| ~~1~~ | ~~June 2026~~ | **DONE 07-17** — +$16,925 gross @10MNQ · script arms 2W/0L · [[morningstar-dual46-june-week1-harvest]] |
| **2** | **May 2026** | **← current** |
| **3** | **Nov → Dec 2025** | New year-half; outside Jul/Oct Lab stand-down |
| **4** | **Aug → Sep 2025** | Optional “good calendar” stress |
| Hold | Extra July 2026 | Already seeded — don’t overfit |
| Eyes | Any October week | Count skips only |

**Retune ban:** finish June + May before changing pine. Screenshot weird days; journal; keep walking.

**Sanity control (anytime):** 2026-07-16 Cont · `1RB · OTE+KO` · RB stop · 1:5.

---

## Step 1 — What’s the week wanting? (NWOG)

Look at the purple **NWOG** box (and the dotted **CE** in the middle).

| Question | Your answer |
|---|---|
| Is there an **unfilled** NWOG on the chart? | Y / N |
| Where is price **relative to** that gap? | Above · Inside · Below |
| Did price **jump away** from the gap and leave it empty? (best free-bias) | Y / N |
| Or is it **chopping inside** the gap? (weaker — be careful) | Y / N |

**Bias rule (keep it simple):**

1. **Empty NWOG still open above price** → lean **bullish** (draw = fill the gap up).  
2. **Empty NWOG still open below price** → lean **bearish** (draw = fill the gap down).  
3. **Price already filled both sides of NWOG** → gap is done. Use Step 2 only.  
4. **Price stuck inside NWOG** → no clean week bias. Prefer **skip** or demand a perfect Path B.

Write it down:

> **Week bias today:** LONG · SHORT · NONE  
> **Why (one line):** _______________________________

If your trade idea **fights** an empty NWOG, you need a very good reason — or **skip**.

---

## Step 2 — What’s the day wanting? (before / at 10:00)

Do this in order. One check per line.

- [ ] **News:** Red folder today? Time ______ · If big one-sided print → skip or only A+ setups  
- [ ] **10:00-time news?** (releases at 10:00 ET are common) — if yes, don’t rest a limit blind into the print.
      **Measured stand-down:** makers pull ~2 min before a 10:00 print and the book normalizes ~9 min
      after → **never convert a limit to marketable inside T−2min→T+1min** of a 10:00 release; on
      tier-1 release days **cancel unfilled entry limits at 9:58** (source: `quant/ops-news-print-microstructure-stand-down.md`)  
- [ ] **PDH / PDL:** Which is closer / more unfinished? ______  
- [ ] **Overnight:** Did we already run the obvious draw? If yes, today’s first signal is suspect  
- [ ] **Consumed liquidity check:** a **filled** NWOG or **already-swept** pool is *no longer a draw* — don’t anchor a reversal on it (this is exactly the 06-09 loss)  
- [ ] **Open story (Judas):** Did we fake one way then reverse? Which way did we **really** take liquidity? ______  

**Day bias rule:**

- Swept **PDL / lows** then held → lean **long** (unless empty NWOG below is still the magnet).  
- Swept **PDH / highs** then held → lean **short** (unless empty NWOG above is still the magnet).  
- **NWOG wins ties.** If day story and NWOG conflict, trust **empty NWOG** or sit out.

Write it down:

> **Day bias today:** LONG · SHORT · NONE  
> **Same as week bias?** Y / N  

If week and day **disagree** → **NONE** (no trade) unless Path B is textbook and small risk.

### Bias mode (Dual46 harvest)

Keep Direction = **Long & Short**. Auto tag is eyes only. Optional Auto A/B **after** June+May are journaled — see [[morningstar-dual46-lock]].

---

## Step 3 — Path B story (after 10:00)

Only look for trades that match your bias from Steps 1–2.

### A. Did 10:00 do its job?

- [ ] Yellow **10:00** wash is on the open bar  
- [ ] Price **wicked** one side of 10:00 (manipulation)  
- [ ] Price **left** away from 10:00 (away-only leave)  
- [ ] Amber **FIB LO (0)** / **FIB HI (1)** mark the frozen leg  

**Direction check:**

| What you saw | Path B lean |
|---|---|
| Dump leave → long OTE RB | **Judas** long (if bias allows) |
| Rally leave → short OTE RB | **Judas** short |
| Same side as leave | **Cont** |

Must match **Day bias**. If not → skip, even if ENTRY prints.

### B. Fib (eyes)

- [ ] Your fib tool on amber LO→HI — golden pocket is confluence  
- [ ] Live stop is **RB extreme**, not 0.705 of the leg  

### C. Trigger (A+)

- [ ] Armed tag ≈ `Powell · Cont|Judas · 1RB · OTE+KO` (or `OTE` / `KO` — grade it)  
- [ ] Entry = RB wick-start · stop beyond RB extreme · TP ≤ 100 pts  
- [ ] Fill = price **trades through** entry after arm (wick counts) — touch-no-fill ≠ fill  
- [ ] **Conversion rule (standing, from 07-17 research):** limit touched but unfilled and the
      setup is confirming → convert to **marketable** and log “converted”. 1–2 ticks slippage
      (~0.02R on a 20-pt stop) vs losing a multi-R winner — 06-12 tick-miss was structural
      (CME FIFO queue at wick extremes), 06-29 market fallback was right  
- [ ] Stop size feels sane (~10–25 ideal) · **real R = min(5, 100 ÷ stop)** — stop > 20 pts
      means R < 5, log the real number  
- [ ] Trade is **with** your bias, not against empty NWOG  

### D. Final gate (say it out loud)

1. Week bias = ______  
2. Day bias = ______  
3. Path B direction = ______  
4. Do all three agree? **Y / N**  

- **Y** → you may take it (still your click).  
- **N** → **skip** and log why.

---

## Step 4 — Quick “no trade” list

Skip the day (or the signal) if **any** of these are true:

- [ ] Empty NWOG is the clear magnet and this trade **runs away from** filling it  
- [ ] Week bias and day bias fight each other  
- [ ] Path B direction fights your written bias  
- [ ] Messy chop / no clean leave from 10:00  
- [ ] You can’t explain the trade in one short sentence  
- [ ] Already took your 1 trade for the day  
- [ ] Grade is weak and stop is huge with no confluence  
- [ ] Reversal idea anchored on a **consumed** level (filled gap / swept pool)  

---

## One-line journal (every day)

```
Date: ____
NWOG: price above / inside / below · gap unfilled / FILLED (both — filled gap can still be S/R)
Week bias: L / S / none
Day bias: L / S / none
Script arm?: Y / N · Cont / Judas · grade ____ · stop pts ____ · plan RR ____
Fill?: Y / N / no-arm
Take or skip: ____
Outcome: WIN / LOSS / no fill / skipped · R ____
Why: ____
ATR(14) on 1m at entry: ____ pts        ← May addition (stop/ATR study)
Entry time (NY): ____                   ← for the 9:50–10:10 window question
MFE: peaked at ____ R before exit   ← May addition (structural-TP decision: does median MFE beat +5R?)
5m confirm present? Y / N            ← May addition (Powell hybrid-trigger question)
Session: OR size ____ · first 30m dir ____ (census only)
NWOG tap? gap size ____ · gap age ____ d · tapped edge/CE/far ____ · gap = ____ ×dailyATR · day-of-week ____   ← only if NWOG idea (Monday tap rows scored separately — published gap data shows Monday is the genuine-move outlier)
News: auto-matched in the app from the calendar — glance at F7 NEWS to confirm it agrees with FF
Regime (measurable only — [[mnq-relevant-regime-variables]]):
  VIX prior close: <16 / 16–20 / >20
  OR30 ratio (09:30–10:00 ÷ 20d median): <0.75 / 0.75–1.25 / >1.25
  Mega-cap earn week (AAPL/MSFT/GOOGL/AMZN/META/NVDA): Y / N
  Oil shock (|CL 1d|≥3% or |CL 5d|≥8%): Y / N
  (Red-folder / 10:00 release already auto-matched)
```

---

## Reminder

- **NWOG** = week magnet when empty.  
- **PDH·PDL + Judas** = day story.  
- **Path B** = leave → freeze leg → **1m RB** in OTE (+ KO) → wick-start / RB stop → Fixed 1:5 ≤ 100 pts.  
- Script proposes. **Checklist decides.** · Freeze: [[morningstar-dual46-lock]]
