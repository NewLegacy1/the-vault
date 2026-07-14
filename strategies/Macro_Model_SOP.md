# Macro Model — Rules & Standard Use

**Status:** Living SOP (Macro-only — Mech model and Motion Model are **out of scope**)  
**Instrument:** MNQ / NQ (NASDAQ futures)  
**Companion:** [[Macro_Trade_Checklist]] · trade archive: `strategies/All Trades! 1d227c700a09813898b2e3736f87af6d.pdf` · manual log: `strategies/legacy-manual/trade-log.csv`  
**Strategy relationship:** Separate from [[Powell_Rejection_Block_SOP]] (Powell/PRB). Test both in F4 LAB; eval vs funded split TBD by MC results.

---

## 1. One-line model

Trade **ICT macro windows** on NQ/MNQ using **narrative + liquidity geometry**: closest **draw on liquidity (DOL)**, **BISI/SIBI** respect/disrespect, **MSS**, **PXH/PXL** continuation, and **internal manipulation** (5m–15m) — targeting **30–50 points**, with **half size on red-folder days**.

---

## 2. Glossary (locked)

| Term | Meaning |
|------|---------|
| **BISI** | Buy-side imbalance (bullish FVG family) |
| **SIBI** | Sell-side imbalance (bearish FVG family) |
| **DOL** | Draw on liquidity — **closest** major pool right now (PDH/PDL, PSH/PSL, session H/L, CWH/CWL, etc.) |
| **Disrespect** | Candle **closes through** an imbalance (invalidates / inverts the gap) |
| **BISI ran + retraced** | BISI disrespected → becomes SIBI (IFVG) → price taps back into gap for entry fill |
| **PXH** | Bullish continuation: break above DOL, return to level, expand higher |
| **PXL** | Bearish continuation: break below DOL, return to level, expand lower |
| **CWH / CWL** | Current week high / current week low |
| **MSS** | Market structure shift |
| **Internal manipulation** | Liquidity sweep of an **internal** high or low on **5m–15m** (not 1m) within the range you're trading |
| **PSH / PSL** | Previous session high / low |
| **PDH / PDL** | Previous day high / low |
| **HALF / FULL** | Half size vs full size (see §8 risk) |

**Example — DOL sweep at 9:39:45:** Price sweeps the **nearest** major pool (whichever of PDH, PDL, PSH, PSL, etc. is closest at that moment).

---

## 3. ICT macro windows (researched — NY time / ET)

ICT macros are **~20-minute algorithm delivery windows**, not one long “9 to 12” block. Your instinct that **morning is macro-heavy** is correct; the precision is **which 20-minute slices**.

### New York session (primary for MNQ/NQ)

| Window (ET) | Role |
|-------------|------|
| **8:50–9:10** | Pre-open completion — often finishes pre-market range extension before equities open |
| **9:30–9:45** | **Your manipulation staging** — Judas / DOL sweep window (not a named ICT macro, but aligns with open fake-out) |
| **9:50–10:10** | **Primary AM macro** — post-open MSS + displacement FVG; sets up Silver Bullet hour |
| **10:50–11:10** | Second AM macro — continuation retrace or reversal of morning complex |
| **11:50–12:10** | Lunch macro |
| **1:10–1:40** | PM macro 1 |
| **3:15–3:45** | PM macro 2 |

### London (context for overnight bias)

| Window (ET) | |
|-------------|--|
| 2:33–3:00 | London macro 1 |
| 4:03–4:30 | London macro 2 |

**Practical anchor for this model:** Most of your logged trades cluster **9:45–10:45 AM** — inside the **9:50–10:10** and **10:50–11:10** windows plus your **9:30–9:45** DOL sweep rule.

> All times = **America/New_York**. Do not convert manually for DST — use chart/session timezone.

---

## 4. Your 90-minute cycles (narrative layer)

Used to read **where reversals are likely** within the session. These run **parallel** to ICT macros — macros are the **entry clock**, cycles are the **story clock**.

| Cycle | Window (ET) | Notes |
|-------|-------------|-------|
| 1 | 8:00–9:30 | Pre-open / pre-market narrative |
| 2 | 9:30–11:00 | **Primary execution cycle** — contains open manipulation + both AM macros |
| 3 | 11:00–12:30 | Mid-morning / lunch approach |
| 4 | 12:30–2:00 | Afternoon shift |
| 5 | 2:00–3:30 | Late session |

### Narrative checklist (from your notes)

