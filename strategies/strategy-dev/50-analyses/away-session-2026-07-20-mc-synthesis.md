---
updated: 2026-07-20
tags: [away-session, monte-carlo, synthesis, regime-gate, dual46, path-mc]
---
# Away session · 2026-07-20 — MC / analysis synthesis

> Offline only. No invented Deep Backtest numbers. Path MC / `E[$/wk]` first (SCORECARD).  
> Dual46 = chart study — **never Lab-promote**. Locked PRB v1 untouched. Killed Track B not reopened.

## What was re-run (this session)

| Command (cwd `vault-app/`) | Exit | Notes |
|---|---|---|
| `npx tsx scripts/weekly-review.ts` | **0** | Wrote `strategies/strategy-dev/50-analyses/weekly-review-latest.md` — only **1** cohort scanned (script does not recurse `eval/` / `funded/` subdirs; limitation, not missing data) |
| `npx tsx scripts/lab-confirm-regime-gate-v0.ts` | **0** | Refreshed `vault-app/data/tv-exports/regime-gate-v0-lab-confirm.json` + 4 new cohort notes under `strategies/cohorts/{eval,funded}/2026-07-20_*` |
| `npx tsx scripts/analyze-chain-ev-gated.ts` | **0** | Refreshed `vault-app/data/tv-exports/chain-ev-gated-vs-ungated.json` + `strategies/strategy-dev/50-analyses/phase2-chain-ev-gated.md` |
| `npx tsx scripts/research-queue-status.ts` | **0** | All 13 Track B matrix CSVs closed (kill/away · BLOCK) |

**Not re-run (existing JSON cited as-is):**

- `vault-app/data/tv-exports/prb-3y-autopsy.json` (generated 2026-07-14)
- `vault-app/data/tv-exports/hybrid-matrix-analysis.json` (built 2026-07-14 · premium 365d matrix)

---

## Path MC — regime-gate-v0 Lab confirm (authority)

Source: `vault-app/data/tv-exports/regime-gate-v0-lab-confirm.json` · `generated: 2026-07-20T21:21:35.682Z`  
MC: sims=2000 · maxTrades=220 · buffer=$2000 · Jul+Oct STAND_DOWN gate.

| Book | Window | Kind | n | E[$/wk] | Pass% | Bust% |
|---|---|---|---|---|---|---|
| A0a | full | ungated | 120 | **$14** | 41.1 | 58.9 |
| A0a | full | gated | 100 | **$28** | 56.2 | 43.9 |
| A0a | oos | ungated | 40 | **$112** | 84.8 | 15.3 |
| A0a | oos | gated | 36 | **$144** | 91.2 | 8.9 |
| D1 | full | ungated | 120 | **$32** | 95.8 | 42.1 |
| D1 | full | gated | 100 | **$37** | 122.9 | 32.5 |
| D1 | oos | ungated | 40 | **$116** | 191.7 | 9.8 |
| D1 | oos | gated | 36 | **$152** | 207.9 | 5.6 |

**Verdicts in file:** A0a **PASS** · D1 **PASS** · overall **PASS**.

Gated books improve full-window `E[$/wk]` and cut bust vs ungated; OOS gated remains ≥ ungated on E[$/wk] with lower bust. **toward** for Jul+Oct STAND_DOWN as ops overlay (calendar hygiene — not a causal “regime alpha”).

New cohorts this run:

- `strategies/cohorts/eval/2026-07-20_212133312_a0a_prb_control_regime_gate_v0.md`
- `strategies/cohorts/eval/2026-07-20_212134110_a0a_prb_control_regime_gate_v0_oos.md`
- `strategies/cohorts/funded/2026-07-20_212134917_d1_prb_rr6_funded_raw_regime_gate_v0.md`
- `strategies/cohorts/funded/2026-07-20_212135681_d1_prb_rr6_funded_raw_regime_gate_v0_oos.md`

---

## Path MC — chain EV gated vs ungated (A0a→D1)

Source: `vault-app/data/tv-exports/chain-ev-gated-vs-ungated.json` · `generated: 2026-07-20T21:21:33.330Z`  
Primary metric: `labEngine.chainEWeek`.

| Slice | chain E[$/wk] | settle |
|---|---|---|
| Ungated full 3y | **−$15** | — |
| Gated full 3y | **−$6** | `settleFull: PASS` (Δ +$9/wk vs ungated) |
| Ungated OOS ≥2025-07-14 | **+$32** | — |
| Gated OOS | **+$50** | `settleOos: PASS` (Δ +$18/wk) |

Book-level labEngine (same file):

| Slice | eval E[$/wk] | eval bust% | funded E[$/wk] | funded bust% |
|---|---|---|---|---|
| ungated_full | $14 | 57.5 | $28 | 43.4 |
| gated_full | $27 | 41.6 | $38 | 33.6 |
| ungated_oos | $111 | 15.5 | $112 | 11.1 |
| gated_oos | $142 | 9.7 | $148 | 5.7 |

**Reading:** Gate **toward** on chain Δ and bust. Full-window chain E[$/wk] still **negative** (−$6 gated) — pass/bust on single books can look fine while chain economics remain harsh. OOS chain is the bright spot (+$50 gated). Do not claim “income settled” from full-3y chain alone.

---

## Existing JSON (not re-run) — autopsy + hybrid 365d

### `prb-3y-autopsy.json` (2026-07-14) — ungated 3y proxy MC

