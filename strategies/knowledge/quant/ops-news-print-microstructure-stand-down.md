---
topic: ops-news-print-microstructure-stand-down
researched: 2026-07-18
sources: 7
agent-cycle: cycle3-laneB
---
# News-Print Microstructure: Spread/Depth Around 8:30 and 10:00 ET Releases, and Quantified Stand-Down Windows

*The measured-evidence companion to lane C's red-folder playbooks (charter #65). The 10:00 ET release class lands INSIDE the Dual46 execution window — this is the one news slot that directly threatens the strategy.*

## Key findings

- **EVIDENCE (peer-reviewed, high-frequency futures data): liquidity is withdrawn ~2 minutes BEFORE a scheduled release, hits its minimum at the print, and reverts to normal within ~9 minutes after.** The cleanest published measurement (Review of International Economics 2019, crude-oil futures around monetary-policy announcements, using bid-ask spread + depth + book slope) gives exactly this template: pull ~T−2 min, trough at T, normal by ~T+9 min; the magnitude scales with the size of the announcement *surprise*. Energy futures, not MNQ — but the mechanism (makers protecting against adverse selection) is instrument-generic.
- **EVIDENCE (CFTC Office of the Chief Economist, ES/other CME contracts): automated liquidity providers exit "just prior" to the announcement and take on the order of a second to re-enter; the violent active period "often lasts on the order of a few seconds."** The post-print tape is dominated by automated accounts in the first seconds, manual accounts in the following minutes. Implication: the book you see at T+1 s is not the book you can trade; by T+30–60 s two-sided automated quoting has substantially rebuilt.
- **EVIDENCE (Journal of Futures Markets 2014, ES price jumps): over 75% of price discontinuities in 8:30:00–8:35:00 and over 60% of jumps in 10:00:00–10:05:00 are attributable to the scheduled releases at those times.** i.e. the 10:00 slot is a *bona fide jump generator* on jump days — but note the flip side: most 10:00s have no tier-1 release and are ordinary tape.
- **EVIDENCE (LMAX/Macro Hive, CPI/NFP/FOMC 2019–2024): the decisive price move happens in the first 1–2 seconds; ~25% of the S&P's total event move completes within the first minute, half within the hour.** For an execution (not alpha) perspective: by T+60 s the discontinuity risk is mostly spent; what remains is elevated-but-continuous volatility.
- **The 8:30 releases (CPI, NFP, retail sales, GDP) are OUTSIDE the Dual46 window (9:50–10:10) but set the session's regime**; the 10:00 releases are the direct threat: **ISM Manufacturing/Services, Consumer Confidence, JOLTS, UMich final, new/pending home sales**, plus unscheduled Fed-speaker headlines. Consumer Confidence specifically is one of the two releases most associated with jumps in the Wiley study.
- **No MNQ-specific depth study found** (consistent with the microstructure note). The synthesis across sources: on a 10:00 release day expect the ~T−2 min maker pull → spread widening to 2–3+ ticks on MNQ (micro books thin faster than minis) → jump risk in the first seconds → mostly-rebuilt book by T+1 min → fully normal by T+5–9 min.

## Details / mechanics

**The stand-down window, assembled from the evidence:**

| Phase | Time (release at T) | Book state | Order policy |
|---|---|---|---|
| Pre-pull | T−2 min → T | Depth draining, spread widening | No NEW orders; resting limit = decision point (below) |
| Print | T → T+5 s | Trough liquidity, jump risk, OCO race risk | Nothing. No conversions, no modifications |
| Rebuild | T+5 s → T+60 s | Automated quoting returns, spread 2–3 ticks → 1 | No market/converted orders; passive limits acceptable |
| Normalization | T+1 → T+9 min | Reverting to baseline | Normal rules, elevated slippage budget (2 ticks) |

Conservative single-number version: **stand down T−2 min to T+1 min for order *placement/conversion*; treat T−2 to T+9 as an elevated-slippage regime.** These bounds are lifted from measured studies (2 min / 9 min from the RIE liquidity study; 1 min from LMAX + CFTC rebuild timing), not invented.

