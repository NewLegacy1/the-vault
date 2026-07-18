---
created: 2026-07-17
status: CYCLE 1 COMPLETE (2026-07-17 · 20/20 topics · 6 agent-waves · 19 notes + 14 transcripts)
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

## Guardrails

- Knowledge notes **never** override the Dual46 freeze or hard stops in
  `strategy-dev/00-charter`. They inform the **post-May backlog** only.
- Every note must separate **claim** (what the source says) from **evidence**
  (any stats/backtests cited) — ICT/Powell content is teaching, not proof.
- No paywalled/pirated content: Powell's course only where free on YouTube; ICT's
  public lectures only.
