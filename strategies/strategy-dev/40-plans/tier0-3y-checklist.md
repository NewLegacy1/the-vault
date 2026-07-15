---
updated: 2026-07-14
tags: [checklist, 3y, strategy-dev]
---
# Tier 0 — exact Lab dropdown names

**Advanced:** Max trades **220** · Payout buffer **2000**.

| What you exported | Lab dropdown (exact) | Section |
|---|---|---|
| PRB RR5 | **A0a · PRB control** | Eval |
| PRB RR6 | **D1 · PRB RR6 funded raw** | Funded · PRB + Macro B0/B1 |
| Hybrid both Macro windows | **H0a · Eval · A0a + B1a** | Hybrid · Eval |
| Hybrid funded | **H0b · Funded · D1 + B1a** | Hybrid · Funded |
| Hybrid 9:50 ON / 10:50 OFF | **H2a · Eval · 9:50 Macro only (10:50 OFF)** | Hybrid · Eval |
| Macro_v2 / Macro full CSV | **B0 · Macro full book (upload here)** then **B1a · Macro A-tier only (from B0)** | Funded · PRB + Macro B0/B1 |

**Do not use for the A-tier study:**  
`M0 · Macro_v2 $400…` / `M1 · Macro_v2 $400…` — those are the killed income track (Macro_Model_v2 profiles), not B0/B1a.

## 395f4 (this Hybrid)

Same book as prior H2a (`6b19e`): **154 trades**, **0 Macro @ 10:50**, net **−$155**.  
Engine MC (eval): ~**20% pass · 79% bust · E[$/wk] ≈ −$12** — worse than H0a ($10/wk).  

Lab: select **H2a · Eval · 9:50 Macro only (10:50 OFF)** → upload `395f4` → RUN (hard-refresh if H2a missing).

## Stack so far (Lab cohorts)

| | E[$/wk] |
|---|---|
| H0b funded | **$36** (best) |
| D1 funded | **$28** |
| A0a eval | **$15** |
| H0a eval | **$10** |
| H2a 9:50-only | **−$12** (engine) |
| M0/M1 | **−$4** |

**Next (not more Hybrid polish):** [[execution-plan-post-3y]] — autopsy A0a/D1 → regime gate or Track B.

[[sim-queue]]
