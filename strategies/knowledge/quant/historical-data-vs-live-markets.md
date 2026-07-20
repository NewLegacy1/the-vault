---
topic: historical-data-vs-live-markets · researched: 2026-07-20 · sources: 14 · agent-cycle: adhoc-past-vs-live
---
# Historical Data vs Live Markets: Objectifying the Past Without Pretending It Repeats

*Answers the practical question: if no two days are the same and last year's market is never this year's, what is past / backtest / replay data actually good for — and how do serious traders and quants turn it into live decisions without cargo-culting history?*

Extends (does not replace): `walk-forward-testing-overfitting-prevention.md`, `stationarity-era-splitting-event-studies.md`, `regime-switching-monte-carlo.md`, `vol-regime-dependence-setup-frequency.md`, `ops-replay-live-calibration-protocol.md`, `deltatrend-quant-process-event-first-workflow.md`, `bayesian-beta-binomial-win-rate-updating.md`.

## Key findings

- **CLAIM (distributional honesty):** historical data never forecasts a *day*; it estimates a *conditional distribution* under assumptions that must be stated. The useful object is not "June 5 will happen again" but "when structure X appears after condition Y, measured EV was Z ± CI across eras." Non-stationarity and concept drift are the default, not the exception (Gama et al. stream-learning lineage; finance reviews of regime change / concept drift).
- **CLAIM (what history CAN do):** (1) reject or fail-to-reject a pre-registered structural hypothesis; (2) estimate geometry (stop/TP shape, fill-model sensitivity, streak/path risk) under stated regimes; (3) size *conservatively* under parameter uncertainty (fractional Kelly / shrinkage); (4) practice process under time pressure proxies (replay → paper → live bridges). López de Prado's validation stack (purged/embargoed CV, PBO, DSR) exists precisely because naive backtests overstate all four.
- **CLAIM (what history CANNOT do):** certify income; prove next month's WR; license full-Kelly from sample estimates; survive unconditioned pooling across regime shifts; or bridge replay fills to live fills without a separate calibration experiment (`ops-replay-live-calibration-protocol.md`).
- **EVIDENCE (era non-stationarity, already in vault):** DeltaTrend's ES prior-day H/L sweep was statistically significant bearish in 2023 and CI-includes-zero over 2022–2025 pooled — same event, different eras, different answer (`deltatrend-quant-process-event-first-workflow.md`). That is the canonical warning against "the backtest says."
- **CLAIM (objectification stack professionals use):** event studies with pre-registered era splits → walk-forward / OOS holdouts (WFA or CPCV) → regime conditioning → Bayesian updating of parameters → paper→live calibration with CI pass criteria → path Monte Carlo for barrier questions (prop DD). None of these assume day-identity; all assume *partial* stability of a *conditional* map.
- **CLAIM (Kelly under uncertainty):** full Kelly assumes known p and payoffs; plugging in sample estimates systematically overbets (Baker & McHale 2013 *Decision Analysis*; MacLean–Thorp–Ziemba fractional-Kelly practice). Fractional / shrunk Kelly is the professional response to historical uncertainty — not "ignore history," but "shrink its implied size."
- **CLAIM (prop forward-testing practice):** after backtest, run frozen-rules forward tests on the target platform (≥30–50 trades / several weeks common prescription; demo→firm trial→small paid challenge staging). Compare forward metrics to backtest within a pre-set band (~20–30% discrepancy triggers investigation, not rationalization) — practitioner consensus, not peer-reviewed thresholds.

## Details / mechanics

### 1. What historical data CAN and CANNOT do

| Layer | History can estimate… | History cannot claim… |
|---|---|---|
| Day / tape | Nothing about tomorrow's open | "Same as last Tuesday" |
| Conditional setup | P(outcome \| event features, regime tag) ± CI | That the conditional map is eternal |
| Geometry | MFE/MAE shape, cap-hit rate, streak risk under sample | Optimal live TP without OOS + live fill model |
| Path / prop | Pass/bust/`E[$/wk]` *under* assumed WR posterior + regime model | Income without Stage-0 **toward** + path MC |
| Process | Detection rate, staging latency, rule adherence under replay/paper | That replay fills = live fills |

