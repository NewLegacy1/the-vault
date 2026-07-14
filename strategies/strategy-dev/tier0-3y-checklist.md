---
updated: 2026-07-14
tags: [checklist, 3y, strategy-dev]
---
# Tier 0 handoff — your 3y exports → Lab

Files are already in `vault-app/data/tv-exports/matrix/*-3y.csv`.

## Lab run order (MUST raise Max trades)

**Advanced options → Max trades = `220`** (default used to be 80 — that truncates 3y books).  
Payout buffer = **2000**. Scoreboard = **E[$/wk]**.

| Your Downloads file | Matrix name | Lab strategy | Notes |
|---|---|---|---|
| `PRB_…e89d7.csv` | `prb-a0a-3y.csv` | **A0a · PRB control** | RR5 eval |
| `PRB_…57097.csv` | `prb-d1-3y.csv` | **D1 · PRB RR6 funded** | |
| `Hybrid_…19fab.csv` | `hybrid-h0a-3y.csv` | **H0a · Eval** | both Macro windows |
| `Hybrid_…c1da1.csv` | `hybrid-h0b-3y.csv` | **H0b · Funded** | |
| `Hybrid_…6b19e.csv` | `hybrid-h2a-3y.csv` | **H2a · Eval · Macro 9:50 only** | Macro 10:50 off (PRB may still print ~10:50) |
| `Macro_v2_…20853.csv` | `macro-v2-full-3y.csv` | **B0 · Macro** first, then **B1a · A-tier only** | File is **full** A/A+/H — not A-only. B1a derives A-tier from B0 |

After each full RUN: Advanced dates → last **12 months** → RUN again (OOS).

## Quick engine MC (already run locally · max trades 220)

| Book | Pass | Bust | E[$/wk] | Read |
|---|---|---|---|---|
| A0a-3y | ~34% | ~66% | ~$2 | Survival collapses vs 1y |
| D1-3y | ~95%* | ~43% | ~$28 | Funded recycle still pays |
| H0a-3y | ~23% | ~76% | **−$9** | Kill as eval income |
| H0b-3y | ~67%* | ~57% | ~$33 | Best funded speed |
| H2a-3y | ~18% | ~81% | **−$16** | Worse than H0a on 3y |
| Macro full | ~20% | ~83% | −$4 | Kill |
| B1a A-only | thin | high | ~$0 | Sparse · not income |

\*Funded-mode “pass” is recycle path, not eval pass.

**Implication:** 3y window is much harder than the premium 1y. Don’t trust 1y EV until OOS (last 12m) on these same ledgers.

## Live Lab note

**H2a** preset is new in code — needs a deploy/push for https://the-vault-rose.vercel.app. Until then use **H0a** + hypothesis `H2a-3y` with the `6b19e` / `hybrid-h2a-3y.csv` file.

Full queue: [[sim-queue]] · Calendar: [[calendar-3y]]
