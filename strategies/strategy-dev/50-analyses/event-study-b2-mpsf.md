---
updated: 2026-07-15
status: stage-0-open
tags: [stage-0, event-study, track-b, b2, strategy-dev]
---
# Event study — B2 Morning PD Sweep Fade

> Pre-registered **before** measuring. Events ≠ signals.  
> Parent: [[track-b-b2-mpsf-v0]] · Painter: `pine/TrackB_MPSF_events_v0.pine`

## Meta

| Field | Value |
|---|---|
| Idea class | MR |
| Purpose tags | event: PDH/PDL sweep+reclaim · context: ATR frac · outcome: barrier 1.5R |
| Instrument / TF | MNQ · 5m |
| Pre-registered date | 2026-07-15 |
| Artifact JSON | *(pending first export)* `vault-app/data/tv-exports/event-study-b2-mpsf.json` |

## Model / edge (predictive claim)

Overnight extremes that **fail in the first 30 minutes of RTH** mean-revert into the prior-day range more often than chance, net of tight stops.

### Event-defining feature

| Field | Value |
|---|---|
| Definition | 09:30–10:00 NY: sweep PDH or PDL by ≥4 pts then close back inside |
| Value type | binary (long reclaim / short reclaim) |
| Transform | none |
| Expected frequency band | ok (~0.3–1.0 / week) — kill if &lt;40 / 3y or &gt;3 / day |

### Outcome label

| Field | Value |
|---|---|
| Kind | barrier (stop / TP 1.5R) · time stop 11:30 |
| Spec | Stop beyond extreme+1; TP entry±1.5R; flat 11:30 |

### Contextual features (pre-registered)

1. ATR(14)/close ≤ 0.012 at event bar (trade) else stand-down that event  
2. Monday skip ON vs OFF (A/B after primary)  
3. *Not* Jul/Oct in v0 — measure raw independence from PRB gate  

## Execution / risk protocol (only after edge evidence)

$150 risk · max 25 pt stop · 1/day · see [[track-b-b2-mpsf-v0]].

## Results (fill after measurement)

| Window | n | EV | EV CI 95% | Median | Verdict |
|---|---:|---:|---|---:|---|
| Full | | | | | |
| IS (&lt;2025-07-14) | | | | | |
| OOS (≥2025-07-14) | | | | | |
| Random baseline | | | | | |

Footnotes only: WR / RR / SD.

## Four gates

| Gate | Result | Artifact |
|---|---|---|
| IS excellence | pending | |
| IS price-perm | pending if minSweepPts searched | [[permutation-tests]] |
| Walk-forward | pending | |
| WF price-perm | pending | |

## How to collect Stage-0 data (Deep Backtest — do this)

You need a **List of Trades** CSV so we can run EV ± CI (IS/OOS). Use the **measure** strategy (same rules as the painter).

### Script

`pine/TrackB_MPSF_measure_v0.pine` — paste as a **new** strategy on TradingView.

### Lock these inputs (pre-registered — do not retune for Stage-0)

| Input | Value |
|---|---|
| Min sweep | **4** |
| Event window | **930 → 1000** |
| Flat by | **1130** |
| Skip Mondays | **ON** |
| ATR length | **14** |
| Max ATR/Close | **0.012** |
| Stop buffer | **1** |
| Max stop | **25** |
| Target R | **1.5** |
| Risk USD | **150** |
| Point value | **MNQ ($2/pt)** |

### Deep Backtest settings

| Field | Value |
|---|---|
| Symbol | **MNQ1!** (CME_MINI continuous) |
| Timeframe | **5 minutes** |
| Range | **2023-07-01 → today** (Deep Backtest) |
| Commission | keep Pine default (~$0.62/ctr) |

### Export

1. Strategy Tester → **List of trades** → Export CSV.  
2. Save as:  
   `vault-app/data/tv-exports/matrix/trackb-mpsf-3y.csv`  
3. Optional second export for density check only: chart with `TrackB_MPSF_events_v0` and note Events count from the table (no CSV needed).

### What I will run after you drop the file

```text
npx tsx scripts/analyze-event-study.ts   # pointed at trackb-mpsf-3y.csv
```

Then fill [[event-study-b2-mpsf]] SCORECARD toward / away / kill.  
**Do not** Lab-promote or live-trade MPSF until that closeout is **toward**.

### Kill checks before you even export

- Painter table shows **&lt;40** events on a full 3y chart load → likely too thin; still export, we may kill on n.  
- Events look like **every other day** spam → stop; raise minSweep only after we document a new Stage-0 note (don’t silently retune).

## Scorecard closeout

- [ ] toward / away / kill — [[SCORECARD]]  
- Pine promote / Lab MC allowed? **only if** toward + loss shape holds  
