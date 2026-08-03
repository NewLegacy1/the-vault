---
updated: 2026-08-02
tags: [jj-simon, stage-0, frequency, diagnosis]
---
# JJ-P2-MR v0 — frequency diagnosis + first SCORECARD

> CSV: `matrix/jj-p2-mr-mnq-1m-12m.csv` (user export 2026-08-02, ~365d)  
> Spec v0: [[../60-track-b/jj-p2-mr-fair-value-v0]] · Event study: [[event-study-jj-p2-mr-mnq-1m-12m]]

## SCORECARD (v0 mechanical)

| Metric | Value |
|---|---|
| n | **117** (~0.45 fills / trading day) |
| WR | **40.2%** |
| RR | **1.43** |
| EV/trade | **−$7.26** CI covers 0 |
| Verdict | **away** — soft-drain geometry (meta #15 cousin) |

Matching JJ’s *claimed* WR (~57%) is **not** what this ledger shows. Geometry matches the Track-B trap band more than his montage.

## Why 117/year ≠ “3–15 trades/day”

| Our v0 freeze | What JJ does on video |
|---|---|
| **Max 1 trade / day** | Many entries / day; layers; multi-account “trades” |
| **P2 only** (09:45–11:00) | P1 continuation first ~5–15m **plus** P2 |
| **MSB + displacement both required** | Often **displacement alone** (“body bigger than prior”) |
| Extension ≥ **0.5×ATR** from FV | More aggressive; sometimes immediate |
| Pivot = **5-bar** confirmed swing | Discretionary structure / wick breaks |
| NY AM only | + 2pm FV, Asia, news FV resets |
| Single MNQ ledger | Copy across many prop accounts |

Third-party write-ups already flag **“20–30/day” as marketing**; mechanical docs cluster nearer **~2–4/session** when strict. Our 1/day cap alone caps ~252 fills/year theoretical max — we got 117 because MSB+ext filters fire ~half of days.

**v0 is not “JJ live.”** It is the *strictest measurable P2 slice* — correct for Stage-0 honesty, wrong as a frequency clone.

## Can we “get it working”?

Two different goals:

1. **Match JJ cadence** → loosen event definition (new Stage-0 profiles below).  
2. **Positive EV under prop rules** → cadence only helps if EV/trade > 0. **More fills of −$7 EV = faster bust.**

So: raise frequency **and re-score**. Do not spam the same losing book.

## Pre-registered frequency ladder (next exports)

Each profile = **new CSV name**. Do not sweep mid-flight.

| ID | Change vs v0 | Expected cadence class | Save as |
|---|---|---|---|
| **v0** (done) | 1/day · MSB+disp · P2 | ~0.5/day | `jj-p2-mr-mnq-1m-12m.csv` |
| **F1** | Max **5** trades/day · same triggers | ~1–3/day | `jj-f1-multiday-mnq-1m-12m.csv` |
| **F2** | F1 + **displacement only** (MSB OFF) | Higher | `jj-f2-disp-only-mnq-1m-12m.csv` |
| **F3** | F2 + **P1 ON** (09:30–09:45 cont away from FV) | Closest to his AM story | `jj-f3-p1p2-mnq-1m-12m.csv` |

Pine: `pine/JJ_P2_MR_measure_v1.pine` (profile inputs). Kill each on EV / soft-drain independently.

## Implication for Apex

v0 **away** — do not live-trade this sleeve on the eval. F1–F3 are research only until a profile clears toward + path MC.
