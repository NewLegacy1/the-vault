---
topic: event-study-methodology-intraday-setups
researched: 2026-07-17
sources: 8
agent-cycle: wave-3
---
# Event-Study Methodology for Intraday Setups: Baselines, Overlap, MFE/MAE, and Bias Control

## Key findings
- **An event study measures "what happens after condition X" as *abnormal* movement: observed outcome minus a modeled baseline of what would have happened anyway** (EventStudyTools; EventStudy.de). Without an explicit baseline, a conditional study measures the condition *plus* drift, session seasonality, and volatility regime all at once.
- **Intraday event studies gain 3–5× statistical power over daily designs when the event timestamp is known precisely** (Barclay & Litzenberger 1988, cited in EventStudy.de intraday docs) — good news for a setup pinned to a 1-minute bar near 10:00 ET.
- **Intraday returns are badly non-normal (kurtosis 5–20 vs 3) and volatility is U-shaped across the session**, so parametric t-tests on raw intraday moves misstate significance; non-parametric or bootstrap tests are preferred (Andersen & Bollerslev 1997 and Rinaudo & Saha 2014, cited in EventStudy.de intraday docs).
- **Overlapping event windows create cross-sectional dependence that biases standard tests toward false significance**; event clustering is a named, classical failure mode of the methodology (event-study methodology review, ResearchGate 2025; EventStudyTools). Two "events" 5 minutes apart share the same outcome path and are not two observations.
- **A narrow window is NOT sufficient for causal identification.** The regression identifies a causal effect only when the event's surprise dominates everything else in the window (relative exogeneity) — formally proven for high-frequency event studies (arXiv 2406.15667). At 10:00 ET, scheduled data releases share the window with the setup.
- **MFE/MAE analysis (Sweeney 1996) is the correct machinery for "what happens after X" at trade granularity**: distribution of maximum favorable/adverse excursion after the condition, computed on winners and losers separately, calibrates stops (from winners' MAE) and targets (from MFE capture ratios) (Sweeney, *Maximum Adverse Excursion*, Wiley; QuantifiedStrategies; forex-basics).
- **Look-ahead enters conditional studies through the condition definition itself**: any element of "condition X" that uses information completing after the proposed entry time (bar closes, swing confirmations, "clean rejection" judged with hindsight) shifts the measured distribution optimistically (EventStudy.de estimation/event-window separation; AlphaInsider on repainting/forming-bar signals).

## Details / mechanics
**Proper structure of a Stage-0-style conditional study:**
1. *Define the event mechanically* — a rule a computer could apply at time t using only data up to t (e.g., "1-min bar closing 10:00–10:30 with lower wick ≥ x ticks into level L, defined from data before t"). Write the rule down before scanning history.
2. *Freeze an outcome window* — e.g., next 60 minutes of 1-min bars, or until session close.
3. *Compute the baseline* — the same outcome measured at non-event times matched on session time (same clock window on non-event days is the cleanest control, because of the U-shaped intraday volatility pattern). Report event-conditional MFE/MAE *minus* baseline MFE/MAE, the intraday analogue of abnormal return (EventStudyTools' normal-vs-abnormal decomposition).
4. *Handle overlap* — if two qualifying events occur within one outcome window, either keep only the first (dominant convention) or shorten windows so they cannot overlap; never count both as independent. Cluster days: N events on one day are closer to 1 observation of that day's regime than to N observations (event-clustering literature).
5. *Test non-parametrically* — sign tests, rank tests, or bootstrap CIs on median MFE/MAE differences; avoid t-tests on raw point moves (Rinaudo & Saha-type tests exist precisely because parametric tests fail intraday).

**MFE/MAE mechanics (Sweeney).** For each event, record the running max favorable and max adverse excursion from the hypothetical entry price over the outcome window. Then:
- Winners' MAE distribution → where stops can live without clipping winners (stop ≈ 1.1–1.2× winners' average MAE, or a high percentile; forex-basics).
- MFE distribution vs realized exit → capture efficiency (realized/MFE). Persistent efficiency < ~70% argues for wider targets or trails (forex-basics).
- Diagnostic ratio: winners' avg MAE / stop distance — below ~0.6 means the stop is paying for protection that is never tested; above ~0.85 means the stop is being routinely tested and is probably clipping legitimate winners (TradersSecondBrain MAE/MFE guide). ≥100 events before trusting any of these numbers (forex-basics; QuantifiedStrategies).

**Bias catalog for replay-based studies:**
- *Look-ahead:* judging setup quality after seeing the outcome bar; using the day's eventual range to define the level; grading "A-setups" retrospectively. Antidote: pre-register the grading rubric, grade on a frozen screenshot at entry time, then reveal the outcome.
- *Selection bias:* replaying only days remembered as good, or months chosen because the setup "worked"; skipping days where no trade was taken without logging them (the no-trade days are part of the denominator for frequency and E[$/wk]).
- *Survivorship of attention:* in manual replay, sessions abandoned mid-way (boring, choppy) silently drop from the sample — precisely the sessions where the setup likely fails or never triggers. Log every session attempted, including nulls.
- *Execution optimism:* touch-fills and zero-latency entries in replay (covered in the fill-modeling and latency notes) inflate the conditional distribution.

## APPLICATION TO THE VAULT
- **The June 15-trade ledger is a *trade study*, not yet an event study.** It conditions on "I took the trade," which entangles the setup with discretionary selection. The Stage-0 upgrade: enumerate *all* qualifying rejection-block events near the 10:00 open in the replay window — taken or not — and compute MFE/MAE for every one. The untaken events are the control arm for the discretionary filter; if taken and untaken events have similar MFE/MAE, the filter adds nothing and the mechanical event definition is the strategy.
- **Baseline for the 10:00 window specifically.** The 10:00 ET minute sits in the post-open volatility shoulder and hosts scheduled releases (e.g., 10:00 economic data on many days). Per the relative-exogeneity result (arXiv 2406.15667), "wick rejection at 10:00" events on data-release days are measuring the release, not the block. Tag each event with whether a 10:00 release occurred; analyze separately or exclude.
- **Overlap rule for their cadence:** with a 100-pt capped target and outcome windows that can run 30–90 minutes, two same-morning events almost always overlap. Convention to adopt: first qualifying event per session only — which conveniently matches the "one open Stage-0 candidate" spirit of the charter and keeps events ≈ independent (one per day).
- **MFE/MAE directly stress-tests the fixed 1:5/100-pt geometry.** From the event set: what fraction of events reach 5R before 1R against? What is the winners' MAE distribution vs the block-extreme stop? If winners' MAE clusters at ~0.4R, the structural stop is wider than needed and R could improve by tightening (cross-reference the existing stop-placement note before acting — wick-out rates cut the other way).
- **Replay-specific hygiene:** grade setups on the frozen chart before advancing the replay; log every 9:45–10:30 session scanned including no-trigger sessions; record MFE/MAE for missed-fill events too (the two June fill-misses have known counterfactual paths — they belong in the event table flagged as unfilled, not in the trade ledger).

## Sources
1. EventStudyTools — Introduction to the Event Study Methodology: https://www.eventstudytools.com/introduction-event-study-methodology
2. EventStudy.de — Introduction to Event Studies: https://eventstudy.de/docs/introduction
3. EventStudy.de — Intraday Event Studies (power gains, non-normality, seasonality): https://eventstudy.de/docs/intraday
4. Event Study Methodology in Financial Research: Classical Foundations, Modern Developments (2025 review; clustering/overlap limitations): https://www.researchgate.net/publication/403077677
5. Identification and Estimation of Causal Effects in High-Frequency Event Studies (arXiv 2406.15667): https://arxiv.org/abs/2406.15667
6. Sweeney — Maximum Adverse Excursion: Analyzing Price Fluctuations for Trading Management (Wiley, 1996): https://www.wiley.com/en-us/Maximum+Adverse+Excursion%3A+Analyzing+Price+Fluctuations+for+Trading+Management-p-9780471141525
7. forex-basics — MAE and MFE: Trade Analysis and Stop/TP Calibration: https://forex-basics.com/practice/mae-mfe-trade-analysis/
8. QuantifiedStrategies — MAE and MFE Explained: https://www.quantifiedstrategies.com/maximum-adverse-excursion-mae-maximum-favorable-excursion-mfe-explained-quantifiedstrategies-com/
