---
updated: 2026-07-20
tags: [morningstar, dual46, harvest, may-2026, manual-study, regime-tags]
---
# Dual46 · May 2026 harvest — IN PROGRESS (started 2026-07-17)

> Chart + journal study only — **not** Lab MC. Freeze: [[morningstar-dual46-lock]].
> Fills monitored live-style in replay. Second walk month (June complete:
> [[morningstar-dual46-june-week1-harvest]]). Limits pre-staged from day one per the
> June capture-arc lesson. P&L canvas updated 2026-07-20 alongside this note.
> JJ Fair-Value is a **separate** product exploration — not this walk
> ([[../../knowledge/quant/jj-simon-fair-value-930-strategy]]).

## Count (5 rows · sessions 05-01 → 05-06)

| **Script arms (the real Dual46 sleeve)** | **0** — no arms yet |
| Discretionary takes | 1 (0W / 1L) |
| No fill | 1 (05-05 — limit sat right on the 10AM line) |
| Skipped / no setup | 3 (05-01 ×2 rows, 05-04) |

## Ledger @ 10 MNQ ($20/pt) · gross, no fees

| Date | Src | Side | Tag | Stop | RR | Out | Pts | P&L |
|---|---|---|---|---|---|---|---|---|
| 05-01 Fri | — | — | — | — | — | no setup (2 rows: NWOG above·filled + inside·filled) | 0 | $0 |
| 05-04 Mon | — | — | — | — | — | no setup | 0 | $0 |
| 05-05 | disc | S | Judas · OTE+KO | 12.25 | 1:4.22 | no fill — limit on the 10AM line itself | 0 | $0 |
| 05-06 | disc | S | Judas · OTE+KO | 13 | 1:4.56 | LOSS — filled perfectly, ran ~+$990 MFE, returned to SL | −13 | −$260 |

**May running: −13 pts → −$260 gross @ 10 MNQ** · takes 0W / 1L · **script sleeve 0 arms / 0 fills**
(the −$260 is discretionary-sleeve only — Dual46 scorecard unchanged at June's 2W/0L on 2 fills)

## Phase-0 regime tags (backfill · Yahoo ^VIX · 2026-07-20)

Pre-registered bands from [[../../knowledge/quant/vol-regime-dependence-setup-frequency]]:
prior-day VIX **&lt;16 / 16–20 / &gt;20**. Oil shock frozen: **|CL 1d|≥3% OR |CL 5d|≥8%**.
Mega-cap week = any of AAPL/MSFT/GOOGL/AMZN/META/NVDA reporting Mon–Fri of that week.
App fields live on Dual46 form + edit panel (`vixPrevClose`, `megaCapEarnWeek`, `oilShock`, `or30ratio`).

| Session | Prior VIX close | Band | Mega-cap earn week | Oil shock | OR30 ratio |
|---|---|---|---|---|---|
| 05-01 Fri | 16.89 (Apr 30) | 16–20 | **Y** (MSFT/META Apr 29 · AAPL Apr 30) | unset — check CL | unset (chart) |
| 05-04 Mon | 16.99 (May 1) | 16–20 | N | unset | unset |
| 05-05 | 18.29 (May 4) | 16–20 | N | unset | unset |
| 05-06 | 17.38 (May 5) | 16–20 | N | unset | unset |

All four logged sessions sit in the **16–20** band — no early-May excuse that “May was a different VIX month” at the day level either (month means were already ~identical to June).

**Human edit pass:** open each May row in F5 Journal → paste VIX prior close + mega-cap Y/N chips → save. OR30 needs the 09:30–10:00 MNQ range vs 20-session median from chart/replay. Oil shock needs one CL glance per day.

## Week breakdown (fills in as the walk advances)

| Week | Sessions logged | Takes | P&L |
|---|---|---|---|
| W1 (05-01 Fri) | 1 | 0 | $0 |
| W2 (05-04 → 05-08) | 3 so far (Mon–Wed) | 0W / 1L | −$260 |

## Patterns — too early (n=1 take); what to watch

- **New census columns are the point of this month**: MFE (R), 5m-confirm Y/N, NWOG gap
  in ×dailyATR. They decide open research questions — structural-TP vs 1:5 cap comes free
  from the MFE column (median MFE vs +5R), Powell 5m-confirm hybrid needs the Y/N log.
- **05-06 is already an MFE data point**: 13-pt stop, ran ~+$990 (≈ +3.8R at $20/pt)
  before returning to the stop. Exactly the trade the MFE column exists to count —
  log `mfeR` on every take going forward (field was empty on this row).
- **05-05 no-fill echoes June's limit-placement arc**: limit rested exactly on the 10AM
  KO line; a few ticks below (or the 1m OB/RB at KO3) fills it. Placement precision, not
  setup quality, is the variable again.
- **Both real setups so far are Judas · OTE+KO shorts** — A+ grade frequency (~1/week in
  June) holding early.
- NWOG census columns (pos + filled split) are populated on all 5 rows; gap-pts / tap-loc /
  ×dATR not yet — start filling per the census spec in the June note.
- Mondays: 05-04 no setup (June went 2/2 on Mondays — keep tracking the un-skip case).
- **Regime:** early May is goldilocks-mid VIX so far; frequency/quality splits wait until
  bands diversify (and n≥10 per band before %).

## May logging additions in effect

ATR (pts), entry time, NWOG position + filled as separate fields, news auto-match
(red-folder event/time), MFE (R), 5m confirm, daily ATR, **plus Phase-0 regime**:
`vixPrevClose` (auto-bands), `megaCapEarnWeek`, `oilShock`, `or30ratio`.
Schema live; per-trade fields still thin on early rows — fill at log time.

## Status

- **Walk in progress** — no verdicts, no prop math, one open Stage-0 discipline holds.
- Script sleeve: waiting for first May arm.
- Regime Phase-0: **form shipped + VIX/mega-cap backfill table above**; oil + OR30 still human.
- Canvas [dual46-june-pnl-10mnq] updated 2026-07-20 with May regime strip;
  not a milestone, no archive snapshot taken (June archive already at
  [[../55-canvas-archive/dual46-june-2026-pnl]]).
- **Next session to log:** 05-07 Thu (continue May walk) — tag regime at log time.
