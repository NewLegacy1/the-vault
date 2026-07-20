---
topic: macro-regime-context-data-options · researched: 2026-07-20 · sources: 28 · agent-cycle: adhoc-regime-data
---
# Macro Regime Context Data: Forgotten App Candidates, Build-vs-Buy Options, Vault Viability

User forgot the name of an **ex-quant-vibe** app that pulls **bank/earnings calendars, war/global-tension headlines, Fed rates, and financial news into one calendar** for market-regime context. Goal: inventory **many** accurate data paths (cost, viability), and decide whether regime tagging helps **multi-strategy lifespan** (Dual46 frozen MNQ Path B; JJ Fair-Value a separate product) without fighting every regime with one edge.

Vault already has: Forex Factory–style **economic calendar bundle** + **red-folder auto-match** in journal (`vault-app/lib/economic-calendar.ts`, `/news`); notes on `vol-regime-dependence-setup-frequency.md`, `regime-switching-monte-carlo.md`, `intraday-regime-detection-session-selection.md`, `historical-data-vs-live-markets.md`, Track-B kill lessons.

**We cannot identify “the” app with certainty.** Below are ranked matches — confirm with a screenshot or URL.

## Key findings

- **Best name candidates (CLAIM = product marketing; match score = fit to remembered features):** (1) **MACRO/SIGNAL** — Streamlit FRED + Finnhub earnings/news/calendar + explicit regime sentence; (2) **EdgeCypher** — free browser AI risk-regime + econ calendar + news + FOMC; (3) **CondorEdge** — calendar + Smart Earnings + Fed liquidity/FedWatch + geopolitics proxies (e.g. Hormuz oil) + macro regime detector. Honorable: **fffinstill**, open GitHub **macro-regime-warroom**, **MRKT Edge** (earnings-impact calendar). **QuantPad** is already known (Thomas/DeltaTrend) and is a strategy IDE, not this calendar.
- **EVIDENCE (Vault doctrine already):** regime tags are useful as **context features / gates** for Stage-0 EV splits, path-MC inputs, and sleeve routing — not as Dual46 lock changes (`regime-switching-monte-carlo.md`, `vol-regime-dependence-setup-frequency.md`, kill-lesson “no multi-regime costume without private Stage-0 lift”).
- **CLAIM (cost reality 2026, verify before purchase):** institutional NLP/news analytics (RavenPack ~$50k–$500k/yr class; Bloomberg ~$32k/seat/yr) are **not** EV-justified for a 10-MNQ prop desk. Mid-tier retail (Benzinga Pro ~$37–$197/mo; Quiver API ~$30–$75/mo; Polygon/Massive stocks ~$29–$199/mo) can buy **news/earnings feeds**, not a proven MNQ morning edge. **$0 DIY** (FF calendar + VIX + oil/DXY/gold proxies + mega-cap earnings week) covers the Vault’s actual decision needs this week.
- **What regime tagging CAN / CANNOT do:** CAN condition EV, route Dual46 vs JJ vs stand-down, feed Markov path MC, avoid barren eras. CANNOT predict tomorrow; soft NLP “war tension” without **market proxies** (CL, GC, DXY, VIX) is vibes, not a gate.

## 1. Likely apps matching the description

