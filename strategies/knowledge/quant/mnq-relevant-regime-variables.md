---
topic: mnq-relevant-regime-variables · researched: 2026-07-20 · sources: 18 · agent-cycle: adhoc-regime-vars
---
# MNQ / Dual46 Relevant Regime Variables: Ranked Measurables (Not Soft Tension)

Companion to `macro-regime-context-data-options.md` (build/buy) and `vol-regime-dependence-setup-frequency.md` (VIX bands already pre-registered). Scope: **measurable** market-condition variables most relevant to **MNQ Path B / Dual46** (09:30–13:00 NY, 10:00 KO, 1m RB, prop path) — and secondarily to JJ Fair-Value as a separate product. Soft “war tension” NLP is out of scope except as something to **deprioritize**.

Doctrine (unchanged): regime tags = **context / gate / Stage-0 split / MC input**. Never Dual46 lock edits. Pre-register cutoffs **before** looking at sleeve PnL. Prior-day / completed-window features only (`feature-lag-audits-data-leakage.md`).

## Key findings

- **EVIDENCE (Vault + published microstructure):** Dual46’s binding conditioners are **instrument-local realized range** (OR / ATR), **prior-day implied vol band**, and **scheduled 10:00 microstructure** — not geopolitics text. Jump risk at 10:00 is release-driven (J. Futures Markets 2014); liquidity trough is measured T−2 → T+9 min (`ops-news-print-microstructure-stand-down.md`).
- **CLAIM (practitioner + options market structure):** NQ realizes ~1.3–1.5× ES % range; VXN (not only VIX) tracks Nasdaq stress; VXN−VIX wide = tech-specific risk (Volatility Box; SpotGamma / trading.tools 2026 commentary). Treat point estimates as CLAIM until Vault ledger cells fill.
- **EVIDENCE (academic / central bank on oil–equity):** oil–equity correlation is **time-varying** and often rises in crises / post-2008 news-sensitivity regimes (BIS/Fed-style papers; wavelet/DCC studies). Oil is a useful **shock flag**, not a stable daily alpha feature for tech-heavy NQ.
- **CLAIM (rates vs Nasdaq):** duration theory says higher US10Y hurts long-duration tech; long-sample correlation is only mildly inverse (~−0.33 tech vs 10Y over ~15y, Morningstar). Large same-day yield jumps matter more than level. Log **rate shock**, not “rates are high.”
- **Vault verdict:** start with five $0 tags that already appear in Phase-0 of the macro-data note + vol note; expand only after ≥10 trades/band.

## 1. Ranked variables (MNQ / Dual46 relevance)

Rank = relevance to **morning MNQ setup quality / frequency / stand-down / path risk**, not to macro forecasting skill. CLAIM vs EVIDENCE noted in “why.”