| Book | n | MC E[$/wk] | Pass% | Bust% |
|---|---|---|---|---|
| A0a eval | 120 | **$4** | 35.6 | 64.4 |
| D1 funded | 120 | **$27** | 91.7 | 44.5 |

Autopsy MC is a different builder path than Lab-confirm; Lab-confirm / chain-ev above are SCORECARD authority for gate settlement. Autopsy still useful for year/month loss-shape (Jul/Oct barren cells motivated the gate).

### `hybrid-matrix-analysis.json` (2026-07-14) — premium **365d** (not 3y)

Pass/bust only in this file (no E[$/wk] field on individuals):

| Book | n | Expectancy $/trade | Pass% | Bust% |
|---|---|---|---|---|
| A0a | 40 | $325 | 78.6 | 21.4 |
| D1 | 40 | $423 | 78.9 | 17.9 |
| B1a Macro A | 14 | $355 | 73.6 | 26.1 |
| B0 Macro full | 26 | $132 | 41.3 | 58.5 |
| B1c | 8 | −$301 | 3.3 | 96.6 |

Union pick-better / both-days-sum: pass ~76–77% · bust ~23% on n=54 (365d). **Diagnostic only** vs 3y path MC — do not promote Hybrid from this sleeve alone (H0a trail-weak vs A0a already settled in sim-queue).

---

## Dual46 May / June (chart study — no Lab promote)

Sources:

- `strategies/strategy-dev/50-analyses/morningstar-dual46-june-week1-harvest.md`
- `strategies/strategy-dev/50-analyses/morningstar-dual46-may-harvest.md`
- `strategies/strategy-dev/50-analyses/morningstar-dual46-lock.md`

| Month | Status | Script sleeve (scorecard) | Gross @ 10 MNQ |
|---|---|---|---|
| **June 2026** | **COMPLETE** | 3 arms · 2 fills · **2W/0L** (+$3,990) | +$16,925 all takes (disc+script) |
| **May 2026** | **IN PROGRESS** (05-01→05-06 logged) | **0 arms / 0 fills** | Disc only −$260 (1L); Dual46 scorecard still June’s 2W/0L |

June harvest verdict language: **toward** on process/script evidence · **away** from prop math (n=2 script fills — no path MC / E[$/wk]). May: no verdicts yet; one open Stage-0 discipline holds.

**Hard line:** Dual46 stays locked freeze / journal walk. Never Lab-promote from these harvests.

---

## Track B / Stage-0 queue

`research-queue-status.ts`: **13/13** Track B CSVs closed (ORBreak/ERXor kills + B2–B12 away·BLOCK). Idle hint: propose next Stage-0 from kill-lessons — **one only**.

Per `sim-queue.md` + `lane-s-s3-reaper-macroa-v0.md`:

- S2 Reaper = **AWAY / DESERT** — do not salvage.
- Open Stage-0: **Lane S · S3** Reaper × Macro A — waiting on human TV Deep BT export  
  **`vault-app/data/tv-exports/matrix/lane-s-reaper-macroa-mnq-5m.csv`** — **file absent** as of this session.

No new Stage-0 idea drafted this away session (one open candidate already: S3).

---

## Clear toward / away / idle verdicts

| Item | Verdict | Why |
|---|---|---|
| Regime-gate-v0 (Jul+Oct STAND_DOWN) Lab confirm | **toward / PASS** | E[$/wk]↑ · bust↓ full+OOS on A0a & D1 (`regime-gate-v0-lab-confirm.json`) |
| Chain EV A0a→D1 gated vs ungated | **toward on Δ** · full chain still **harsh** | Gated chain −$6 vs ungated −$15; OOS gated +$50 (`chain-ev-gated-vs-ungated.json`) |
| Ungated 3y PRB (autopsy MC) | **hold / ops-dependent** | A0a E[$/wk]~$4 · high bust; gate is the live ops path |
| Hybrid 365d matrix | **diagnostic** | Strong pass% on short window; not 3y path authority |
| Dual46 June | **toward** process · **away** income claim | Script 2/2 · n too thin for Lab |
| Dual46 May | **idle / in progress** | 0 script arms so far |
| Track B B0–B12 | **kill / away · BLOCK** | Do not retune |
| Lane S S3 | **idle — waiting CSV** | Only open Stage-0 |

---

## Blockers for human

1. **TV export (blocking Stage-0):** Deep Backtest → save as  
   `vault-app/data/tv-exports/matrix/lane-s-reaper-macroa-mnq-5m.csv`  
   (MNQ · measure Pine per [[lane-s-s3-reaper-macroa-v0]] · then agent runs `analyze-event-study.ts`).
2. **Ops (not blocked by data):** Keep gated PRB Jul STAND_DOWN live per [[gated-prb-live-guide]] — MC reconfirm still PASS.
3. **Dual46:** Continue May replay / journal only — no Lab upload, no pine retune mid-walk.
4. **Optional hygiene:** `weekly-review.ts` should recurse cohort subdirs (currently under-counts); not a research blocker.
5. **Do not:** invent Deep BT numbers · Lab-promote Dual46 · reopen killed Track B via param retune · edit `pine/Powell_Rejection_Block_v1.pine`.

---

## Executive close

Re-ran Lab-confirm + chain-EV + queue status on existing matrix CSVs; gate remains **PASS / toward**. Full-3y chain E[$/wk] still negative even gated — OOS chain is where economics clear. Dual46 June complete (script thin), May walking. Next evidence gate is **S3 CSV from human**, not more MC on the same files.
