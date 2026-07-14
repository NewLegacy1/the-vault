---
updated: 2026-07-14
status: active
owner: strategy-dev
tags: [execution-plan, agent-brief, 3y, post-mortem, strategy-dev]
---
# Execution plan — post-3y reset (agent brief)

> **Status:** ACTIVE — read this before proposing new Pine, Lab runs, or “brand new strategies.”  
> **Context date:** 2026-07-14 · after Tier 0 3y matrix MC (max trades 220) **including Macro B0→B1a**.  
> **North star (unchanged):** `E[$/calendar week]` after fees — [[prop-firm-math]].

## 0. One-sentence brief for any agent

The 3y deep-backtest matrix showed that mechanized ICT/PRB/Macro models are **not a durable prop-income product** as currently encoded. Do **not** keep polishing Hybrid/Macro toggles or invent random new setups. First **autopsy regime structure on A0a/D1 ledgers**, then either **gate an existing edge** or launch **Track B: one new non-ICT coded candidate** designed for trail-compatible loss shape.

## 1. What just happened (facts agents must not re-litigate)

Tier 0 3y books (`2023-07 ≈ → 2026-07`, Lab max trades **220**, payout buffer **2000**). Ranked by `E[$/wk]`:

| Book | Pass / bust | E[$/wk] | Weeks → payout | Verdict |
|---|---|---|---|---|
| **H0b** Hybrid funded (D1 ∪ Macro A) | ~69% / ~54% | **$36** | **5.6** | Best EV/wk · **max DD ~$19k** still trail-hostile |
| **D1** PRB RR6 funded | ~95% / ~43% | **$28** | 11.7 | Best clean recycle · still thin income |
| **A0a** PRB eval | ~42% / ~58% | **$15** | 35 | Barely alive · 1y ~84% pass story **dead** on 3y |
| **H0a** Hybrid eval | ~26% / ~73% | **$10** | 18.6 | **Kill as eval income** (worse pass than A0a) |
| **B1a** Macro A-tier only | ~84% / ~49% | **$6** | 24.5 | **Sleeve only** — not standalone income (0.2 tr/wk) |
| **H2a** Hybrid 9:50 Macro only | ~23% / ~77% | **~$0** | 21 | **Kill** — worse than H0a |
| **B0** Macro full book | ~34% / ~74% | **−$4** | 10 | **Kill** (feed for Lab filters only) |
| **M0 / M1** Macro v2 $400 | ~16–20% / ~83–85% | **−$4** | ~33 | **Kill** (BE@2R does not rescue) |

Companion snapshot: [[tier0-3y-checklist]] · kills: [[sim-queue]] / [[findings-macro]].  
Cohorts live under `strategies/cohorts/{eval,funded}/` (1y baselines in `_archive_365d_jul2026/` — **do not MC-compare** to 3y as if same window).

### Macro B0 → B1a (settled 2026-07-14 evening)

- One Macro v1.4 Deep Backtest → Lab **B0**; **B1a** = Lab derived filter `tier === "A"` from that CSV (signals `Long_A` / `Short_A`).
- **Do not** tell the user to run a second TV/Pine export for A-only. Lab already does it. Optional Pine “Allowed tiers” input is convenience, **not** the matrix SOP.
- A-filter is real: B0 −$10.6k / 76 trades / E[$/wk] −$4 → B1a +$3.2k / 38 trades / E[$/wk] **$6**, payout 34% → 84%.
- Still loses badly to **H0b $36** / **D1 $28** as a primary. Keep B1a only as **Hybrid sleeve ingredient**; B0 alone stays dead.
- 1y B1a (~$106 raw/wk, n=14) was a soft sample — do not revive Macro-alone income on that number.

### Lab / agent hygiene (from this chat — do not repeat)

- Prefer existing Lab presets and post-filters over adding strategy UI the user didn’t need.
- If the user asks for an A-only “button” on TradingView: answer **Lab B1a from B0**, don’t default to a new Pine profile.
- Graveyard stays closed: M2 volume, A+ as primary, blind 10:50, H2a as “safer H0a,” M0/M1 polish.

