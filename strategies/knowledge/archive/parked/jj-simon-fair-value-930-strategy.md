---
topic: jj-simon-fair-value-930-strategy · researched: 2026-07-20 · sources: 10 · agent-cycle: adhoc-jj-simon
---
# JJ Simon — Fair Value / Fair Price Theory (9:30 NQ sleeve)

**Scope:** free YouTube teachings from JJ Simon (`@itsjjsimon`) plus third-party mechanical summaries (FX Replay PDF, PropFirmElite paraphrase). No paid course; no Pine. Draft Stage-0 *idea* only — does not reopen killed Track B books and does **not** override Dual46 freeze.

## Key findings (claim vs evidence)

- **CLAIM (identity / channel):** JJ Simon / J.J. Simon — YouTube channel [JJ Simon](https://www.youtube.com/@itsjjsimon) (`UCrvs89j_5m3LQDVWXbdnZMw`, ~17k subs as of fetch). Free content; no paid course found in this pass. Primary strategy dump: ["The EXACT Trading Strategy That Made Me $1,200,000…"](https://www.youtube.com/watch?v=3L8xdh3oPm4) (35:34).
- **CLAIM (payouts):** Self-reported ~$1.2M–$1.5M prop payouts over ~12 months; shows bank/Wise screenshots, firm dashboards (Topstep, RiseWorks, E8, Lucid, Apex, FundedNext, etc.), and asserts 1099s (~$250k Topstep, ~$450k RiseWorks). Also claims ~$200–250k spent on evals. **EVIDENCE status:** screenshots and tax-form *claims* in video — **not independently audited by The Vault**. Treat as marketing-grade claim until verified.
- **CLAIM (prop-only edge):** Explicitly: strategy "only works on prop firms"; on a live account it would "probably break even" / tiny edge (~1–5%); eval fee caps downside. This is his framing of *prop asymmetry*, not a measured live-vs-prop EV study.
- **CLAIM (fair-price theory):** Nasdaq has a short-horizon "fair price" at session open (pre-open / 9:29 body / 9:30 open — he uses these interchangeably across videos). Opening flow moves price *unfairly* without changing underlying company value; absent news, expect reversion to that reference. News *does* reprice fair value → use pre-news candle as the new FV for 8:30 red-folder prints.
- **CLAIM (two-phase window):** NY AM: Phase 1 continuation away from FV in first ~0–10 (sometimes 10–15) minutes; Phase 2 mean-reversion back toward FV from ~10–90 minutes. Caps ~3–4 trades/session; stop after consecutive losses / bias fail. Secondary windows: 2:00 PM NY, 6:00 PM reopen, 8:00 PM Asia, London mentions, 8:30 news.
- **CLAIM (entry):** Displacement candle + BOS/MSB with close. Grades A+/A/B by HTF reversion bias + LTF continuation alignment; skip B when biases conflict. Fixed ~1.5R (often 25pt SL / 37.5–38pt TP on NQ; vol days 50/75). ATR tiers formalized in FX Replay write-up (not always numbered that way in his own speech).
- **EVIDENCE (third-party):** FX Replay published a mechanical checklist + ATR tiers and ran a public backtest video; PropFirmElite / Oyamori summarize the same skeleton and flag payout figures as unverified. Third-party WRs are *their* tests, not JJ's audited track record — do not import as Vault edge.

## Details / mechanics

### Fair-value reference: 9:30 vs 9:29

| Source | Reference used |
|---|---|
| Main strategy video + 10-min explain | "Pre-open" / session open / "fair price at open" (9:30) |
| "ONE Candle" video | Explicitly marks **9:29 AM 1m candle body** as FV rectangle; reverts to that zone |
| FX Replay PDF | 9:30 market open price (and 2pm afternoon) |

**Vault note:** for event studies, pick **one** pre-registered anchor (recommend **9:30 RTH open print** *or* **9:29 body mid** — not both) and freeze it. Mixing 9:29 body vs 9:30 open is a free parameter that invites retune theater.

### Phase 1 — continuation (first ~10–15 min)

- Bias from opening displacement / overnight order flow executing at the open.
- Entry: BOS (continuation) or displacement + structure break *away* from FV.
- He often enters "pretty much instantly" in minutes 0–10.
- FX Replay soft tip: may skip first ~3 minutes after 9:30 (liquidity chaos) — **his** videos do not hard-code that; treat as optional filter requiring its own Stage-0 flag if used.

### Phase 2 — mean reversion (rest of ~90 min)

- After a move away from FV, look for MSB/BOS + displacement *back toward* FV.
- Primary setup in most third-party write-ups; he calls HTF mean reversion + LTF continuation the A+ bias stack.
- Window commonly cited through ~11:00 AM ET (~90 min from open); afternoon sleeve 2:00–3:00 PM with 2pm as FV.

### Entry triggers (as stated)

- **Displacement:** larger/decisive body vs prior candles; minimal counter-wick. FX Replay mechanicalization: counter-wick &lt; 20% of open→extreme distance (Fib 0 / 0.2 / 1). "Larger than neighbors" left discretionary/optional.
- **BOS:** break of structure = trend continuation close past recent swing.
- **MSB:** market structure break = potential reversal close past recent swing wick H/L.
- Market entry; **no** active management / no partials in the published checklist.

### Risk / RR / sizing (claims)

- Default **1.5R** (e.g. 25 SL → 37.5–38 TP; high vol 50 → 75).
- FX Replay ATR tiers (CLAIM, their PDF of his rules):

  | ATR regime | SL (pts) | TP @ 1.5R |
  |---|---|---|
  | &gt;20 | 50 | 75 |
  | 7–20 | 25 | 37.5 |
  | &lt;7 | 16.5 | 24.75 |

- Sizing story: 1–3 NQ so risk ≈ **$1k/trade** at those stops (NQ $20/pt — PDF typo said $1/pt). Account selection by "points available" that day (20 vs 50 pt reversion → different prop account / risk).
- Session hygiene claims: max ~3–4 trades; stop on loss streak / dead volume; don't hold through secondary 9:45–10:00 news if already in.

### Other session anchors

- **2:00 PM NY:** afternoon FV, trade ~2–3pm.
- **6:00 PM / 8:00 PM Asia:** FV = that session's open; Asia continuation only if volume/volatility "surges" (discretionary gate in his Asia video).
- **8:30 red folder:** FV = candle *before* news; same continuation-then-reversion skeleton.

### What he shows as "proof"

- Payout montages, live-account logins, 1099 screenshots, weekly P&amp;L recaps, a long backtest walkthrough video.
- **Vault stance:** all **claim** until third-party firm confirmation or our own event-study EV. His own admission that live would ~break even is important: any Stage-0 must score **path MC / E[$/wk] under prop rules**, not guru equity screenshots ([walk-forward / overfitting](walk-forward-testing-overfitting-prevention.md); prop MC notes in knowledge tree).

## APPLICATION TO THE VAULT

### Product boundary (locked 2026-07-20)

**JJ Fair-Value is its own separate research product** — not a Dual46 replacement, not a Dual46 add-on, not a Dual46 discretionary sleeve, and not a Pine merge candidate. Dual46 stays frozen and walks its own ledger (May → Nov–Dec). JJ gets its own Stage-0 note, own event study, own SCORECARD, and own path MC when a slot opens. Shared infrastructure only (MNQ, prop firms, `analyze-event-study.ts`, kill-lessons). Never co-score or blend rules into Morningstar.

### Overlap vs conflict with Dual46 (frozen — comparison only, not integration)

| Dimension | Dual46 | JJ Simon | Conflict? |
|---|---|---|---|
| Time box | 10:00 KO leave → 1m RB in OTE | 9:30–~11:00 (heavy 9:30–10:00) | **Yes — same morning attention / capital** if both live |
| Level set | OTE / rejection block | Session open / 9:29 body | Independent |
| Barrier | Fixed **1:5** capped 100pts | Fixed **~1.5R** ATR stop | Independent; 1.5R sits in Track-B **geometry-trap band** (~40% / ~1.3R kills) |
| Cadence | **One trade/day** | Multi (3–4) + multi-session | Conflicts with Dual46 ops discipline if same account |
| Instrument | ~10 MNQ | Full NQ (1–3) typical in talk | Scale math differs; MNQ event study still fine |

**Hard rule:** knowledge never overrides Dual46 freeze. JJ is at most a **separate Stage-0 candidate sleeve**, never a Dual46 retune, and never simultaneous "take both" on the same morning without a pre-registered exclusivity rule.

### Legitimate Stage-0 event-study candidate?

**Yes — if and only if events are mechanical and Phase 1 / Phase 2 are scored separately.**

Suggested pre-registered events (draft — not open until Stage-0 slot free):

1. **JJ-P1-CONT:** In minutes **0–15** after RTH open, first 1m bar that (a) closes beyond prior swing H/L in the direction *away* from FV by ≥1 tick, **and** (b) satisfies displacement rule (counter-wick ≤20% of body extreme span), **and** (c) FV = frozen 9:30 open. Entry next bar open; SL = ATR-tier table; TP = 1.5R. One event max per day.
2. **JJ-P2-MR:** In minutes **15–90**, first MSB (close beyond opposing swing) **toward** FV + same displacement rule, only if price has already extended ≥ X×ATR from FV (X pre-registered, e.g. 0.5 or 1.0 — **one** free param). Same barriers.

Tag Asia / 2pm / 8:30 news as **out of scope** for v0.

### Hard constraints from kill-lessons

- **Not an OR-break clone (B0)** if the event is *MSB/BOS + displacement*, not "break of first N-minute range H/L." Do **not** redefine as ORB mid-flight.
- **Open-magnet caution (B10):** B10 killed *late* (14:30) fade to RTH open. Morning FV-reversion is a **cousin**, not the same costume — still report era vector and loss shape early; soft preference was "next class outside open-magnet." If JJ-P2-MR lands in the ~40%/1.3–1.5R soft-drain cluster, kill on EV — do not widen TP to "look more Dual46."
- **Measurable without feel:** A+/A/B grading, "surge in Asia volume," and "points available that day" are **out** of Stage-0. Displacement 20% wick rule + swing definition (e.g. last 5-bar pivot) stay **in**.
- **One Stage-0 at a time;** no Lab promote / income claim without toward + path MC `E[$/wk]`.
- **Era-split** calendar years + 30-event rolling EV per [stationarity note](stationarity-era-splitting-event-studies.md); WFE / no param spray per [walk-forward note](walk-forward-testing-overfitting-prevention.md).

### Recommendation

**Explore as a standalone product (parked until its own Stage-0 slot free) — do not kill-as-inspiration-only. Do not fold into Dual46.**

**Why explore separately:** Clean, public, free theory; objective FV anchor; mechanizable displacement rule already published; different session/RR/cadence from Dual46 so it can live as a second prop attempt *if* it clears SCORECARD on its own.

**Why not open now / why not promote:** (1) Dual46 May walk is current priority; (2) 1.5R geometry sits next to falsified Track-B traps — need n and path MC before any excitement; (3) Phase-1 continuation is ORB-adjacent risk — score P2 first; (4) payout "proof" remains claim; (5) he himself frames live EV ≈ 0 — Vault scores *our* MNQ path EV under prop rules, not his montage.

**Next human step (when slot opens):** export 1m NQ/MNQ matrix for a pre-registered window → `analyze-event-study.ts` on JJ-P2-MR only → SCORECARD with eraConsistency + vsFlip/vsRandom. No Pine until toward.

## Sources

1. JJ Simon channel — https://www.youtube.com/@itsjjsimon (`UCrvs89j_5m3LQDVWXbdnZMw`)
2. Transcript archive — `vault-app/data/jj-simon-transcripts/` (+ re-runnable `vault-app/scripts/fetch-jj-simon-transcripts.ts`)
3. [The EXACT Trading Strategy That Made Me $1,200,000…](https://www.youtube.com/watch?v=3L8xdh3oPm4) (35:34) — primary
4. [My $1,300,000 Trading Strategy (Explained in 10 Minutes)](https://www.youtube.com/watch?v=UVKVSWKFlvo) (10:01)
5. [This ONE Candle Makes me $100,000+ PER MONTH](https://www.youtube.com/watch?v=7UXiI2arAlQ) (12:26) — 9:29 body
6. [Copy My News Trading Strategy](https://www.youtube.com/watch?v=8lbkj0PF1uM) (12:45) — 8:30 FV
7. [How I Trade the 6PM & 8PM Session](https://www.youtube.com/watch?v=GMDUiamqgig) (12:44)
8. [Watch Me Backtest My $1,500,000 Trading Strategy](https://www.youtube.com/watch?v=MVP7X-3v8xk) (50:19)
9. FX Replay strategy page + PDF checklist — https://fxreplay.com/strategies/jj-simons-fair-value-theory-nq-strategy
10. PropFirmElite paraphrase — https://www.propfirmelite.com/blog/nq-prop-trading-strategy-fair-pricing-theory (supplement; payout verification = claim)

### Cross-refs

- `quant/walk-forward-testing-overfitting-prevention.md`
- `quant/stationarity-era-splitting-event-studies.md`
- `strategy-dev/50-analyses/kill-lessons-track-b.md` (B0 ORBreak, B10 open-magnet, #15 geometry trap)
- Dual46 freeze — `strategy-dev/00-charter`
