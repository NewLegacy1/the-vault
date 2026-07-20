---
created: 2026-07-20
tags: [morningstar, dual46, conclusions, away-session, june-2026, may-2026]
status: conclusions only — chart/journal study · NOT Lab MC · NOT income
sources:
  - morningstar-dual46-lock.md
  - morningstar-dual46-june-week1-harvest.md
  - morningstar-dual46-may-harvest.md
  - HANDOFF-cloud-to-local-2026-07-20.md
  - knowledge/quant/vol-regime-dependence-setup-frequency.md
  - knowledge/quant/expectancy-math-wr-rr-capped-payoffs.md
  - knowledge/quant/minimum-sample-size-statistical-significance.md
  - canvases/dual46-june-pnl-10mnq.canvas.tsx
---
# Away session 2026-07-20 — Dual46 conclusions

> Chart + journal study only. Numbers below are **replay-ledger facts** from the harvest notes / canvas. **No invented trades. No Deep Backtest / path MC / E[$/wk].** Freeze: [[morningstar-dual46-lock]].

---

## 1. June vs May facts (script vs disc — honest)

### June 2026 — COMPLETE (06-02 → 06-29)

| Sleeve | What counts | Result |
|---|---|---|
| **Script (Dual46 scorecard)** | Arms the script proposed under freeze | **3 arms · 2 fills · 2W / 0L · +$3,990** (06-23 Judas·KO; 06-29 Cont·OTE+KO with 100-pt TP cap). 1 no-fill (06-24). |
| **Discretionary** | Human takes / skips / late limits — **not** Dual46 scorecard | **13 filled takes · 8W / 5L** (ledger count). Dominates dollar P&L. |
| **Blended (all fills)** | Study context only | **15 fills · 10W / 5L · +846.25 pts → +$16,925 gross @ 10 MNQ** (canvas / June harvest). Gross, no fees. |

**Honest read:** the headline June month is mostly a discretionary sleeve. Dual46 proper is the script column only — **n = 2 fills**, both wins, arms clustered late (none in first ~13 sessions, then 3 in the last five). Capture process fixed mid-month (0/3 late A+ limits → pre-stage → 1/1). 100-pt TP cap validated once on a 33.5-pt stop (06-29). Bias gate matters: 06-19 A+ against day bias → LOSS.

**Note on prior summary tables:** lock once said “+$17,020 / 10W/4L”; harvest count table said “12 disc (8W/4L)”. Prefer the **row ledger** (canvas + June harvest table): **+$16,925 · 10W/5L blended · disc 8W/5L · script 2W/0L**.

### May 2026 — IN PROGRESS (05-01 → 05-06 only)

| Sleeve | Result |
|---|---|
| **Script** | **0 arms · 0 fills** — Dual46 scorecard still June’s **2W / 0L** |
| **Discretionary** | **1 fill · 0W / 1L · −$260** (05-06 Judas·OTE+KO short; ~+$990 MFE ≈ +3.8R then full stop). 05-05 A+ no-fill (limit on the 10AM line). 3 skip/no-setup rows. |
| **Running May** | **−13 pts · −$260** — all discretionary |

**Months are not comparable on P&L yet.** May has five logged session-rows and no script evidence. June’s dollar month ≠ Dual46 income.

**Vol backdrop (real data, not vibes):** May mean VIX ≈ 17.2 vs June ≈ 17.1 — nearly identical monthly means; June had spike clusters, May compressed. If May results diverge from June, **monthly mean VIX is not an available excuse** — day-level tags (`vixPrevClose`, `or30ratio`) are the variables.

---

## 2. What n we have vs what n we need before income claims

| Object | Have now | Why it is not enough for income / Lab |
|---|---|---|
| Script fills (Dual46) | **n = 2** | Point WR 100% is noise; no CI worth quoting; no path MC input. |
| All June fills (script + disc) | **n = 15** | Wilson 95% on 10/15 ≈ **[42%, 85%]** — “not a coin flip vs 1:5 breakeven (16.7%)” is supportable; “WR ≈ 67%” is **not**. Dollar asymmetry ~13.6:1 is a **sample description**, not a population parameter. |
| May script fills | **n = 0** | Second month not started for the scorecard sleeve. |
| Regime-tagged cells | thin / unset | Report **counts**, not % WR by band, until a band has **≥ ~10** trades. |

**Targets (from sample-size research, frozen walk ~15 takes/month if disc+script keep firing):**

