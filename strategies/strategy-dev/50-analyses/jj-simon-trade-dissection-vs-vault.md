---
updated: 2026-08-02
tags: [jj-simon, dissection, stage-0]
---
# JJ Simon — how 1.5R + “millions” can coexist · one-trade dissection

> Source: his own video transcript (“Strategy Behind My $1.6M…”) + FX Replay public checklist.  
> Our ledgers: F1–F3 12m **away**. Payout montages remain **claim**, not Vault-audited.

## 1. Does 1.5R + prop millions make sense?

**Yes, mathematically — if and only if his real trade EV is positive and he scales accounts.**

He states explicitly:

- Eval geometry: **25 pt SL / 38 pt TP = 1.5R** (matches firm PT/DD ≈ 1.5).
- His sample in that video: **80 trades · 8 days · 57.5% WR @ 1.5R**.

Rough EV per trade in R:  
`0.575 × 1.5 − 0.425 × 1 = +0.44R` per trade.

At ~$1,000 risk/trade (1–3 NQ at his ATR tiers — **not** our $300 MNQ):  
≈ **+$440 / trade** × 10 trades/day × many accounts × high pass rate = large *gross* payout flow — **before** failed eval fees ($200–250k he claims spent).

Also convex: economic downside ≈ fees; upside = repeated payouts. He even says the system is **prop-optimized** and on a live account would be near breakeven.

| Claimed world | Our measured world (F1–F3) |
|---|---|
| ~57% WR @ 1.5R → **+EV** | ~37–41% WR @ 1.5R → **~0 to −EV** |
| Aggressive discretionary selects | Mechanical rules fire losers too |
| Multi-account factory | Single MNQ ledger |

So: **1.5R isn’t the paradox. The paradox is WR.** If he’s really ~57% and we’re ~40%, we are **not executing his filter** — or his montage WR isn’t what a mechanical clone gets.

## 2. Live breakdown — first trades from his own walkthrough

Video sequence (NY open, prop eval sizing 25/38):

### Trade A — P1 continuation (seconds after open)

| Step | What he does | Our Pine? |
|---|---|---|
| FV | Session open / pre-open | ✓ 9:30 open |
| Signal | **Opening candle green → buy at the top** | ✗ We do **not** take “candle color only” |
| Stop / TP | 25 / 38 | ✓ 1.5R tier |
| Rationale | “Unfair” move away from FV — get in/out fast | P1 in F3 is displacement-based, not open-color |

**Gap #1:** His highest-frequency opener is literally **open candle direction**, not MSB.

### Trade B — First mean-reversion short

| Step | What he does | Our Pine? |
|---|---|---|
| Displacement rule (his words) | Body **larger than previous candle’s body** (“10 points larger”) | ✗ We use **counter-wick ≤20%** only (FX Replay mechanicalization) — **different definition** |
| Discretion skip | Bigger body but **didn’t close below wick** → he **skipped** | ✗ We can’t skip — no wick-preference filter |
| Entry | Market short toward FV | ✓ directionally |
| Barrier | 25 / 38 fixed | ✓ |

**Gap #2:** His “zero discretion” displacement ≠ our wick-% rule.  
**Gap #3:** He still applies **discretionary skips** we never coded.

### Trade C — Displacement + BOS (A+)

| Step | What he does | Our Pine? |
|---|---|---|
| Signal | Displacement **and** break of structure | F1 requires MSB; F2/F3 do not |
| Management | Sometimes would hold to open; on prop sticks to **1.5R** | ✓ fixed 1.5R |
| Layering | Mid-move, halfway to TP, **adds another entry** on next BOS | ✗ One position; no pyramiding |

**Gap #4:** He **layers** winners — our measure never does.

### Trade D — Mid-day FV rewrite

| Step | What he does | Our Pine? |
|---|---|---|
| Event | Consolidation → breaks higher; volume “reprices” | ✗ |
| Action | **Deletes** old open FV; new FV = consolidation / post-news level | FV frozen at 9:30 all day |

**Gap #5 (huge):** Moving fair value mid-session is core to how he trades the rest of the day. Our FV is static → many of our “reversions” aim at a level he already abandoned.

## 3. So are we “coded wrong”?

| Piece | Verdict |
|---|---|
| 1.5R / 25–38 | **Correct** — he says it on camera for evals |
| Fair value = open | **Partially** — he starts there, then **moves it** |
| Displacement | **Wrong variant** — he uses body>prior; we used wick% |
| Structure | He takes **disp alone** often; MSB is “stronger” not required |
| P1 | Open **color** / instant aggression — we under-specify |
| Cadence | Layering + no 1/day cap + FV moves → many more signals |
| Millions | Needs **his WR + NQ size + many accounts + prop convexity** — not proven by our MNQ clone |

We didn’t invent 1.5R incorrectly. We **under-cloned the discretionary / FV-update / displacement definition** that (if real) is where his WR would live.

## 4. Fix shipped — v2 clone ladder

Pine: `pine/JJ_P2_MR_measure_v2.pine` (replaces v1 as active measure).

| Gap | v2 implementation |
|---|---|
| Disp definition | `body > body[1]` + directional close |
| Wick skip | C1/C2: close beyond `high[1]`/`low[1]` |
| FV rewrite | Consol range ≤1.25×ATR then BOS away → FV = consol mid; also 2:00 open |
| Open-color P1 | 9:30 / 2:00 bar color → 25/38 (or 50/76 if range>25) |
| Phase timing | Cont first **5m**, then MR to 11:00 / 15:00 |
| Layering | C2: pyramid max 2 · unique entry IDs |
| Cadence | Max **10**/day |

| Profile | CSV |
|---|---|
| C1 Full clone · no pyramid | `jj-c1-clone-mnq-1m-12m.csv` |
| C2 Full clone · pyramid 2 | `jj-c2-layer-mnq-1m-12m.csv` |
| C3 Clone + MSB + wick% | `jj-c3-msb-mnq-1m-12m.csv` |

**Waiting:** human Deep BT exports → `analyze-event-study.ts`. No Apex live until toward + path MC.

## 5. Bottom line

- **1.5R + millions** can make sense under prop math **if** WR ≈ mid-50s and size/accounts scale.  
- v0/v1 ~40% WR reflected **clone gaps**, not proof that 1.5R is “wrong.”  
- v2 encodes the dissection gaps. SCORECARD after export decides if the edge transfers.