### Structural diagnosis (not a KPI bug)

- Books are **low frequency** (~0.2–1.1 tr/wk) with **fat right tail** (rare ~$1.9–2.3k winners) and many ~$400–$800 losses / scratches.
- Inside a **$2k trail**, cold streaks dominate over 3y even when 1y premium looks fine.
- Hybridizing for cadence **adds Macro legs** → faster extract on funded (H0b) but **DD far beyond trail** and **eval death** (H0a/H2a).
- **`E[$/wk]` is still the correct KPI.** Wrong product assumption was: *one Pine ICT encoding → cohesive forever strategy → durable income.*

## 2. Standing decisions (agent DO / DO NOT)

### DO

1. Prefer **ledger autopsy and regime gates** over new model sprawl.
2. Keep Lab / Pine / cohort hygiene: one variable, saved cohort, promotion rule.
3. Design any new edge for **loss distribution vs $2k trail first**, then expectancy, then MC.
4. Treat strategies as a **small portfolio with kill criteria**, not one forever SOP.
5. Split R&D into **Track A (prop income)** vs **Track B (edge research)** — see §4.

### DO NOT

1. **Do not** reopen graveyard: M2 volume Macro, A+ Macro as primary, blind 10:50, H2a “safer hybrid,” M0/M1 BE polish, trail-as-default, A0b/A1c polish (unless 3y OOS explicitly reverses).
2. **Do not** promote **B0** or **Macro-alone B1a** as funded income — B1a is sleeve-only; B0 is dead.
3. **Do not** invent a second TV Deep Backtest for A-tier when Lab **B1a (from B0)** already filters the book.
4. **Do not** propose Bookmap / new chart tools as the rescue plan — they don’t enter MC ledgers.
5. **Do not** “fix income” by stacking Macro frequency onto PRB until loss shape is trail-safe (H0b speed ≠ trail survival).
6. **Do not** modify `pine/Powell_Rejection_Block_v1.pine` (locked). Variants only.
7. **Do not** invent a second ICT mentorship encoding (another PRB/Macro clone) and call it Track B.
8. **Do not** scale multi-account until a book has clearly positive `E[$/wk]` on **full 3y + last-12m OOS**.

## 3. Phased execution plan

### Phase 0 — Freeze + reframe (done)

- [x] Accept 3y matrix as the truth window for durability.
- [x] Keep KPI = `E[$/wk]` after fees (chain when available).
- [x] Reframe goal: **portfolio of edges with kill criteria**, not one cohesive forever model.
- [x] Finish Tier 0 Macro cut: B0 kill · B1a sleeve-only · H2a/M0/M1 kill · H0b/D1 leaders on EV/wk.
- [ ] Update live language in playbooks when Phase 1 settles (eval/funded “current leader” may downgrade).

**Exit:** Any agent reading this file understands Hybrid/Macro are not the durable income path, will not queue cosmetic toggles, and will not re-run Macro A as a second Pine export.

### Phase 1 — Autopsy before invention (DONE 2026-07-14 · see [[phase1-autopsy-a0a-d1]])

| # | Task | Status | Result |
|---|---|---|---|
| 1.1 | Year / half-year expectancy split | [x] | Edge **non-stationary** — IS pre-2025-07 negative; OOS last 12m carries almost all EV |
| 1.2 | Winner cluster analysis | [x] | 14–16 ~$1.9–2.3k winners; clustered mid-2025→2026; Jul/Oct WR **0%** |
| 1.3 | Loss-streak / bust path analysis | [x] | 4–5L ~$400 streaks; several ≥$2k trail-death paths 2023–early 2025 |
| 1.4 | News / red-folder overlay | [x] | Red stand-down **kills** A0a EV — not a PRB gate |
| 1.5 | Regime gate draft | [x] | **`regime-gate-v0`:** STAND_DOWN Jul+Oct · predicted lift held on full + OOS proxy MC |