| Rank | Variable | Why it matters for NQ/MNQ specifically | How to measure (series / ticker) | Free vs paid | Journal tag encoding | Lag / leakage risk |
|---:|---|---|---|---|---|---|
| 1 | **Prior-day VIX (band)** | Sets expected ES/NQ range; Dual46 100-pt cap + OTE geometry are vol-asymmetric. Vault May/Jun 2026 lived in 15–22; day-level band > monthly mean (`vol-regime-dependence-setup-frequency.md`). **EVIDENCE:** house VIX closes; **CLAIM:** strategy-type flips by vol band. | `^VIX` / FRED `VIXCLS` prior close | Free | `vixPrevClose`: number + band `L`/`N`/`H` = **&lt;16 / 16–20 / &gt;20** | **Low** if prior close only. Same-day VIX for same-day gate = **leakage**. |
| 2 | **MNQ opening-range ratio (OR30)** | Instrument-local realized vol for the Dual46 10:00 window; goldilocks hypothesis for RB/OTE. **REASONED / testable**, not published MNQ paper. | MNQ 09:30–10:00 H−L ÷ trailing 20-session median of same OR | Free (TV / house bars) | `or30ratio`: float; optional band `thin`/`ok`/`wide` (see §2) | **Medium:** must use **completed** 10:00 OR; do not peek mid-OR into entry decision tags used for Stage-0 (tag after 10:00 for analysis; optional live gate only after OR complete). |
| 3 | **Realized ATR (1m / 5m)** | Same idea as OR but continuous; detects expanding tape inside session (useful for JJ open-drive vs Dual46 post-10:00). | MNQ ATR(14) on 1m and 5m at 09:29 (pre-session) and/or at 10:00 | Free | `atr1m_pre`, `atr5m_pre` (pts); optional `atrExpand` = ATR@10:00 / ATR@09:29 | Pre-09:30 ATR = OK. Intraday contemporaneous ATR for same-bar entry = leakage if used as feature of that bar’s outcome. |
| 4 | **Red-folder / 10:00 release flag** | **EVIDENCE:** >60% of 10:00–10:05 ES jumps are release-driven; book pull T−2→T+9. Direct Dual46 execution threat. Already in Vault calendar. | FF / Vault `economic-calendar.ts` USD high-impact; name the 10:00 print | Free | `redFolder` bool; `release10` bool; `release_name`; `am_release` (08:30) | Calendar known day-before = **no leakage**. Surprise magnitude is post-print — do not use surprise as same-day gate. |
| 5 | **Mega-cap earnings week** | NQ ~50% in top names; single-name guidance moves index 1–3% sessions (**CLAIM** practitioner). Bank week is weaker proxy. | Earnings calendar: AAPL MSFT GOOGL AMZN META NVDA (± AVGO TSLA) report Mon–Fri that week | Free | `megaCapEarnWeek` bool; optional `earnDay` = ticker on report day | Tag **calendar week** known Sunday night. After-hours print → next RTH attribution: log `earnAftermath=true` next session. |
| 6 | **VXN / VXN−VIX** | Nasdaq-specific implied vol; wide spread = tech stress vs broad market (**CLAIM** Volatility Box / SpotGamma). Better NQ range proxy than VIX alone when they diverge. | `^VXN`, `^VIX`; spread = VXN − VIX (prior close) | Free | `vxnPrevClose`; `vxnVixSpread` | Prior close only. Same-day spread = leakage. |
| 7 | **Overnight gap + Asia range** | Sets open-drive / gap-fill regime; JJ Fair-Value cares more; Dual46 cares if gap + OR already spent the day’s impulse. | MNQ: `(RTH_open − prior_RTH_close) / prior_close`; Asia = Globex high−low from 18:00 prior → 09:29 NY | Free | `ongap_pct`; `asiaRange_pts`; optional `gapFillOpen` bool | Known at 09:30 open = OK for post-open tags. Do not use incomplete Globex H/L mid-Asia for next-day labels written early. |
| 8 | **FOMC week / Fed funds path** | Policy weeks: elevated jump risk, thinner books into 14:00 (outside Dual46 window but session regime). Funds rate level is slow; **week flag** matters more for morning. | FOMC calendar; FRED `EFFR` or `DFEDTARU` for level context | Free | `fomcWeek` bool; `fomcDay` bool; optional `effr` | Calendar = no leakage. Do not use same-day statement surprise for morning Dual46 gate. |
| 9 | **CL (WTI) 1d / 5d return — oil shock** | **EVIDENCE:** oil–equity co-movement rises in stress / news regimes; geopolitics transmits via **price**, not headlines. NQ is not energy-heavy — oil is a **systemic risk flag**, not NQ beta. | CL continuous / `CL=F` / WTI spot; 1d and 5d % change through prior settle | Free | `oil1d_pct`; `oil5d_pct`; `oilShock` bool (cutoff §2) | Prior settle only. Intraday CL for same-day MNQ tag = mild leakage / noise. |
| 10 | **US10Y / 2s10s — rate shock** | Duration: large yield jumps associated with weaker NDX same-day (**CLAIM** Saxo decile analysis; mild long-run corr Morningstar). Curve inversion = slow macro, weak for 1m RB. | FRED `DGS10`, `T10Y2Y`; or `^TNX` | Free | `us10y_bp_1d` (bp change); `curve_2s10s`; `rateShock` bool | Prior close / prior day change. Intraday yield for same-bar MNQ = leakage. |
| 11 | **ES–NQ correlation / SMT divergence** | ICT-style SMT: ES vs NQ swing disagreement as confirmation filter. **CLAIM** (ICT teaching), not peer-reviewed Dual46 lift. Useful as **setup feature**, not day regime. | Rolling 30–90m return corr ES vs NQ; or swing-high/low disagreement bool at 10:00 | Free (TV) | `esnq_corr_30m`; `smtDiv` bool (direction-coded) | If defined on bars that include the entry bar → leakage. Freeze SMT state at **signal time − 1 bar**. |
| 12 | **HY OAS / credit stress** | Risk-off when credit blows out; equity vol often follows. Slow for Dual46 morning; good **weekly** regime for MC occupancy. | FRED `BAMLH0A0HYM2` (HY OAS) | Free | `hyOas`; `creditStress` bool (e.g. >80th %ile of 1y) | FRED lag ~1 business day — use **as-of available** prior print. |
| 13 | **VVIX (vol-of-vol)** | Spikes when VIX options price crash convexity; useful when VIX level calm but tails bid. Secondary to VIX+OR for Dual46. | `^VVIX` prior close | Free | `vvixPrevClose`; optional band | Prior close only. |
| 14 | **DXY** | USD strength → risk-off / foreign-flow channel; weaker direct link to MNQ morning geometry than VIX/OR. | `DX-Y.NYB` / DXY futures prior close; 1d/5d % | Free | `dxy1d_pct`; optional `usdShock` | Prior close. |
| 15 | **NYSE TICK / breadth** | Cash-equity breadth; futures can diverge (esp. overnight / Globex). Weak for MNQ futures path; optional JJ open confirmation only. | `$TICK`, advance/decline | Free (TV) | `tick_0935` snapshot; `adLine_1d` | Snapshot must be **pre-entry**; using TICK at fill time to label “good trade” = leakage / storytelling. |

