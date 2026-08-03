---
date: 2026-07-24
tags: [msv47, june, ko-gate, rb-tf, ab]
---
# MSv47 v33 — June A/B (gate × RB TF)

**CSVs** (archived under `vault-app/data/tv-exports/matrix/`)
- `msv47-v33-june-1m5m-pad15.csv` ← 91c4a (confirmed: has 5RB tags)
- `msv47-v33-june-1m5m-zone.csv` ← 5584c (has 5RB; fewer leave fills)
- `msv47-v33-june-1m-pad.csv` ← ff23b (**1RB only** — no 5RB in list)

**Canvas:** `msv47-v33-june-ab.canvas.tsx`

## Scorecard (10 MNQ)

| Settings | Net | n / W | Max DD | Leave $ | Powell $ | 5RB $ |
|----------|-----|-------|--------|---------|----------|-------|
| **1m+5m · Pad 15** | **+$6,517** | 22 / 6 | $1,277 | +$4,039 | +$2,478 | +$3,408 |
| 1m+5m · Zone | +$3,152 | 18 / 4 | $1,617 | +$674 | +$2,478 | +$1,420 |
| 1m only · Pad | +$1,124 | 15 / 3 | **$3,027** | +$409 | +$715 | — |

## Why June looks “bad” on 1m-only / zone

Not that the model is dead — **settings strip the June winners**:

1. **1m only** misses Jun 18 **Powell 5RB +$1,988** and Jun 18 **leave 5RB +$1,988**, plus other 5RB Powell. Path DD blows out (~$3k).
2. **Zone** keeps Powell (when 5m allowed) but drops leave winners **Jun 18 leave 5RB +$1,988** and **Jun 24 leave 1RB +$1,988**, and takes a worse Jun 24 leave (−$647). Leave sleeve collapses (+$4.0k → +$0.7k).

## vs July

| | July | June |
|--|------|------|
| Zone vs pad | ~same net · **better** DD | **−$3.4k** · **worse** DD |
| 1m+5m | (Jul runs were mostly 1m default) | **Required** for the good path |

→ Zone is **not** yet the prop default. Pad15 + `1m or 5m` is the June winner. Need May (and hold July) before locking.

## Not Lab / not E[$/wk]

Closed-trade path only. Next: May Deep BT for the same three (or at least Pad15·1m+5m vs Zone·1m+5m vs 1m-only).