| Claim type | Rough n | Horizon under current pace |
|---|---|---|
| “Not losing vs 1:5 breakeven” | already true at n=15 for **blended** takes | **does not** authorize income |
| WR ±10% (near ~65%) | ~**87** fills | ~6 frozen months |
| WR ±7% | ~**178** | ~12 months |
| Variant A/B (e.g. 65% vs 55%) | ~**180–200** per arm | out of reach this year — **don’t run** |
| Canvas / walk discipline floor before talking income | **n ≈ 40** script-relevant fills + fixed-horizon look | end of **May** walk first look; then **Nov–Dec** — not mid-month peeks |
| Prop / Lab | path MC **`E[$/wk]`** under firm rules | **blocked** until Stage-0 **toward** + that MC |

**Pre-registered rule (do not break):** Dual46 script-sleeve verdicts only at **end of May walk**, then **end of Nov–Dec walk**. Mid-month “is it working?” is optional stopping (~25%+ false-alarm inflation). Disc sleeve judged on the same schedule, separately.

---

## 3. Open research questions May census columns answer

Logging only — **no geometry / pine change** until June+May complete.

| Column / tag | Question it answers |
|---|---|
| **MFE (R)** | Structural TP vs fixed 1:5+100pt cap — free from **median MFE vs +5R**. 05-06 already: ~+3.8R MFE then stop-out (must log `mfeR` going forward). |
| **5m-confirm Y/N** | Powell hybrid: 5m confirm → 1m entry — support or kill as a **filter**, not a TF switch. |
| **ATR(14,1m) at entry** | Stop validity floor (~1.5×ATR / ~10 pts) — June’s 9.75 loss vs 11.5–33.5 wins is one anecdote; ~100 tagged trades decides Stage-0. |
| **`vixPrevClose` bands (&lt;16 / 16–20 / &gt;20)** | Setup **frequency** vs **quality** by day-level vol (not month label). May sessions so far all 16–20. |
| **`or30ratio`** | Instrument-local open range vs 20d median — Dual46 goldilocks / cap-binding hypothesis. |
| **`megaCapEarnWeek` · `oilShock` · `redFolder`** | Event/regime frequency splits without war-NLP junk. |
| **NWOG gap pts / age / tap / ×dATR** | Separate **NWOG sleeve census** (not Dual46) — size-driven respect rates. |
| **plan R = min(5, 100/stop)** | Honest E(R) under the cap — stop &gt;20 pts is not “1:5”. |

Cap-hit rate, stop distance by band, and valid-setup-days / regime-days fill **before** WR-by-regime is trustworthy.

---

## 4. Hard “do not claim” list

1. **Income, funded payout, or “this pays $X/week”.**
2. **Lab promote / Stage-0 toward** without path MC `E[$/wk]`.
3. **Deep Backtest numbers** for Dual46 (none exist in these notes — do not invent).
4. **Script-sleeve edge from n = 2** (or May’s n = 0).
5. **Population WR / RR / 13.6:1 asymmetry** from June’s n = 15 blended takes.
6. **“May failed / succeeded because vol differed”** — monthly VIX means match; use day tags.
7. **Pine retune or Dual46 lock edit** mid-May (including min-stop floor, RB re-anchor, fib live geom).
8. **NWOG or JJ Fair-Value as Dual46 inputs** — separate products / censuses.
9. **Mid-month verdicts** that unfreeze or kill on streaks.
10. **10 MNQ fixed size as live policy** — study convention only; live must be fixed-$ risk.

---

## 5. Exact next human action

1. Open vault-app → **F5 Journal** (localhost:3000); Dual46 freeze unchanged.
2. Continue May bar-replay from **2026-05-07 Thu** (next after 05-06).
3. Walk **Tue–Fri preference** still holds, but Mondays stay **ON** for May (tag Monday rows); **skip Mon 2026-05-25 Memorial Day** — holiday, not a Monday data point.
4. Session window **09:30 → 13:00** NY; bias on 5m, arm check on 1m; **limits pre-staged** from the open (June lesson).
5. On every take/arm/skip row: fill **MFE, 5m-confirm, ATR, entry time, ×dATR**, plus regime tags **`vixPrevClose` · `or30ratio` · `megaCapEarnWeek` · `oilShock`** (`redFolder` auto). Empty census fields = wasted walk.
6. Do **not** retune pine; do **not** Lab-promote; update harvest + canvas only after real journal rows exist.

---

## JJ Fair-Value (one paragraph)

JJ Simon 09:30 fair-value is a **separate parked product** — own Stage-0 later, not a Dual46 sleeve or add-on. Dual46 May walk stays the single open priority; do not mix regime UI / journal tags into a JJ promote narrative.

---

## Verdict · blockers · export

| | |
|---|---|
| **Verdict** | **toward** on process (freeze held, script sleeve alive in June, capture fixed) · **away** from prop math / income (script n=2; May script n=0). |
| **Blockers** | Finish May walk with census populated; fixed-horizon script look only at May closeout; path MC only after enough tagged fills. |
| **TV / human export** | No Deep BT CSV required for Dual46 right now — **continue May replay from 05-07**; skip **05-25**. |
