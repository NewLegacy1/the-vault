---
updated: 2026-08-02
tags: [kill-lessons, audit, methodology, track-b]
---
# Kill lessons methodology audit — 2026-08-02

> Prompt: re-evaluate whether Track B kills were gathered properly before treating them as permanent walls.  
> Agent: [kill methodology audit](d628a1fc-d192-4bbb-8d3b-449086e372ec) · canvas `pass-speed-mitigation` companion: kill-audit canvas.  
> Does **not** authorize param retunes of killed costumes.

## Pipeline — what we actually measured

| Piece | Reality |
|---|---|
| Input | TV Strategy Tester **List of Trades** CSVs (`matrix/trackb-*.csv`) |
| Analyzer | `vault-app/scripts/analyze-event-study.ts` — bootstrap EV CI (2000), IS/OOS split |
| OOS cut | Fixed calendar **`2025-07-14`** — not walk-forward folds |
| “Event study” | **Trade PnL ledger study**, not all qualifying events + session baseline + MFE/MAE |
| Random baseline | Sign-flip of \|PnL\| — not matched non-event clocks |
| Fill model | Measure Pine typically `process_orders_on_close = true` — optimistic same-bar risk |

Ideal methodology (documented in [[event-study-methodology-intraday-setups]]) is stricter. Vault Stage-0 used a **faster trade-ledger bootstrap**. That is a known limitation — it does **not** reverse high-n negative ledgers.

## File trail

| | Status |
|---|---|
| Matrix CSV B0–B12 | **All present** under `vault-app/data/tv-exports/matrix/` |
| Standardized `event-study-trackb-*.json` | **B2–B12** |
| B0 / B1 | CSV yes · bootstrap JSON weak/missing (pre-pipeline or alt stats) |

## Verdict classes

| Class | IDs | Meaning |
|---|---|---|
| **SOLID_KILL** | B0 (trail), B1, B2, B4, B6–B12 | Enough evidence to keep hard constraint |
| **THIN_BUT_DIRECTIONALLY_DEAD** | B3 (n=27), B5 (OOS n=10) | Costume stays dead; *orthogonal* new events only |
| **METHOD_FLAWED_REOPEN** | — | **None** of the costume families earn a reopen |

## Meta #15 (~40% / ~1.3R trap)

- Built from **correlated** MNQ 5m Stage-0 shells (same window, often $150 / 1.5R) after B0–B7.
- Valid as a **search constraint** (“change rarity or barrier, not clock/label”).
- **Not** an independent physical law — do not use it to auto-kill every future 1.5R idea without its own study (relevant for JJ-P2).

## Reopen policy (binding)

1. **Never** reopen B0–B12 *costumes* via param retune (gapMult, clock, ADX, z, etc.).  
2. **Never** treat weak file trail on B0 as license to trade ORB again — trail math still kills.  
3. **May** open a *new* Stage-0 only if ≥2 of {time box, level set, regime, barrier} differ from the killed family **and** from gated PRB.  
4. Thin kills (B3/B5) may inspire **different** compression/morning features — not NR→PDH/PDL or 10:05 mid-impulse.  
5. Future Stage-0 hygiene upgrade: first-event/day, session baseline, MFE/MAE before freezing barriers; flag `process_orders_on_close`.

## Implication for pass-speed work

Kill lessons **should not be discarded** to chase Apex cadence. The frequency gap is real; the answer is **new books** (S3 → JJ-P2) and **phase-split ops**, not resurrecting soft-drain TA.

## Related

- [[kill-lessons-track-b]] · [[failure-harvest]] · [[track-b-meta-progress]] · [[track-b-error-synthesis-b0-b10]]
