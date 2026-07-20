---
topic: mnq-relevant-regime-variables · researched: 2026-07-20 · sources: 8 · agent-cycle: adhoc-regime-data
---
# MNQ-Relevant Regime Variables (Phase-0 Dual46 May walk)

What to **log** on every Dual46 / walk day so Stage-0 splits and regime-MC have measurable
inputs — not SaaS “risk-on” labels, not war NLP. Dual46 freeze unchanged. JJ Fair-Value is a
**separate** product ([[jj-simon-fair-value-930-strategy]]).

Cross-refs: [[vol-regime-dependence-setup-frequency]], [[macro-regime-context-data-options]],
[[intraday-regime-detection-session-selection]], [[regime-switching-monte-carlo]],
[[ops-news-print-microstructure-stand-down]], [[ict/red-folder-playbooks-1000-window]].

## Key findings

- **Top 5 for MNQ morning Path B** (pre-registered, $0 DIY): prior-day VIX band · opening-range
  ratio · red-folder / 10:00-release flag · mega-cap earnings week · oil-shock proxy.
- **Ignore for scoring:** soft geopolitics NLP, politician-trade feeds, vendor AI regime meters
  without frozen definitions (glance OK; do not put in Dual46 scorecard).
- **Leakage rule:** VIX = **prior close** only; OR30 uses the **completed** 09:30–10:00 range;
  oil uses **prior** CL settles for the shock flags.

## Top 5 — log these

| # | Field | Definition (frozen) | Storage |
|---|---|---|---|
| 1 | **`vixPrevClose`** / **`vixBand`** | Prior trading day’s VIX close → bands **&lt;16 / 16–20 / &gt;20** | number + enum |
| 2 | **`or30ratio`** / **`or30Band`** | MNQ 09:30–10:00 high−low ÷ trailing **20-session median** of same → **&lt;0.75 / 0.75–1.25 / &gt;1.25** | number + enum |
| 3 | **`redFolder`** / **`release10`** | Any USD high-impact on calendar (`redFolder`); **`release10`** = high-impact print with time in **09:50–10:10 NY** (Dual46 arm window microstructure) | already auto / boolean |
| 4 | **`megaCapEarnWeek`** | Y if any of AAPL, MSFT, GOOGL, AMZN, META, NVDA reports Mon–Fri of that calendar week | boolean |
| 5 | **`oilShock`** | \|CL 1-day %\| ≥ **3** OR \|CL 5-day %\| ≥ **8** (prior settles) — frozen in `vault-app/lib/regime-tags.ts` | boolean |

## Why these five (MNQ morning)

1. **VIX prior** — day-level vol backdrop; May vs June 2026 month *means* were nearly identical
   (~17.2 vs ~17.1); the honest split is intra-month bands, not “May was different.”
2. **OR30 ratio** — instrument-local open vol for a 10:00 leave/KO system; Crabel/ORB literature
   says the first 30 minutes carry session regime information.
3. **Red-folder / release10** — scheduled microstructure stand-downs already in Vault SOP;
   10:00-slot prints collide with Dual46 arm timing.
4. **Mega-cap week** — NQ/MNQ reacts to mega-cap guidance more than bank earnings alone.
5. **Oil shock** — measurable geopolitics *proxy* without NLP; optional stand-down suggestion
   for the discretionary sleeve only — never a Dual46 lock edit.

## Optional later (still census, not gates)

- ADX(7) @ 10:00 + DI direction (intraday regime note)
- First-30-min direction vs day bias
- Post-hoc session Hurst / VR (labels only)

## APPLICATION TO THE VAULT

1. **May walk:** populate all five on every new row; backfill VIX/mega where known
   ([[../../strategy-dev/50-analyses/morningstar-dual46-may-harvest]]).
2. **UI:** Dual46 form + journal edit expose these fields (`vault-app/lib/regime-tags.ts`).
3. **No Dual46 Pine / lock changes.** Regime findings → post-May backlog / Stage-0 only.
4. **JJ Fair-Value:** may reuse the same day tags for routing later; do not mix into Dual46 sleeve math.
5. **SaaS glance** (MACRO/SIGNAL, EdgeCypher, CondorEdge): optional morning context only —
   re-implement observables in Vault tags if useful; never import black-box labels into the scorecard.

## Sources

1. Vault vol-regime + macro-regime + intraday-regime notes (cycle 2–3 + adhoc 2026-07-20)
2. Yahoo / Cboe VIX history May–Jul 2026 (cited in vol-regime note)
3. Gao et al. / Crabel ORB lineage (cited in intraday-regime note)
4. Vault red-folder / news-microstructure SOPs
5. Handoff `strategy-dev/50-analyses/HANDOFF-cloud-to-local-2026-07-20.md`
