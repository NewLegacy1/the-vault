---
topic: iv-walls-fractals-day-range · researched: 2026-08-02 · sources: 12 · agent-cycle: adhoc-iv-walls
---
# IV walls × fractals — day highs/lows research

**Scope:** What people mean by “IV walls,” how that relates to “fractals,” and whether The Vault should use them for MNQ day-range / prop work. No Pine. No Lab promote. Dual46 freeze untouched.

## Key findings (claim vs evidence)

- **CLAIM (retail teaching):** IV walls mark the day’s high/low magnet — fade into them, take profits there, treat the band as the session envelope.  
  **EVIDENCE status:** Concept family is real (options dealers price a range and hedge at concentrated strikes). **Hard pin-to-HOD/LOD every day is marketing.** Walls are *candidates* for extremes, regime-dependent, and often break in short-gamma / stressed vol.

- **Three different “walls” get conflated:**
  1. **GEX call/put walls** — max call / put *gamma* strikes; dealer delta-hedging creates mechanical support/resistance. Closest to “walls find highs/lows” for ES/NQ futures. Sources: FlashAlpha NQ/ES GEX, Tikitrade gamma map, dealer-hedging literature.
  2. **IV / options-writer range walls** — “priced-in range” from the chain (Roblesh / TradeWellX Fractal System: **IV Wall** top/bottom, weekly **WIV**). Explicitly stacked with **fractal wave** labels (W7D, W10/15M). Proprietary packaging; mechanics = options positioning + structure.
  3. **IV-surface / “no interest” walls** — e.g. Heltzel EA model: low bid/IV interest strikes as outer “Max Fear” envelope for an expiry (often 0DTE). Claim: call IV wall ↔ put IV wall ≈ MM-priced range. **Not independently audited by Vault.**
  4. **(Cousin) VIX-implied exhaustion wall** — not a strike wall; expected 1-day move ≈ VIX/√252. Soft extension check, fails in stressed VIX. Useful as *size/regime*, not a price level.

- **“Fractals” in this conversation usually means one of:**
  | Sense | Meaning | Relation to IV walls |
  |---|---|---|
  | **Self-similar structure** (ICT / market structure) | Swing H/L / BOS repeats across TFs | Walls = HTF “draw” / day envelope; LTF fractal = entry |
  | **Fractal System / Roblesh** | Proprietary map: fractal waves + Spread Monster + IV walls | IV walls are one layer of a multi-layer day map |
  | **Bill Williams fractal** | 5-bar pivot high/low | Unrelated mechanically; sometimes used as LTF trigger *at* a wall |

- **Regime is the load-bearing fact:** Above **gamma flip** (dealers long gamma) → walls more often *repel* (mean reversion / fade extremes). Below flip → walls *fragile*, breakouts amplify. Fading every wall without regime = Track-B soft-drain risk.

- **NQ/MNQ path exists:** Options-on-futures GEX is published for NQ (strikes on futures, $20/pt multiplier, basis vs NDX). Mapping SPX/NDX walls onto MNQ without basis = wrong levels.

## Mechanics (usable definitions)

### A — GEX walls (preferred Vault vocabulary)

| Level | Definition (dealer-hedging story) | Typical use |
|---|---|---|
| **Call wall** | Strike with largest call gamma above spot | Upside resistance / TP magnet in +GEX |
| **Put wall** | Strike with largest put gamma below spot | Downside support / TP magnet in +GEX |
| **Gamma flip (zero gamma)** | Spot where net dealer GEX changes sign | Regime: fade vs trend |
| **Max pain** | Strike minimizing option-holder payout | Soft magnet near expiry — weaker mid-day |

Hedging intuition (simplified, assume dealers short customer options): near call wall, rising delta → dealers **sell** underlying → caps rallies; near put wall, falling delta → dealers **buy** → cushions dips. **Sign of net GEX flips the playbook.**

### B — IV range walls (writer-priced envelope)

- Top/bottom zones = where options market has priced “unlikely / expensive to breach today” for a given expiry (0DTE vs weekly).
- Roblesh legend: IV Wall top/bottom; weekly WIV / WApex (chain center).
- Closest to “find the high and low of the day” **as a band**, not as two exact ticks.

### C — Fractal nesting (how practitioners combine)

```text
HTF fractal narrative (daily/4H draw, weekly wave)
        +
IV / GEX day envelope (put wall ↔ call wall, or IV walls)
        +
LTF fractal trigger (1m/5m BOS, RB, Williams fractal, displacement)
        =
entry only when LTF confirms AT the options-defined level
```

This is the same grammar Dual46 already uses (HTF bias → 10:00 manip → 1m RB) with a **different level set** (options walls instead of / in addition to PDH·PDL·KO).

## APPLICATION TO THE VAULT

### Useful? — conditional yes as **context**, not as a new entry engine yet

