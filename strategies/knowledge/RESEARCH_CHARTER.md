---
created: 2026-07-17
status: CYCLE 3 ACTIVE (2026-07-18 · 30 topics · 3 lanes × 10 · cycle 1 = 20/20 · cycle 2 = 14/21 done, open items carried into cycle 3)
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
28. [ ] Time stops for retracement entries: max holding time research
29. [x] Daily loss limits — `quant/daily-loss-limits-circuit-breakers.md` (c2w2 ·
      Dual46's one-trade/day already is the circuit breaker · missing rule = disc-sleeve
      lockout on script-loss days)
30. [x] Streak math — `quant/losing-streak-math.md` (c2w2 · **63% chance of a 4-loss streak
      in first 100 trades at 65% WR** · 8R trailing buffer ≈ 1.3% blow-up vs ~28% at 5R)
31. [ ] Bayesian (Beta-binomial) updating of small-sample WR month over month
32. [ ] Vol-regime dependence: VIX levels vs setup frequency/quality; May-vs-June 2026 vol context

### ICT / Powell deepening (agent C)
33. [x] Powell psychology videos (already transcribed) → `powell/powell-trading-psychology.md` (cycle2-wave1)
34. [ ] ICT market-maker buy/sell models — full sequence template
35. [x] ICT Silver Bullet (10–11 window) — `ict/silver-bullet.md` (cycle2-wave1 · primary: 2023 Mentorship SB lecture transcript)
36. [x] ICT premium/discount (equilibrium) bias framing — covered in `ict/weekly-profiles-premium-discount.md` (cycle2-wave1)
37. [ ] SMT divergence (NQ/ES) — refresh for the archived Vault SMT script
38. [x] ICT weekly profiles — `ict/weekly-profiles-premium-discount.md` (cycle2-wave1 · primary: Core Content Month 07 transcript archived to `vault-app/data/ict-transcripts/` · verdict: canon does NOT forbid Mondays)
39. [ ] Liquidity voids vs FVGs — delivery expectations
40. [ ] Red-folder playbooks: CPI/NFP/FOMC at the 10:00 window — stand-down rules
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
42. [ ] Regime-switching Monte Carlo: Markov transition matrix over vol regimes vs i.i.d.
      reshuffle — implementation math for upgrading the path MC (DeltaTrend finding)
43. [ ] Eval timeout & fee-drag modeling: monthly-fee bleed + time-outs for low-WR/high-RR
      shapes (DeltaTrend's Powell build: ~55% timeout) — extend the scorecard math
44. [ ] Bayesian Beta-binomial updating of small-sample WR month over month (carry-over #31)
45. [ ] Vol-regime dependence: VIX vs setup frequency/quality; May-vs-June 2026 vol context
      (carry-over #32)
46. [ ] Time stops for retracement entries: max holding time research (carry-over #28)
47. [ ] Stationarity & era-splitting for small intraday event studies (his ES sweep: significant
      2023, dead pooled 2022–25) — protocol for Stage-0 event EV
48. [ ] Feature lag audits & leakage checks: contemporaneous vs predictive (the 78× R² collapse)
49. [ ] Benchmark discipline: naive baselines (random-entry same-exit, buy-hold) as mandatory
      scorecard columns
50. [ ] Small-sample drawdown inference: bootstrap vs analytic bounds for 20–40 trade samples
51. [ ] Multiple-testing & selection bias across candidate sleeves: how many killed Track-B ideas
      before a "surviving" edge is just noise (relates to kill-lessons doctrine)

### Lane B — Execution & prop ops (agent B) — NEW LANE for the replay→live transition
52. [ ] Replay→live calibration protocol: measuring the one-tick-candle advantage; pre-registered
      metrics for the first N live-sim sessions
53. [ ] Slippage & fill quality on MNQ market orders in the 9:50–10:10 window: expected ticks,
      measurement protocol (feeds the conversion rule's real-R bookkeeping)
54. [ ] Order types on prop platforms (Tradovate / ProjectX / Rithmic): server-side brackets,
      stop-limit vs stop-market, OCO reliability during prints
55. [ ] News-print microstructure: MNQ spread/depth at 8:30 & 10:00 releases — quantified
      stand-down windows (pairs with red-folder playbooks in lane C)
56. [ ] Payout cadence optimization across funded accounts: withdraw-vs-buffer math per firm
57. [ ] Prop rule-change watch 2026: TopStep / TPT / Apex consistency & DLL updates since the
      landscape note (quant/prop-firm-landscape-2026.md)
58. [ ] Data-feed discrepancies: TradingView vs Tradovate/Rithmic prints — same-setup divergence
      risk for a 1m RB strategy
59. [ ] Pre-staged limits vs hotkey execution: published human-latency chains; best practice for
      the arm→limit workflow (June misses were latency)
60. [ ] US prop payout taxes & entity basics (1099 vs LLC, estimated payments) — informational
61. [ ] Multi-account copier execution *mechanics* deep-dive: divergence stats for limit entries
      (extends quant/trade-copiers-prop-accounts.md toward practice)

### Lane C — ICT / Powell / strategy deepening (agent C)
62. [ ] ICT market-maker buy/sell models — full sequence template (carry-over #34)
63. [ ] SMT divergence NQ/ES — refresh for the archived Vault SMT script (carry-over #37)
64. [ ] Liquidity voids vs FVGs — delivery expectations (carry-over #39)
65. [ ] Red-folder playbooks: CPI/NFP/FOMC at the 10:00 window — stand-down rules (carry-over #40)
66. [ ] Structural-target sleeve evidence: Powell's structural TPs (internal H/L, gaps) vs fixed
      1:5/100pt — assemble the post-May Stage-0 case, both directions
67. [ ] 5m vs 1m entry trigger: Powell's evolved 5m preference (DeltaTrend note) — what he says,
      where each wins; post-May question only
68. [ ] NWOG published statistics: gap size / age / fill-rate numbers from any citable backtests —
      calibrate the sleeve census columns
69. [ ] Monday HTF-discount-array flag validation: the "Tuesday drive" template config vs June+May
      Monday ledger rows
70. [ ] ICT one-shot-one-kill & daily-bias models vs Dual46's one-trade cadence — alignment audit
71. [ ] Powell/DeltaTrend new-upload sweep: transcribe anything new since 07-17/07-18; diff Powell
      uploads against SOP §16 transcript log

## Guardrails

- Knowledge notes **never** override the Dual46 freeze or hard stops in
  `strategy-dev/00-charter`. They inform the **post-May backlog** only.
- Every note must separate **claim** (what the source says) from **evidence**
  (any stats/backtests cited) — ICT/Powell content is teaching, not proof.
- No paywalled/pirated content: Powell's course only where free on YouTube; ICT's
  public lectures only.