**Distributional assumptions (state them or the number is fiction):**
- **i.i.d. trades** — fine for mean EV; optimistic 1.5–5× on drawdown/bust tails when vol regimes persist (`regime-switching-monte-carlo.md`).
- **Stationarity of p** — required to pool May+June into one WR posterior; if era/regime break is flagged, discount prior months (power prior) rather than full pool (`bayesian-beta-binomial-win-rate-updating.md`, `stationarity-era-splitting-event-studies.md`).
- **Fill model** — touch ≠ trade-through ≠ queue-aware; replay baselines that count touches are a different experiment than live (`ops-replay-live-calibration-protocol.md`).

**Non-stationarity / concept drift (CLAIM):** in streaming-ML language, *concept drift* is a change in P(y|x) — same inputs, different outcomes — while *data drift* is a change in P(x). Markets deliver both. OOS failure has four causes that must not be collapsed into one word "overfit": no edge ever, leakage, sample too small, or regime shift between IS and OOS (`stationarity-era-splitting-event-studies.md`). Mislabeling (4) as (1) produces false kills; mislabeling (1) as (4) produces endless "regime excuse" retunes.

### 2. How professionals objectify history

Ordered from research design → live monitoring. Each step is a *protocol*, not a vibe.

1. **Event studies, not every bar.** Define the event scope first; label barrier outcomes; add contextual features that explain outcome variance (DeltaTrend quant-process; Vault Track B). Sampling every candle forecasts noise.
2. **Pre-registered hypotheses + era vector.** Split by calendar years (or pre-specified halves), not by data-mined break dates. Report per-era n, EV, CI; kill/block when one hot block carries pooled EV (`stationarity-era-splitting-event-studies.md`).
3. **Walk-forward / OOS holdouts.** Train/calibrate → freeze → test on the next unseen window; concatenate OOS. WFE = OOS/IS; parameter instability across windows is a red flag (`walk-forward-testing-overfitting-prevention.md`). For multi-path honesty, CPCV (López de Prado AFML) produces a *distribution* of OOS paths, not one lucky path (PBO via CSCV when many variants were tried).
4. **Regime conditioning.** Tag days (e.g. prior-day VIX band + OR ratio) *before* reading WR/EV; estimate transition matrices from long price history, outcome distributions from the thinner trade ledger (`vol-regime-dependence-setup-frequency.md`, `regime-switching-monte-carlo.md`).
5. **Multiple-testing defense.** DSR / PBO / k-adjusted promotion when many sleeves were screened (`walk-forward-testing-overfitting-prevention.md`, `multiple-testing-selection-bias-sleeves.md`).
6. **Bayesian updating of WR (and EV inputs).** Posterior Beta(α+x, β+n−x); quote mean **and** 95% CI; feed path MC by sampling p from the posterior, not a point (`bayesian-beta-binomial-win-rate-updating.md`).
7. **Paper → live bridge with pre-registered metrics.** CI test: live expectancy/WR/fill rate must sit inside bootstrap CI of the *corrected* replay baseline; rule adherence scored separately from P&L (`ops-replay-live-calibration-protocol.md`). Prop practice: frozen rules, target platform, 30–50+ trades before sizing up (practitioner guides).
8. **Live decay monitors.** CUSUM / Page-Hinkley / rolling Sharpe bands referenced to a *clean validation* mean, not the full backtest mean — so you detect decay rather than redefine success (`stationarity-era-splitting-event-studies.md`, StockAlpha concept-drift alarms).

**Kelly under uncertainty (operational form):** treat historical WR/EV as *estimates*. Prefer half-Kelly-or-less (or fixed fractional risk capped by prop MLL) unless the posterior lower bound still clears break-even *and* path MC `E[$/wk]` survives shrunk sizing. Full-Kelly from n≈15 is a category error.

### 3. The "useful abstraction" layer

**The sentence that is allowed:**

