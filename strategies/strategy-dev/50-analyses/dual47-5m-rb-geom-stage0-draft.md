---
created: 2026-07-23
updated: 2026-07-23
tags: [morningstar, dual47, stage-0, powell, 5m-rb, not-lab]
status: DRAFT Stage-0 — Dual46 freeze stays locked · this is a parallel SHADOW candidate
---
# Dual47 draft — more Powell-like arms (5m RB path)

> **Not a Dual46 lock edit.** May walk + live MSv46 stay on Dual46 freeze.  
> **Not Lab MC / not income.** Chart + journal census first.  
> Pine: do **not** edit `Morningstar_v46.pine` or locked PRB. Measure / shadow fork only after May Priority-2 census columns exist.

## Why this exists (2026-07-23)

User miss / Powell parallel: **5m rejection block at/near 10:00**, Powell took the **return** into that zone and won. Dual46 live path is **KO-retest + 1m RB wick** only — so a clean 5m RB@KO (or return to a 5m leave RB) often never arms.

Powell archive already settled this question ([[../../knowledge/powell/5m-vs-1m-entry-trigger]]):

- He still uses **1m every day** (RR).
- He rates **5m trigger higher-WR**, more patience.
- Real teaching = **hybrid**: 5m confirm → 1m entry — **not** “delete 1m.”
- Separate product question: **5m RB as live geometry** (more arms) vs **5m as filter** (fewer arms).

User asked for **more arms / more Powell-like**, even if some lose. That points at **expand geometry**, not the hybrid filter (filter cuts frequency).

## What Dual46 already has (do not rediscover)

| Piece | In v46? | Dual46 freeze uses it? |
|---|---|---|
| 5m RB pack computed | **Yes** | For KO-leave prefer-5m + eyes / KO·LTF count |
| KO-leave sleeve (RB@KO after leave) | **Yes** | **No** — freeze = **KO-retest only** |
| Live Powell arm geom | 1m RB wick | **Yes** |
| `5m_confirm_present?` journal field | Logging | Census only — hybrid Stage-0 |

So yesterday’s miss is likely **leave-sleeve / 5m-geom territory**, not “the script is broken.”

---

## One open Stage-0 slot — pick **one** primary

### Primary (matches “more arms + Powell yesterday”) — **Dual47-A · 5m RB live geom (SHADOW)**

**Hypothesis:** Allowing a **5m RB wick** as live Path B geometry (same KO leave → OTE/KO stack rules) increases arm count toward Powell’s tape without deleting the 1m path.

**Rules (≤10 lines) — SHADOW only:**

1. Same bias checklist + Cont/Judas tagging as Dual46.
2. Leave / freeze manip leg off 10:00 (unchanged).
3. **Arm if either:**
   - Dual46: 1m RB wick in OTE (+ KO for A+), **or**
   - Dual47-A: **5m RB wick** overlaps frozen-leg OTE and (for A+) 10:00 sits in the 5m RB zone (± tol).
4. Entry = that TF’s RB **wick-start** · stop beyond that TF’s **RB extreme** (+ buffer).
5. TP = **Nearest structure in band** (Origin/Leg/KO/DayIL/NWOG) inside **1.0–2.5R** and **≤60 pts**; else Fixed **1:2** fallback. Dual46 freeze stays Fixed 1:5 · 100cap on v46.
6. Last arm 13:00 · Long & Short · Mondays ON (same as May walk).
7. Log sleeve tag: `1m` vs `5m` geom on every arm.
8. **Do not** market into stops &gt; agreed max without $ check (process — from 07-23 crash).

**Falsify / kill if (after census n≥15 Dual47-A arms):**

- EV ± CI covers 0 worse than Dual46 script sleeve on same days, **and**
- Loss shape worse (cluster of sub-10 or &gt;35-pt disasters), **or**
- Arms are mostly disc-junk with no KO/OTE stack (grade leakage).

**Evidence path (cheap → dear):**

1. **Replay census first (no pine):** May + remaining June days — mark every session where a **5m RB@KO or return-to-5m-leave-RB** existed and Dual46 did / didn’t arm. Tag WIN/LOSS/would-have / shadow.
2. If n and loss shape look **toward** → fork measure Pine `Morningstar_v47_shadow.pine` (copy v46, add live 5m geom OR turn on leave+5m as SHADOW alerts only).
3. Lab / path MC **only** after SCORECARD toward — never from vibes.