**Oil shock thresholds (pre-register, freeze after one revision):** see §2. Geopolitics without CL move → ignore.

## 2. Top 5 — start logging this week (pre-registered cutoffs)

Aligned with Phase-0 in `macro-regime-context-data-options.md` + vol note. All $0. No Dual46 rule change.

| # | Tag | Cutoff / encoding (frozen) | Source at glance |
|---|---|---|---|
| 1 | **`vixPrevClose` + band** | Band **L &lt; 16 · N 16–20 · H &gt; 20** (prior close). Log raw close too. | Yahoo `^VIX` / FRED VIXCLS |
| 2 | **`or30ratio`** | `(MNQ 09:30–10:00 range) / median(OR30, last 20 sessions)`. Bands (analysis only until ≥10 trades each): **thin &lt; 0.75 · ok 0.75–1.25 · wide &gt; 1.25**. | House / TV |
| 3 | **`redFolder` / `release10`** | Already auto-matched. `release10=true` if tier-1 10:00 (ISM, Conf. Confidence, JOLTS, UMich final, home sales, etc.). | Vault `/news` calendar |
| 4 | **`megaCapEarnWeek`** | `true` if any of AAPL, MSFT, GOOGL, AMZN, META, NVDA reports that calendar week. Optional: `earnDay` ticker. | Public earnings calendar |
| 5 | **`oilShock`** | `true` if **\|CL 1d %\| ≥ 3%** OR **\|CL 5d %\| ≥ 8%** (prior settles). Log raw `oil1d_pct`, `oil5d_pct`. | Yahoo `CL=F` |

**Optional sixth (still this month, not blocking):** `fomcWeek` bool; `ongap_pct` at RTH open.

## 3. Deprioritize (do not journal as gates)

| Item | Why deprioritize |
|---|---|
| **War / geopolitics NLP scores** | Soft; not pre-registerable; vendor labels ≠ Vault-auditable. Use **CL / VIX / DXY / gold** proxies instead (`macro-regime-context-data-options.md` §H). |
| **Politician / Congress trades (Quiver etc.)** | Wrong horizon and asset for MNQ 10:00 Path B; entertainment ≠ regime. |
| **RavenPack / Bloomberg sentiment** | Cost fails prop EV; no Stage-0 lift proven. |
| **Bank-earnings week alone** | Weak NQ proxy vs mega-caps. |
| **GPR / EPU text indices as daily gates** | Academic monthly/slow; do not drive Dual46 day tags. |
| **“Risk-on/off” SaaS AI labels** (EdgeCypher etc.) | Opaque; glance only — re-implement observables, don’t scorecard their state. |
| **COT positioning** | Weekly lag; useless for Dual46 day. |
| **Crypto fear/greed, Reddit sentiment** | Noise for MNQ prop path. |
| **TICK as primary regime** | Cash microstructure; futures Globex-dominant overnight; leakage-prone if tagged at fill. |
| **2s10s level as morning gate** | Slow macro; prefer **1d US10Y bp shock** if logging rates at all. |

## 4. APPLICATION TO THE VAULT

