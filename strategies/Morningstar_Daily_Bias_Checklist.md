# Morningstar — Daily bias checklist (plain English)

Use this **every session** before you click a trade.  
The script finds candidates. **You** pick the day bias, then take or skip.

**Freeze:** [[morningstar-dual46-lock]]  
**Chart:** MNQ · **5m for bias** · **flip to 1m to ARM** (Path B entry is a 1m RB).  
**Script:** `pine/Morningstar_v46.pine`  
**Inputs:** Path B ON · **KO-retest only** · geom **1m RB wick** · Fixed R **5** · **Max TP 100** · model **Both** · last arm **13:00** · Direction **Long & Short** (Auto OFF) · fib 0.62/0.705 = **eyes only**.

---

## Multi-month walk (do this now)

Walk each weekday **09:30 → 13:00** NY. Bias on **5m**; arm check on **1m**. Skip Mondays (SHADOW) or don’t open them.

| Order | Month | Why |
|---|---|---|
| **1** | **June 2026** | Newest Dual46 blank — **start here today** |
| **2** | **May 2026** | Second recent month |
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
- [ ] **PDH / PDL:** Which is closer / more unfinished? ______  
- [ ] **Overnight:** Did we already run the obvious draw? If yes, today’s first signal is suspect  
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
- [ ] Fill = price **trades through** entry after arm (wick counts)  
- [ ] Stop size feels sane (~10–25 ideal; wide = smaller effective RR under 100pt cap)  
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
- [ ] Monday (SHADOW only — don’t take)  
- [ ] Grade is weak and stop is huge with no confluence  

---

## One-line journal (every day)

```
Date: ____
NWOG: unfilled above / below / filled / inside
Week bias: L / S / none
Day bias: L / S / none
Script arm?: Y / N · Cont / Judas · grade ____ · stop pts ____ · plan RR ____
Fill?: Y / N / no-arm
Take or skip: ____
Outcome: WIN / LOSS / no fill / skipped · R ____
Why: ____
```

---

## Reminder

- **NWOG** = week magnet when empty.  
- **PDH·PDL + Judas** = day story.  
- **Path B** = leave → freeze leg → **1m RB** in OTE (+ KO) → wick-start / RB stop → Fixed 1:5 ≤ 100 pts.  
- Script proposes. **Checklist decides.** · Freeze: [[morningstar-dual46-lock]]
