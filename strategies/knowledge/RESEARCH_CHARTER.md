---
created: 2026-07-17
status: CYCLE 3 COMPLETE (2026-07-18 · 30/30) · CYCLE 4 IN PROGRESS (2026-07-20 · 1/8 model-builder gaps) · hubs + architecture notes landed
tags: [knowledge-base, research-charter, multi-agent]
---
# Knowledge Research Charter — multi-agent deep-research loop

**Mission:** while no backtesting is running, continuously grow the Obsidian brain with
vetted knowledge that serves the end goal: **consistent prop-firm payouts trading MNQ via
Dual46 (Morningstar Path B) + candidate sleeves (NWOG), sized ~10 MNQ, 1:5 capped-R.**

## Workflow

- **2–3 research agents run in parallel**, each owning a topic batch for one cycle
  (~30 min of deep research per cycle).
- Each cycle each agent: web-search + fetch primary sources → for YouTube (ICT lectures,
  Powell's free course), extract captions with **yt-dlp** (installed 2026-07-17, v2026.07.04):
  `yt-dlp --write-auto-sub --sub-lang en --skip-download -o "<out>" <url>` (new shells may
  need PATH refresh: `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') +
  ';' + [Environment]::GetEnvironmentVariable('Path','User')`); npm `youtube-transcript` via
  `npx tsx` from `vault-app/` is the fallback → write **one note per topic** into this tree.
- After each wave the orchestrator reviews outputs, dedupes, and launches the next wave.
- Re-run anytime: point agents at unclaimed topics in the queue below.

## Note format (every note)

```
---
topic: <slug> · researched: <date> · sources: <n> · agent-cycle: <wave>
---
# <Title>
## Key findings (bullet, source-linked)
## Details / mechanics
## APPLICATION TO THE VAULT  ← mandatory — how this changes/confirms what we do
## Sources
```

Folder layout: `quant/` · `ict/` · `powell/` (one .md per topic, kebab-case).

## Topic queue (20)

### Quant methods (agent A)
1. [x] Walk-forward & overfitting — `quant/walk-forward-testing-overfitting-prevention.md` (wave 1)
2. [x] Monte Carlo prop survival — `quant/monte-carlo-prop-firm-survival.md` (wave 1)
3. [x] Sizing under trailing DD — `quant/position-sizing-under-trailing-drawdown.md` (wave 1)
4. [x] Sample size & significance — `quant/minimum-sample-size-statistical-significance.md` (wave 2)
5. [x] Regime detection — `quant/intraday-regime-detection-session-selection.md` (wave 2)
6. [x] Stop placement — `quant/stop-placement-fixed-structure-volatility.md` (wave 2)
7. [x] Limit-fill modeling — `quant/limit-order-fill-modeling-queue-position.md` (wave 3)
8. [x] Expectancy / capped-R — `quant/expectancy-math-wr-rr-capped-payoffs.md` (wave 3)
9. [x] Event-study methodology — `quant/event-study-methodology-intraday-setups.md` (wave 3)
10. [x] Execution latency — `quant/execution-latency-reaction-time-replay-realism.md` (wave 3) — **quant domain complete (10/10)**

### ICT concepts (agent B)
11. [x] NWOG/NDOG — `ict/nwog-ndog-opening-gaps.md` (wave 1)
12. [x] Judas swing — `ict/judas-swing.md` (wave 1)
13. [x] OTE / golden pocket — `ict/ote-optimal-trade-entry.md` (wave 1)
14. [x] Rejection vs order blocks — `ict/rejection-blocks-vs-order-blocks.md` (wave 2)
15. [x] Key opens & Po3 — `ict/key-opens-power-of-3.md` (wave 2)
16. [x] FVG / IFVG / CE — `ict/fvg-ifvg-consequent-encroachment.md` (wave 2)
17. [x] Draw on liquidity — `ict/draw-on-liquidity.md` (wave 3)
18. [x] Time macros — `ict/time-based-macros.md` (wave 3) — **ICT domain complete (8/8)**

### Powell (agent C)
19. [x] Powell catalog + RB teachings — `powell/powell-course-catalog.md`,
      `powell/powell-rb-entry-teachings.md` (wave 1 · channel = "Powell trades"
      @Powelltrades · 9/14 transcripts extracted, raw in `vault-app/data/powell-transcripts/`,
      re-runnable script `vault-app/scripts/fetch-powell-transcripts.ts`)
20. [x] Powell risk & management — `powell/powell-risk-trade-management.md` (wave 2 ·
      all 14/14 videos now transcribed) — **Powell domain complete · QUEUE COMPLETE 20/20**

## Topic queue — CYCLE 2 (20 · added 2026-07-17)

### Instrument / prop landscape (agent A)
21. [x] MNQ vs NQ — `quant/mnq-vs-nq-instrument-comparison.md` (c2w1) — **verdict: stay MNQ**
22. [x] MNQ microstructure — `quant/mnq-microstructure-ny-open.md` (c2w1)
23. [x] Prop landscape 2026 — `quant/prop-firm-landscape-2026.md` (c2w1)
24. [x] Trade copiers — `quant/trade-copiers-prop-accounts.md` (c2w2 · self-copy OK at
      Apex/Topstep/MFFU, banned-in-practice at TPT · fill divergence = the real risk for limit entries)
25. [x] Contract rolls & session gotchas — `quant/contract-rolls-session-gotchas.md` (c2w2 ·
      walk audit: May 2026 clean except Memorial Day 5/25 halt · Sep + Dec 2025 contain roll
      weeks (roll Thu 9/11 & 12/11, quad-witch 9/19 & 12/19) · Nov 2025 Thanksgiving thin ·
      Aug 2025 clean)

### Strategy / stats deepening (agent B)
26. [x] MFE/MAE exit analysis — `quant/mfe-mae-exit-analysis.md` (c2w2 · e-ratio method ·
      scaling out raises WR optics but cuts expectancy · defines May-walk MFE/MAE logging)
27. [x] Break-even & trailing stops — `quant/break-even-and-trailing-stops.md` (c2w2 ·
      BE-at-1R sits at the *minimum* of published performance sweeps; retracement entries
      most damaged · closed-form adoption rule from the MFE/MAE ledger)
28. [x] Time stops — closed in cycle 3 → `quant/time-stops-retracement-entries.md` (see item 46)
29. [x] Daily loss limits — `quant/daily-loss-limits-circuit-breakers.md` (c2w2 ·
      Dual46's one-trade/day already is the circuit breaker · missing rule = disc-sleeve
      lockout on script-loss days)
30. [x] Streak math — `quant/losing-streak-math.md` (c2w2 · **63% chance of a 4-loss streak
      in first 100 trades at 65% WR** · 8R trailing buffer ≈ 1.3% blow-up vs ~28% at 5R)
31. [x] Bayesian WR updating — closed in cycle 3 → `quant/bayesian-beta-binomial-win-rate-updating.md` (see item 44)
32. [x] Vol-regime dependence — closed in cycle 3 → `quant/vol-regime-dependence-setup-frequency.md` (see item 45)

### ICT / Powell deepening (agent C)
33. [x] Powell psychology videos (already transcribed) → `powell/powell-trading-psychology.md` (cycle2-wave1)
34. [x] ICT market-maker buy/sell models — covered by cycle 3 item 62 → `ict/market-maker-buy-sell-models.md`
35. [x] ICT Silver Bullet (10–11 window) — `ict/silver-bullet.md` (cycle2-wave1 · primary: 2023 Mentorship SB lecture transcript)
36. [x] ICT premium/discount (equilibrium) bias framing — covered in `ict/weekly-profiles-premium-discount.md` (cycle2-wave1)
37. [x] SMT divergence (NQ/ES) — covered by cycle 3 item 63 → `ict/smt-divergence-nq-es.md`
38. [x] ICT weekly profiles — `ict/weekly-profiles-premium-discount.md` (cycle2-wave1 · primary: Core Content Month 07 transcript archived to `vault-app/data/ict-transcripts/` · verdict: canon does NOT forbid Mondays)
39. [x] Liquidity voids vs FVGs — covered by cycle 3 item 64 → `ict/liquidity-voids-vs-fvgs.md`
40. [x] Red-folder playbooks: CPI/NFP/FOMC at the 10:00 window — covered by cycle 3 item 65 → `ict/red-folder-playbooks-1000-window.md`
41. [x] DeltaTrend / QuantPad channel review (13 videos) — `quant/deltatrend-quant-process-event-first-workflow.md`,
      `quant/deltatrend-monte-carlo-markov-prop-convexity.md`,
      `quant/deltatrend-guru-quantification-powell-detail.md` (cycle2-deltatrend ·
      transcripts archived in `vault-app/data/deltatrend-transcripts/`, re-runnable
      script `vault-app/scripts/fetch-deltatrend-transcripts.ts` · QuantPad flagged as
      evaluation-candidate-only for the TV-export bottleneck)

## Cycle protocol (repeatable — how new cycles spawn)

When the user says "queue another research cycle" (or a cycle's lanes are exhausted):

1. **Harvest first:** orchestrator re-reads the latest walk harvest, kill lessons, and the
   newest knowledge notes' APPLICATION sections. New topics must trace to a finding or an
   open question — never filler.
2. **Draft 30 topics, 10 per lane**, into a new `## Topic queue — CYCLE N` section here.
   Standing lanes (rename as findings dictate):
   **A = Quant / stats** · **B = Execution & prop ops** · **C = ICT / Powell / strategy**.
3. **Launch 3 agents in parallel**, one per lane. Each agent: work topics in listed order,
   write one charter-format note per topic (or merge tightly-related ones, saying so),
   check off its own queue items with file paths, and obey the guardrails below.
4. **Orchestrator closes the wave:** dedupe, sync checkboxes, surface the 3–5 findings that
   change what we do, and fold walk-relevant items into the daily checklist.

## Topic queue — CYCLE 3 (30 · added 2026-07-18 · findings-driven)

### Lane A — Quant / stats deepening (agent A)
42. [x] Regime-switching Monte Carlo — `quant/regime-switching-monte-carlo.md` (cycle3-laneA ·
      verdict: i.i.d. reshuffle is fine for EV but optimistic 1.5–5× on drawdown/bust tails under
      vol regimes; 2-state day-tag Markov upgrade specced for `monte-carlo.ts`, reuses `markov-occupancy.ts`)
43. [x] Eval timeout & fee-drag — `quant/eval-timeout-fee-drag-modeling.md` (cycle3-laneA ·
      verdict: engine already computes timeoutRate/weeksToPass — surface 4 timeout columns on the
      scorecard; IG analytic triage kills fee-bleeders at Stage-0; TopStep 2025 cohort: 16.8%/attempt)
44. [x] Bayesian Beta-binomial WR updating — `quant/bayesian-beta-binomial-win-rate-updating.md`
      (cycle3-laneA · verdict: June 10/15 ⇒ WR 95% CI [0.42, 0.86] — point estimates overstate; May
      posterior = June prior exactly; add posterior line to monthly harvest + optional MC p-sampling)
45. [x] Vol-regime dependence — `quant/vol-regime-dependence-setup-frequency.md` (cycle3-laneA ·
      verdict: May (mean 17.2, smooth) vs June (17.1, two spike clusters to 22.2) — vol-of-vol not
      level; log vixPrevClose + or30ratio per walk day; "different vol month" excuse pre-killed)
46. [x] Time stops for retracement entries — `quant/time-stops-retracement-entries.md` (cycle3-laneA ·
      verdict: 567k-backtest sweep says time exits ≤ neutral, short ones harmful — the 13:00 flat rule
      already is the defensible time stop; log 3 timestamps/trade so 2×-median-MFE check is free)
47. [x] Stationarity & era-splitting — `quant/stationarity-era-splitting-event-studies.md`
      (cycle3-laneA · verdict: formal break tests powerless at n=40–200 — use pre-registered
      calendar-year era vector + 30-event rolling EV + regime-overlap KS check; era-consistency
      scorecard field; symmetric guard: one hot block carrying pooled EV → BLOCK)
48. [x] Feature lag audits & leakage — `quant/feature-lag-audits-data-leakage.md` (cycle3-laneA ·
      verdict: 8-row L-checklist mandatory at Stage-0; exposure is upstream in Pine (same-bar entries,
      security() lookahead), not in analyze-event-study.ts; automate the lagged-correlation test)
49. [x] Benchmark discipline — `quant/benchmark-discipline-naive-baselines.md` (cycle3-laneA ·
      verdict: 3 mandatory columns — vsRandom pctile / vsBuyHold $Δ / vsFlip (already in script);
      Dual46 itself never benchmarked vs time-matched buy-hold — post-May item)
50. [x] Small-sample drawdown inference — `quant/small-sample-drawdown-inference.md` (cycle3-laneA ·
      verdict: at n=20–40 bootstrap MDD is plug-in-biased 1.5–5× optimistic — go parametric: Beta
      posterior on WR × empirical win sizes; bootstrap demoted to labeled lower-bound cross-check)
51. [x] Multiple-testing & selection bias — `quant/multiple-testing-selection-bias-sleeves.md`
      (cycle3-laneA · verdict: at k=14 Track-B trials, ~51% odds a "significant" survivor is noise —
      add k counter to kill-lessons header, k-adjusted CI or OOS replication to promote, best-of-(k+1)
      random baseline; kills need no deflation, only survivors) — **lane A complete (10/10)**

### Lane B — Execution & prop ops (agent B) — NEW LANE for the replay→live transition
52. [x] Replay→live calibration protocol — `quant/ops-replay-live-calibration-protocol.md` (c3-laneB ·
      pre-registered 7-metric sheet, 20-session gate · re-score May/June ledger trade-through FIRST or live will fake edge-decay)
53. [x] Slippage & fill quality 9:50–10:10 — `quant/ops-mnq-slippage-market-orders-open.md` (c3-laneB ·
      1–2 ticks normal / 3–5 release-adjacent · convert via aggressive limit not market · implementation-shortfall TCA protocol)
54. [x] Order types on prop platforms — `quant/ops-order-types-prop-platforms.md` (c3-laneB ·
      all 3 stacks have server-side OCO but TopstepX default (Position Brackets) must be switched to Auto-OCO · stop-MARKET always · 6-item kill-test gate)
55. [x] News-print microstructure — `quant/ops-news-print-microstructure-stand-down.md` (c3-laneB ·
      measured: makers pull T−2min, trough at print, normal by T+9min · stand down T−2m→T+1m, NEVER convert inside it · 10:00 tier-1 releases hit ~4–8 days/mo)
56. [x] Payout cadence optimization — `quant/ops-payout-cadence-withdraw-vs-buffer.md` (c3-laneB ·
      two-phase rule: retain everything until floor-lock, then hold ~8R cushion and sweep every window — the account is a pipe, not a vault)
57. [x] Prop rule-change watch 2026 — `quant/ops-prop-rule-change-watch-2026.md` (c3-laneB ·
      Topstep 4/28 cap cut ($2k/50K Std) + MLL→$0 after 1st payout · Apex $85/mo looks STALE (4.0 = one-time activation, $0/mo) — re-rank before purchase)
58. [x] Data-feed discrepancies — `quant/ops-data-feed-discrepancies-tv-vs-execution.md` (c3-laneB ·
      ±1 tick at wick extremes & bar boundaries, no published rate → house protocol · fix free: chart specific contract via TV-Tradovate connection, score fills off execution T&S)
59. [x] Pre-staged limits vs hotkey execution — `quant/ops-prestaged-limits-vs-hotkey-execution.md` (c3-laneB ·
      human chain 1–3 s unplanned vs ~0 pre-staged · one-variable-at-trigger workflow, no confirm dialogs, 1 hotkey (conversion only) · buy nothing)
60. [x] US prop payout taxes & entity basics — `quant/ops-prop-payout-taxes-entity-basics.md` (c3-laneB ·
      ordinary SE income NOT 1256 · sweep 30%/payout to tax account, quarterly 1040-ES · no entity until ~$60–80k/yr net · start expense ledger NOW · not tax advice)
61. [x] Copier limit-entry divergence mechanics — `quant/ops-copier-limit-entry-divergence-mechanics.md` (c3-laneB ·
      pre-staged resting limits are latency-EXEMPT → Orders Mode + per-account conversion fallback dominates · vendor slippage tables 0.1–3 ticks by copier class)

### Lane C — ICT / Powell / strategy deepening (agent C)
62. [x] ICT market-maker buy/sell models — `ict/market-maker-buy-sell-models.md` (cycle3-laneC ·
      primary 2023 "last lecture" transcript archived · verdict: context lens only, least
      mechanizable ICT concept; Dual46 = right-side fragment; log 1st- vs 2nd-stage entries)
63. [x] SMT divergence NQ/ES — `ict/smt-divergence-nq-es.md` (cycle3-laneC · SMT = confirmation
      /management, never entry; Powell uses it mid-trade only; archived Pine lacks heal-invalidation;
      add SMT_at_tap? boolean to NWOG census)
64. [x] Liquidity voids vs FVGs — `ict/liquidity-voids-vs-fvgs.md` (cycle3-laneC · void = multi-candle
      container of FVGs; partial repricing normal, news voids may never fill; NWOG > void > FVG hierarchy)
65. [x] Red-folder playbooks — `ict/red-folder-playbooks-1000-window.md` (cycle3-laneC · decision
      table built; Powell: NFP reverses at open (friendly), CPI trends all day (hostile to fades);
      FOMC morning + day-before-NFP = consensus stand-downs; 10:00-slot prints = arm-delay question)
66. [x] Structural-target sleeve evidence — `powell/structural-target-sleeve-evidence.md` (cycle3-laneC ·
      Powell sanctions BOTH structural and static-RR; deciding evidence = May ledger MFE column
      (nearly free); pre-register 4 assumptions if promoted; NWOG sleeve should be structural-TP anyway)
67. [x] 5m vs 1m entry trigger — `powell/5m-vs-1m-entry-trigger.md` (cycle3-laneC · DeltaTrend
      paraphrase overstated: Powell still uses 1m daily; real teaching = hybrid (5m confirm → 1m
      entry); ledger boolean `5m_confirm_present?` decides before any sim)
68. [x] NWOG published statistics — `ict/nwog-published-statistics.md` (cycle3-laneC · no true-NWOG
      study exists; best adjacent data: size dominates (78→8% fill by ×ATR bin), Mon lowest DOW fill
      53.9%, CE-touch ~76% is near-baseline; census needs ×ATR column + DOW split; age decay = Vault exclusive)
69. [x] Monday HTF-discount-array flag — `ict/monday-htf-discount-array-flag.md` (cycle3-laneC ·
      canon supports the flag but with 3 escape hatches (Wed variants, array-tapped-Monday, news weeks);
      06-29 likely FLAG_DEAD i.e. template-consistent; exact 4-cell scoring protocol defined, ≥10-Monday
      pre-registered decision rule)
70. [x] One-shot-one-kill & daily-bias audit — `ict/one-shot-one-kill-daily-bias-audit.md` (cycle3-laneC ·
      Dual46 = day-scale port of OSOK; OSOK itself uses a FIXED objective (point for AGAINST in
      structural-TP debate); 10-row stand-down table, 3 new zero-cost journal columns)
71. [x] Powell/DeltaTrend new-upload sweep — logged in `powell/powell-course-catalog.md` (§Upload-sweep
      log, cycle3-laneC · NO new uploads on either channel; archives complete 14/14 + 13/13; Powell ~7
      weeks silent; bonus: ICT 2023 MMXM lecture transcript archived to `vault-app/data/ict-transcripts/`)

## Ad-hoc research (2026-07-20)

- [x] Historical data vs live markets — `quant/historical-data-vs-live-markets.md` (adhoc-past-vs-live · objectify history via conditional EV±CI / walk-forward / regimes / Bayesian WR / replay→live calib — not day-identity)
- [x] JJ Simon / Fair Value 9:30 NQ sleeve — `quant/jj-simon-fair-value-930-strategy.md`
      (adhoc-jj-simon · channel `@itsjjsimon` · 6 transcripts in
      `vault-app/data/jj-simon-transcripts/` · verdict: **explore / park until Stage-0
      slot free** — Phase-2 MR mechanizable; not Dual46 override; payouts = claim)
- [x] Macro regime context data options — `quant/macro-regime-context-data-options.md`
      (adhoc-regime-data · forgotten-app candidates + build/buy ladder · verdict:
      **$0 DIY tags first**; SaaS/NLP optional glance only; regime = gate not Dual46 lock)
- [x] Phase-0 regime tags shipped into Dual46 journal (2026-07-20 · master) —
      `vault-app/lib/regime-tags.ts` + Dual46 form/edit · May harvest VIX/mega-cap backfill ·
      oil thresholds frozen · JJ Fair-Value still parked separately
- [x] Frozen top-5 regime variables — `quant/mnq-relevant-regime-variables.md`
- [x] Model builder architecture APPLICATION — `quant/vault-model-builder-architecture.md`
      + knowledge `hubs/` MOCs (math / regimes / ops / stage0 / doctrine)

## Topic queue — CYCLE 4 (8 · added 2026-07-20 · model-builder gaps)

Aim: close **wiring / math / validation** gaps for the cohesive model builder+tester.
Not more ICT folklore. Prefer distill → `lib/` or `strategy-dev` over new lore notes.
See `quant/vault-model-builder-architecture.md`.

72. [ ] Event-study → regime columns — wire `vixBand` / `or30` / `release10` / `oilShock` /
      `megaCapEarnWeek` group-bys into `analyze-event-study.ts` output (match frozen top-5)
73. [ ] `regime-tags.ts` completeness — restore or implement `or30BandFromRatio` /
      `or30BandLabel` / `release10FromEventTimes` so tests + doctrine stay in lockstep
74. [x] Stage-0 scorecard surface — `quant/stage-0-scorecard-surface.md` (cycle4 ·
      one closeout checklist: EV±CI · L1–L8 · vsRandom/vsFlip · k-adjusted survivor ·
      path MC still required; maps SCORECARD ↔ analyze-event-study.ts; Dual46 freeze untouched)
75. [x] Path MC `E[$/wk]` after Stage-0 toward — document + script path from ES JSON →
      firm-rule MC inputs (fees, trail, timeout) without inventing Deep BT numbers
      → `quant/event-study-to-path-mc-handoff.md` (cycle4-75)
76. [x] Fill-haircut defaults — `quant/fill-haircut-defaults-stage0-lab.md` (cycle4 ·
      tick presets by window from ops-mnq-slippage + limit-fill; Stage-0/Lab defaults as
      CLAIM+VERIFY; suggest `vault-app/lib/execution-haircut-presets.ts`)
77. [ ] Journal ↔ harvest sync protocol — localStorage → May/June harvest → canvas
      without stale-tab overwrite; regime fields required on every day row
78. [ ] Prop-rule matrix as MC config — Topstep/Apex/TPT payout + MLL fields as versioned
      JSON consumed by path MC (ties to ops-prop-rule-change-watch)
79. [ ] Builder hub smoke-test — verify all `hubs/*` wikilinks resolve; archive stubs only;
      update `_index` when a CYCLE 4 note lands in `lib/`

## Guardrails

- Knowledge notes **never** override the Dual46 freeze or hard stops in
  `strategy-dev/00-charter`. They inform the **post-May backlog** only.
- Every note must separate **claim** (what the source says) from **evidence**
  (any stats/backtests cited) — ICT/Powell content is teaching, not proof.
- No paywalled/pirated content: Powell's course only where free on YouTube; ICT's
  public lectures only.
