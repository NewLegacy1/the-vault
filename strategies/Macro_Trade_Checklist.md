# Macro Model — Trade Checklist

**Config (v0 target):** 5m MNQ · macro windows 9:50–10:10 + 10:50–11:10 · DOL sweep 9:30–9:45 · 30–50 pt target · BE after internal manip · HALF on red folder · 1 trade/day (soft)

The model is **narrative-first**. The script (when built) handles geometry; **you** handle reversal vs continuation.

---

## 1. Pre-session (before 9:30, ~15 min)

- [ ] **News (Forex Factory):** red folder today? Time: ______
  - **Red folder** → **HALF size** only
  - **10:00 AM release** → expect **first manipulation trap**; wait for second signature
- [ ] **Closest DOL marked:** PDH ______ · PDL ______ · PSH ______ · PSL ______ · CWH ______ · CWL ______
- [ ] **15m range** mapped; equilibrium (0) of PDH↔today low (or inverse) noted
- [ ] **Day-of-week:** Mon/Fri → reversal **less probable** (not auto-continuation)
- [ ] **90m cycle 1 read (8:00–9:30):** price went **up / down** → ______

---

## 2. 9:30–9:45 (manipulation staging)

- [ ] **DOL swept?** Y / N — which pool: ______
- [ ] **9:30 SMT?** Y / N → if yes, expect **volatile macro**
- [ ] **Cycle 2 start read:** 9:30 → now, price **up / down** → ______
- [ ] **Reversal or continuation story forming?** (pick one, hold loosely)
  - Reversal: opposing PD array ran + MSS / BISI ran+retrace forming?
  - Continuation: displacement through DOL, >100 pts pre-macro?

---

## 3. Macro window (9:50–10:10 or 10:50–11:10)

- [ ] Inside **ICT macro** window (not just “morning”)?
- [ ] **Algo sigs present:** SMT · TS · OB · MSS · BISI/SIBI disrespect · PXH/PXL
- [ ] **FVG validated:** premium/discount · DOL swept · cycle supports invert?
- [ ] **Entry:** rebalance to FVG / CE / OB — **not** raw breakout (especially PXH/PXL)
- [ ] **Stop:** beyond manipulation wick (1 tick)
- [ ] **Target:** 30–50 pts (unless news SMT + DOL narrative → 100+ discretionary)

**Skip** when:

- Red folder + first manipulation only (10 AM trap)
- Continuation day but **no** internal manip and no PXH/PXL disrespect — don't force
- OB disrespected in a reversal read — wait for continuation signatures
- Can't name the DOL being drawn to in one sentence

---

## 4. In-trade

- [ ] **Do not move to BE** until **5m–15m internal H/L** swept inside trade range
- [ ] Flat by session end; no revenge re-entry
- [ ] Log: date · macro window · reversal/continuation · DOL · factors hit · outcome · MFE

---

## 5. Factor tags (for Vault journal / LAB import)

`macro-950` · `macro-1050` · `dol-sweep-930-945` · `bisi-disrespect` · `sibi-disrespect` · `bisi-ran-retrace` · `mss` · `pxh` · `pxl` · `internal-manip` · `smt-930` · `smt-macro` · `turtle-soup` · `red-folder-half` · `mon-fri` · `news-smt`
