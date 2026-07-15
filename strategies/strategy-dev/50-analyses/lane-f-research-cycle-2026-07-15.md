---
updated: 2026-07-15
status: settled
tags: [track-b, lane-f, research-cycle, prop, strategy-dev]
---
# Lane F research cycle — 2026-07-15

> Comprehensive cycle after B8 kill. Goal: one Stage-0 for **higher-frequency** prop-compatible geometry — not another 1.5R TA costume.  
> Authority: [[kill-lessons-track-b]] · [[SCORECARD]] · [[prop-firm-math]] · [[RESEARCH_AGENT_LOOP]].

## 1. Why Lane F for prop (claim + caveat)

**Claim (user):** More trades → faster eval pass → more payout cycles than rare PRB.

**Vault fact check:**

| Evidence | Implications |
|---|---|
| H0b Hybrid funded was **faster** weeks→payout than D1 but **bust/DD hostile** on 3y | Cadence without trail-safe losses burns accounts |
| Prop math: `E[$/wk]` = f(pass, bust, extract, fees) | Frequency helps only if trade EV ≥ 0 **and** streak × risk fits $2k trail |
| TPT Test = **EOD** trail · PRO = **intraday** trail | HF must keep *unrealized* swings small on funded; eval is more forgiving |
| Consistency (best day &lt;50%) + min days | Many small wins pack consistency better than rare $2k hits — **if edge exists** |

**Honest ruling:** Lane F is the right *search* for challenge speed. It is **not** proven superior until Stage-0 toward + path MC. M2 Macro volume already showed “fast + uncontrolled” → negative `E[$/wk]`.

## 2. Vault kill map (what HF must not redo)

| Dead family | Why |
|---|---|
| ORB / 10:05 impulse / AM→PM / MTF PM / open-magnet | Clock + continuation costumes |
| Gap fade **and** gap cont | Polarity flip failed at n=641 |
| Session VWAP ±zσ fade (B4) · ER xor (B1) | Unconditional MR / dual-regime costume |
| PDH sweep fade · NR→PDH break | Level costumes |

Settled trap: **common event + ~40%/1.3R/$150** soft drain. Lane F must change **barrier and/or information source**.

## 3. External research digest (web · Jul 2026)

Sources informal (prop blogs / education — treat as **hypothesis generators**, not evidence):

| Theme | Takeaway for Stage-0 |
|---|---|
| Futures scalping @ props | Often targets **higher WR (~55–65%)** with **~1:1 or sub-1.5R**; micros for trail room |
| Drawdown model matching | Intraday trail (TPT PRO) punishes HF equity spikes; prefer small MAE per trade |
| VWAP ±σ fade | Popular — **already killed here as B4**; must not retune z |
| BB / band **reclaim** (not touch-alone) | Piercing + close back inside + target mid; literature stresses **regime filter** (ADX / flat mid / non-trend day) |
| Trend-day failure mode | Unfiltered MR dies on walk-the-bands days — same structural kill as our soft drains |
| Fees / first 5 minutes | HF edge erased by commissions + open spread; delay arm past open |

## 4. Candidate shortlist (filtered)

| Idea | Lane | Pass kill filter? | Notes |
|---|---|---|---|
| Retune gapMult on GapCont | R/F | **No** | Retune dead B8 |
| VWAP z with ADX only | F | **No** | Costume of B4 |
| OR mid fade scalp | F | **No** | Open-magnet / ORB-adjacent |
| Tick DOM / Bookmap | F | **No** | Not in TV Deep BT ledger |
| **BB pierce → reclaim → 1.0R** + ADX&lt;25 | F | **Yes** | New level (BB mid) · new event (reclaim) · new barrier (1.0R) · regime info |
| EMA pullback trend scalp | F | Maybe later | Hold — one Stage-0 at a time |

## 5. Selected Stage-0 — **B11 BB Reclaim (BBR)**

Falsifiable: On MNQ 5m, when ADX(14)&lt;25 and price closes outside BB(20,2) then closes back inside, a 1.0R scalp (stop beyond 2-bar extreme) has **positive trade EV** full + OOS; loss streaks × $100 &lt; $2k trail.

Full pre-register: [[track-b-b11-bb-reclaim-v0]] · [[event-study-b11-bb-reclaim]].  
Measure: `pine/TrackB_BBReclaim_measure_v0.pine` → `matrix/trackb-bbreclaim-mnq-5m.csv`.

## 6. Rejected this cycle

- Stacking Jul+Oct onto BBR as “edge”  
- Multi-symbol / 1m breadth before toward  
- Lab MC promote language before SCORECARD toward  

## Links

[[track-b-ideas]] · [[sim-queue]] · [[gated-prb-live-guide]] · [[track-b-error-synthesis-b0-b10]]