**Primary gate:** `TRADE` iff calendar month ∉ {7,10}. Ledgers: `matrix/prb-*-3y-gate-jul-oct.csv` (n=100). Script: `vault-app/scripts/analyze-prb-3y-autopsy.ts`.

**Success gates:** cleared on script proxy (OOS E[$/wk] ↑, bust ↓, n=100). **Phase 2** = Lab confirm + [[findings-prb]] settle. Track B deferred while Track A gate is live.

**If Lab Phase 2 falsifies the gate:** reopen Track B (one non-ICT candidate).

### Phase 2 — Conditional Track A (only if Phase 1 finds a gate)

Use existing PRB/D1 ledgers + gate. Do **not** re-open Macro as primary.

| # | Experiment | Prediction | Kill if |
|---|---|---|---|
| 2.1 | A0a / D1 **× regime gate** (CSV filter → Lab) | E[$/wk] ↑ vs ungated 3y | OOS E[$/wk] ≤ ungated or sample < useful floor |
| 2.2 | Min-day pad overlay (ops) — **after** 2.1 looks good | P(payout\|pass) ↑ | Doesn’t change bust math materially |
| 2.3 | Chain EV A0a→D1 with gate | Full-loop E[$/wk] documented | Chain EV ≤ 0 after fees |

Still blocked unless gate clears: second Macro window, same-day Macro+PRB sleeve as *new* primary, B0/B1a as funded primary, risk scale-up.

Update [[findings-prb]] with gate result (settle: works / fails). Optional: one-line settle in [[findings-macro]] — B0 kill / B1a sleeve-only on 3y.

### Phase 3 — Track B: new coded edge research (parallel once Phase 1 started; primary if autopsy is empty)

**Goal:** find **any** durable expectancy with trail-compatible losses — not translate another ICT SOP into Pine.

#### Design constraints (non-negotiable)

1. **Loss shape first:** design stop / BE / size so a realistic loss streak fits in $2k trail (document assumed max consecutive losses × $risk).
2. **Falsifiable entry:** rule fits in ≤10 lines; no “narrative confirmation.”
3. **Two windows required before promotion discussion:** full ~3y deep BT **and** last 12m OOS.
4. **Cadence target only after survival:** if income is the claim, state required tr/wk; if research-only, say so.
5. **Family tag:** `strategy_family: custom` · save cohorts under `cohorts/research/` until it beats a Track A baseline on prop math.

#### Candidate pipeline (pick **one** first; do not farm five)

| ID | Idea class | Why allowed | First test |
|---|---|---|---|
| **B0** | Time/vol session rule + hard stop (e.g. open drive / range condition) | Explicit, codeable, measurable | expectancy + loss hist before MC |
| **B1** | Mean-reversion **xor** continuation with **regime switch** | Addresses 3y non-stationarity directly | same |
| **B2** | Data H/L (X-series) only if already sketched — treat as custom | Exists as research series in cohorts index | must pass same constraints |

**Out of scope for Track B v0:** order-flow platforms, discretionary heatmap confirmation, rewriting Macro/PRB “better.”

#### Track B success → promotion path

1. Research cohort: positive expectancy + trail-safe loss math on 3y + OOS.  
2. Lab MC TPT $50K: `E[$/wk] > 0` after fees; bust acceptable vs current D1 (~43%) or better.  
3. Only then: consider eval/funded phase split and playbook entries.  
4. Naming: new Pine file under `pine/` (never overwrite locked PRB).  

### Phase 4 — Ops scale (last)

Only when a book has **full-sample + OOS** `E[$/wk]` clearly positive:

- Multi-account parallelism  
- PRO size ladder after cushion  
- Live discretionary overlay as **tagged A/B**, not silent filter  

Until then: **no** multi-account as a substitute for edge.

## 4. Two-track R&D model (agent operating map)