**What about a resting Dual46 limit through a 10:00 print?** Three coherent policies, in descending conservatism:
1. *Flat rule:* on tier-1 10:00 release days (ISM, Consumer Confidence, JOLTS), cancel any unfilled entry limit at 9:58 and re-place at 10:01 if the setup is still valid. Cost: occasionally sacrifices queue position (FIFO restart). Benefit: cannot be filled by a news wick into an instant −1R.
2. *Ride-through rule:* leave the limit; a fill on the news wick is accepted as a legitimate (if violent) rejection-block test. Requires the server-side stop-market bracket (order-types note) because the stop may be hit within seconds.
3. *Asymmetric rule:* ride through only if the bracket is server-side AND the stop distance ≥ the release-class's typical jump (measurable from house data after a few months).
The June/May replay ledgers cannot arbitrate this (replay bars hide the intra-minute jump path) — it must be pre-registered before live-sim and the chosen rule logged per event. Recommendation: start with policy 1 (flat rule) during the calibration month; it is the only one whose worst case is bounded at "missed trade," which the calibration protocol already measures.
4. In all cases: **no conversion-rule executions inside T−2 min → T+1 min.** The conversion order is marketable — it pays the trough-liquidity spread directly. This is the sharpest, cheapest rule in this note.

**Which days:** tier-1 10:00 releases hit ~4–8 trading days/month (ISM ×2, Consumer Confidence ×1, JOLTS ×1, UMich final ×1, home-sales prints, quarterly extras). The stand-down affects the Dual46 window on those days only; 8:30 releases never force a stand-down (window starts 9:50) but flag the session as high-vol regime in the journal.

## APPLICATION TO THE VAULT

- **Add to the pre-market checklist: "10:00 ET release today? (ISM / Conf. Confidence / JOLTS / UMich / home sales / Fed speaker)" — one lookup on any economic calendar.** If yes: mark the session as `release_day=true` in the journal and apply the flat rule (cancel unfilled limit 9:58, re-assess 10:01) during calibration.
- **Hard line for the conversion rule: never convert inside T−2 min → T+1 min of a scheduled release.** This is the direct intersection of the slippage note's 3–5-tick release budget and the measured trough-liquidity window. One sentence in the execution SOP.
- **Journal fields:** `release_day` (bool), `release_name`, `entry_vs_release_offset_s` (signed seconds from print to entry, when both occur). After ~6 months this yields the house jump-size distribution needed to upgrade from policy 1 to policy 3.
- **8:30 prints (CPI/NFP weeks): no stand-down needed, but log `am_release=true`** — lane C's vol-regime topic (#45) will want to test whether 8:30-release sessions have different setup quality at 10:00.
- **Guardrail note:** the flat rule is an *execution overlay*, not a Dual46 parameter change — the setup definition, entry level, and R geometry are untouched; only order residency during a measured liquidity trough is managed. Still: pre-register it in the walk plan before live-sim so it can't become an in-session excuse.

## Sources

1. Slopes, spreads, and depth: Monetary policy announcements and liquidity provision in the energy futures market (Review of International Economics 2019 — the T−2 min pull / trough at T / T+9 min reversion measurement): https://ideas.repec.org/a/eee/reveco/v59y2019icp234-252.html
2. CFTC OCE — Macro News Announcements and Automated Trading (automated maker exit pre-print, ~1 s re-entry, few-seconds violent window): https://www.cftc.gov/sites/default/files/idc/groups/public/@economicanalysis/documents/file/oce_macroannouncement.pdf
3. S&P 500 Index-Futures Price Jumps and Macroeconomic News (J. Futures Markets 2014 — >75% of 8:30–8:35 and >60% of 10:00–10:05 jumps are release-driven; NFP & Consumer Confidence strongest): https://onlinelibrary.wiley.com/doi/10.1002/fut.21627
4. LMAX Group / Macro Hive — Millisecond Reactions to Economic Events (1–2 s decisive move; ~25% of S&P event move in first minute): https://www.lmax.com/documents/LMAXGroup-Macro-Hive-report.pdf
5. Premium for Heightened Uncertainty (Jun Pan et al. — pre-announcement return/uncertainty structure; ISM at 10:00 confirmed in the announcement set): https://en.saif.sjtu.edu.cn/junpan/PreAnn_20210728.pdf
6. Chung, Elder & Kim (JMCB 2013) — Liquidity and Information Flow around Monetary Policy Announcement (cited framework for spread/depth response): via source 1's references
7. Vault note — `ops-mnq-slippage-market-orders-open.md` (release-adjacent 3–5 tick budget; this note supplies the time bounds): internal