| Use | Fit | Why |
|---|---|---|
| Day-range / TP magnets | **High** | Call/put or IV walls as *optional TP / skip-if-already-at-wall* tags |
| Regime gate (fade vs trend) | **High** | Gamma flip / net GEX sign before taking mean-reversion sleeves |
| Expected-move size check | **Medium** | VIX/√252 or NQ ATM IV → “is today’s Dual46 100pt TP inside 1σ?” |
| Standalone “fade the IV wall” system | **Low until Stage-0** | Same failure mode as killed open-magnet / VWAP fades if −EV |
| Apex pass-speed HF | **Maybe later** | Positive-GEX fade-to-wall is HF-shaped — needs own Stage-0, not Dual46 merge |

### Hard constraints from kill lessons

- Do **not** rebuild **B10 open-magnet** or **B4 VWAP±z** as “IV wall fade” without a **new** event definition (wall source ≠ prior close / VWAP).
- Do **not** claim day H/L prediction; log hit-rate vs wall as census.
- One Stage-0 at a time — S3 still owns the slot; IV/GEX stays **parked eyes-only** or post-S3 candidate.
- Dual46 freeze: walls are **tags only**, never retune geom mid-walk.

### Data reality (why this isn’t in Pine tomorrow)

| Source | Notes |
|---|---|
| Spot GEX dashboards (FlashAlpha, etc.) | NQ levels available commercially; not free in TV by default |
| CME NQ options chain | Needed for DIY GEX; vault-app has no GEX ingest yet |
| TradingView | Limited options Greeks on futures; Roblesh-style charts are third-party |
| DIY Phase-0 | Pre-open screenshot: put wall · call wall · flip · ATM IV → journal fields |

### Recommended Vault path (ordered)

1. **Eyes-only census (now, during Dual46/May or Apex process weeks):**  
   Journal fields (optional): `gexRegime` (+/−/near flip) · `putWall` · `callWall` · `ivDayMovePts` · `touchedPutWall` Y/N · `touchedCallWall` Y/N · `brokeWall` Y/N.  
   Question: do Dual46 TPs / disc HOD/LOD cluster at walls more than random?

2. **Regime overlay (soft):** In +GEX, prefer fade/selective A+; in −GEX, prefer continuation / wider stops / skip mean-reversion. No promote until tagged n is large.

3. **After S3 closes — possible Stage-0 draft (not open):**  
   **GEX-P2-FADE:** RTH, only if spot above flip; first MSB/displacement **toward** nearest wall after extension ≥ X×ATR from open; SL ATR-tier; TP = wall (or 1.5R if wall farther). Score separately from Dual46. Kill if soft-drain geometry.

4. **Do not** buy a proprietary Fractal System as Vault edge until we can restate levels mechanically and clear SCORECARD on our MNQ path MC.

### Verdict

| Token | Meaning |
|---|---|
| **toward (research)** | GEX/IV walls are a legitimate **non-TA level set** + regime filter for day-range context |
| **away (as magic HOD/LOD)** | Exact daily high/low prediction from walls alone |
| **parked product** | Separate from Dual46; activate Stage-0 only after S3 + data source chosen |

## Sources

1. FlashAlpha — NQ GEX / call wall / put wall / flip — https://flashalpha.com/futures/nq/gamma  
2. FlashAlpha — ES/NQ GEX handbook — https://flashalpha.com/articles/trading-es-nq-futures-with-flashalpha-handbook  
3. Tikitrade — Options gamma levels for ES/NQ — https://tikitrade.com/options-gamma-levels-for-futures-trading-the-dealer-hedging-map-that-moves-es-and-nq  
4. Ainvest OptionPilot — Gamma walls explained — https://optionpilot.ainvest.com/blog/gamma-walls-explained  
5. TradeWellX / Roblesh — Fractal System + IV Wall legend — https://tradewellx.substack.com/p/how-to-trade-roblesh-nqes-charts  
6. Max Heltzel — IV modeling / IV walls (EA ≤ threshold) — https://maxheltzel.medium.com/implied-volatility-modeling-using-trignonometric-functions-b41b2ae246b2  
7. Vortex — VIX-implied exhaustion walls — https://www.vortexcapitalgroup.com/post/vix-implied-exhaustion-walls-mapping-where-momentum-runs-out  
8. LiquidityScan — Fractal market structure across TFs — https://liquidityscan.io/blog/fractal-market-structure-how-structure-nests-across-timeframes  
9. TradeLikeADealer — PA + GEX walls vs magnets — https://tradelikeadealer.com/guide  
10. Tiki Gamma (open TV tool for dealer levels) — https://github.com/tikitrade/tiki-gamma  

### Cross-refs

- Dual46 freeze · [[../strategy-dev/50-analyses/morningstar-dual46-lock]]  
- Kill open-magnet / VWAP — [[../strategy-dev/50-analyses/kill-lessons-track-b]]  
- Parked OF/auction — [[../strategy-dev/60-track-b/parked-of-auction-sleeve-sketches]]  
- Regime tags already on Dual46 form — [[macro-regime-context-data-options]] · [[mnq-relevant-regime-variables]]  
- JJ FV (different mean-reversion anchor) — [[archive/parked/jj-simon-fair-value-930-strategy]]
