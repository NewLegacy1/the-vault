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

## Calendar — you do **not** wait until October

STAND_DOWN months are **July and October only**. **August and September are live/paper take months** under the same gate.

| Window (NY) | Live PRB RTH fills? | What you practice |
|---|---|---|
| **Jul · Oct** | **No** — Coach/gate STAND_DOWN | Shadow log only (below) |
| **Aug · Sep** | **Yes** — paper or small live | Full Manual ON stack + checklist |
| Nov–Jun | **Yes** (except holidays / news skips) | Same ops |

### “But this July would’ve been great”

One good calendar month does **not** override Lab Jul+Oct. The gate was settled on **path survival** across the 3y window — not “did the last July print winners.” Taking July fills “because it felt good” is the kill criteria for the ops loop (personal override). Do not turn the coach skip off to chase a good July.

### What to do right now (mid-July → Oct)

1. **Rest of July + all of October:** leave `Jul/Oct STAND_DOWN` **ON**. Do **not** click RTH PRB into the prop account.  
2. **Shadow journal (still useful):** with gate_v0 **Manual ON** + Jul/Oct **ON**, setups still draw **SHADOW** boxes (orange) and funnel `SHADOW Jul/Oct — journal only`. Log *would take / would skip · stop · qty · checklist grade · hypothetical path* — zero size. Do not flip Jul/Oct OFF to get teal ARMED labels.  
3. **Aug 1 → Sep 30:** this is the active live/paper window. Same stack, real (or paper) fills — funnel reads `ARMED — you click`. Aim for checklist fidelity and trail discipline — not a new Lab claim from ≤20 takes.  
4. **Parallel:** Track B Stage-0 research (TV CSV → scripts) runs **year-round** — it does not need PRB live fills.

Optional: set Coach alerts **enter STAND_DOWN** / **exit STAND_DOWN** so Aug open and Oct close are calendar events, not willpower.

---

## TradingView: strategy vs indicator

### Who draws what (read this if you only see a table)

| Script | What it draws | What it does **not** do |
|---|---|---|
| **`PRB_Gate_LiveCoach_v0`** | STAND_DOWN wash · corner LIVE/STAND_DOWN · risk table · optional **planned** stop/TP/BE lines from *Planned stop (pts)* | Find RBs · arm LIMIT/STOP/TP boxes · emit entry signals |
| **`Powell_Rejection_Block_gate_v0`** | FVG-style **RB Short/Long** zones · PDH/PDL bands · Sweep PDH/PDL pills · ARMED/SHADOW risk boxes · 10:00 wash | Turtle-soup displacement · Live Coach sizing |

If the chart shows only a HUD/table: you almost certainly have **Coach only**. Add **gate_v0** on the same MNQ chart (overlay strategy). Locked `Powell_Rejection_Block_v1.pine` stays untouched.

### Minimal MNQ setup (copy into TV)

1. Chart: `CME_MINI:MNQ1!` · **1m** (CISD package) or **5m** (limit/Auto leave-retest) · NY session visible.  
2. Add **`Powell_Rejection_Block gate_v0`** (strategy, overlay).  
3. Inputs — must match live ops:
   - **Manual levels only — NO orders = ON**
   - **Skip July & October = ON** (leave on through Aug practice; do not flip off to “see more” in July)
   - Visuals: **Live clean chart = ON** · **Show pre-trade checklist HUD = ON** · Extra liquidity = OFF
   - Funnel/MISSED tables stay hidden while Live clean + Manual (turn Live clean OFF to debug)
4. Add **`PRB Gate Live Coach v0`** (indicator, same pane). Profile Eval or Funded.  
5. Style tab: leave gate_v0 overlays visible — TV can hide them if a previous style was saved. **Re-paste** after visual updates so defaults apply.  
6. Confirm checklist HUD **Jul/Oct gate** = STAND_DOWN (Jul) or OK (Aug/Sep) and **Script state** updates when an RB arms.

### Recommended live stack (same pane or two)

| Pane | Script | Setting | Role |
|---|---|---|---|
| **A — Coach** | `PRB_Gate_LiveCoach_v0` | Eval or Funded profile | STAND_DOWN banner · sizing · planned R lines |
| **B — Setup engine** | `Powell_Rejection_Block_gate_v0` | **Manual levels only = ON** · Jul/Oct = ON | Draws LIMIT / STOP / TP boxes when ARMED / SHADOW — **no** `strategy.entry` |

