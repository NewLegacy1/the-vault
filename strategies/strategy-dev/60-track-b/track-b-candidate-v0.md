---
updated: 2026-07-14
status: killed
owner: strategy-dev
idea_class: B0
tags: [track-b, b0, orbreak, strategy-dev, killed]
---
# Track B candidate v0 — B0 · Opening Range Break (ORBreak)

> **Idea class:** **B0** (time/vol session rule + hard stop) — *not* Lab Macro `matrix-b0`.  
> **Pine:** `pine/TrackB_ORBreak_v0.pine`  
> **Export:** `vault-app/data/tv-exports/matrix/trackb-orbreak-3y.csv`  
> **Status:** **KILL** (2026-07-14) — do not promote · do not ICT-rescue · do not tune RR forever.

Parent: [[execution-plan-post-3y]] Phase 3 · sprint [[parallel-impl-sprint2]] Lane D.

## Why B0 (not B1 / not ICT)

- Track A already carries calendar/regime gating on PRB; Track B must be a **different mechanism**.
- OR break is explicit, session-timed, and stoppable with a hard $ risk — matches “loss shape first.”
- No rejection blocks, FVG, SMT, PDH/PDL draw narratives, Macro staging, or mentorship confluence.

## Hypothesis (falsifiable)

On MNQ, a **first break of the 09:30–09:45 NY opening range**, with stop at the opposite OR extreme and a modest fixed R target, has positive expectancy and **trail-compatible** loss streaks on ~3y + last-12m OOS under TPT $50K ($2k trail).

## Rules (≤10 lines)

1. Instrument: MNQ continuous · 5m (or 1m; defaults assume 5m).
2. **OR build:** from `09:30` to `09:45` America/New_York — OR high = max high, OR low = min low.
3. **Arm after** `09:45`. Last new entry by `11:00`. Flat by `15:55`.
4. **Long** if close > OR high · **Short** if close < OR low (first signal of the day only).
5. **Skip day** if OR width (pts) outside `[minOrPts, maxOrPts]` (defaults **8–120** — MNQ 15m OR often exceeds 40).
6. **Stop:** opposite OR extreme (± buffer pts). Skip entry if stop distance > `maxStopPts` (default **60**).
7. **Target:** `RR × risk distance` (default **1.5R** — research; not prop-income cadence claim).
8. **Size:** contracts = floor(`riskUsd` / (stopPts × $/pt)); riskUsd default **$250** · MNQ forced **$2/pt** (TV continuous can mis-report 20).
9. **Max 1 trade/day** · no pyramiding · no Monday special case required (can leave ON for A/B later).
10. No ICT filters. No news calendar in v0 (post-filter only if later research asks).

## $2k-trail loss math (design first)

| Assumption | Value |
|---|---|
| Firm trail | **$2,000** EOD trailing (TPT $50K) |
| Risk per trade | **$250** |
| Theoretical max L streak inside trail | **8** ($250 × 8 = $2,000) |
| Design stress streak | **7 losses** → −$1,750 (leaves $250 headroom for fees/slip) |
| Daily loss stop (ops) | **$500** (2R) — soft; does not replace trail math |
| Stop geometry | Opposite OR extreme; skip if stop > `maxStopPts` (default 40) so risk size stays ≤ $250 |

**If a backtest shows P95 consecutive losses ≥ 8 at $250 risk → kill or cut risk to $200 (10-loss budget) before any MC income claim.**

## Kill criteria (pre-registered) — **HIT**

| # | Criterion | Result |
|---|---|---|
| 1 | Full-3y expectancy ≤ 0 | **HIT** · exp **−$6.76**/trade · net **−$615** · n=91 · WR 42.9% |
| 2 | Max L-streak ≥ 8 @ ~$250 risk | **HIT** · max consecutive L = **11** · equity DD ≈ **−$2.8k** (> $2k trail) |
| 3 | OOS 12m expectancy ≤ 0 | Miss (OOS +$55/trade on n=12 only — ignore as rescue) |
| 5 | n < 40 | Miss (n=91) |

**Verdict: KILL ORBreak v0.** OOS looks cute on 12 trades after a −$1.3k IS — classic non-stationary noise, not a green light.

**Do not** rescue with ICT confluence, March stacking, Hybrid sleeves, or “widen the OR / change RR” loops.

## Success path (later — not this sprint)

1. Deep Backtest ~2023-07 → today · export List of Trades → `matrix/trackb-orbreak-3y.csv`.  
2. Expectancy + loss histogram **before** celebrating pass%.  
3. Lab research cohort `strategy_family: custom` · hypothesis `track-b-orbreak-v0`.  
4. Only if trail-safe + E[$/wk] > 0 on full + OOS → discuss eval/funded split.

## Export plan (next human/agent session after merge)

| Step | Action |
|---|---|
| 1 | Chart `CME_MINI:MNQ1!` 5m · paste `TrackB_ORBreak_v0.pine` |
| 2 | Defaults: OR 0930–0945 · last entry 1100 · RR 1.5 · risk $250 · OR max **120** · max stop **60** · chart **5m** |
| 3 | Deep Backtest → full ~3y → CSV → `vault-app/data/tv-exports/matrix/trackb-orbreak-3y.csv` |
| 4 | OOS: Lab Advanced dates last 12m · same CSV |
| 5 | Settle kill vs continue in this MD + research cohort |

## Naming collision note

- Idea class **B0** = execution-plan Track B “time/vol session.”  
- Lab Macro preset `matrix-b0` = unrelated Macro full book — never confuse.  
- Pine prefix **`TrackB_`** is required.
