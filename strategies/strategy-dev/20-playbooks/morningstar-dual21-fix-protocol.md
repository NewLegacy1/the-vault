---
updated: 2026-07-17
tags: [morningstar, path-b, fix-protocol, dual23]
---
# Morningstar Dual23 — fix protocol

## TV Premium delay (not a Pine bug)

Premium ≠ free CME real-time. MNQ/NQ real-time usually needs a separate **CME exchange fee**. That does not break historical Jul 16–17 replay.

## Indicator vs strategy

**Switching to `indicator()` does not fix missing RBs or entries.** Same bars, same logic. Dual22 stays an indicator for manual overlay only.

## Teaching RB (spec lock — SOP §9)

An RB is **not** a long wick alone.

| Required | Rule |
|---|---|
| Wick | ≥ min pts · ≥ N× body · confirming close |
| **Take-out** | Bull: `low < lowest(prior N lows)`; bear: mirror on highs. Default N=12 |
| Soft | **Forbidden** |

Leave POI = RB tags **10:00 KO**. Powell pool = same RB at **Day IL**, freed, then return.

## Local parity gate (run before any TV paste)

```bash
cd vault-app
npm run pathb-replay
```

- Synthetic fixture must **PASS** (Jul 16 leave+Powell; Jul 17 fake wick leave must not arm).
- Optional: drop real OHLC at `vault-app/data/tv-exports/morningstar-bars/mnq-1m-2026-07-15-17.csv` — see that folder’s README.
- **Do not paste Dual22 until the harness is green.**

## End goal (Powell)

Powell = **first return** to the **morning teaching RB at locked Day IL** (wick-start entry) — the rejection that printed at the intermediate low **before** the big reaction up.  
**Not** a later small 5m block near a ratcheting session low.

## What Dual23 is

| Piece | Action |
|---|---|
| Script type | `indicator()` — manual study |
| RB | Teaching wick/body/close **+ liquidity sweep** |
| Day IL | First bounce-confirm, then **LOCK** (no afternoon ratchet) |
| Powell pool | Only **before leave**; freeze after free; RB extreme within **12 pts** of locked Day IL |
| Drawings | Prior-day leave/Powell plans **kept** across calendar midnight |
| Stamp | `MS Dual23 · DayIL RB lock` |

## Paste steps (once)

1. Confirm `npm run pathb-replay` → PASS.
2. Remove old Morningstar / MS Dual* from chart.
3. Pine Editor → paste `pine/Morningstar_v44.pine` → **Add to chart**.
4. Stamp must read: **`MS Dual23 · DayIL RB lock`**.
5. Chart: MNQ · scroll Jul 16–17 (or bar-replay).

## Acceptance (Jul 16–17)

- [ ] Jul 16: leave plan visible after scrolling history (not wiped at midnight)
- [ ] Jul 16: blue untapped box on the **morning Day-IL RB** (≈09:45), not a ~12:15 small block
- [ ] Jul 16: Powell entry = return to that morning **wick-start**
- [ ] Jul 17: no fake leave·1RB on wick-only candle with no prior H/L take-out
- [ ] No soft RB · no all-day RB museum spray

If fail: copy **status tag text** only — do not retune. Fix harness + Pine together.

## Hard stops

- Never edit `pine/Powell_Rejection_Block_v1.pine`
- No soft / looser RB quality
- No Dual6 `locL` equality gate
- No Lab promote without Stage-0 math
