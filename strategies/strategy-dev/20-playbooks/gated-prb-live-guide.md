---
updated: 2026-07-15
status: active
tags: [live, gated-prb, ops, strategy-dev]
---
# Gated PRB — live trading guide

> **Yes — actively paper/live-test gated PRB** as an **ops overlay**, not as proven prop income.  
> Lab: Jul+Oct STAND_DOWN **PASS** (survival ↑). Full-3y chain A0a→D1 still **≤$0/wk** absolute.  
> Pine: `pine/Morningstar_v44.pine` · Checklist: [[PRB_Trade_Checklist]] · Coach: `pine/PRB_Gate_LiveCoach_v0.pine`

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
| **`Morningstar_v44`** | **RB** wick box · **LIMIT / STOP / TP** lines on chart when setup arms · optional frozen past trades (Deep BT) | Bias labels · corner tables |

If the chart shows only a HUD/table: you almost certainly have **Coach only**. Add **gate_v0** on the same MNQ chart (overlay strategy). Locked `Powell_Rejection_Block_v1.pine` stays untouched.

### Morningstar study (Manual Path B)

**Name:** Morningstar — Manual study on lean `gate_v0` (TV shorttitle **Morningstar v44**). Locked PRB v1 / Lab Chart control stay **PRB**.

**IMPORTANT:** [[morningstar-jul16-dual-sleeve-finding]] — early RB@KO (~10:00) vs Powell OTE (~11:15).

1. Chart: `CME_MINI:MNQ1!` · **5m bias / 1m to ARM** · NY session.  
2. Add **`Morningstar v44`** (strategy, overlay). Re-paste after Pine changes.  
3. Inputs:
   - **Path B ON** · **Path B sleeves = Both** · Min fib **40** · Min away **30** · ARM 1m ON · MARK 5m ON · Fill KPI ON · ARM 5m OFF
   - Last arm **1300** · Direction **Both** · NWOG / fib LO/HI / ENTRY/STOP/TP ON
4. Journal: which sleeve(s) you take · fill KPI per plan. Bias: [[Morningstar_Daily_Bias_Checklist]].
5. Lab Deep BT: locked **`Powell_Rejection_Block_v1.pine`** only. Fat archive: `_archive_Powell_Rejection_Block_gate_v0_working_before_slim_2026-07-16.pine`.

| Sleeve | Trigger | Script |
|---|---|---|
| **EARLY** | first RB@KO after leave, before away-run | amber plan + fill KPI |
| **OTE (Powell)** | after away-run + min fib + RB@KO | white plan + fill KPI |
| **Lab PRB** | locked v1 | not this lean script |

### Recommended live stack (same pane or two)

| Pane | Script | Setting | Role |
|---|---|---|---|
| **A — Coach** | `PRB_Gate_LiveCoach_v0` | Eval or Funded profile | STAND_DOWN banner · sizing · planned R lines |
| **B — Setup engine** | `Morningstar_v44` | **Manual levels only = ON** · Jul/Oct = ON | Draws LIMIT / STOP / TP boxes when ARMED / SHADOW — **no** `strategy.entry` |

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

1. Jul/Oct: SHADOW only if month blocked — orange trade plan, no live size.
2. News / bias / draw: **your checklist** (not on chart). Set **Direction filter = Both**.
3. Confirm Manual ON + trade plan visuals ON.

### When LIMIT / STOP / TP lines appear

1. Read prices off the lines — copy limit/stop/target to broker.
2. Run checklist §2 in your head — skip if 2+ fail.
3. Coach (optional): paste stop pts → qty.
4. One slot/day.

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
| `Morningstar_v44` | **PRB · ARMED (Manual ON)** | Limit armed — only if `Manual levels only` **ON** and `Alert when limit level arms` **ON** |

ARMED body (also baked into Pine):

```text
PRB gate_v0 ARMED — {{ticker}} {{interval}} {{time}}
1) Checklist bias / confluence
2) Copy LIMIT · STOP · TP from boxes
3) Coach qty from stop pts
Manual ON — you click. Jul/Oct STAND_DOWN blocks new arms.
```

### Chart — what you should see

| Mode | On the candles |
|---|---|
| **Morningstar** (Manual ON) | HTF RB (Path A) and/or **Path B** (`PathB · 10:00 · 5RB`) · fib `B OTE` lines · LTF marks · **LIMIT / STOP / TP** — LTF grade never arms; Path B does |
| **Lab PRB** (Manual OFF) | Chart-TF structure + frozen **WIN/LOSS** after fills |
| **Jul/Oct** | Skip default **OFF** for Manual discretion — Lab used ON |

Bias stays off the chart (**Direction = Both**). Micro mid-trend 5m RBs should mostly disappear when structure = 15 and draw POI is ON.

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