| Candidate | Covers | Free vs paid | API? | Caveats / match |
|---|---|---|---|---|
| **MACRO/SIGNAL** ([useconomichealth10.streamlit.app](https://useconomichealth10.streamlit.app/)) | FRED Fed/CPI/GDP/yields/spreads/VIX; Finnhub **econ calendar + S&P earnings + news** (geopolitics in headlines); **named market regime** + risk-on/off | Free Streamlit demo (needs Finnhub/FRED keys for self-host) | Via underlying Finnhub/FRED if you fork | **Strongest “ex-quant vibe” match** — calendar + earnings + Fed + news + regime in one UI. Not a polished product brand; may be what was forgotten. |
| **EdgeCypher** ([edgecypher.com](https://edgecypher.com/)) | AI **risk regime** (Fed/inflation/employment/stress); 1,200+/mo econ events; news + AI briefings; FOMC minutes NLP; historical event impact | Claims **100% free**, no signup to browse | Unknown / not advertised as public API | Closest **turnkey SaaS** to “regime + calendar.” AI labels are **CLAIM**, not Vault-auditable. Crypto-heavy bias in marketing. |
| **CondorEdge** ([condoredge.com](https://condoredge.com/)) | Econ calendar; **Smart Earnings**; FedWatch / net liquidity; **macro regime** (6-state Signal Engine); geopolitics via oil/Hormuz tracker; news wraps | Free browse of many dashboards; commercial API terms **unknown — verify** | Mentions tool-style endpoints (`get_economic_calendar`, `get_signal_engine`, …) | Strong institutional aesthetic; founded ~2025 — longevity/data quality unproven. Closest on **earnings + Fed + geopolitics + regime**. |
| **fffinstill** ([fffinstill.com](https://fffinstill.com/)) | Earnings calendar; FRED economic events; **macro regime detection** (yield curve, NFCI, CPI, ISM…); stock scoring | Subscriber API key; public pages browseable; pricing **unknown — verify** | REST + MCP advertised | More equity-research terminal than morning futures calendar; regime is FRED-rules based (good). |
| **Open GitHub: macro-regime-warroom** | FRED + Yahoo: yields, HY/IG OAS, VIX, MOVE, DXY, oil, SPY → RISK-ON/OFF/PANIC + “fake panic” filter | Free code | DIY | Excellent **architecture template** for option G; not a hosted calendar with earnings/news. |
| **QuiverQuant** | Alt data (Congress, lobbying, dark pool, Reddit…) — **not** Fed/econ/war calendar | Free tier + Premium ~$25/mo; API Hobbyist/Trader ~$30/$75/mo | Yes | Wrong problem for MNQ morning regime; fun but orthogonal. |
| **QuantPad** (DeltaTrend/Thomas) | Strategy IDE, MC, regime analysis, TV/Pine — **already known** | Paid product (vendor pricing) | Product-internal | Not the forgotten calendar app; evaluation-candidate only for TV-export bottleneck (`deltatrend-quant-process-event-first-workflow.md`). |
| **TradingEconomics** | World-class econ calendar + indicators | Site usable; API trial then volume pricing; platform often cited ~$199/mo class — **verify** | Yes (calendar, indicators) | Calendar accuracy high; no geopolitics NLP; weak “app vibe.” |
| **Econoday** | Professional econ calendar + commentary | Retail: Global Economics email ~$75/6mo or $120/yr; Online Calendar / API licensing **contact sales** | Widgets/API for licensees | Calendar quality; not earnings/war/news bundle. |
| **Forex Factory / FF** | USD red/orange folder — **already used** | Free | Scraping fragile; Vault uses CSV upload path | Baseline calendar; keep. |
| **Benzinga** | News, earnings, calendars, squawk | Pro ~$37 / $147 / $197/mo; news API via Massive/Polygon add-ons ~$99/mo class or enterprise | Yes (REST/WS; often via Polygon/Massive) | Excellent **news layer**; not a macro-regime classifier. |
| **RavenPack** | Institutional news NLP / event sentiment | Opaque; industry estimates **~$50k–$500k/yr** (mid often cited ~$45k) | Enterprise feed | Accurate for desks that can pay; **not viable** for Vault prop economics. |
| **Bloomberg / Refinitiv (LSEG)** | Full terminal: calendar, news, rates, geopolitics | Bloomberg ~**$31,980/seat/yr** (multi ~$28,320); Eikon/Workspace roughly **$3.6k–$22k/user/yr** | Terminal + enterprise APIs | Gold standard; cost fails Vault EV bar by orders of magnitude. |
| **MRKT Edge** | Earnings calendar with **cross-asset impact** framing | Unknown — verify | Unknown | Earnings-centric; may match “calendar with context” memory fragment. |

**Confirm with user:** paste a screenshot, domain, or “Streamlit vs polished SaaS” memory. If Streamlit + FRED gauges + earnings table → MACRO/SIGNAL. If polished AI regime meter + free → EdgeCypher. If Fed liquidity + Hormuz oil + Smart Earnings → CondorEdge.

## 2. Data-layer options (build vs buy)

For each family: **accuracy source · ≈ monthly USD · Vault integration · failure modes.**

### A. Manual journal tags (cheapest)

- **Accuracy:** Human reads FF red-folder (already auto-matched), prior-day VIX, optional oil/DXY glance; mega-cap earnings from any free calendar.
- **Cost:** $0 (time ~2–5 min/morning).
- **Integration:** Extend Dual46 / JJ journal day tags: `vixPrevClose` band, `redFolder`, `megaCapEarnWeek`, `oilShock` — already partially specified in `vol-regime-dependence-setup-frequency.md`.
- **Failure modes:** Inconsistent tagging; look-ahead if using same-day VIX close for same-day gate (use **prior close**).

### B. Free public APIs

| Source | What | Cost | Notes |
|---|---|---|---|
| **FRED** | Fed funds, NFCI, yields, CPI, unemployment, VIXCLS | $0 | Gold-standard macro series; lagged releases. |
| **CFTC COT** | Positioning (weekly) | $0 | Too slow for Dual46 day tags; optional weekly context. |
| **Treasury.gov** | Yields, auctions | $0 | Curve shape for DIY classifier. |
| **Yahoo / Cboe** | VIX, CL, GC, DXY proxies | $0 | Fragile scrapers; good enough for daily tags. |
| **Finnhub free** | News, earnings calendar (limited history), quotes | $0 @ 60 calls/min; **personal use** | Powers MACRO/SIGNAL; free econ calendar often paid-only — check current matrix. |
| **TradingEconomics free web** | Browse calendar | $0 browse; API paid | Don’t scrape if ToS forbid. |

- **Integration:** Optional nightly script writing day tags into journal / calendar-bundle JSON; Stage-0 era split columns.
- **Failure modes:** Rate limits; ToS; Yahoo breakage; Finnhub free = non-commercial.

### C. Mid-tier retail APIs

| Vendor | Approx cost (2026 public pages — **verify**) | Fit |
|---|---|---|
| **Polygon / Massive** stocks | Free → ~$29 / $79 / $199/mo; Benzinga news add-ons often ~$99/mo each | Prices + news if needed |
| **Benzinga Pro** | ~$37–$197/mo | Human squawk/news; API separate |
| **Quiver API** | ~$30–$75/mo Hobbyist/Trader | Alt data, not macro calendar |
| **Finnhub All-In-One** | Listed **$3,500/mo** on pricing page for full package — or à-la-carte ~$50/mo class in third-party summaries (**verify**) | Overkill unless bundling many endpoints |
| **Alpha Vantage** | Free 25 req/day; paid from ~$50/mo | News & Sentiment OK for hobby; not futures microstructure |

- **Integration:** Webhook/cron → journal fields; never Dual46 lock.
- **Failure modes:** Paying for news without a registered use (stand-down rules already cover red-folder microstructure).

### D. Calendar-only paid

- **Econoday** Online Calendar / API — licensing; retail email products cheap (~$10–20/mo equivalent).
- **Investing.com Pro** — calendar UX; pricing **unknown — verify**; scrape risk.
- **TradingEconomics API** — volume-priced; trial then convert.
- **Accuracy:** High for scheduled macro prints.
- **Integration:** Replace or cross-check FF CSV in `economic-calendar.ts`.
- **Failure modes:** Duplicate of free FF for Vault’s USD red-folder needs; little geopolitics.

### E. News analytics institutional

- **RavenPack / Amenity / similar:** ~$50k–$500k/yr class.
- **Bloomberg / Refinitiv:** ~$3.6k–$32k+/seat/yr.
- **Vault verdict:** **Do not buy.** Failure mode = cost dominates any plausible Dual46/`E[$/wk]` lift.

### F. Turnkey regime SaaS (EdgeCypher-like)

- **EdgeCypher, CondorEdge, fffinstill UI:** $0–unknown SaaS.
- **Accuracy:** Opaque AI/rules; not pre-registerable for Stage-0.
- **Integration:** Morning glance only; if useful, **re-implement** the *observable* proxies in Vault tags (do not import black-box labels into scorecard).
- **Failure modes:** Vendor disappears; label drift; crypto/equity bias; selection bias if you only remember days the app “felt right.”

### G. DIY classifier in Vault (recommended mid-term)

- **Inputs:** FRED (NFCI, 10y–2y, HY OAS if available) + VIXCLS + optional MOVE; day tags with **hysteresis** (e.g. require 2 consecutive days to flip HIGH↔LOW) — same spirit as open **macro-regime-warroom** / two-session commit ideas and Vault `regime-switching-monte-carlo.md` (2-state Markov, Laplace-smoothed transitions).
- **States:** Prefer **3–5 max** (e.g. LOW_VOL / NORMAL / HIGH_VOL / STRESS); avoid 6+ on a 15-trade/month system.
- **Cost:** $0 + engineering time.
- **Integration:** `dayRegimes` map for MC; Stage-0 event-study group-by; scorecard era-consistency (ties `stationarity-era-splitting-event-studies.md`).
- **Failure modes:** Threshold shopping = multiple testing; fix bands **before** looking at Dual46 PnL.

### H. Geopolitics proxies (not war NLP)

- **Rules (examples, pre-register):** `oilShock` if CL 5-day return > +X% or absolute move > Y ATR; `safeHaven` if gold + DXY both up while SPX down; `volSpike` if VIX day-change > Z% **and** credit calm → “headline panic” (warroom fake-panic idea).
- **Cost:** $0 (Yahoo/FRED).
- **Integration:** Boolean journal tags; optional Dual46 **stand-down suggestion** (discretionary sleeve / ops), never lock edit.
- **Failure modes:** Proxy lag; false positives on OPEC meetings; NLP war scores without price confirmation = soft.

### I. Earnings regime for NQ (not bank earnings alone)

- **Tag:** `megaCapEarnWeek` = true if AAPL/MSFT/GOOGL/AMZN/META/NVDA (and optionally AVGO/TSLA) report Mon–Fri of that week; optional `bankEarnWeek` for JPM/BAC/etc. as secondary.
- **Why:** NQ/MNQ reacts to mega-cap guidance more than regional banks; bank week is a weak proxy for Nasdaq regime.
- **Cost:** $0 (Finnhub free earnings calendar or public calendars).
- **Integration:** Journal + Stage-0 split; JJ Fair-Value may care more about open-drive days inside mega-cap weeks.
- **Failure modes:** After-hours vs next-RTH attribution; tagging the wrong week.

### J. Hybrid: human morning brief + auto tags

- **Workflow:** Auto-compute A/G/H/I tags overnight; human 60-second confirm (“any one-off? Fed speakers?”) into journal note.
- **Cost:** $0–$50/mo if one API key for earnings/news convenience.
- **Integration:** Best accuracy/effort for Vault; matches existing `/news` + journal SOP.
- **Failure modes:** Human skips days → missing tags; mitigate with “untagged = exclude from regime splits.”

## 3. Viability for Dual46 + multi-strategy lifespan

### What regime tagging CAN do

- Condition **Stage-0** event EV±CI by pre-registered regime (see kill lessons: era/regime splits beat pooled WR/RR stories).
- **Route sleeves:** Dual46 on goldilocks vol / non-hostile news; JJ Fair-Value on open-drive / FV days; **stand-down** on red-folder microstructure windows (`ops-news-print-microstructure-stand-down.md`) or extreme stress tags.
- Supply **regime-switching MC** inputs (`dayRegimes` + transition matrix from long VIX history; trade distributions from tagged ledger).
- Extend **strategy lifespan** by not forcing one edge through barren regimes — multi-product book, not one script for all weather.

### What it CANNOT do

- Forecast tomorrow’s direction or guarantee pass rates.
- Replace path MC / `E[$/wk]` with a regime story.
- Make NLP “geopolitical tension” a hard gate without measurable proxies.
- Justify reopening killed Track B via “new regime costume.”

### Doctrine (hard)

| Rule | Meaning |
|---|---|
| Regime = **context feature / gate** | Never a Dual46 lock parameter change |
| Pre-register definition | Bands/rules written before looking at sleeve PnL |
| Era-split | Calendar-year + regime overlap checks (`stationarity-era-splitting-event-studies.md`) |
| One Stage-0 at a time | Regime work does not spawn parallel candidates |
| CLAIM vs EVIDENCE | Vendor AI regimes = CLAIM until Vault ledger shows lift |

### Decision table — investment → expected Vault payoff

| Investment | ≈ $/mo | Expected payoff for Vault |
|---|---|---|
| **$0 DIY tags** (VIX + red-folder + mega-cap week + oil shock) | 0 | **High** — enables regime MC + Stage-0 splits immediately |
| Finnhub free / FRED scripts | 0 | **Medium-high** — automates A/I; ToS personal-use |
| EdgeCypher / CondorEdge glance | 0 | **Low-medium** — morning context only; do not scorecard their labels |
| Benzinga / Polygon news | 40–200 | **Low** unless squawk replaces human news SOP |
| Quiver / alt data | 25–75 | **Near zero** for MNQ morning Path B |
| Econoday / TE API | 10–200+ | **Low** — FF already covers red-folder |
| RavenPack / Bloomberg | 3k–40k+ | **Negative EV** at prop scale |

## 4. Recommended ladder (concrete next steps)

### Phase 0 — this week ($0) — MINIMUM viable MNQ morning regime set

Log on every Dual46 / JJ / walk day (prior-day where noted):

1. **`vixPrevClose` tercile** — use pre-registered bands from vol note: **&lt;16 / 16–20 / &gt;20** (prior close only).
2. **`redFolder`** — already from FF calendar bundle / journal auto-match (USD high-impact).
3. **`megaCapEarnWeek`** — binary: any of AAPL, MSFT, GOOGL, AMZN, META, NVDA reporting that calendar week.
4. **`oilShock`** — binary: e.g. \|CL 1-day %\| ≥ 3% **or** 5-day % ≥ 8% (pre-register exact thresholds before use; adjust once, then freeze).

Optional fifth (still $0): **`or30ratio`** (09:30–10:00 MNQ range ÷ 20-day median) — already recommended in vol-regime note.

No SaaS. No Dual46 rule change. Tags only.

### Phase 1 — automate ($0–$50/mo)

- Script FRED VIXCLS + Finnhub earnings week flag into journal JSON.
- Keep human confirm for red-folder edge cases / FOMC day-before.

### Phase 2 — DIY 2–3 state classifier (engineering backlog)

- Observable proxy HMM-lite / threshold + hysteresis → `dayRegimes` for `monte-carlo.ts` regime bootstrap.
- Adopt as scorecard default only if bust/`E[$/wk]` p05 moves beyond seed noise (rule already in regime-MC note).

### Phase 3 — paid feeds only if EV justifies

- Only after Phase 0–2 show a **regime with material negative Dual46 EV** that a paid news feed would have flagged earlier **and** a cheaper proxy would not. Until then: **do not subscribe**.

## APPLICATION TO THE VAULT

1. **Forgotten app:** treat **MACRO/SIGNAL**, **EdgeCypher**, and **CondorEdge** as top confirm-with-screenshot candidates; do not block work on naming.
2. **This week:** implement Phase-0 four tags on Dual46 + JJ journals; reuse `/news` red-folder; do not buy SaaS.
3. **Multi-strategy lifespan:** use tags to **route** Dual46 vs JJ vs stand-down and to **split Stage-0 / MC** — that is the product architecture; one strategy fighting all regimes is the anti-pattern kill lessons already encode.
4. **Freeze guardrail:** zero Dual46 lock edits; regime findings → post-May backlog / Stage-0 only; JJ remains a separate product exploration (`jj-simon-fair-value-930-strategy.md`).
5. **Cross-refs:** `vol-regime-dependence-setup-frequency.md`, `regime-switching-monte-carlo.md`, `intraday-regime-detection-session-selection.md`, `ops-news-print-microstructure-stand-down.md`, `ict/red-folder-playbooks-1000-window.md`, `stationarity-era-splitting-event-studies.md`, `historical-data-vs-live-markets.md`, kill-lessons-track-b.md.

## Sources

1. EdgeCypher — https://edgecypher.com/
2. CondorEdge — https://condoredge.com/ ; Smart Earnings — https://condoredge.com/stocks/smart-earnings ; LinkedIn Signal Engine post (6 regimes)
3. MACRO/SIGNAL Streamlit — https://useconomichealth10.streamlit.app/
4. fffinstill economic events / about — https://fffinstill.com/economic-events ; https://fffinstill.com/about
5. DarkPassenger111/macro-regime-warroom — https://github.com/DarkPassenger111/macro-regime-warroom
6. Quiver Quantitative pricing summaries — https://www.findmymoat.com/tools/quiver-quantitative ; https://api.quiverquant.com/mcp-server/
7. Trading Economics API — https://tradingeconomics.com/api/ ; https://tradingeconomics.com/api/pricing.aspx
8. Econoday retail — https://shop.econoday.com/products/global-economics-subscription ; https://www.econoday.com/retail-investor-solutions/
9. Benzinga Pro pricing — https://www.benzinga.com/pro/pricing ; Massive/Benzinga partner — https://massive.com/partners/benzinga
10. Finnhub pricing — https://finnhub.io/pricing
11. Polygon/Massive vs Alpha Vantage 2026 — https://tradingdatacompare.com/providers/polygon-io/ ; https://tradingdatacompare.com/compare/alpha-vantage-vs-polygon-io/
12. RavenPack cost class — Datarade / vendor comparisons (opaque; estimates $50k–$500k/yr) — https://datarade.ai/data-providers/ravenpack/profile ; paperswithbacktest alt-data comparison
13. Bloomberg Terminal ~$31,980/seat/yr (2026 industry reports) — https://costbench.com/software/financial-data-terminals/bloomberg-terminal/
14. Refinitiv Eikon / LSEG range — https://costbench.com/software/financial-data-terminals/refinitiv-eikon/
15. FRED — https://fred.stlouisfed.org/
16. MRKT Edge earnings calendar — https://www.mrktedge.ai/features/earnings-calendar
17. Vault cross-refs listed in APPLICATION §5
18. DeltaTrend/QuantPad context — `deltatrend-quant-process-event-first-workflow.md`