### Secondary (do not open as second Stage-0 yet) — **Dual47-B · hybrid filter**

Require `5m_confirm_present?` before accepting a **1m** arm. Powell-faithful, but **cuts** frequency. Already queued in [[../../knowledge/powell/5m-vs-1m-entry-trigger]] and away-session conclusions — collect the boolean on May walk **for free**, decide after May fixed horizon. **Do not** run Dual47-A and Dual47-B as live retunes at once.

---

## Disc wins that can graduate (separate sleeves — not Dual46 inputs)

| Idea | Evidence so far | Path |
|---|---|---|
| **NWOG tap @ HTF draw** | June census 2W/1L + would-haves | Keep **Disc/NWOG sleeve** census through May — [[morningstar-dual46-june-week1-harvest]] |
| **Midnight open + 1m/5m RB** | 07-21 forward disc WIN 4.08R | Parked OF sketch — [[../60-track-b/parked-of-auction-sleeve-sketches]] |
| **Bias gate** | 06-19 against-bias A+ LOSS | Already Dual46 checklist — enforce, don’t “add” |
| **Stop vs ATR floor** | Wins 11.5–33.5 · sub-10 wicked | Logging only until n≈100 |

These are **not** Dual47-A. One system under test at a time.

---

## Hard stops

- Dual46 freeze **unchanged** for May Priority-2 + live MSv46 scorecard.
- No edit to `Powell_Rejection_Block_v1.pine`.
- No Lab promote / E[$/wk] claim from this draft.
- One open Morningstar Stage-0: **Dual47-A** until kill/away/toward closeout.

## Human next steps

1. Re-paste **`pine/Morningstar_v47_strategy.pine`** (Save → Add to chart). Confirm yellow **`SIM closed=N`** tag on the last bar — if missing, you still have the indicator, not the strategy.
2. Strategy Tester → Deep Backtesting on **MNQ 1m** · Bar Magnifier ON when available.
3. **Fill model default:** `Auto: limit, market if through` (leave rips that never revisit the wick become MKT).
4. A/B inputs:
   - **A (Dual46):** sleeve `KO-retest only` · LIVE RB TF `1m only` · Sim leave OFF · Sim Powell ON
   - **B (Dual47):** defaults — sleeve both · `1m or 5m` · Sim leave + Powell ON
5. Export **List of Trades** CSV → Vault. Comments show `· MKT` vs `· LMT`.
6. After ~10–15 Dual47-only *filled* arms → SCORECARD toward/away. **Do not** treat Tester P&L as Lab income.

## Fill honesty (2026-07-23)

Leave sleeve looked “almost all 1:5 WINs” on chart while Strategy Tester was empty. Cause: chart KPI credited **TP touch without entry fill** (common when leave RB arms and price rips away from the wick). That is not a trade.

**Second empty-Tester cause:** TV default **margin 100%** + `$50k` capital rejects 1 MNQ (notional ≈ $50k+). Fix in script: `margin_long/short = 5`, `initial_capital = 1_000_000`. If you already added the script once, open **Settings → Properties** and set margin to 5% / capital to 1M (saved Properties override script defaults).

`Morningstar_v47_strategy.pine` fix:
- KPI requires **ENTRY** before WIN/LOSS
- Default entry model **Market on arm** (prove Tester works; then switch to Auto/Limit)
- Debug tag must say **`MSv47 STRAT · closed=N`**
- Priority default **First LIVE wins**

## TP honesty (2026-07-23)

Fixed 1:5 + 100pt cap made wide-stop arms ask for ~100pts. User saw MFE +70–80 then stop-out — same pattern as away-session `mfeR` note (05-06 ~+3.8R then death).

**Dual47 SHADOW defaults (v47 / v47_strategy only):**
- Mode: `Nearest structure (band)` — Origin CE/HI · Leg CE/HI · KO · Day IL/IH · NWOG mid
- Band: min **1.0R** · max **2.5R** · hard **60 pts**
- Fallback: Fixed **1:2** (`Rfb` tag) when nothing in band
- Tags on plan: `oCE` / `lCE` / `KO` / `DIL` / `NWOG` / `Rfb`

**Do not** change Dual46 lock on `Morningstar_v46.pine`.

## Pine