You copy box prices into the broker (or click TradingView futures if that’s your fill path). The checklist bias filter stays **human**. Paste Coach **Planned stop (pts)** from the red-box stop distance to get qty.

### July SHADOW vs Aug–Sep ARMED

| Window | Manual ON + Jul/Oct ON | What you see on gate_v0 |
|---|---|---|
| **Jul · Oct** | Process / journal only | Orange **SHADOW** boxes + `SHADOW Jul/Oct — journal only` — **do not** click live size |
| **Aug · Sep** (and other live months) | Paper / small live | Teal/red **MANUAL** boxes + `ARMED — you click` |

Turning Jul/Oct **OFF** to force “real” ARMED labels in July is an ops kill criterion. Use SHADOW.

### When to use Strategy Manual OFF

| Mode | Use for |
|---|---|
| Manual **OFF** | Periodic Deep BT CSV → Lab (control / decay check) only — **no** live entry boxes while flat |
| Manual **ON** | Live, shadow (Jul/Oct), and discretionary replay |

Do **not** rely on TradingView strategy auto-orders as the live prop account authority until you’ve logged ≥20 paper takes with checklist fidelity. Even then, prefer Manual ON + broker — TV strategy fills ≠ prop DOM fills.

### Pure indicator alternative

There is **no second full RB encoder**. The “indicator” for entries **is** gate_v0 with Manual ON (same logic as Lab, zero orders). LiveCoach only adds risk HUD / stand-down / planned R lines — it does not find RBs.

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

1. Checklist HUD top-left: if **Jul/Oct gate = STAND_DOWN** → journal SHADOW only / no live size.
2. News (FF): red CPI/NFP → extra caution / skip (**YOU** row).
3. Daily→4H draw noted; set **Direction filter** on gate_v0 (Both / Long / Short / Auto PDH/PDL). Confirm HUD `Auto / bias` matches your read.
4. Confirm inputs match profile card above.

### When boxes arm (HUD Script state → ARMED / SHADOW / WAIT)

1. Read HUD §Setup: Direction · Swept level · vs daily draw · 4H at RB · Stop size — then checklist §2 human rows (EQH/EQL · gut). If 2+ fail → do not click.
2. LiveCoach: confirm qty from stop distance on the red box (paste pts into Coach).
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
| LiveCoach | Soft orange wash in Jul/Oct · corner LIVE/STAND_DOWN · risk table · faint PLAN@Npt stop/TP/BE (not an RB) |
| gate_v0 Manual ON + **Live clean ON** | Top-left **CHECKLIST** HUD (maps [[PRB_Trade_Checklist]]) · **RB Short/Long** zones · PDH/PDL bands · Sweep pills · ARMED/SHADOW risk boxes · 10:00 wash · no funnel/MISSED clutter |
| gate_v0 Live clean OFF | Classic lines + full diagnostic tables (Lab/debug) |
| MPSF events | Separate Track B marker — do not use as PRB entry engine |

### Soup vs turtle soup (read this)

| Term | What PRB gate_v0 means | What it is **not** |
|---|---|---|
| **Liquidity sweep** (code still says `f_soup*`) | Wick through a level (PDH/PDL/PM/key open) + **close back** on the origin side | Your turtle soup: external HL/LH wick pierce **without** body close beyond + **next candle ≥10 pt displacement** |
| **Auto bias Sweep PDH / Sweep PDL** | Same wick-through-close-back on **prior day high/low** → sets day draw (shorts after PDH sweep, longs after PDL) | A confirmed turtle-soup entry signal |
| **Require liquidity sweep on RB** | The RB candle itself must take liquidity that way | Displacement confirmation |

Lab / live PRB does **not** require 10-pt displacement. Do not retune Lab to turtle-soup rules without a new Stage-0. Chart labels now say **Sweep**, not “soup,” to avoid that mix-up.

Turn **off** gate sweep triangles / ghost marks if the live chart feels busy. Keep **Live clean** ON for paper/live.

### If you still see no RB / boxes

1. Confirm **gate_v0** is on the chart (not Coach alone).  
2. Confirm **Manual levels only = ON**.  
3. Timeframe 1m or 5m; look during **10:00–11:30 NY** (entry window wash). Outside that, expect PDH/PDL boxes only.  
4. Funnel: if `RB candles (raw)` stays 0 in-window, filters (wick / 4H / sweep) are blocking — widen nothing for Lab; use bar-replay on a known historical RB day for UX check.  
5. Style → reset gate_v0 plot visibility.

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