### Journal fields proposal (specify only — do not implement code)

Day-level object (Dual46 walk / live journal and JJ journal share schema, different `sleeve`):

```text
regime: {
  vixPrevClose: number,
  vixBand: "L" | "N" | "H",
  or30ratio: number | null,          // after 10:00
  or30Band: "thin" | "ok" | "wide" | null,
  redFolder: boolean,
  release10: boolean,
  release_name: string | null,
  am_release: boolean,
  megaCapEarnWeek: boolean,
  earnDay: string | null,
  oil1d_pct: number,
  oil5d_pct: number,
  oilShock: boolean,
  // optional backlog
  fomcWeek?: boolean,
  ongap_pct?: number,
  vxnPrevClose?: number,
  vxnVixSpread?: number,
  us10y_bp_1d?: number,
  rateShock?: boolean,               // e.g. |bp| >= 8
  hyOas?: number,
  atr5m_pre?: number
}
```

Untagged day → **exclude from regime splits** (do not impute).

### Dual46 vs JJ product

| Tag | Dual46 (Path B) | JJ Fair-Value (separate) |
|---|---|---|
| `vixBand`, `or30ratio` | Primary Stage-0 / frequency splits; cap-hit hypothesis | Secondary; JJ may want **high** OR / gap days |
| `release10` | Execution overlay / stand-down (`ops-news-print…`) | Same microstructure risk at open if trading 09:30 |
| `megaCapEarnWeek` | Session quality / jump risk | Often **higher** interest (open drive on guidance) |
| `oilShock` / `fomcWeek` | Stand-down **suggestion** only (discretionary ops) | Same |
| `ongap` / Asia range | Secondary | **Primary** JJ context |
| SMT / ES–NQ | Optional setup feature — not day regime | Optional |

Routing rule of thumb: hostile microstructure (`release10`, extreme `oilShock`+`vixBand=H`) → Dual46 flat or ops stand-down; JJ only if its own Stage-0 later shows edge on those days — never force one sleeve through all weather.

### Regime-switching MC later

1. Estimate **transition matrix** from long daily history of `vixBand` (and optionally `oilShock` as a rare stress state) — hundreds of days (`regime-switching-monte-carlo.md`).
2. Estimate **per-regime trade / setup-frequency distributions** from tagged Dual46 ledger only when cell n ≥ 10; until then: regime-dependent **frequency**, pooled outcomes.
3. Path MC samples regime path → then trade outcomes; report `E[$/wk]` / bust under regime Markov, not i.i.d.
4. JJ keeps a **separate** `dayRegimes` map if promoted — do not pool Dual46 + JJ into one transition model.

### Freeze guardrail

Zero Dual46 lock / geometry changes from this note. Findings → Stage-0 backlog or ops overlays already pre-registered (flat rule on 10:00).

## Sources

1. Vault — `vol-regime-dependence-setup-frequency.md`, `macro-regime-context-data-options.md`, `ops-news-print-microstructure-stand-down.md`, `mnq-microstructure-ny-open.md`, `historical-data-vs-live-markets.md`, `regime-switching-monte-carlo.md`, `feature-lag-audits-data-leakage.md`
2. J. Futures Markets 2014 — ES jumps & macro news (8:30 / 10:00) — via ops-news note
3. Volatility Box — NQ futures volatility / VXN vs VIX — https://volatilitybox.com/research/nq-futures-volatility/
4. trading.tools — VXN−VIX spread commentary (2026) — https://www.thetrading.tools/tech-volatility-spread
5. SpotGamma — Nasdaq vol divergence vs SPX — https://spotgamma.com/why-nasdaq-volatility-is-breaking-away-from-the-sp-500/
6. Morningstar — tech vs bond-yield correlation myth (~−0.33 / 15y) — https://www.morningstar.com/markets/busting-tech-stock-bond-yield-connection-myth
7. Saxo — NDX excess returns on large 10Y up/down days — https://www.home.saxo/content/articles/equities/interest-rate-sensitivity-is-back-in-town-haunting-technology-stocks-23112021
8. BIS/Fed conference paper — oil–equity comovement & macro news (post-2008) — https://www.bis.org/events/ccacloseconf2016/usa_paper.pdf
9. FRED — VIXCLS, DGS10, T10Y2Y, BAMLH0A0HYM2, EFFR
10. Cboe — VIX / VXN / VVIX index definitions
