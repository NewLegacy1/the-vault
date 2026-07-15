---
phase: funded
updated: 2026-07-14
tags: [playbook, funded, strategy-dev]
---
# Funded-phase playbook

> **Goal:** Maximize **weekly edge** on TPT PRO. Survive intraday trail; withdraw at $52k; **recycle before PRO+** ($5k cumulative). See [[tpt-rules]].

## PRO vs eval — rule change that matters

| | Eval (test) | PRO (funded sim) |
|---|---|---|
| DD | EOD trailing | **Intraday** trailing (unrealized counts) |
| Consistency | 50% + 5 min days | **None** |
| Sizing | Cap wins for consistency | **Scale RR / size** after cushion |
| Exit | Pass at ~$4k net | Withdraw 80% above **$52,000** balance |
| Avoid | Bust on 2–3 losses | PRO+ at **$5,000** cumulative — recycle instead |

## Recycle-before-PRO+ strategy

1. Pass eval with distributed days (PRB BE@2R or successor).
2. Week 1 PRO: baseline risk, BE at +1R (intraday peak is the enemy).
3. After +$1k–$1.5k cushion vs peak: allow higher R and stepped contracts (no consistency cap).
4. Target **$2k–$4.5k** realized; hit buffer, withdraw 80%, start fresh test — do not accept PRO+ invite.

## Winning formula candidates

### Macro Model (time-window edge)

**v1.4 A-tier only** is the leading hypothesis — see [[findings-macro]] tier table.

| Tier | Role | Status |
|---|---|---|
| **A** (TS only, 40pt TP) | Primary funded candidate | +$4,966 on 14 trades in v1.4 year |
| A+ (TS+SMT, 50pt TP) | **Under review** — net −$2,410 | Test 40pt TP on A+ (roadmap 2.1) |
| H (half risk) | Optional add-on | Low sample |

### PRB runners (structure edge)

- Trail 2.0/1.5 in **give-back / runner** regimes only — not permanent.
- See `prb-v15-trail` preset (phase: funded).

## Metrics that matter (not eval metrics)

| Metric | Why |
|---|---|
| Weekly edge $ | `expectancy × trades/week` |
| Avg win / avg loss | Funded can tolerate lower WR if R is right |
| Max DD vs growing trail | Less brittle than eval's fixed $2k |

## Income acceleration — M-series (Track 4.1)

**Priority funded R&D.** Pine: `Macro_Model_v2.pine` · Lab: **Macro income · M0 / M1 / M2**.

| Order | TV Profile | Lab row | Question |
|---|---|---|---|
| 1 | M0 | M0 · $400 · BE OFF | Does $400 alone raise pass vs B0 $800? |
| 2 | M1 | M1 · $400 · BE@2R | Does BE@2R cut busts without killing edge? |
| 3 | M2 | M2 · Volume · BE@2R | Can TS-optional restore v1.2-class frequency? |

Do **not** hybridize (H0/H1) until M1 settles. Full TV recipe: `pine/PINE_GUIDE.md` → Macro Model v2.

## What to run in F4 LAB

1. Strategy preset: `matrix-m1` (primary) or other `macro-*` / matrix B rows (phase **funded**)
2. Upload TV CSV from Macro_Model_v2 profile export (or `macro-v1.4-premium-merged.csv` for tier filters)
3. RUN → cohort saves to `strategies/cohorts/funded/`

## Tier-filter experiments (no re-export needed)

Filter `macro-v1.4-premium-merged.csv` by `tier` column:
- A only → re-run MC
- Drop A+ and H → compare pass rate vs full book

## Promotion to funded live

Higher bar than eval: positive tier-level net · MC pass competitive at **scaled risk** · uncorrelated with eval strategy days.

## Links

- [[findings-macro]]
- [[Macro_Model_SOP]]
- [[prop-firm-math]]