1. Where did price go **9:00–9:30**? (up / down)
2. Where did price go **9:30 → macro open**? (up / down)
3. What **algo signatures** are present **inside** the macro? (SMT, TS, OB, MSS, BISI ran+retrace, PXH/PXL)
4. Are we seeing **displacement through DOL** (continuation) or **weak sweep + inversion** (reversal)?
5. Mark **PDH ↔ current day low** (or inverse) range; note action at the **0 (equilibrium)** of that range
6. Map general range on **15m**

**Macro open** for coding defaults = start of **9:50–10:10** window unless narrative clearly points to **10:50–11:10**.

---

## 5. Reversal vs continuation

**No hard rule** — narrative decides. Reversal is **more probable** most days; **Monday and Friday** = reversal **less probable** (not “always continuation”).

### Reversal profile

- Manipulation **before and/or during** macro
- Prefer **opposing side** of bias PD array gets run (sweep)
- Look for: DOL sweep **9:30–9:45**, MSS, BISI ran + retraced into, turtle soup, SMT
- Enter after **displacement confirms** — if OB disrespected in a reversal read, **wait** for continuation signatures instead of forcing the OB entry
- **10 AM news trap:** on **red-folder days with 10:00 AM release**, first manipulation is often a trap — **wait** (not codeable without calendar; manual flag)

### Continuation profile

