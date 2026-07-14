---
updated: 2026-07-14
tags: [roadmap, hypotheses, strategy-dev]
---
# Strategy development roadmap

> Prioritized experiment backlog. One variable per test. Every entry needs a falsifiable prediction + target metric before running.

## Track 1 — Eval-phase strategy (optimize pass rate)

| # | Experiment | Prediction | Target | Status |
|---|---|---|---|---|
| 1.1 | PRB BE@2R + PDH/PDL as dedicated eval config | Already leader | pass ≥ 55% held on forward test | forward-testing |
| 1.2 | Add win-day cap ($1,490) + stop-after-target simulation to MC | Consistency-blocked passes recovered | consistency pass ≥ gross pass − 5pts | not started |
| 1.3 | Macro A-tier only (drop A+, H) | Fewer, better trades → pass > 40% | beat v1.4 33% on same year | **next** — filter existing v1.4 CSV by tier, no re-export needed |

## Track 2 — Funded-phase strategy (optimize $/week)

| # | Experiment | Prediction | Target | Status |
|---|---|---|---|---|
| 2.1 | Macro A+ with 40pt TP (kill SMT TP boost) | MFE data shows losses reached 40pt → converts L→W | A+ tier net > $0 | **next** — needs Pine tweak + re-export |
| 2.2 | Macro v1.2 (high volume) with $400 risk | Halved risk halves DD, keeps edge | pass > 45% at same trade count | can simulate from existing ledger ×0.5 |
| 2.3 | PRB runner variant (trail in trend regimes) | Regime-gated trail beats BE in runner months | net/week > BE-only in tagged months | needs regime tagging |

## Track 3 — Hybrid (PRB × Macro combined formula)

**Concept:** PRB contributes the *loss-control formula* (BE@2R, small losses, PDH/PDL draw). Macro contributes the *time-and-context edge* (9:50–10:10 window, staging sweep, TS trigger, tier sizing).

| # | Experiment | Prediction | Target | Status |
|---|---|---|---|---|
| 3.1 | Portfolio blend: PRB eval → both strategies funded | Uncorrelated windows (PRB varies, Macro fixed AM) smooth equity | combined weekly edge > either alone; DD < sum | **settled 2026-07-14** — A0a∩B1a = **0 days** (true diversifiers). Union +$/WR but RR dilutes 5.5→3.3, pass ≈ flat/slightly down, maxLStreak still 4. A0a∩B0 = 5 conflict days (see hybrid-playbook). Next: Macro quiet-only + PRB full portfolio rule |
| 3.2 | Macro entries + PRB-style BE@2R management | BE mechanism fixes Macro's symmetric-loss problem | Macro pass > 45% | Pine variant `Macro_Model_v2` |
| 3.3 | PRB entry inside macro window only | Time filter concentrates PRB edge | expectancy/trade ↑ vs all-day PRB | Pine variant |

**Correlation check first (3.1):** count days both strategies traded in the shared year; if same-day losses cluster, blending doesn't diversify.

## Track 4 — Income acceleration (not pass-rate A/Bs)

> Current ceiling: ~1.2 trades/wk · recycle extract ~$1k take-home / 8w ≈ **$1k/mo**. Target path: **≥$1k/wk realized** before split → need ~3–5× frequency and/or size after cushion. Small PRB toggles will not get there.

| # | Experiment | Why it moves $/wk | Effort | Status |
|---|---|---|---|---|
| 4.1 | **Macro v1.2 volume @ $400 + BE@2R** (roadmap 2.2+3.2 merge) | 229 trades/yr → ~4–5× frequency; BE kills $800 trail busts | Pine `Macro_Model_v2` + MC | **priority** |
| 4.2 | **Second Macro window unlocked** (10:50–11:10 always; test 11:50–12:10) | Same edge, second daily slot — frequency without new model | Pine input flip + export | next |
| 4.3 | **Sleeve: allow 1 Macro + 1 PRB same day** (when Macro AM filled, PRB still arms) | Exploits 0-overlap on A-tier; doubles peak cadence | Hybrid_Sleeve v0.1 | next |
| 4.4 | **True H1 quiet-Macro ledger MC** (filter-hybrid-news) | +5pt pass vs H0 without slowing much | CSV only — re-run H1a/H1b | quick win |
| 4.5 | **PRO scale ladder** after +$1.5k cushion: risk $400→$800→$1,200 | Same edge, 2–3× extract per cycle before recycle | playbook + MC size scale | analysis |
| 4.6 | **Multi-account / larger size** (3× $50k or $150k if DD scales) | Parallelism is the only lever that doesn't need new edge | ops | parallel to R&D |
| 4.7 | Lunch / PM macro exploratory (1:10–1:40) | Untapped SOP windows — only if 4.2 pays | research | later |

## Rules for this backlog

- Winner promotion follows [[STRATEGY_DEV_AGENT]] promotion rule.
- Settled results move to [[findings-prb]] / [[findings-macro]]; failures noted in graveyard sections.
- Prefer experiments that reuse existing enriched CSVs (tier filter, risk scaling) before asking for new TV exports.
