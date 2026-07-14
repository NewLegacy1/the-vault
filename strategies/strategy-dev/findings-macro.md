---
strategy: Macro Model
updated: 2026-07-14
tags: [findings, macro, strategy-dev]
---
# Macro Model — Settled findings & winning trade formula

> Source of truth for Macro Model evolution (v1.2 → v1.4). Update after every settled cohort.

## Winning trade formula (current: v1.4)

- **Window:** ICT macro 9:50–10:10 · staging DOL sweep 9:30–9:45
- **Trigger:** Turtle soup **required** (consumed levels, vault-style) · CE confirm entry (tap + lift)
- **SMT role:** boosts TP (50pt vs 40pt), does **not** gate entry
- **Risk tiers (encoded in Pine entry IDs → CSV Signal column):**
  - `_AP` (A+): TS + SMT at sweep · TP 50
  - `_A` (A): TS only · TP 40
  - `_H` (half): wick 56–80pt → half risk · skip wick >80 without SMT
- **Risk:** $800 full / $400 half · max stop 80pt (inclusion filter, not live risk mgmt)
- **Sizing basis:** MES1! pointvalue for MNQ · pivot 5 (marginal vs 10 — only +1 trade)

## Version history (TPT $50K MC, 2000 sims)

| Version | Trades | Net | WR | Max DD | MC pass | Notes |
|---|---|---|---|---|---|---|
| v1.2 CE confirm | 229 | $16,749 | 55.5% | $13,296 | 30.5% | baseline; symmetric ~$800 W/L busts $2k trail |
| v1.3 tiered | 25 | $4,969 | 48% | $3,739 | 42.1% | over-filtered; B-tier never fired |
| **v1.4 premium 365d** | 26 | $2,348 | 50% | $2,623 | 33.0% | first clean single-export year; tier data below |

## v1.4 tier breakdown (THE key finding)

| Tier | n | W/L | Net | Read |
|---|---|---|---|---|
| **A** (TS only) | 14 | 9/5 | **+$4,966** | Carries the entire book |
| **A+** (TS+SMT) | 8 | 2/6 | **−$2,410** | 25% WR — SMT-boosted TP not paying for the gate |
| **H** (half) | 4 | 2/2 | −$208 | Noise at current sample |

**A+ failure mode:** large MFE before reversal (e.g. 2026-01-26 Short_AP: MFE +$1,268, closed −$814). The 50pt TP overshoots; these trades *reach* the A-tier 40pt target. Hypothesis: A+ with 40pt TP converts several losses to wins → top of [[roadmap]].

## Settled

1. **CE confirm (tap + lift)** is the best entry mode tested.
2. **TS required** — the old optional-TS filter did nothing; requiring SMT always lost.
3. **Tier logging works** — Pine entry IDs (`Long_AP`, `Short_A`, `Long_H`…) export in CSV Signal column; parser extracts tier + MFE/MAE/qty/duration.
4. Pivot 5 vs 10 is marginal (+1 trade) — not a lever.
5. Manual 6-week forward test: 4 trades, 3 wins, +$1,900 (small sample, direction agrees).

## Open questions

- **A+ with A-tier TP (40pt):** does killing the SMT TP boost fix the −$2,410 leak?
- **A-tier only** (drop A+ and H entirely): higher pass rate at ~14 trades/year?
- MAE data now available per trade — is there a tighter stop that survives winners?

## Data

- Enriched year ledger: `vault-app/data/tv-exports/macro-v1.4-premium-merged.csv`
- MC + tiers: `vault-app/data/tv-exports/macro-v1.4-premium-mc-report.json`
- v1.2 baseline: `vault-app/data/tv-exports/macro-v1-ce-confirm-mc-report.json`
- Manual journal: `strategies/legacy-manual/trade-log.csv`
- Pine: `pine/Macro_Model_v1.pine` (v1.4)