> When structure X appears after condition Y (and regime tag R ∈ set S), across eras E₁…Eₖ with ≥ n_min events each, measured trade EV was Z with bootstrap/Jeffreys interval [L, U]; path MC under that posterior and fill model F yields `E[$/wk]` = …

**The sentence that is not:**

> Last June paid +X R, so next June will.

**When the abstraction fails (stop trusting, don't retune blindly):**
- Era vector fails consistency (one block carries the pool).
- Regime-overlap check shows live month is structurally unlike the estimation sample — verdict is "untested in this regime," not "edge died" *and* not "press on."
- Live metrics fall below the replay CI *after* fill-model harmonization (execution tax or true decay — diagnose with the 7-metric sheet).
- Feature was contemporaneous with the outcome (leakage); lag-check fails (Cont-style collapse; DeltaTrend orderflow demo).
- Researcher degrees of freedom exploded (k variants) without DSR/PBO / OOS replication.

### 4. Replay vs live specifically for Dual46

Full protocol lives in `ops-replay-live-calibration-protocol.md`. Condensed claim/evidence for this note:

| Component | Replay artifact | Expected live direction | Measurement |
|---|---|---|---|
| Decision / staging | One-tick candle formation — react to completed bar only | Live forming bars should *improve* staging latency | `t_stage − t_trigger` |
| Fills | Touch-fill optimism, no queue | Live fills *worse* unless trade-through rule used on both sides | fill_mode + entry_delta_ticks |
| Psychology | Pause/step allowed | Error rate can only degrade | improvise_count |
| Edge (expectancy) | Confounded with fill model | Compare only after re-scoring replay under trade-through | metric 7 inside bootstrap CI |

**Net drift is not knowable a priori** — measure per component over ≥20 sessions for execution metrics; 40–60 events before expectancy comparisons mean much. Re-score May/June under trade-through **before** live-sim so "live underperformance" is not just fill-model correction wearing a decay costume.

### 5. APPLICATION TO THE VAULT

#### What June / May ledger numbers are allowed to claim

Use Bayesian note language; adjust counts when the journal is pulled fresh.

| Claim type | Allowed wording | Not allowed |
|---|---|---|
| June WR (example 10/15) | Posterior mean ~0.66, **95% CI [0.42, 0.86]** (Jeffreys); P(WR>50%)≈0.90 | "Dual46 is a 67% system" |
| Pooled May+June (if era-OK) | Mean and **narrower** CI; still quote interval until n≳40 | Income from pooled point WR |
| Break-even vs geometry | P(WR > break-even for frozen 1:5-capped shape) | "Beats 50%" as the decision metric |
| MFE / +5R geometry | "Median MFE vs +5R informs Stage-0 exit rule" | "We leave X R/week on the table" as income |
| DOW / Monday cells | Keep in sample with **small-n flag**; counts not % until ≥10 | "Mondays are A+" from 2W/0L |
| Path / prop | Only after path MC with posterior (and preferably regime) sampling | Lab-promote / payout narrative from replay alone |

Script-arm and discretionary sleeves keep **separate** posteriors (canvas / Dual46 scorecard rule).

#### When to promote a sleeve vs "process practice"

| Gate | Promote / **toward** (SCORECARD) | History is process practice only |
|---|---|---|
| Dual46 (frozen Path B) | Multi-month journal + calibration metrics green; chart harvest, not Lab MC claim | Single-month replay P&L storytelling |
| Candidate sleeve (NWOG, Track B) | Stage-0 **toward** + path MC `E[$/wk]` after fees clears hierarchy; eraConsistency PASS; k-adjusted / OOS if many trials | Pretty WR, high RR optics, one hot era, or "felt good in replay" |
| Live sizing up | Ops calibration metrics 1–6 green ≥20 sessions; expectancy inside CI of corrected baseline | Beating replay point estimate for two weeks |

Hierarchy unchanged: **path MC / `E[$/wk]` → trade EV±CI → geometry diagnostics only.**

#### Decision table — Historical finding → Live action

| Historical finding | Live action tomorrow |
|---|---|
| June Mondays 2W/0L (or any thin DOW cell) | Keep Mondays **IN** (canon does not forbid); flag cell as small-n; do not build a Monday stand-down from it |
| June WR 10/15 ≈ 67% | Log Jeffreys posterior + CI in harvest; size/process as if lower bound matters; never quote 67% alone |
| MFE median ≪ +5R (or ≫) | Feeds Stage-0 / post-May **exit-rule research**; not an income claim; Dual46 freeze untouched |
| Cap-hit rate high on vol-spike days | Log `vixPrevClose` + `or30ratio`; regime-MC frequency channel; no ad-hoc VIX>24 stand-down without Stage-0 |
| Replay touch-fills vs planned trade-through | Re-score ledger first; live compares to corrected baseline |
| One month strong, next weak, regime-overlap FAIL | Label "untested in regime Y"; do not retune Dual46; do not invent a kill story |
| Era vector one hot year | BLOCK promote for Track B; Dual46 stays frozen harvest |
| Calibration: staging latency not improving live | Treat June "we'll be faster live" as falsified → prestaged-limit / hotkey workflow (`ops-prestaged-limits-vs-hotkey-execution.md`), not param retune |
| Path MC `E[$/wk]` ≤0 or bust tail intolerable under posterior sampling | **away** / no eval spend; history demoted to process practice |
| Path MC toward + era OK + calib green | Only then treat history as *decision-grade* for capital at risk |

#### Concrete May-walk + post-May protocol (checklist)

1. **Before session:** written plan; Dual46 freeze; stand-down windows from red-folder note — not from vibes.
2. **During:** one script trade max; log trigger/stage/fill fields when live-sim starts.
3. **EOD:** harvest row; CUSUM on R vs June μ₀ (noisy early — conversation forcer, not p-value).
4. **Week/month:** WR posterior line; era May-vs-June check before full pool; vol tags filled.
5. **Promotion language:** "toward / away / kill" only with SCORECARD fields — never "the backtest made money."

## Sources

1. Bailey, Borwein, López de Prado & Zhu — *The Probability of Backtest Overfitting* (CSCV / PBO) — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253
2. López de Prado — *Advances in Financial Machine Learning* (CPCV, purge, embargo) — overview: https://blog.quantinsti.com/cross-validation-embargo-purging-combinatorial/
3. Bailey & López de Prado — Deflated / Probabilistic Sharpe — https://davidhbailey.com/dhbpapers/deflated-sharpe.pdf
4. Walk-forward vs CPCV (practitioner synthesis of LdP) — https://quantistrade.co.uk/learn/concepts/walk-forward-vs-cpcv
5. Gama et al. — stream learning / concept-drift evaluation lineage — https://doi.org/10.1007/s10994-012-5320-9
6. Non-stationarity–complexity tradeoff (return prediction) — https://arxiv.org/html/2512.23596v1
7. Regime change + concept drift in financial ML (systematic review framing) — https://doi.org/10.9781/ijimai.2023.06.003
8. Baker & McHale (2013) — Kelly under parameter uncertainty / shrinkage — https://doi.org/10.1287/deca.2013.0271
9. Fractional Kelly practice (MacLean–Thorp–Ziemba; practitioner summary) — https://en.wikipedia.org/wiki/Kelly_criterion
10. Prop forward-testing glossary / staging protocol — https://propfirmscan.com/glossary/forward-testing
11. Forward-test analysis (CI vs backtest, demo realism caveats) — https://backtrex.com/en/blog/forward-testing-trading-strategy-results-analysis
12. Concept-drift alarms / shadow tests (ops monitoring) — https://stockalpha.ai/alpha-learning/concept-drift-alarms-for-quant-signals-detecting-when-alpha-decays
13. Vault cross-refs: `ops-replay-live-calibration-protocol.md`, `bayesian-beta-binomial-win-rate-updating.md`, `stationarity-era-splitting-event-studies.md`, `walk-forward-testing-overfitting-prevention.md`, `regime-switching-monte-carlo.md`, `deltatrend-quant-process-event-first-workflow.md`, `SCORECARD.md`
14. TradeZella / prop backtest→forward gap ~30% investigation rule (practitioner) — https://www.tradezella.com/blog/prop-firm-backtesting
