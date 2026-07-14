---
updated: 2026-07-14
tags: [playbook, simulations, strategy-dev, 3y]
---
# Simulations queue — 3-year reset

> **ACTIVE BRIEF:** [[execution-plan-post-3y]] — after Tier 0, prioritize **autopsy / regime-gate Lab runs**, not new Hybrid/Macro variants.  
> **Scoreboard:** [[prop-firm-math]] — `E[$/calendar week]` after fees (pass → payout → recycle).  
> **Window:** Deep Backtest **~2023-07-01 → today** · Lab payout buffer **2000**.  
> **OOS:** After each full RUN, Advanced dates → last **12 months** only · compare E[$/wk].  
> **1y baselines archived:** `strategies/cohorts/_archive_365d_jul2026/` — do **not** MC-compare to new `*-3y-*` cohorts.  
> **Calendar:** [[calendar-3y]] (2486 USD events · dense FF through 2025-04-07 · FRED gap after).

## Settled from 1y premium (do not re-litigate unless 3y OOS reverses)

| Result | Status |
|---|---|
| A0a PRB control · high pass / ~$100+/wk | keep candidate |
| A0b / A1c polish | regress on EV/week |
| H0a Hybrid vs A0a | faster payout · higher bust |
| H2a 9:50-only | safer · slightly lower EV vs both-windows |
| M2 volume Macro / A+ Macro | **kill** |
| BE@2R on Macro point TPs | never armed |

## Tier 0 — Controls (run first · no Pine edits)

| # | ID | Pine / profile | Lab preset | Save CSV as |
|---|-----|----------------|------------|-------------|
| 1 | **A0a-3y** | PRB v1.5 · BE@1R · RR5 · $400 | `matrix-a0a` | `prb-a0a-3y.csv` |
| 2 | **D1-3y** | Same · RR6 funded | `matrix-d1` | `prb-d1-3y.csv` |
| 3 | **H0a-3y** | Hybrid_Sleeve · H0a · **both** Macro windows ON | `matrix-h0a` | `hybrid-h0a-3y.csv` |
| 4 | **H0b-3y** | Hybrid_Sleeve · H0b | `matrix-h0b` | `hybrid-h0b-3y.csv` |
| 5 | **H2a-3y** | Hybrid · 9:50 ON · **10:50 OFF** | `matrix-h0a` (note H2a in hypothesis) | `hybrid-h2a-3y.csv` |
| 6 | **B1a-3y** | Macro A-tier only | `matrix-b1a` | `macro-b1a-3y.csv` |

### TV → Lab checklist (each Tier 0)

1. TradingView Deep Backtest · MNQ continuous · **2023-07-01 → today**.  
2. Export list of trades → copy into `vault-app/data/tv-exports/matrix/` with the name above.  
3. Lab → matching preset → upload → Advanced: buffer **2000** → **RUN** (full window).  
4. Advanced dates → from `today−12m` → **RUN** again (OOS) · rename dataset / hypothesis `… · OOS 12m`.  
5. Record **E[$/wk]**, pass/bust, weeks→payout — not pass% alone.

## Tier 1 — Filters (after Tier 0 locked)

| # | ID | Change (one variable) | Success gate |
|---|-----|----------------------|--------------|
| 7 | **H1a-3y** | `npx tsx scripts/filter-hybrid-news.ts hybrid-h0a-3y.csv` → Lab H1a | E[$/wk] ≥ H0a-3y · pass ≥ H0a−3pt |
| 8 | **H2a+H1** | Quiet filter on 9:50-only CSV | Bust ↓ without EV wipe |
| 9 | **Seasonal stand-down** | A/B full vs skip worst months (data-driven) | Full-calendar E[$/wk] must still win |
| 10 | **Min-day pad** | Overlay on A0a-3y | P(payout\|pass) ↑ |

## Tier 2 — Small variances (Premium-fast · max 4 until a gate hits)

| ID | Variable | Bound by |
|----|----------|----------|
| V1 | PRB BE@1R vs BE@2R on **funded RR6** | E[$/wk] D1 / H0b |
| V2 | Macro risk $400 vs $800 inside Hybrid | Bust / EV |
| V3 | PRB session start 10:00 vs 9:50 | Cadence vs Macro conflict |
| V4 | Max 1/day ON vs Macro+PRB same day | tr/wk ≥ 1.8 · bust ≤ H0+5pt |

## Graveyard (do not reopen)

M2 volume · A+ Macro · blind 10:50 expansion · trail ratchet · A0b/A1c polish unless 3y OOS reverses.

## Cohesive stack target (after Tier 0–1)

```text
Eval:    A0a-3y or H0a/H2a-3y (winner on E[$/wk] + acceptable bust)
Funded:  D1-3y or H0b-3y · recycle before PRO+
Macro:   9:50 A-tier · optional quiet / same-day sleeve
Ops:     min-day pad · multi-account once E[$/wk] > ~$150 / box
Kill:    E[$/wk] ≤ 0 after fees
```

## Scripts

- `node scripts/backfill-calendar-3y.mjs` — refresh USD calendar ([[calendar-3y]])  
- `npx tsx scripts/filter-hybrid-news.ts <hybrid.csv>` — H1 quiet Macro  
- `npx tsx scripts/analyze-payout-cycle.ts` — batch EV/week  

## Links

- [[prop-firm-math]] · [[calendar-3y]] · [[roadmap]] · [[findings-prb]] · [[findings-macro]] · [[hybrid-playbook]]
