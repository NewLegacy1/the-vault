---
updated: 2026-07-14
tags: [calendar, news, strategy-dev, 3y]
---
# Economic calendar — 3-year backfill

## Why

Quiet/red-folder filters (`filter-hybrid-news`, F7 News, Lab NewsDay) need USD high-impact coverage aligned with **3y** Deep Backtests (~2023-07 → today). Prior bundle started 2024-01 and went sparse after **2025-04-07**.

## What we have now

| Field | Value |
|---|---|
| Canonical CSV | `data/calendar/forexfactory_2023-07-01_2026-07-14.csv` |
| Bundle | `vault-app/data/calendar-bundle.json` |
| Runtime JSON | `data/calendar/vault_calendar.json` (+ vault-app copy) |
| Events | **2486** USD rows |
| Span | **2023-07-02 → 2026-07-14** |
| Dense FF | Hugging Face `forex_factory_cache` through **2025-04-07** |
| Gap fill | FRED high-impact calendars (+ prior merged stubs) **2025-04-08 → end** |

Old partial CSVs live in `data/calendar/_archive_pre_3y/`.

## Refresh command

```bash
node scripts/backfill-calendar-3y.mjs
# or
node scripts/backfill-calendar-3y.mjs --cache "$HOME/Downloads/forex_factory_cache.csv" --start 2023-07-01 --end 2026-07-14
```

Then hard-refresh **F7 NEWS** / Lab. Optional: install [forexfactory-go](https://github.com/Nosvemos/forexfactory-go) for a live pull through today (HF cache currently tops out ~2025-04-07).

## Quality note

Post–Apr 2025 rows are **not** full FF taxonomy (FOMC/Claims/ISM may be thin). Prefer upgrading with forexfactory-go when available. Red-folder (USD high) still works for H1 quiet Macro on the dense period.

## Links

- [[sim-queue]] · F7 NEWS · `scripts/filter-hybrid-news.ts`