```text
                ┌─────────────────────────────┐
                │  Phase 1 autopsy (A0a/D1)   │
                └─────────────┬───────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
   Regime structure found              No structure / noise
              │                               │
              ▼                               ▼
   Track A: gated PRB/D1              Track B: one new coded edge
   (Lab CSV filter → MC)              (loss shape → expectancy → MC)
              │                               │
              └───────────────┬───────────────┘
                              ▼
                    E[$/wk] > 0 on 3y + OOS
                              │
                              ▼
                    Phase 4 ops / multi-account
```

| Track | Optimize | Allowed tools | Forbidden |
|---|---|---|---|
| **A — Prop income** | trail survival + E[$/wk] | filters on existing ledgers, BE/RR phases, gates | frequency stacks that blow DD |
| **B — Edge research** | raw expectancy + loss hist first | new Pine/code under constraints | ICT clone sprawl; promo without trail math |

## 5. Immediate sprint board (next agent session)

Phase 1 autopsy **done** — [[phase1-autopsy-a0a-d1]]. Next is **Phase 2 Lab confirm**:

1. [x] Locate matrix CSVs: `prb-a0a-3y.csv`, `prb-d1-3y.csv`.
2. [x] Year + OOS splits (script + MD).
3. [x] Winner / loss-streak / news clusters.
4. [x] Draft gate: **Jul+Oct STAND_DOWN** (`regime-gate-v0`).
5. [ ] Lab MC: upload `prb-a0a-3y-gate-jul-oct.csv` + `prb-d1-3y-gate-jul-oct.csv` (presets A0a / D1) · hypothesis `regime-gate-v0` · buffer 2000 · max 220 · full + OOS 12m · auto-save cohorts.
6. [ ] Settle [[findings-prb]] from Lab numbers (script proxy already says works — Lab is source of truth for promotion).
7. [ ] Only if Lab falsifies gate: Track B ticket — **one** candidate; don’t confuse Track B idea IDs B0/B1 with Lab Macro `matrix-b0` / `matrix-b1a`.

## 6. How this overrides / relates to other docs

| Doc | Relationship |
|---|---|
| [[STRATEGY_DEV_AGENT]] | Still the charter — this plan is the **current mission focus** |
| [[roadmap]] | Tracks 1–4 remain historical backlog; **defer** Macro income / Hybrid polish until Phase 1–2 resolve |
| [[sim-queue]] | Tier 0 done · Tier 1 only if it serves **regime gate / H1 quiet on 3y**, not cosmetic |
| [[tier0-3y-checklist]] | Evidence snapshot this plan interprets |
| [[findings-prb]] / [[findings-macro]] | Update after Phase 1–2; Macro graveyard stands |
| [[chain-ev-spec]] | Still useful **after** a gated or Track B book exists |
| SOPs (Powell / Macro) | Educational / discretionary reference — **not** automatic Lab promotion authority |

## 7. Communication rules for agents talking to the user

- Be direct: 3y collapse is **useful falsification**, not a reason to thrash tools.
- Do not promise a “long-lasting cohesive strategy” as a single Pine script destiny.
- Prefer “gate or invent” language: autopsy → gate Track A **or** Track B new edge.
- Surface `E[$/wk]` and bust/loss-shape before pass%.
- If the user asks for something that won’t work or is already solved in Lab (e.g. separate Pine for A-tier), **say so first** — don’t build the redundant path.

## 8. Change log

| Date | Change |
|---|---|
| 2026-07-14 | Created after 3y Tier 0 MC + senior review. Active brief for all strategy-dev chats. |
| 2026-07-14 | Added final B0/B1a + H2a/M0/M1 numbers; Lab B1a-from-B0 SOP; sleeve-only B1a; agent hygiene (don’t overbuild TV filters); Track B ID collision note. |
| 2026-07-14 | Phase 1 autopsy complete — `regime-gate-v0` Jul+Oct STAND_DOWN; next = Phase 2 Lab confirm. |
