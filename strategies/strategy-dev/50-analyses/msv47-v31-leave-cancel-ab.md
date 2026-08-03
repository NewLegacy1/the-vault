---
date: 2026-07-24
tags: [msv47, leave, cancel-away, ab, july]
---
# MSv47 v31 — leave cancel-away A/B (July)

**CSVs:** `msv47-v31-july-leave-cancel-OFF.csv` (ac2d5) · `msv47-v31-july-leave-cancel-ON.csv` (0fe78)  
**Canvas:** `msv47-v31-leave-cancel-ab.canvas.tsx`

## Verdict

**Cancel OFF wins.** ON costs **−$1,027.80** on the same July window. Not Lab / not E[$/wk].

| | Cancel OFF | Cancel ON |
|--|------------|-----------|
| Trades | 17 · 5W | 14 · 4W |
| Net | **+$4,919.20** | +$3,891.40 |
| Leave | 12 · 2W · +$826 | 9 · 1W · −$202 |
| Powell | 5 · 3W · +$4,093 | identical |

## Removed fills (ON only cancels these)

| Date | PnL | Role |
|------|-----|------|
| 07-20 leave short | **+$1,587.60** | Winner killed (ran away then filled to TP) |
| 07-23 leave long | −$152.40 | Orphan dump (intended save) |
| 07-24 leave long | −$407.40 | Loss avoided |

Sum of removed = +$1,027.80 = full July delta.

## Harvest

1. Cancel-away is **not** free insurance — it cuts late retest winners that paid the month.
2. Jul 23 orphan loss is real but small vs Jul 20 leave win.
3. Keep **cancel OFF** default. Next A/B = leave **KO gate** (pad 50 / pad 15 / zone), cancel off.

## Exact next TV exports

Same Deep BT window · MSv47 **v33** · cancel away **OFF**:

1. `Leave KO gate = Pad ±N` · pad **50** → `msv47-v33-july-ko-pad50.csv`
2. Pad **15** → `msv47-v33-july-ko-pad15.csv`
3. `Leave KO gate = KO in RB zone` → `msv47-v33-july-ko-zone.csv`
