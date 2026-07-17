# Morningstar — Daily bias checklist (plain English)

Use this **every session** before you click a trade.  
The script finds candidates. **You** pick the day bias, then take or skip.

**Chart:** MNQ · **5m for bias** · **flip to 1m to ARM** (Path B entry is a 1m RB) · **MARKS 5m RBs** (eyes only).  
**Script:** lean Morningstar (`Powell_Rejection_Block_gate_v0.pine`) — Path B only (no museum / ghosts / tables).  
**Inputs (Powell control):** Path B ON · **Require KO in fib OTE ON** · Min fib leg 40 · ARM 1m ON · MARK 5m ON · ARM 5m OFF · Early RB eyes ON · Fill KPI ON · proximity ≥ 50.  
**Note:** Status + ENTRY stay up past 13:00 / 18:00 (calendar midnight wipe only).  
**Dual sleeve:** [[morningstar-jul16-dual-sleeve-finding]] — early ~10:00 RB@KO (eyes) vs Powell OTE ~11:15 (ARM).

---

## Bar-replay test dates (start here)

Walk each day **09:30 → 13:00** NY. On 5m for story; flip to 1m if you want candle detail.

| Date | Why |
|---|---|
| **2026-07-16** | **Control day** — Powell OTE long (~11:15) with OTE **ON**. May also show amber **EARLY RB · eyes** near leave (~10:00) without stealing the ARM. Check fill KPI on ENTRY. |
| 2026-07-15 | Prior session — bias + Path B practice |
| 2026-07-14 | Prior session |
| 2026-07-13 | Prior session |
| 2026-07-10 | Friday — NWOG week context into Sun open |
| 2026-07-09 | Mid-week practice |
| 2026-07-08 | Mid-week practice |
| 2026-07-07 | Mid-week practice |

**Pass rule for Jul 16:** tag = `1RB` · fib LO/HI visible on the leave leg · ENTRY matches the good 1m retest (not the bad midday long).

Then keep walking **backward one weekday at a time** with the journal line below.

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

---

## Step 3 — Path B story (after 10:00)

Only look for trades that match your bias from Steps 1–2.

### A. Did 10:00 do its job?

- [ ] Yellow **10:00** wash is on the open bar  
- [ ] Price **wicked** one side of 10:00 (manipulation)  
- [ ] Price **left** back through 10:00 (distribution starts)  
- [ ] Amber **FIB LO (0)** and **FIB HI (1)** mark the leg — put your fib tool there (script does not draw 0.62–0.79)

**Direction check:**

| What you saw | Path B lean |
|---|---|
| Wick **below** 10:00, then close/trade back **above** | Looking for **LONG** retest |
| Wick **above** 10:00, then close/trade back **below** | Looking for **SHORT** retest |

Must match **Day bias**. If not → skip, even if ENTRY prints.

### B. Fib (your tool)

- [ ] Put TradingView fib from **FIB LO (0)** → **FIB HI (1)**  
- [ ] **Long:** 10:00 in discount (your 0.62–0.79) — or close enough you accept  
- [ ] **Short:** 10:00 in premium — or close enough you accept  

### C. Trigger

- [ ] **Armed** ENTRY tag = `PathB · 10:00 · 1RB` (1m only arms)  
- [ ] Dashed box `5RB @ KO · eyes` may appear — **confluence only**, not the click  
- [ ] Rejection is **at / near** 10:00 (not a random mid-range wick)  
- [ ] Stop size feels sane  
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
- [ ] Messy chop inside NWOG / no clean leave from 10:00  
- [ ] You can’t explain the trade in one short sentence  
- [ ] Already took your 1 trade for the day  
- [ ] Only a `5RB · eyes` mark printed — **no 1RB arm** → no click  

---

## One-line journal (every day)

Copy/paste:

```
Date: ____
NWOG: unfilled above / unfilled below / filled / inside
Week bias: L / S / none
Day bias: L / S / none
Path B armed?: Y / N · dir ____ · tag ____ (want 1RB)
5RB eyes?: Y / N
Fib LO/HI visible?: Y / N
Take or skip: ____
Why (one sentence): ____
R result (if taken): ____
```

---

## Reminder

- **NWOG** = week magnet / free bias when empty.  
- **PDH·PDL + Judas** = day story.  
- **Path B** = 10:00 wick → leave → **fib leg (amber LO/HI)** → **1m RB arm** at 10:00.  
- **5m RB** = mark only.  
- Script proposes. **Checklist decides.**