- `pine/Morningstar_v47.pine` — Dual47 SHADOW **indicator**
- `pine/Morningstar_v47_strategy.pine` — Dual47 **strategy** (Tester + CSV)
- `pine/Morningstar_v47_smoke.pine` — Tester wiring check only

## Stage-0 sample closeout — v6 CSV (2026-07-23)

**File:** `MSv47_v6_CME_MINI_MNQ1!_2026-07-23_1e16a.csv` · MNQ 1m · 1 lot · market-on-arm · nearest-structure TP · Jul 3–23 2026.

| Sleeve | n | WR | Net $ |
|--------|---|----|-------|
| All | 19 | 32% | **−116.06** |
| Leave | 12 | 25% | **−130** |
| Powell | 7 | 43% | **+14** |

**Verdict:** Wiring OK (v6). **Away lean on leave under market-on-arm** for this window — not Lab. Powell ~flat, n small → stay SHADOW. Dual46 freeze untouched.

**Patterns:** many 1-bar losses; several MFE-then-stop (e.g. leave `lCE` MFE ~$63 → lose ~$75). `Rfb` best this sample; structure tags (`lCE`/`KO`/`oCE`) net negative here.

**Next A/B (one change):** Sim leave OFF · fill `Auto: limit, market if through` · same TP · re-export CSV. Canvas: `canvases/msv47-v6-july-csv.canvas.tsx`.

## v8 — slim Settings UI (2026-07-23)

TV Settings cut to **7 knobs**: Leave · Powell · Entry fill · RB TF · Contracts · Show levels · Debug tag. Everything else is **LOCKED** in the Pine file (TP band, fib, stops, colors, KO·LTF OFF, etc.). Retune by editing the script, not the UI.

## Powell-only A/B (user report, 2026-07-23) — WR only, awaiting CSV $

Leave **OFF**. Same July window / v8. Counts are **Tester fills**, not Lab.

| Config | Approx fills | Wins | Note |
|--------|-------------:|-----:|------|
| Market · 1m or 5m | 7 | 3 | Matches v6 Powell sleeve (~43%) |
| Market · **1m only** | ? | ~50% | Cutting 5m lifts WR |
| 5m RB arms alone (inside 1m∨5m) | **5** | **1** | Dual47-A 5m geom looks **away** this sample |
| Auto · 1m only | 6 | **4** | |
| Auto · 1m or 5m | 7 | **5** | |
| Limit @ wick · 1m or 5m | 7 | **5** | Same ballpark as Auto |

**Read (geometry / fill, not income):**
1. Leave stays out — hole confirmed.
2. **Dual47-A “add 5m LIVE RB” is the weak leg here** (5×5m, 1 win). Lean next default: Powell · **1m only** (Dual46-like TF) until a longer window says otherwise.
3. **Market-on-arm was padding losers** on Powell too. Auto/Limit → higher WR by not (or differently) taking “never revisit wick” arms. Expected honesty, not magic alpha.
4. n=6–7 → **SHADOW only**. WR≠EV. Need List-of-Trades CSV for net $ / MAE shape before toward language.

## Working SHADOW defaults to test next (one CSV):** Leave OFF · Powell ON · RB **1m only** · fill **Auto** · export CSV.

## Powell Auto CSV — v8 (2026-07-23)

**File:** `MSv47_v8_CME_MINI_MNQ1!_2026-07-23_20281.csv` · Leave OFF · Auto · 1m or 5m · Jul 8–23.

| n | WR | Net $ |
|---|----|-------|
| 7 | 5/7 (71%) | **+$226.82** |

vs prior market Powell sleeve **+$14**. Auto LMT flipped Jul 16 (+50) and Jul 22 (+85) vs prior market losers.

**TP bug:** #7 `Powell · Cont · 1RB · OTE · KO` took **+12.25 pts (~1.1R)** — KO was a structure TP candidate sitting next to entry. **v9 fix:** drop KO from band · min structure R **1.5** · else Fixed 1:2 `Rfb`. Canvas: `msv47-v8-powell-auto.canvas.tsx`.

**Verdict:** toward lean on fill honesty + Powell-only; still SHADOW (n=7). Re-export on **v9**.

## v10 — prop sizing lock (2026-07-23)

