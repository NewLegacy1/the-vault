---
phase: eval
firm: Apex $50K Intraday Trail
updated: 2026-08-02
status: active — live week plan
tags: [playbook, eval, apex, sprint, ops]
---
# Apex $50K Intraday — eval sprint playbook

> **Job this week:** pass Apex Intraday eval with a *sprint book*, not Dual46 extract geometry.  
> Dual46 freeze stays a **chart/study** product. Live Apex size follows this card.  
> Related: [[gated-prb-live-guide]] · [[eval-playbook]] · [[prop-firm-math]] · [[eval-vs-funded-phase-split canvas]]

## 0. Verify on your Apex / Tradovate dashboard (do first)

| Check | Vault default | You confirm |
|---|---|---|
| Account type | **Intraday Trail** (not EOD) | □ |
| Profit target | **$3,000** | □ |
| Max trail | **$2,000** | □ |
| Trail behavior | Peak incl. **unrealized** | □ |
| Eval consistency | **None** | □ |
| Min trading days | **0** (1-day pass OK) | □ |
| Eval window | **~30 calendar days** | □ |
| Max contracts | **6 minis / 60 micros** (confirmed) | □ |
| Platform | Tradovate → trail **never locks** on eval | □ Rithmic/other: lock rules differ |
| Days left on this eval | ___ | □ |

If any row disagrees with dashboard, **dashboard wins** — update this note.

## 1. Why Apex Intraday changes the sprint book

| Rule | Implication for us |
|---|---|
| $3k pass / $2k trail | Geometry ≈ **1.5×** firm shape — mild losses, bank peaks |
| **Intraday** trail | Open MFE **raises the floor**. Runners that give back can fail you. **BE early.** |
| No eval consistency | No need for TPT-style $1,490 win-day cap — still use a **soft daily lock** for trail hygiene |
| No firm DLL | You must set a **personal daily loss stop** |
| No min days | Speed is allowed — **hero days are not required** and are trail-hostile |
| Tradovate never locks | Floor keeps chasing peak for the whole eval — do not “run it up open” |

**July harvest already on this book** ([[msv46-live-2026-07-23]]): disc sleeve −$962 · script arm +$1,095. Live rule: **script / RB arms only.**

## 2. Sprint book (live identity)

### Take

| Field | Rule |
|---|---|
| Instrument | **MNQ** only |
| Setup | **Script arm only** — Morningstar Dual46/v47 **or** gated PRB RB with checklist pass |
| Bias | [[Morningstar_Daily_Bias_Checklist]] / PRB checklist — skip if bias fail |
| Risk / trade | **$300** (prefer) · hard max **$400** |
| Contracts | `floor( riskUsd / (stopPts × 2) )` · never “always 10” |
| Max stop | **20 pts** — wider → **skip** (Jul 23 T1 −34.75 pt was the crash) |
| Target | Plan **3R soft bank** · hard max **5R** or 100-pt Dual46 cap — whichever smaller in $ |
| BE | **Mandatory at +1R** (Apex intraday) — move stop to entry / +1–2 ticks |
| Trades / day | **1** armed take max |
| Disc sleeve | **OFF** on this account (journal as shadow only) |
| Session | Arm window per script · **flat by 15:55 ET** |
| News | Red-folder stand-down per Vault habit |

### Kill / pause (ops)

| Trigger | Action |
|---|---|
| Day P&L ≤ **−$600** | Done for day (personal DLL) |
| Day P&L ≥ **+$1,200** | Done for day (soft lock — trail hygiene) |
| **2 losses** same week on script arms | Size → $200 next trade · review checklist |
| **3 losses** in a week / checklist override | Pause Apex live · paper only until review |
| Open trade MFE ≥ **+$800** then still open | Tighten to BE or scale out — do not gift trail |

### Pass path (example, not a promise)

```text
3 green days × ~$1,000  →  $3,000   OR
2 × ~$1,200 + 1 × ~$600 →  $3,000
Stay under $2,000 peak→trough including open P&L
```

## 3. Chart stack (TradingView → Tradovate)

| Pane | Script | Settings |
|---|---|---|
| A — risk HUD | `PRB_Gate_LiveCoach_v0` | Profile **Eval (A0a)** · Risk **$300** · paste planned stop pts |
| B — arms | `Morningstar_v46` **or** `Morningstar_v47` Manual / plan lines | Dual46 freeze inputs · **you click** — no TV auto-orders as authority |
| Optional | Gated PRB Manual ON if running PRB sleeve | Aug is a live PRB month ([[gated-prb-live-guide]]) |

**Broker is authority.** Copy LIMIT / STOP / TP · confirm **$ risk = qty × stop × $2** before send.

## 4. Data architecture (what to log so we can improve)

Every live fill / skip on Apex gets one journal row with **phase + firm locked**:

