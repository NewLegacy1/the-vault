---
updated: 2026-07-15
status: active
tags: [live, gated-prb, ops, strategy-dev]
---
# Gated PRB — live trading guide

> **Yes — actively paper/live-test gated PRB** as an **ops overlay**, not as proven prop income.  
> Lab: Jul+Oct STAND_DOWN **PASS** (survival ↑). Full-3y chain A0a→D1 still **≤$0/wk** absolute.  
> Pine: `pine/Powell_Rejection_Block_gate_v0.pine` · Checklist: [[PRB_Trade_Checklist]] · Coach: `pine/PRB_Gate_LiveCoach_v0.pine`

## What “actively testing” means

| Do | Do not |
|---|---|
| Paper or small live size with **gate_v0**, Jul/Oct skip **ON** | Treat gated PRB as a $1k/wk path |
| Log every take/skip (F2 Journal) · weekly review cadence | Stack March or invent new calendar months |
| Use **Manual ON** for real entries (you click) | Blind auto-fire into a live funded account on day 1 |
| Keep Challenge vs Funded risk presets separate | Copy Hybrid frequency stacks onto live PRB |
| Kill/pause if streak ≥5×$400 into trail without pause | Open multi-account off this book |

Kill criteria for the live ops loop (not the Lab gate): **3 losses in a week that violate checklist**, or **personal override of Jul/Oct** “just this once.”

---

## TradingView: strategy vs indicator

### Recommended live stack (two panes)

| Pane | Script | Setting | Role |
|---|---|---|---|
| **A — Coach** | `PRB_Gate_LiveCoach_v0` | Eval or Funded profile | STAND_DOWN banner · sizing · risk numbers |
| **B — Setup engine** | `Powell_Rejection_Block_gate_v0` | **Manual levels only = ON** · Jul/Oct = ON | Draws LIMIT / STOP / TP boxes when ARMED — **no** `strategy.entry` |

You copy box prices into the broker (or click TradingView futures if that’s your fill path). The checklist bias filter stays **human**.

### When to use Strategy Manual OFF

| Mode | Use for |
|---|---|
| Manual **OFF** | Periodic Deep BT CSV → Lab (control / decay check) only |
| Manual **ON** | Live and discretionary replay |

Do **not** rely on TradingView strategy auto-orders as the live prop account authority until you’ve logged ≥20 paper takes with checklist fidelity. Even then, prefer Manual ON + broker — TV strategy fills ≠ prop DOM fills.

### Pure indicator alternative

There is **no second full RB encoder**. The “indicator” for entries **is** gate_v0 with Manual ON (same logic as Lab, zero orders). LiveCoach only adds risk HUD / stand-down — it does not find RBs.

---

## Risk parameter cards

### Eval (Challenge) — A0a-style

| Parameter | Value | Why |
|---|---|---|
| Instrument | MNQ continuous | Point value ~$2 |
| Risk / trade | **$300–$400** | Trail budget |
| Max stop | **20 pts** | Skip wider |
| Target | **5R** | Eval book |
| BE | **+1R** | Kept |
| Trail | **OFF** (BE-only) | Trail A/B failed |
| Cap / day | 1 trade · profit lock ~$1,400 · loss stop ~$800 | Consistency |
| Eval win cap (optional) | ~$1,490 | Best-day &lt;50% of $4k |
| Session | 10:00–11:30 arm · flat 15:55 | SOP |
| Skip | Mondays · **Jul · Oct** | Settled |

### Funded (PRO) — D1-style

| Parameter | Value | Why |
|---|---|---|
| Risk / trade | **$400** until +$1–1.5k cushion | Intraday trail |
| Target | **6R** | Funded export |
| BE | **+1R** | Peak is the enemy early |
| Trail | OFF unless give-back counter screams | Same as Lab default |
| Consistency | **None** | Funded rules |
| Recycle | Withdraw before PRO+ (~$5k cum) | Playbook |

Sizing formula (shown on LiveCoach):

```text
contracts = floor( riskUsd / (stopPts × $2) )   // MNQ
cap at 60 micros (TPT $50K)
```

Example: stop 10 pts · $400 risk → 20 MNQ.

---

## Session workflow (live day)

### Pre-open (−30 to −5 min)

1. LiveCoach: if **STAND_DOWN Jul/Oct** → close the DOM. Done for the month’s RTH entries.
2. News (FF): red CPI/NFP → extra caution / skip (checklist).
3. Daily→4H draw noted; set **Direction filter** on gate_v0 (Both / Long / Short / Auto PDH/PDL).
4. Confirm inputs match profile card above.

### When boxes arm (funnel ARMED)

1. Checklist §2 — if 2+ fails → remove pending / do not click.
2. LiveCoach: confirm qty from stop distance on the red box.
3. Place **limit** at entry, **stop** and **target** as drawn. Do not freestyle RR.
4. One slot/day — after fill or cancel, stop hunting.

### Management

1. At +1R: stop to BE (script would; you do it on broker if Manual ON).
2. No trail unless give-back regime toggle + checklist says so.
3. Flat by 15:55. Daily loss stop / profit lock — honor them.

### After close

1. Journal: take/skip · grade · MFE · checkpoint fails.
2. Weekly: `npm run weekly-review` · look at shortfall + decay — not WR.

---

## Alerts (TradingView) — clean templates

Create **separate** alerts (one script each). Use *Once per bar close*. Message is built into the Pine `alertcondition` — pick the condition title below.

### Live gated PRB

| Script | Condition title | When |
|---|---|---|
| `PRB_Gate_LiveCoach_v0` | **PRB · enter STAND_DOWN** | Month rolls into Jul/Oct |
| `PRB_Gate_LiveCoach_v0` | **PRB · exit STAND_DOWN** | Month leaves Jul/Oct |
| `Powell_Rejection_Block_gate_v0` | **PRB · ARMED (Manual ON)** | Limit armed — only if `Manual levels only` **ON** and `Alert when limit level arms` **ON** |

ARMED body (also baked into Pine):

```text
PRB gate_v0 ARMED — {{ticker}} {{interval}} {{time}}
1) Checklist bias / confluence
2) Copy LIMIT · STOP · TP from boxes
3) Coach qty from stop pts
Manual ON — you click. Jul/Oct STAND_DOWN blocks new arms.
```

### Chart visuals (defaults)

| Script | What you should see |
|---|---|
| LiveCoach | Soft orange wash in Jul/Oct · one corner LIVE/STAND_DOWN label · compact risk table |
| gate_v0 Manual ON | Red entry→stop box · teal entry→TP · funnel ARMED |
| MPSF events | Blue wash 9:30–10:00 · dashed PDH/PDL · L▲ / S▼ only · light SL/TP boxes |

Turn **off** gate soup triangles / ghost marks if the live chart feels busy.

---

## What success looks like (30–60 days)

| Signal | Toward | Away |
|---|---|---|
| Process | ≥80% checklist completion · 0 Jul/Oct breaches | Skipping gates when bored |
| Trail | No account within $400 of bust from PRB alone | 4–5L without pause |
| Economics | Paper path MCs still look like gated Lab (don’t invent new edge from 10 live trades) | “Live WR is 60% so we’re rich” |

Live ops validates **you + the overlay**, not a new Lab promote.

---

## Links

- [[Powell_Rejection_Block_SOP]] · [[PRB_Trade_Checklist]] · [[findings-prb]] · [[prop-firm-math]] · [[SCORECARD]]  
- Track B research (parallel): [[track-b-ideas]] · [[track-b-b2-mpsf-v0]]