Tester now defaults to **$50k capital · 10 MNQ** (locked in script, not a Settings knob). Prior CSVs were 1-lot — scale ~×10 for dollar reads. Yellow tag: `MSv47 v10 · 10 MNQ · $50k`. If TV Properties still show qty=1, reset strategy properties or remove/re-add the script.

## Market · Leave+Powell CSV — v8 (2026-07-23)

**File:** `MSv47_v8_…_2cf11.csv` · Market · Leave ON · Powell ON · 1m or 5m · 1 lot.

| Sleeve | n | WR | Net $ |
|--------|---|----|-------|
| All | 19 | 32% | **−116.06** |
| Leave | 12 | 25% | **−130** |
| Powell | 7 | 43% | **+14** |

Identical shape to first market CSV. **Away** vs Powell-only Auto (+$227). Leave under market stays killed for this window. Canvas: `msv47-v8-market-both.canvas.tsx`.

## v11 — TP floor 1:3 (2026-07-23)

Locked: Fixed fallback **1:3** · structure min **3.0R** · max **5.0R** · hard cap **100 pts**. (Was 1:2 / 1.5–2.5R / 60pt — too tight vs user floor ~1:3–1:4.) Dual46 freeze still Fixed 1:5 on v46. Tag: `MSv47 v11 · TP≥1:3`.

## v11 CSV + v12 fix (2026-07-23)

**File:** `MSv47_v11_…_91d53.csv` · 10 MNQ · Leave+Powell · net **−$333.2**.

- **35pt TPs** = Fixed 1:3 × ~12pt stop (not Dual46 1:5 ≈ 80pt). Structure tags (`oHI`/`lCE`) made targets inconsistent.
- **Sunday 18:00 leave LMT** + several **0-bar** LMT stops = resting-limit / same-bar touch — not live-honest.
- **5m leave** ignored “1m only” RB TF (`leavePrefer5` ungated).

**v12:** Fixed **1:5 · ≤100pt** only · leave default OFF · Auto · RB **1m only** · 5m leave gated by TF · RTH-only sim + cancel on new calendar day. Canvas: `msv47-v11-csv.canvas.tsx`.

## v13 — tight-stop stretch (2026-07-23)

TP = `min(100, max(5R, 80pts))`. Small stops can run **above 1:5** (e.g. 10pt → 80pt = 8R). Wide stops still clip at 100. Dual46 freeze on v46 unchanged. Tag: `MSv47 v13 · ≥1:5 stretch`.

## Stage-0 harvest — v13 July (2026-07-23) · **toward**

**File:** `MSv47_v13_…_34fe1.csv` · $50k · **10 MNQ** · Leave ON · Powell ON · **1m only** · Fixed stretch · Auto mix.

| Sleeve | n | W/L | WR | Net $ |
|--------|---|-----|----|-------|
| **All** | 17 | 4/13 | **24%** | **+$2,769** |
| Leave | 11 | 2/9 | 18% | **+$1,029** |
| Powell | 6 | 2/4 | 33% | **+$1,741** |

**Shape:** four identical ~$1,588 full-target hits (≈80pt × 10 MNQ) carried the book. Low WR / high payoff — not a WR story. Leave flipped from hole (under structure/1:3) to contributor under Fixed stretch.

**Verdict:** **toward** for this geometry+TP on July. Still **SHADOW** — n=17, one month, LMT optimistic, MFE-then-death still present (#4, #17). Do **not** Lab-promote / claim E[$/wk] / scale to “20 accounts” yet.

**Locked knobs for multi-month:** Leave ON · Powell ON · 1m only · Auto · Fixed stretch · 10 MNQ.  
**Human next:** Deep BT export May · June · (Aug) same settings → drop CSVs. Canvas: `msv47-v13-july-harvest.canvas.tsx`.

## Jul 23 leave LMT + FILL→ advice (2026-07-23)

**CSV #16** `leave · 1RB · Rfb · LMT` 10:08→10:09: **LOSS −$152** (not a win). Chart **1:11** = planned RR (tiny ~7pt stop × 80pt stretch), not realized payoff.

Why LMT can “fill” without an obvious pullback: TV fills on **bar range touch**, not CME trade-through — one-tick wicks count. Trust eyes for live.

**v14:** Plan labels show live **`FILL→ MKT | LMT·coming | LMT·near | LMT·wait | AWAY`**. Auto sim markets only when **close** is through (not wick-only). Approaching band default 15pts.

