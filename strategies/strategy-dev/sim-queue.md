---
updated: 2026-07-14
tags: [playbook, simulations, strategy-dev]
---
# Next simulations queue

> Run these **after** Lab shows business-loop metrics (`E[$/calendar week]`, P(payout|pass), median withdraw).  
> Rank by: moves EV/week · one variable · uses Premium fields · firm gate aware.  
> Primary scoreboard: [[prop-firm-math]] business loop — not raw P&L.

## Settled evidence (do not re-litigate)

| Result | Status | Implication |
|---|---|---|
| A0a PRB control ~80% pass · ~$104/wk EV | keep | Eval backbone |
| A0b / A1c BE@2R + cap | **regress** vs A0a on EV/week | Cap/BE@2R hurts pass→payout speed on this year |
| D1 RR6 funded | keep | Funded PRO extract |
| H0a/H0b hybrid | keep (speed) | Faster weeks→payout; lower pass than A0a |
| H1 quiet Macro | Lab duplicate of H0 — use filtered CSV | Re-run real quiet ledger |
| B1a A-tier Macro | sparse edge · slow | Diversifier only |
| B1c A+ Macro | kill | −$1.3k / 6.5% pass |
| M0≡M1 Macro v2 | BE@2R never armed | Don't port PRB BE@2R onto point TPs |
| M2 Macro volume | **kill** (−EV/week) | 10:50 + mid-window bleed |
| Macro 9:50-only TOY | strong | First-class filter |

## Queue — Tier 1 (run first · highest EV/week leverage)

| # | Sim ID | What to export / filter | Lab preset | Hypothesis (falsifiable) | Success gate |
|---|---|---|---|---|---|
| S1 | **True H1 quiet Macro** | `filter-hybrid-news` on H0a/H0b TV CSVs → upload H1a/H1b | matrix-h1a / h1b | Quiet Macro raises E[$/wk] vs H0 without killing cadence | E[$/wk] ≥ H0 · pass ≥ H0−3pt |
| S2 | **Hybrid 9:50 Macro only** | Hybrid_Sleeve: Macro window 9:50–10:10 ON · 10:50 OFF | new H2a/H2b (or manual input) | Dropping 10:50 lifts pass + EV/wk | Bust ↓ · E[$/wk] ↑ vs H0 |
| S3 | **A0a × firm matrix (payout buffer $2k)** | Re-RUN A0a with payoutBuffer **2000** (not 1000) | matrix-a0a | Buffer matching TPT $52k changes median withdraw | Record E[$/wk] as new control |
| S4 | **PRB min-day pad overlay (analysis)** | No new TV — script: keep A0a trades + inject $0/$50 “pad” days to hit 5 days | research preset | Day pad doesn't hurt EV; may raise P(payout\|pass) on slow firms | Document EV/wk delta · then live test |
| S5 | **Macro A-tier ∪ PRB same-day allow** | Hybrid v0.1: 1 Macro + 1 PRB/day when no conflict | Hybrid_Sleeve v0.1 | Cadence ↑ without DD blow-up (A-tier 0-overlap) | tr/wk ≥ 1.8 · bust ≤ H0+5pt · E[$/wk] ↑ |

## Queue — Tier 2 (management / geometry · only if Tier 1 pays)

| # | Sim ID | What | Why |
|---|---|---|---|
| S6 | Macro BE@**1R** $400 · **9:50 A-only** | New Macro_v2 profile M3 | Avg MFE ~$309 — 1R can arm; 2R cannot |
| S7 | Macro A-tier TP = structure R (not 40pt fixed) | R-multiple TP | Aligns BE/TP with path geometry |
| S8 | PRB BE@1R vs BE@2R **on same RR6 funded** | D1×BE A/B | Funded needs different BE than eval lore |
| S9 | PRO scale ladder (MC size steps) | Post-cushion ×1.5–2 risk on D1/H0b ledger | Raises median withdraw without new entries |

## Queue — Tier 3 (firm / ops · parallel to R&D)

| # | Sim ID | What | Why |
|---|---|---|---|
| S10 | Multi-firm A0a + H0b with **E[$/wk]** primary | Lab firm matrix after rebuild | Pick firm mix: fast min-days vs high pass |
| S11 | Topstep / Alpha Zero min-day constraints | Same ledgers · firm MC | Day-pad value shows up here |
| S12 | 2–3 concurrent accounts model | Spreadsheet/MC: n × E[$/wk] − fees | Income target without new edge |

## Queue — Do **not** run (graveyard)

- M2 volume unlock / TS-optional expansion  
- A+ Macro isolation  
- Blind 10:50–11:10 / lunch macros before S2 settles  
- More A0b/A1c polish for “eval purity” if E[$/wk] regresses  
- Trail ratchet on Macro (PRB trail already failed long A/B)

## Cohesive strategy target (assemble after Tier 1)

```text
Eval engine:   A0a (or H0a if E[$/wk] wins after S1–S2)
Funded engine: D1 or H0b with recycle-before-PRO+
Macro role:    9:50 A-tier only · optional same-day with PRB (S5)
Ops:           min-day pad · multi-account once E[$/wk] > $150 on one box
Kill switch:   any book with E[$/wk] ≤ 0 after fees
```

## How to run each Lab session

1. Rebuild Lab (`npm run build && npm run start`) so **E[$/calendar week]** strip is visible.  
2. F3 recipe → TV Deep Backtest → CSV.  
3. F4 upload matching preset → RUN.  
4. Compare **E[$/wk]**, P(payout|pass), median withdraw, weeks→payout — not pass% alone.  
5. Cohort auto-save now includes cycle YAML fields.  
6. For eval presets with a funded pair (A0a→D1), check **Chain EV panel** after RUN — see [[chain-ev-spec]].

## Scripts

- `npx tsx scripts/analyze-payout-cycle.ts` — batch EV/week across matrix CSVs  
- `npx tsx scripts/filter-hybrid-news.ts <hybrid-tv.csv>` — true H1 ledgers (S1)  
- `npx tsx scripts/analyze-macro-v2-m-series.ts` — Macro TOY/MFE autopsy  

## Links

- [[prop-firm-math]] · [[roadmap]] · [[findings-prb]] · [[findings-macro]] · [[hybrid-playbook]]
