---
created: 2026-07-17
status: ACTIVE
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
4. [ ] Minimum sample size & significance for trade systems (n, WR CIs, regime coverage)
5. [ ] Intraday regime detection: trend vs chop filters for session selection
6. [ ] Stop placement research: fixed vs structure vs volatility (ATR) — wick-out rates
7. [ ] Limit-order fill modeling: queue position, adverse selection, tick-miss rates
8. [ ] Expectancy math: WR × RR frontier, capped-R distributions, asymmetry ratios
9. [ ] Event-study methodology for intraday setups (what we call Stage-0)
10. [ ] Execution latency cost: reaction time vs pre-staged orders (replay vs live)

### ICT concepts (agent B)
11. [x] NWOG/NDOG — `ict/nwog-ndog-opening-gaps.md` (wave 1)
12. [x] Judas swing — `ict/judas-swing.md` (wave 1)
13. [x] OTE / golden pocket — `ict/ote-optimal-trade-entry.md` (wave 1)
14. [ ] Rejection blocks vs order blocks: precise definitions, entry/stop conventions
15. [ ] Key opens (midnight, 8:30, 9:30, 10:00) & Power of 3 (AMD)
16. [ ] FVG / IFVG / BISI-SIBI & consequent encroachment (CE) targeting
17. [ ] Draw on liquidity: PDH/PDL, internal vs external liquidity, intermediate highs/lows
18. [ ] ICT time macros (9:50–10:10, 10:50–11:10) — mechanics and evidence

### Powell (agent C)
19. [ ] Powell's free YouTube course: catalog videos, extract teachings on RB entries,
      KO retests, fib confluence — transcript-based where possible
20. [ ] Powell's risk & trade management: stop conventions, RR targets, session rules

## Guardrails

- Knowledge notes **never** override the Dual46 freeze or hard stops in
  `strategy-dev/00-charter`. They inform the **post-May backlog** only.
- Every note must separate **claim** (what the source says) from **evidence**
  (any stats/backtests cited) — ICT/Powell content is teaching, not proof.
- No paywalled/pirated content: Powell's course only where free on YouTube; ICT's
  public lectures only.
