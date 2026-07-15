---
updated: 2026-07-15
tags: [stage-0, mtf, breadth, strategy-dev]
---
# Stage-0 protocol — MTF bias + execution TF + (later) symbol breadth

> HTF confluence **is codable** in Pine via `request.security`. What was *not* automatic was TradingView Deep BT clicks / discretionary live HTF for gated PRB — not “MTF impossible.”  
> Prop path MC stays **after** Stage-0 **toward** — [[SCORECARD]].

## Coding model (one measure script)

```text
HTF (e.g. 15m)  →  event / bias / gate   via request.security(..., "15")
Chart TF (1m or 5m)  →  entry fills + stop distance
Deep BT runs on whichever chart the script is attached to
```

Do **not** build three divergent Pine “versions” of the same idea. Build **one** locked measure; re-run Deep BT on different charts/symbols under the same inputs.

## Gating ladder (do not explode the matrix)

| Step | What you run | CSVs | Pass gate to continue |
|---|---|---|---|
| **0a** | Primary symbol **MNQ continuous · 5m** · HTF factors ON | 1 | EV / loss shape readable (not desert, not kill-by-CI) |
| **0b** | **Same Pine** · **MNQ · 1m** | +1 | Compare to 0a: EV, CI, maxL, n — not WR |
| **0c** | Only if 0a **or** 0b is **toward** (or clear lift) | | |
| **0d** | Symbol breadth (optional) | +1..3 | See below |
| **1** | Lab path MC / prop passability | Lab | SCORECARD toward + gates |

**Default next experiment:** 0a + 0b only (two Deep BTs). Four-symbol matrices wait until something survives 0a/0b.

## Symbol breadth (Stage-0d — only after toward / lift)

| Symbol | Role | Note |
|---|---|---|
| **MNQ** | Primary micro Nasdaq | Default Stage-0 |
| **NQ** | Mini Nasdaq | Same underlying; mostly point-value / fill noise — weak “breadth” |
| **MES** | Micro S&P | True cross-index test |
| **ES** | Mini S&P | Pair with MES; same caveat as NQ/MNQ |

Micro vs mini on the **same index** is **not** four independent strategies — it’s sizing / tick economics. Prefer:

1. MNQ 5m vs MNQ 1m (execution TF)  
2. Then MES 5m (cross-index) with **same HTF event logic**  
3. NQ/ES only if you need mini-lot realism for a specific firm product

**Never** 2 TFs × 4 symbols = 8 CSVs before the first toward. That’s a fishing expedition.

## Pre-register checklist (every MTF Stage-0 note)

- [ ] HTF timeframe locked (e.g. 15)  
- [ ] HTF event/bias definition (binary or gate)  
- [ ] Chart TF used for **fills only**  
- [ ] Which runs are planned: 0a / 0b / (0d names)  
- [ ] Kill criteria per ledger — plus “1m no lift vs 5m → drop 1m path”  
- [ ] Obeys [[kill-lessons-track-b]] / [[track-b-meta-progress]]

## Prop / passability math

Correct placement:

```text
Stage-0 trade EV ± CI  →  toward?
        ↓ yes
Path MC E[$/wk] · pass/bust · trail  →  promote?
```

Do **not** Lab-grind every TF×symbol combo. Passability is the **promote** stage — [[SCORECARD]] · [[prop-firm-math]].

## Compare script convention

Save CSVs as:

```text
matrix/trackb-{slug}-mnq-5m.csv
matrix/trackb-{slug}-mnq-1m.csv
matrix/trackb-{slug}-mes-5m.csv   # only if 0d unlocked
```

Run `npx tsx scripts/analyze-event-study.ts <file>` on each; harvest compares **ledgers**, not aesthetics.

## Related

[[event-study-template]] · [[RESEARCH_AGENT_LOOP]] · [[kill-lessons-track-b]] · [[SCORECARD]]
