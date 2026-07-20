---
topic: fill-haircut-defaults-stage0-lab · researched: 2026-07-20 · sources: 5 · agent-cycle: cycle4-model-builder
---
# Fill-Haircut Defaults for Stage-0 / Lab: Tick Presets by Window (No Live Edge Claims)

Distills `ops-mnq-slippage-market-orders-open.md` + `limit-order-fill-modeling-queue-position.md` into **concrete execution-haircut presets** for paper EV → net EV bookkeeping. Numbers are **CLAIM (sourced) / VERIFY (house TCA)** — not measured Vault medians and not Deep BT `E[$/wk]`.

## Key findings

- **CLAIM (slippage note · NexusFi / practitioner):** MNQ market / converted orders in the elevated first hour (09:30–10:30 ET) budget **1–2 ticks** normal; Dual46’s 09:50–10:10 sits in the *late* elevated hour — use the fast-window number, not the calm mid-morning **0–1 tick** figure that applies ~10:30+. Release-adjacent (10:00 macro within ±120 s): **3–5 ticks**; tail blowouts **8–10 ticks** exist but should be capped via aggressive limit, not assumed as the default haircut.
- **CLAIM (slippage note · $ arithmetic at $0.50/tick MNQ):** 1 tick = $0.50/contract → **$5 / 10-lot**; 2 ticks → **$10 / 10-lot**; 4 ticks release budget → **$20 / 10-lot**. Charge these in real-R / net EV before “edge” language.
- **CLAIM (limit-fill note · CME FIFO / NexusFi):** touch ≠ fill; Stage-0 / Lab tallies that count wick-touch fills are optimistic. Conservative sim standard = **trade-through (≥1 tick beyond limit)** or **logged conversion**. Conversion cost ~**1–2 ticks** when pre-planned; missing a +5R winner dominates that cost when EV geometry is multi-R.
- **CLAIM (order-type lever):** prefer **aggressive limit** (±1–2 ticks through the level) over bare market for conversions — same practical fill rate in normal tape, hard-caps the 8–10 tick tail.
- **VERIFY (mandatory):** no published MNQ size-bucket study; house implementation-shortfall median after ~30 live/converted events **supersedes** every preset below. Mark all Stage-0/Lab runs `haircutSource: preset | house-tca`.

## Details / mechanics

### Preset table (MNQ, RTH, 1–10 lots · CLAIM → VERIFY)

| Window / regime (ET) | Order assumption | Haircut (ticks / side) | $/contract | 10-lot $ | Use when |
|---|---|---|---|---:|---|
| **A · Open elevated** 09:30–10:30 (incl. Dual46 09:50–10:10) | Converted / aggressive limit | **expected 1 · conservative 2** | $0.50 / $1.00 | $5 / $10 | Default Stage-0 & Lab net EV in open window |
| **B · Quieter RTH** ~10:30–15:00 (ex-release) | Converted / aggressive limit | **expected 0 · conservative 1** | $0 / $0.50 | $0 / $5 | Midday / afternoon sleeves only |
| **C · Release-adjacent** scheduled print ±120 s inside A or B | Stand-down preferred; if forced convert | **4** (range CLAIM 3–5) | $2.00 | $20 | Or flag trade `standDown` — do not blend into A |
| **D · Limit resting, trade-through counted** | Passive fill only if ≥1 tick through | **0 fill haircut** + adverse-selection flag | $0 | $0 | Still apply A/B if later stop is market |
| **E · Touch-counted (forbidden for promote)** | Wick touch = fill | **N/A — invalid model** | — | — | Reject for Stage-0 toward / Lab edge claims |
| **F · Tail / thin book** | Bare market into blowout | **8–10** (scenario, not default) | $4–5 | $40–50 | Stress column only; SOP = aggressive limit cancels this path |

**Round-trip note (CLAIM):** entry conversion + exit market stop can stack. Stage-0 default = charge **entry haircut from the table**; add **+1 tick exit** conservative when stops are marketable (VERIFY with house stop-slip column). Do not double-count if both sides already use aggressive limits that filled at limit.

**Fill-mode tags (from limit-fill note — required companion to ticks):**

| Tag | Meaning | Haircut row |
|---|---|---|
| `limit-clean` | Trade-through fill at/through limit | D (+ exit rule) |
| `converted` | Pre-planned aggressive limit / marketable | A or B (or C) |
| `missed` | Touch or leave without fill | 0 PnL event; do not invent fill |
| `touch-assumed` | Forbidden in promote path | E |

### Stage-0 / Lab default proposal (CLAIM · mark verify)

| Surface | Default preset | How to apply |
|---|---|---|
| **Stage-0 event study** | Window **A conservative = 2 ticks** per converted entry; **0** if ledger is already live/net fills | Subtract `haircutUsd = ticks × $0.50 × contracts` from each trade PnL **before** bootstrap CI if export is gross TV; if CSV is already net of fees/slip, set ticks=0 and document |
| **Lab path MC inputs** | Same A expected=1 / conservative=2 as a **fee-like drag** on trade EV; release days use C or exclude | Never report gross-only `E[$/wk]`; SCORECARD execution-haircut row must name preset id `open-elev-2tick` etc. |
| **Dual46 journal (freeze untouched)** | Ledger real-R column: charge 1 tick expected / 2 conservative on conversions; 4 on release-adjacent or stand down | Ops SOP only — **no Pine / freeze edit** |

**Labels to stamp on every report:**

```
haircutPreset: open-elev-2tick | quiet-1tick | release-4tick | house-tca
haircutVerify: pending | measured-n≥30
fillModel: trade-through | converted | invalid-touch
```

## APPLICATION TO THE VAULT

1. **Immediate (doctrine only):** Stage-0 closeout checklist item S0-7 (`stage-0-scorecard-surface.md`) references these preset ids — no new Track-B ideas; Dual46 freeze unchanged.
2. **Where to put presets in vault-app later (suggest, do not require implement now):**
   - New module: `vault-app/lib/execution-haircut-presets.ts` — export typed presets (`id`, `windowEt`, `ticksExpected`, `ticksConservative`, `usdPerTick: 0.5`, `verify: 'pending'`).
   - Consume from: `analyze-event-study.ts` (optional `--haircut open-elev-2tick` adjusting PnL before CI) and `mc-params-builder.ts` / Lab scorecard (`lab-scorecard.ts`) so path MC never sees unlabeled gross EV.
   - Optional UI: Lab cohort form dropdown bound to the same ids; journal already has fill-status fields — map conversions to preset A.
3. **Measurement supersedes:** after ~30 shortfall events (`P_decision_mid`, `P_fill_vwap` per ops slippage note), replace preset medians with `house-tca` and keep old presets only as stress bands.
4. **Hard stop:** these ticks are **not** Deep BT results and **not** `E[$/wk]` — they are cost assumptions for netting paper ledgers.

## Sources

- `quant/ops-mnq-slippage-market-orders-open.md` — 1–2 / 3–5 / 8–10 tick bands, TOD map, $/10-lot table, aggressive-limit lever, TCA protocol
- `quant/limit-order-fill-modeling-queue-position.md` — FIFO, trade-through standard, conversion EV trade-off, fill-mode column
- `quant/ops-news-print-microstructure-stand-down.md` — release stand-down (pairs with preset C)
- `strategy-dev/00-charter/SCORECARD.md` — execution haircut before “edge” language
- `quant/stage-0-scorecard-surface.md` — S0-7 hook for this preset table
