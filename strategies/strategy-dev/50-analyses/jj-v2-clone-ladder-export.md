---
updated: 2026-08-02
tags: [jj-simon, stage-0, export, v2]
---
# JJ-FV v2 — clone ladder export card

> Pine: `pine/JJ_P2_MR_measure_v2.pine`  
> Spec: [[../60-track-b/jj-p2-mr-fair-value-v0]]  
> Why: [[jj-simon-trade-dissection-vs-vault]]  
> Prior away: v0 · F1–F3 ([[jj-f1-f2-f3-12m-verdict-2026-08-02]])

## What changed vs v1

| v1 (wrong) | v2 (clone) |
|---|---|
| Counter-wick ≤20% = displacement | **Body > prior body** |
| FV frozen at 9:30 | 9:30 + **2pm** + **consol BOS reprice** |
| No open-color | **OC** on session open bar |
| P1 = 15m disp away | Cont **5m** then MR (his timing) |
| Max 5/day · no pyramid | Max **10**/day · C2 pyramid 2 |
| AM only | AM + PM window |

## Exact TV steps

1. `CME_MINI:MNQ1!` · **1 minute**.  
2. Remove old JJ-FV v1 if present. Add `JJ_P2_MR_measure_v2.pine`.  
3. Strategy Tester → Deep Backtest → ~**12 months** (same window as F1–F3 if possible).  
4. Profile **C1** → List of Trades → CSV →  
   `vault-app/data/tv-exports/matrix/jj-c1-clone-mnq-1m-12m.csv`  
5. Switch profile **C2** → same range → `jj-c2-layer-mnq-1m-12m.csv`  
6. Switch profile **C3** → same range → `jj-c3-msb-mnq-1m-12m.csv`  
7. Ping agent (or run):  
   `npx tsx scripts/analyze-event-study.ts jj-c1-clone-mnq-1m-12m.csv`  
   (repeat per file)

Risk leave at **$300 MNQ** so ledgers compare to F1–F3. Optional later: NQ $20/pt A/B — new filenames only.

## SCORECARD gate

| Verdict | Action |
|---|---|
| toward (EV>0, OOS holds) | Apex path MC · still no live until MC |
| away / soft-drain | Harvest · do not promote · do not chase RR |
| C2 only wins via pyramid noise | Treat as fragile — prefer C1/C3 |

## Do not

- Live Apex on JJ before toward + path MC  
- Merge into Dual46  
- Retune 1.5R / ATR tiers mid-flight to force a pass  
