# Morningstar — Daily bias checklist (plain English)

Use this **every session** before you click a trade.  
The script finds candidates. **You** pick the day bias, then take or skip.

Chart: MNQ · **5m primary** · Morningstar · Manual ON · Lean ON · Path B ON.  
(1m is optional detail — Path B now latches 1m RBs so they still arm on 5m.)

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

- [ ] 10:00 line is marked  
- [ ] Price **wicked** one side of 10:00 (manipulation)  
- [ ] Price **left** back through 10:00 (distribution starts)  
- [ ] Script shows **FIB LO (0)** and **FIB HI (1)** — that’s the leg you care about  

**Direction check:**

| What you saw | Path B lean |
|---|---|
| Wick **below** 10:00, then close/trade back **above** | Looking for **LONG** retest |
| Wick **above** 10:00, then close/trade back **below** | Looking for **SHORT** retest |

Must match **Day bias**. If not → skip, even if ENTRY prints.

### B. Fib (your eye — script already drew it)

- [ ] Fib is on the **marked leg** (LO → HI)  
- [ ] **Long:** 10:00 sits in the **discount** pocket (near 0.62–0.79 from the high) — or close enough you accept it  
- [ ] **Short:** 10:00 sits in the **premium** pocket (near 0.62–0.79 from the low) — or close enough you accept it  
- [ ] You’re OK if it’s slightly off — you decide; script may still arm  

### C. Trigger

- [ ] ENTRY tag looks like `PathB · 10:00 · 15RB` / `5RB` / `1RB`  
- [ ] Rejection block is **at / near** 10:00 (not a random mid-range wick)  
- [ ] Stop size feels sane (not “hateful”)  
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

---

## One-line journal (every day)

Copy/paste:

```
Date: ____
NWOG: unfilled above / unfilled below / filled / inside
Week bias: L / S / none
Day bias: L / S / none
Path B armed?: Y / N · dir ____ · tag ____
Take or skip: ____
Why (one sentence): ____
R result (if taken): ____
```

---

## Reminder

- **NWOG** = week magnet / free bias when empty.  
- **PDH·PDL + Judas** = day story.  
- **Path B** = 10:00 wick → leave → fib leg → RB at 10:00.  
- Script proposes. **Checklist decides.**
