---
topic: nwog-published-statistics
researched: 2026-07-18
sources: 7
agent-cycle: cycle3-laneC
---
# NWOG-Adjacent Published Statistics — Calibrating the Sleeve Census Columns

Extends `nwog-ndog-opening-gaps.md` (definitions + the 60.3% headline). This note collects **every citable number** relevant to opening-gap behavior and maps each onto the NWOG-tap sleeve census columns (gap pts, age, tap location). Headline honesty first: **no published study measures the actual NWOG** (Friday 17:00 → Sunday 18:00 Globex void). Everything below is adjacent-object data (RTH daily gaps, weekend RTH gaps, equity overnight gaps) — useful for *column design and priors*, never for sleeve expectancy.

## Key findings

- **Gap size is the dominant conditioner in every dataset that publishes a split.** TradingStats (NQ RTH gaps, 2,791 days 2015–2025): 100%-fill-by-close = **77.8% for tiny (<0.3× daily ATR), 42.0% small (0.3–0.7×), 25.6% medium (0.7–1.2×), 8.2% large (>1.2×)**. Independent equity study (65,505 overnight gaps, 99 S&P constituents, 2021–24): <1.5% gaps fill same-day 72%, >4% gaps 15%, with sharp non-linear decay between — **two unrelated datasets, same shape**. Any NWOG census result not conditioned on size is uninterpretable.
- **Partial fill ≫ full fill:** TradingStats threshold table (by close): 25% fill 86.6% · 50% fill 76.1% · 75% fill 68.0% · 100% fill 60.3%. The 50%-fill row is the closest published proxy for "price reaches CE" — **~76% touch-the-midpoint vs ~60% full fill** on daily RTH gaps. This is the first data-adjacent support for the ICT CE emphasis (still not NWOG-specific).
- **Day-of-week structure exists and Monday is the outlier:** fills by day — **Mon 53.9% (lowest), Tue 62.8%, Wed 63.5% (peak), Thu 62.4%, Fri 58.8%**. TradingStats' reading: Monday gaps carry genuine weekend sentiment (more often "true" moves). Practitioner corroboration (TraderVerdict): "Monday gaps on NQ tend to be noisier than Tuesday–Thursday gaps."
- **Fill timing is violently front-loaded** (TradingStats 5-min study, 839 NQ fill-days): of gaps that fill, **34% fill in the first 5-minute RTH candle, 61% by 30 min in, 91% by noon; median fill ≈ 17 min after the open**. If a gap hasn't filled by ~2.5h in, the remaining same-day odds are small. NQ fills faster than ES at every horizon (+4–9 pts).
- **Direction context:** gaps *opposed* to the weekly move fill slightly more (62.3%) than *aligned* gaps (58.5%); gaps opening inside the prior day's range fill far more than outside-range "true" gaps (up to 93% best-case vs 8% worst-case).
- **Weekend-gap-specific numbers are weak:** completetradersedge claims ES/NQ weekend gaps fill within the week "approximately 70–80%" — **no methodology published**, folklore-adjacent; the best-sourced weekly-scale number remains TradingStats' *weekly open revisited later in the week 69.7%* (394/565 weeks — adjacent to but not identical with NWOG fill). FX weekend-gap studies exist (gaps on ~20–25% of Monday opens) but don't transfer to index futures.
- **Age decay: no published data at all.** Nobody has measured NWOG reaction quality vs gap age (days/weeks since printed). The community convention of keeping 4–10 NWOGs because "old gaps still react" is unmeasured. The census `age` column will be **first-of-its-kind** — as was the June respect-rate tally.

## Details / mechanics — census column calibration

