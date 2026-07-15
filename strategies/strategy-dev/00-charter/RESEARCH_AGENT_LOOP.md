---
updated: 2026-07-15
tags: [charter, research-agent, loop, strategy-dev]
---
# Research Agent Loop — continuous Track B R&D

> Goal: an agent that **keeps researching** (propose → wait for evidence → analyze → harvest → compare → propose), using Vault prop math.  
> **Not** Hermes-style auto-mutation of live Pine / Railway 24-7 without gates.

## What can run unattended vs what needs you

| Unattended (agent / loop) | Needs human (you) |
|---|---|
| Read kills · harvest · draft next Stage-0 note | TradingView Deep Backtest + CSV export |
| Run `analyze-event-study.ts` when CSV appears | Paste new Pine into TV (first time) |
| Compare to prior kills / last event-study JSON | Live gated PRB discretionary |
| Update scorecard notes · sim-queue · ideas roster | Approve promote / Lab MC for income claims |
| Draft measure Pine (no live path) | Cloud agent needs committed files if it runs remote |

**Bottleneck is TV evidence**, not chat speed. The loop’s job is to never idle after a CSV lands, and never invent the next idea without kill-lessons.

**MTF / TF compare:** HTF bias **is** codable (`request.security`). Stage-0 default = one measure Pine → MNQ **5m** then **1m** under [[stage-0-mtf-breadth]]. Prop path MC only after SCORECARD toward. Do not expand to 4 symbols × 2 TFs before a toward.

## Continuous loop (one cycle)

```text
1. INGEST    — new matrix/trackb-*.csv or empty queue?
2. ANALYZE   — npx tsx scripts/analyze-event-study.ts <file>
3. SCORECARD — toward | away | kill (write note)
4. HARVEST   — update kill-lessons-track-b (if kill/away closeout)
5. COMPARE   — vs last study + gated PRB baseline (EV, n, loss shape — not WR)
6. PROPOSE   — next Stage-0 note OR “waiting on CSV: <filename>”
7. STOP GATE — never Lab-promote; never edit locked PRB v1; never retune kills
```

## Authority stack (prop / “alternate” math)

1. Path MC + `E[$/wk]` after fees (only after Stage-0 toward)  
2. Trade EV ± bootstrap CI (Stage-0)  
3. Risk geometry / WR/RR = diagnostic only  
4. [[kill-lessons-track-b]] constraints bind search  

## How to run the agent

### A — Local Cursor chat (recommended start)

1. Open Agent chat in this repo.  
2. Say: **“Run one Research Agent Loop cycle”** (rule + this charter apply).  
3. For heartbeat while the machine is on:

```text
/loop 30m Run one Research Agent Loop cycle per strategies/strategy-dev/00-charter/RESEARCH_AGENT_LOOP.md — if no new CSV, propose or refine the next Stage-0 draft only; do not invent Deep BT results.
```

Stop with: stop the research loop.

### B — Cursor Cloud Agent

- Works on a **branch**; commit `RESEARCH_AGENT_LOOP.md`, `kill-lessons-track-b.md`, and measure Pine first.  
- Prompt: same charter. Cloud **cannot** click TradingView — it will stop at “waiting for CSV.”  
- Use cloud for note drafting / script runs after you push CSVs.

### C — Cursor Automation (scheduled)

Only if you want scheduled wakes in Agents Window: trigger = schedule (e.g. every morning) · tools = repo edit + shell · instructions = one Loop cycle · **never** push live Pine without approval. Use `/automate` skill when you’re ready to create it.

## Idle behavior (no new CSV)

1. Read [[kill-lessons-track-b]] + [[track-b-ideas]].  
2. If no active Stage-0 draft → create **one** next candidate note (B3 or B4) fully pre-registered.  
3. If draft exists → tighten loss-shape math / measure Pine checklist only.  
4. Do **not** spam new ideas every tick — max **one** open Stage-0 at a time.

## Success metrics for the agent (not the strategy)

| Agent KPI | Target |
|---|---|
| Kill notes with all 5 harvest extracts | 100% |
| Next idea violates a hard constraint | 0 |
| Hours idle after new CSV lands | &lt; 1 (when loop/agent awake) |
| Unapproved Lab promotes | 0 |

## Related

- [[failure-harvest]] · [[STRATEGY_DEV_AGENT]] · [[SCORECARD]] · [[sim-queue]] · [[gated-prb-live-guide]]