- Ideally **no** manipulation before/during macro (low-probability filter, not absolute)
- **Displacement above/below DOL** before or during macro
- **>100 pts** pre-macro from open → favor continuation sequence
- **PXH / PXL** with rebalance entry (wait for FVG/CE retest — don't chase)
- On continuation days: prefer **internal manipulation at PXH/PXL** (SMT, TS, internal LS, MSS) before full confidence
- If PXH/PXL **disrespected** without internal manip → can take **opposing** direction trade instead of forcing continuation

### Soft checklists (not all required)

**Reversal**

1. DOL swept **9:30–9:45**?
2. Bullish or bearish — algo sigs supporting reverse?
3. OB + SMT + TS confluence?
4. MSS or BISI ran + retraced into?

**Continuation**

1. Displaced through DOL before/during macro?
2. Pre-macro move **>100 pts**?
3. PXH/PXL signatures?
4. Rebalance to PXH/PXL / internal FVG?
5. Internal manipulation at the continuation level?

---

## 6. FVG validation (any entry family)

Before trusting a gap:

1. Premium or discount of dealing range?
2. Are we **inside a macro window**?
3. Did we **sweep DOL**?
4. Is the **new 90m cycle** telling us to **invert** the FVG?
5. Use **respect** (hold) or **disrespect** (close through) as confirmation of next leg

### Bearish reversal nuance (“issues in the macro”)

When a high is swept and price returns to a BISI: **weak displacement through** → expect return to swing high for **real** manipulation. Enter after **second** manipulation pushes through BISI, on retracement to **IFVG**.

---

## 7. Entries & exits

### Entry locations (any may be used)

1. **CE (50%)** of range, FVG, or OB
2. Permissible in premium **or** discount — stop goes **beyond the manipulation wick** (1 tick past the candle that formed the manipulation leg)

### Market entries rule

Wait for **rebalance to FVG** even on PXH/PXL — avoids stop-outs on raw breakout entries.

### Targets (hard rule)

- **Only target 30–50 points** on standard macro days
- **News SMT + narrative + DOL** → can anticipate **100+ pts** (discretionary; separate tag)

### Exit locations

1. CE of opposing FVG
2. Low-hanging fruit (nearest internal high/low)
3. 50% of the active **90-minute cycle** range

### Stop / breakeven

- Stop: **≥1 tick** beyond the manipulation candle wick you're entering off
- **Do not move to BE** until **internal manipulation** has occurred — a **5m–15m internal H/L liquidity sweep** inside the trade's range

---

## 8. SMT tiers (timing expectations)

| SMT type | Expectation |
|----------|-------------|
| **9:30 SMT** | Volatile run during macro likely |
| **Macro SMT** | Standard **30–50 pt** move |
| **PM SMT** | Standard **30–50 pt** move |
| **News SMT** | With narrative + DOL → **100+ pts** possible |

**Dual SMT logic:** First SMT + DOL sweep + second SMT → second may **hold** if signatures align. Displacement on side of **first** SMT → first SMT likely real; second may be **confusion/manipulation**.

---

## 9. Risk & sizing

| Context | Size |
|---------|------|
| **FULL** | 15 MNQ (your full-lot reference) |
| **HALF** | ~50% of full (you often ran **8 MNQ**; comparing **10 vs 1 MNQ** for funded) |
| **Red-folder day** | **HALF** size — observe 10 AM trap if release at 10:00 |
| **Stop placement** | Beyond manipulation wick — wide stop acceptable on continuation **without** internal manip |

Powell/PRB uses **$400 FULL** on eval — Macro model historically used **HALF/FULL tiers** from journal, not fixed USD. When importing to LAB, normalize PnL or tag `risk_tier` separately.

---

## 10. Standard deviation (optional target module)

Range = swing high ↔ swing low of the manipulation leg.

| Day type | Bearish entry zone | Target zone |
|----------|-------------------|-------------|
| Low probability | Between **1 and 0.5** SD | **0 to −1** SD |
| High probability | Between **2 and 2.5** SD | Expansion / PXH/PXL |

SD **2–2.5** can mark reversals or PXH/PXL continuation.

---

## 11. Codable vs discretionary

| Rule | Codable? | Notes |
|------|----------|-------|
| Macro window filter (9:50–10:10, etc.) | **Yes** | HHMM session gate |
| 9:30–9:45 DOL sweep | **Partial** | Need closest-pool logic + sweep detection |
| Closest DOL (PDH/PDL/PSH/PSL/CWH/CWL) | **Partial** | Geometry yes; “closest narrative” needs weighting |
| BISI/SIBI detect + disrespect | **Yes** | Close through gap |
| BISI ran + retrace entry | **Partial** | Inversion + retap — state machine |
| MSS | **Partial** | Swing break rules vary by TF |
| PXH/PXL continuation | **Partial** | Break → retest → expand pattern |
| Internal manipulation (5m–15m sweep) | **Partial** | Rolling internal H/L sweep |
| BE only after internal manip | **Yes** | Gate BE flag on sweep event |
| 30–50 pt target | **Yes** | Fixed pts or SD module |
| 90m cycle narrative | **No** | Story layer — manual tags |
| Reversal vs continuation choice | **No** | Narrative — use checklist score / manual bias |
| 10 AM news trap | **No** | Only on red-folder @ 10:00 — calendar + manual |
| Mon/Fri bias | **Partial** | Soft filter only (less reversal prob.) |
| SMT (ES/NQ) | **Yes** | Lock to Master ICT settings (§14) — pivot 3, 5m TF |
| Premium/discount | **Yes** | Equilibrium of chosen dealing range (§15) — anchor pick is discretionary |
| OB + turtle soup quality | **Partial** | TS uses your Strict indicator (§14); OB rules TBD |

**v0 Pine goal:** Code the **left column “Yes/Partial”** items as **filters**, not the narrative engine. Export ghosts for missed narrative trades.

---

## 12. Comparison to Powell / PRB

| | **Macro Model** | **Powell / PRB** |
|--|-----------------|------------------|
| **Clock** | ICT 20m macros + 9:30–9:45 sweep | 10:00–13:00 window, RB retest |
| **Primary trigger** | DOL + FVG disrespect + MSS + PXH/PXL | Formal rejection block + key opens |
| **Target** | 30–50 pts (100+ news) | 1:5R (~50–60 pts at 10–12 pt stop) |
| **Bias** | Narrative / 90m cycles | Daily → 4H mechanical PDH/PDL draw |
| **Best MC test** | Manual journal + eventual Pine export | PRB v1.5 12mo control (108 trades) |

**Deployment idea:** Run **Macro** on eval, **PRB** on funded (or vice versa) — pick whichever passes consistency-aware MC faster on the same firm profile.

---

## 13. Source notes map

Content above merges:

- Your original chat notes ([Jul 13 planning](4eacc662-c096-4738-98d8-17fb88d0b054)) — Macro section only
- Your clarifications (Jul 14): DOL, PXH/PXL, BISI/SIBI, MSS, internal manip TF, sizing, BE rule, Mon/Fri, red folder
- ICT macro research (community consensus, NY ET)
- Manual trade journal PDF (`strategies/All Trades! …pdf`) — 20 discretionary fills Apr 2025–Feb 2026

**Excluded:** Mech model, Motion Model (separate strategies, not part of Macro Model SOP).

---

## 14. Live indicator stack (handed off Jul 14)

You run **two indicators** on TradingView. Screenshots captured — these are the locked defaults for Macro Model Pine parity.

### A) Turtle Soup + Displacement [1m] Strict

| Input | Your value | Notes |
|-------|------------|-------|
| Detection window | **9:00–11:00** NY | Matches `Vault_TS_SMT_v1` detect window |
| Darkened BG window | **9:35–10:15** NY | Macro / 10 AM news-trap focus band — add to Macro v1 |
| Timezone | America/New_York | |
| Pivot lookback (strength) | **10** | Prominent swing liquidity |
| Min displacement | **10 pts** | Confirms sweep wasn't noise |
| Labels | **TS Bull Confirmed** / bear equivalent | Fires after sweep + displacement (see chart example) |
| Swept levels | Lines ON | DOL / swing level visualization |

**Chart example (your screenshot):** price sweeps dashed green level (prior low / DOL) → displacement up → **TS Bull Confirmed** label.

**Repo overlap:** `pine/Vault_TS_SMT_v1.pine` already uses pivot **10**, min displacement **10**, detect **9:00–11:00**. Main gaps vs your indicator:
- Your label says **"Confirmed"** (implies displacement gate already baked in)
- Your **9:35–10:15** shaded band (not in Vault script yet)
- Your indicator is tuned for **1m** chart; Vault strategy runs on chart TF

### B) Master ICT Indicator (SMT)

| Input | Your value | Notes |
|-------|------------|-------|
| Pivot lookback | **3** | Tighter than Vault's liquidity pivot (10) — SMT-specific |
| SMT timeframe | **5 minutes** | HTF divergence read, not chart TF |
| Symbol A | `CME_MINI:ES1!` | |
| Symbol B | `CME_MINI:NQ1!` | Standard ES/NQ SMT pair |
| Swing high SMT | Red | Bearish divergence at highs |
| Swing low SMT | Blue | Bullish divergence at lows |
| Labels | **SMT** ON | |

**Visual reference (Jul 14 handoff):**

| Label | Color | Meaning | Typical use |
|-------|-------|---------|-------------|
| **SMT** at swing low | Blue | Bullish SMT — NQ sweeps/makes LL while ES holds HL | Long bias after DOL sweep low |
| **SMT** at swing high | Red | Bearish SMT — NQ makes HH while ES fails to confirm (trendline connects prior high → new high) | Short bias after sweep above old high (red horizontal line = liquidity level) |

The bearish example shows: price breaks above prior high (red line) → **red SMT** prints at the extreme → sharp displacement down. Pair with **TS Bear Confirmed** on the same sweep for Macro v1 short gate.

**Codable rule (5m, pivot 3, ES/NQ):**
- At NQ pivot high confirmation: NQ `high` > prior NQ swing high AND ES `high` ≤ prior ES swing high → bearish SMT
- At NQ pivot low confirmation: NQ `low` < prior NQ swing low AND ES `low` ≥ prior ES swing low → bullish SMT
- Read pivots on **5m** series via `request.security`, pivot length **3** — matches your Master ICT inputs.

**Repo gap:** `Vault_TS_SMT_v1.pine` evaluates SMT **at the sweep bar on chart TF** with pivot **10**. Your live stack uses **pivot 3 on 5m** — we should align Macro Model to **your** settings, not the Vault default.

### Integration plan (Macro Model v1)

```
ICT macro window (9:50–10:10)
  → premium/discount of dealing range (§15)
  → DOL swept 9:30–9:45
  → TS Bull/Bear Confirmed (Strict indicator logic)
  → SMT label present (Master ICT, 5m / pivot 3)
  → optional: BISI/SIBI disrespect + OB
  → 30–50 pt target
```

**Still optional (helps but not required):** paste Pine source for **Turtle Soup + Displacement [1m] Strict** if you have it — then we copy logic 1:1 instead of approximating from settings.

---

## 15. Premium / discount (codable)

Premium/discount is **fully codable** once the dealing range is chosen:

```pine
float eq = (rangeHigh + rangeLow) / 2
bool inPremium  = close > eq
bool inDiscount = close < eq
float pct       = rangeHigh != rangeLow ? (close - rangeLow) / (rangeHigh - rangeLow) : 0.5
// pct > 0.5 → premium · pct < 0.5 → discount
```

**Default anchors for Macro Model (input-selectable):**

| Anchor | rangeHigh | rangeLow |
|--------|-----------|----------|
| Daily (SOP default) | PDH | current session low |
| Daily inverse | current session high | PDL |
| Manipulation leg | sweep swing high | sweep swing low |
| 90m cycle 2 | highest high since 9:30 | lowest low since 9:30 |

**Entry filter examples:**
- Bullish TS + SMT → require `inDiscount` (or pct < 0.5)
- Bearish TS + SMT → require `inPremium` (or pct > 0.5)
- Continuation PXH/PXL → may intentionally enter in premium on bullish expansion (soft override)

The discretionary part is **which anchor today** — not whether Pine can compute the half.