| Census column | Published prior to steal | Design implication |
| --- | --- | --- |
| **Gap size (pts)** | Size quartiles dominate everything (78→8% swing) | Log size in *both* points and **×daily-ATR** (breaks at 0.3/0.7/1.2×) so June/May rows can be binned against the published shape; a raw-points column alone won't compare across vol regimes |
| **Tap location (edge / CE / quadrant)** | 50%-fill (CE-touch proxy) ~76% vs full-fill ~60% on daily gaps; CE-reactivity claims are otherwise folklore | Keep edge-vs-CE as separate outcomes; expect CE touches to be common — the sleeve question is *reaction quality at the touch*, which no dataset measures |
| **Age (days since printed)** | None exists | Free first-of-its-kind data; also log *how many older NWOGs sit between price and the tapped one* (stacking) |
| **Day-of-week of tap** | Mon 53.9% … Wed 63.5% fill; Monday = genuine-move day | Split census by DOW from day one; a Monday NWOG that *holds* (doesn't fill) is statistically the least surprising — consistent with Monday 2W/0L reading Monday moves as real |
| **Aligned vs opposed** (gap direction vs weekly drive) | Opposed 62.3% vs aligned 58.5% | One boolean; cheap |
| **Time of tap** | Fill timing front-loaded (34% first 5 min of RTH) — daily-gap data, but the mechanism (open-auction repricing) applies | Taps in 9:30–10:00 are the highest-traffic window; sleeve entries near 10:00 are structurally where the action already is |

### Evidence-grade table
| Number | Source & object | Grade |
| --- | --- | --- |
| Size quartiles 77.8/42.0/25.6/8.2% · thresholds 86.6/76.1/68.0/60.3% · DOW 53.9–63.5% · aligned/opposed | TradingStats, NQ **RTH daily gaps**, 2,791 days, methodology published | Best available; wrong object (not NWOG) |
| 34% first-candle, 61% by 30min, median ~17min | TradingStats timing study, 839 NQ fill-days | Good; conditional on fill happening |
| 72%/15% by magnitude, non-linear decay | 65,505 equity overnight gaps 2021–24 | Good; different asset class, confirms the shape |
| Weekend gaps fill in-week 70–80% | completetradersedge | **Uncited — do not use** |
| "CE tested 60–70%", "NWOG 70–80% partial fill" | arongroups et al. | **Folklore — flagged in the base note, still no methodology** |
| NWOG respect-rate by size/age/tap-location | **nowhere** | The census is the only path |

## APPLICATION TO THE VAULT

1. **Add the ×ATR size bin to the census now, before May replay resumes** — it is the one column change that lets Vault rows be compared to any published number, and every study says it will dominate the verdict. The June missed ~200–250pt reversal should be re-annotated with its gap's ATR multiple.
2. **Expect size-dependence in the sleeve verdict and pre-commit to reporting it:** a pooled "NWOGs respected X%" number would repeat the mistake the published data warns about (60.3% headline hiding a 78-vs-8 split). SCORECARD entry for the sleeve should carry size-binned rows even at tiny n.
3. **Monday census rows are special:** published Monday gaps are the least likely to fill (genuine weekend sentiment). For the sleeve this cuts both ways — a Monday NWOG *edge hold* is more meaningful (the gap "wants" to stay open); a Monday *fill-and-reverse* is fighting the strongest trend-day base rate. Tag Monday taps; don't pool.
4. **CE columns get a prior, not a verdict:** ~76% of daily gaps at least touch 50% — so "price reached CE" is near-baseline behavior, and the sleeve's edge (if any) lives in the *reaction* at the touch, not the touch itself. This confirms the base note's instruction to log which level was tapped AND what happened next.
5. **Age decay stays a Vault exclusive.** Keep 4–10 NWOGs on chart per community convention, log age per tap, and after ~30 taps the census will hold the only age-decay estimate in existence. Do not import any assumed decay into the prop math meanwhile.

## Sources

1. TradingStats — Gap Fill Strategy, NQ 2015–2025, 2,791 days (thresholds, size quartiles, day-of-week, aligned/opposed, methodology table) — https://tradingstats.net/gap-fill-strategy/
2. TradingStats — When Do Gaps Fill? ES & NQ 5-min timing (803 ES / 839 NQ fill-days; front-loading; median fill time) — https://tradingstats.net/when-do-gaps-fill/
3. TradingStats — Weekly mean reversion, 565 NQ weeks (weekly open revisited 69.7%) — https://tradingstats.net/mean-reversion-trading-strategy/
4. mental-momentum research — Overnight & weekend gap risk across asset classes (65,505 equity gaps 2021–24; magnitude decay table; FX weekend-gap frequency) — https://research.mental-momentum.ai/r/overnight-weekend-gap-risk-across-asset-gk11qu
5. completetradersedge — CME gaps guide (the uncited 70–80% weekend-gap claim, flagged) — https://completetradersedge.com/cme-gaps-trading-guide/
6. TraderVerdict — Gap trading in futures (Monday-noise practitioner observation; "gap fill" definition pitfalls worth copying into census spec: touch vs trade-through vs close-beyond) — https://traderverdict.com/blog/gap-trading-futures
7. Cross-ref: `ict/nwog-ndog-opening-gaps.md` (definitions, ICT-canon claims, folklore flags)