| Field | Why |
|---|---|
| `phase` = **eval_sprint** | Never mix with funded extract stats |
| `firm` = **apex50-intraday** | Rules differ from TPT / Apex EOD |
| `sleeve` = script \| disc \| shadow | Disc must stay off live |
| `stopPts` · `qty` · `riskUsd` | Prove floating contracts |
| `mfeUsd` · `maeUsd` | Apex trail is an **MFE story** |
| `trailRoomAtEntry` | Equity − floor before click |
| `beMoved` Y/N · time | Process audit |
| `outcome` · `pnlUsd` (broker net) | Cash truth |
| `skipReason` if no take | Frequency vs discipline |

**Weekly rollup (Sunday):** n takes · win $ · loss $ · max open MFE · closest trail room · checklist breaches · pass progress ($ / $3k).

**Do not** co-mingle Dual46 May replay P&L into Apex pass claims.

## 5. Backtests you can run this weekend (TradingView)

TV Strategy Tester **does not** model Apex unrealized trail. Treat exports as **trade EV / loss-shape**, then stress open-MFE mentally or in Lab.

### A — Locked Lab control (PRB)

1. Chart `CME_MINI:MNQ1!` · 5m (or your PRB TF).  
2. Paste **`pine/Powell_Rejection_Block_v1.pine`** only (locked — do not edit).  
3. Deep Backtest · window **2023-07-01 → today** (or last 12m if Premium time-limited).  
4. Export List of Trades →  
   `vault-app/data/tv-exports/matrix/prb-a0a-apex-prep.csv`  
5. Vault Lab → firm **Apex $50K Intraday** if available · buffer **2000** · passAt **3000** · RUN.  
6. Record pass/bust / weeks — **diagnostic**, not income claim.

### B — Morningstar strategy harvest (current Dual47 tester)

1. Paste **`pine/Morningstar_v47_strategy.pine`** (build tag must match file header).  
2. Defaults: Leave+Powell ON · Limit @ wick · qty 10 is **Tester only** — for Apex prep, mentally rescale to $300 risk.  
3. Deep BT · prefer **2026-05-01 → today** (post Dual46 freeze window) **and** a longer 12m if time.  
4. Export → `matrix/msv47-apex-prep-YYYYMMDD.csv`.  
5. In spreadsheet or Lab: flag any trade with stop &gt; 20 pts as **skip under sprint rules**; recompute path with BE@1R haircut if export has MFE.

### C — What we do **not** need new Pine for (yet)

| Idea | Why wait |
|---|---|
| JJ fair-value HF sleeve | Separate Stage-0 · not ready for this eval |
| Auto BE / Apex trail sim in Pine | Nice later · **manual BE** is enough this week |
| Dual46 retune for frequency | Freeze holds · frequency problem ≠ retune mid-walk |

If a Pine change is worth it **after** this week: LiveCoach profile **“Apex Intraday Eval”** ($300 · BE@1R reminder · pass $3k / trail $2k HUD). Not a blocker for Monday.

## 6. Week plan (template)

| Day | Focus |
|---|---|
| Pre-week | Dashboard verify · paste Coach + Morningstar · paper 1 dry-run session |
| Mon | Bias + script arm only · $300 · if no arm → **skip** (zero is fine) |
| Tue–Thu | Same card · honor DLL / profit lock |
| Fri | If ≥+$2,000 progress: reduce risk to $200 · grind remainder without open runners |
| Weekend | Journal rollup → agent review · decide continue / pause |

## 7. After pass (do not use this card on PA day 1)

Apex **PA** still has intraday trail **and** ~50% payout consistency + qualifying days. Switch to [[funded-playbook]] extract rules: smaller size until cushion, then Dual46-class selective — separate ledger `phase = funded_extract`.

## 8. Frequency reality (do not expect Dual46 to pass Apex)

June script sleeve ≈ **0.5 fills/week**. That cannot be the pass engine inside a ~30-day window except via rare win clusters.

| Path | Role |
|---|---|
| Dual46 / sparse Morningstar | **Extract / study** — not Apex sprint identity |
| Active Stage-0 for cadence | **Lane S S3** — Macro A ∪ widened Reaper (`pine/LaneS_ReaperMacroA_measure_v0.pine`) |
| After S3 closes | Queue **JJ-P2-MR** as separate HF candidate |
| Multi-account factory | **Blocked** until per-box chain E[$/wk] > 0 |

Max **60 micros** is a firm ceiling. Sprint risk stays **$300–$400** — max contracts accelerate bust, not pass.

See canvas `pass-speed-mitigation` + agent briefs in chat.

## 9. Success criteria for this experiment

| Gate | Toward | Away |
|---|---|---|
| Process | ≥80% rows have riskUsd + BE logged · 0 disc live takes | Disc reappears · fixed-10 identity |
| Trail | Never inside $400 of floor on open trade | Open giveback near floor |
| Pass | Hit $3k or still alive with clean process at day-30 | Bust from disc / wide stop / no-BE runner |

No Lab promote language from one Apex attempt.
