---
updated: 2026-07-14
tags: [spec, lab, monte-carlo, strategy-dev]
status: approved-for-build
---
# Chain EV panel — product & engineering spec

> **Problem:** Lab and Results optimize **one phase at a time** (eval pass % *or* funded payout %). The real business loop is **eval → funded → withdraw → recycle → next eval**. Sprint-eval + sustain-funded and discretionary execution leakage cannot be compared on a single MC run today.
>
> **Solution:** Operationalize **chained E[$/calendar week]** — pair eval and funded presets/cohorts, compute full-path economics in one panel, and optionally show **discretionary confidence bands**.

Related: [[prop-firm-math]] · [[eval-playbook]] · [[funded-playbook]] · [[hybrid-playbook]] · [[mc-calibration-plan]] · [[sim-queue]]

---

## 1. Goals & non-goals

### Goals

| # | Goal | Success signal |
|---|------|----------------|
| G1 | Show **full business-loop EV** for a strategy family in one Lab view | A0a+D1 chained E[$/wk] ≈ documented ~$104/wk (±10%) |
| G2 | Compare **sprint eval** vs **sustain funded** profiles side-by-side | A1c vs A0a eval pass/weeks vs D1 funded extract — ranked by chain EV |
| G3 | Surface **missing counterpart** clearly | “Run `matrix-d1` funded book to complete chain” CTA |
| G4 | Bound **discretionary leakage** without pretending precision | Low/base/high band on pass and chain E[$/wk] |
| G5 | Persist chain metrics on cohort save for Results / Obsidian | YAML `chain_*` fields on eval cohort notes |

### Non-goals (v1)

- Tick-level intraday MAE / news restriction enforcement in MC
- Automatic Pine export or TV integration
- Multi-account parallel ops modeling (spreadsheet overlay only in v1)
- Replacing single-phase stat strip — chain panel **supplements** it

---

## 2. User stories

### US-1 — Eval researcher (sprint pass)

> As a trader testing A1c (aggressive eval cap), I want to see whether faster pass time beats A0a **after** pairing with D1 funded economics, so I don’t optimize a phase that loses on the full loop.

**Acceptance:** Chain panel shows A1c eval leg + D1 funded leg + combined E[$/wk]; highlights if chain EV < A0a+D1 baseline.

### US-2 — Funded researcher (extract)

> As a trader on D1 RR6, I want to see which eval book I should pass with (A0a vs H0a) to maximize chain EV, not funded payout alone.

**Acceptance:** Funded preset selects eval counterpart dropdown; chain recomputes live.

### US-3 — Portfolio (hybrid)

> As a trader running PRB eval + Macro funded on different days, I want a **portfolio chain** view (two engines, zero overlap), not a fake merged ledger.

**Acceptance:** Portfolio mode shows A0a pass chain **in parallel with** B1a funded chain; combined E[$/wk] = sum (documented assumption: uncorrelated accounts).

### US-4 — Discretionary honesty

> As a trader, I want to see how much pass rate and E[$/wk] might move if execution is 10% worse than the CSV, so I can plan live with a band not a point estimate.

**Acceptance:** Toggle “Execution band” shows low/base/high chain E[$/wk].

---

## 3. Core economics model

### 3.1 Two-cohort chain (primary v1 mode)

Inputs:

- **Eval leg** — cohort or live MC with `simMode: eval_path` (or eval-phase preset defaults)
- **Funded leg** — cohort or live MC with `simMode: funded_only` on **funded profile ledger** (may differ from eval ledger)

From each leg, read `PayoutCycleMetrics` via existing `derivePayoutCycle()` (`lib/payout-cycle.ts`).

```text
P_pass     = eval.passPct / 100
P_pay|pass = funded.payoutGivenPassPct / 100   # funded payoutRate / passRate in funded_only ≈ survivor extract rate
E_net|pay  = funded.medianNetPerAccountUsd     # or expectedNetPerAccountUsd — see §3.4
E_fail     = −(evalFee + activationFee_prorated + monthlyFee × ceil(weeksToPass/4))

E_chain_acct = P_pass × P_pay|pass × E_net|pay
             + P_pass × (1 − P_pay|pass) × E_survive_no_pay   # optional v1.1
             + (1 − P_pass) × E_fail

weeks_chain  = eval.weeksToPassP50 + funded.weeksToPayoutP50
E_chain_wk   = E_chain_acct / weeks_chain
```

**v1 simplification:** Treat `E_survive_no_pay` as 0 (passed eval, blew funded before withdraw = −activation fee only). Document in UI.

### 3.2 Live dual-run mode (Lab convenience)

When user RUNs in Lab on eval preset:

1. Run primary MC (current behavior).
2. If chain pair exists, **auto-run funded MC** on counterpart ledger:
   - Prefer saved counterpart cohort `tradePnls` / `tradeDates`
   - Else if same CSV uploaded and funded preset shares `dataSource`, run funded params on **same trades** (warn: exit profile may differ — label “same-ledger approximation”)
3. Compute chain client-side; no new API.

### 3.3 Portfolio chain (hybrid v1.1)

For pairs like `A0a (eval) + B1a (funded)` with **0 same-day overlap**:

```text
E_portfolio_wk = E_chain_wk(A0a, D1_placeholder) + E_chain_wk(B1a_standalone_funded)
```

`B1a_standalone_funded`: funded_only MC starting at PRO (no eval leg). Eval fee = 0 on Macro leg.

UI label: **“Parallel accounts — not sequential chain.”**

### 3.4 Median vs expected (decision)

| Field | Use for |
|-------|---------|
| `expectedNetPerAccountUsd` | Single-phase strip (current) — mean over all sims including busts |
| `medianNetPerAccountUsd` | Chain extract on **payout paths** — less skewed by rare jackpots |

**Spec decision:** Chain panel displays **both**:

- **E[$/wk] expected** — business planning number (includes bust mass)
- **E[$/wk] median extract** — “typical successful cycle” secondary line

Primary ranking uses **expected** to match [[prop-firm-math]].

### 3.5 Sprint eval score

Auxiliary metric for eval-only comparison:

```text
sprint_score = passPct / weeksToPassP50    # higher = faster pass
```

Show sprint_score on eval leg; **never** use as primary rank without chain EV.

---

## 4. Strategy pair registry

New module: `vault-app/lib/strategy-chain.ts`

### 4.1 Types

```ts
export type ChainMode = "sequential" | "portfolio_parallel";

export interface StrategyChainPair {
  id: string;
  label: string;
  mode: ChainMode;
  evalPresetId: string;
  fundedPresetId: string;
  /** Optional third leg for portfolio_parallel */
  portfolioLegPresetId?: string;
  notes?: string;
}

export interface ChainEvResult {
  pairId: string;
  firmId: string; // default tpt50
  eval: PayoutCycleMetrics;
  funded: PayoutCycleMetrics;
  expectedNetPerAccountUsd: number;
  expectedUsdPerCalendarWeek: number | null;
  medianNetPerAccountUsd: number;
  medianUsdPerCalendarWeek: number | null;
  weeksChainP50: number | null;
  sprintScore: number | null;
  warnings: string[];
  method: "cohort_pair" | "live_dual_run" | "same_ledger_approx";
}
```

### 4.2 Initial pairs (ship with v1)

| `id` | Eval preset | Funded preset | Mode | Notes |
|------|-------------|---------------|------|-------|
| `prb-a0a-d1` | `matrix-a0a` | `matrix-d1` | sequential | **Primary control** — same PRB entries, different exit profile |
| `prb-a0b-d1` | `matrix-a0b` | `matrix-d1` | sequential | BE@2R eval variant |
| `prb-a1c-d1` | `matrix-a1c` | `matrix-d1` | sequential | **Sprint eval** — cap $1,490 |
| `hybrid-h0` | `matrix-h0a` | `matrix-h0b` | sequential | Hybrid sleeve TV exports |
| `hybrid-h1` | `matrix-h1a` | `matrix-h1b` | sequential | Quiet Macro filter |
| `portfolio-a0a-b1a` | `matrix-a0a` | `matrix-d1` | portfolio_parallel | `portfolioLegPresetId: matrix-b1a` — 0 overlap diversifiers |

Registry API:

```ts
chainPairForPreset(presetId: string): StrategyChainPair | undefined
counterpartPresetId(presetId: string): string | undefined
allPairsForSeries(seriesId: string): StrategyChainPair[]
```

### 4.3 Sprint preset family (v1.1)

Add optional `chainRole: "eval_sprint" | "eval_control" | "funded_sustain"` on `StrategyPreset` in `lab-profile.ts` for UI badges — no new presets required initially (A1c = sprint, A0a = control, D1 = sustain).

---

## 5. Discretionary bands (v1.1)

New module: `vault-app/lib/ledger-haircut.ts`

### 5.1 Haircut transforms (apply before MC)

| Scenario | Transform | ε proxy |
|----------|-----------|---------|
| `base` | none | 0 |
| `execution_pessimistic` | `win × 0.90`, `loss × 1.10` | slippage + late fills |
| `execution_optimistic` | `win × 1.05`, `loss × 0.95` | clean limit fills |
| `filter_upper_bound` | drop red-folder days (if dates + calendar) | perfect discretion |
| `filter_lower_bound` | keep only red-folder days | worst discretion |

Run chain on `base`, `execution_pessimistic`, `execution_optimistic` → show:

```text
E[$/wk]: $92 – $104 – $118  (low – base – high)
```

### 5.2 Manual ε input (v1.2)

Lab numeric input **“Execution drag %”** (0–20): scales `P_pass_live ≈ P_pass × (1 − ε)` without re-running MC — instant overlay for journal-calibrated ε.

---

## 6. UI specification

### 6.1 Component: `ChainEvPanel`

**Location:** F4 Lab — immediately **below** existing stat strip (after `McCalibrationBanner`), above firm compare.

**Visibility:**

- Show when `chainPairForPreset(activePresetId)` exists OR user selects pair manually
- Collapsed by default on mobile; expanded on desktop

**Layout (desktop):**

```
┌─ CHAIN EV — PRB A0a → D1 (TPT $50K) ─────────────────────────────┐
│  Method: cohort_pair · MC v2 · Re-run funded to refresh          │
├──────────────────────────────────────────────────────────────────┤
│  EVAL (A0a)          │  FUNDED (D1)         │  CHAINED            │
│  Pass 79%            │  Payout 72%*         │  E[$/wk]  $104     │
│  wks→pass 12         │  wks→pay 6           │  E[$/acct] $1,900  │
│  sprint 6.6          │  median $3.8k        │  weeks 18           │
├──────────────────────────────────────────────────────────────────┤
│  ⚠ Same-ledger approx: D1 cohort missing — using eval CSV       │
│  [ Run counterpart ] [ Open Results ]                            │
├──────────────────────────────────────────────────────────────────┤
│  Execution band: $92 – $104 – $118  (pessimistic – base – opt)   │
└──────────────────────────────────────────────────────────────────┘
```

`*` Funded leg label: **“Payout % (funded sim)”** not “pass %”.

**States:**

| State | UI |
|-------|-----|
| Both cohorts saved | Green check; method `cohort_pair` |
| Eval live only | funded leg from `live_dual_run`; amber “fund counterpart not saved” |
| Missing funded cohort | Button “Run D1 with saved trades” — triggers funded MC on `tradePnls` |
| Stale engine version | Warn if either cohort `mcEngineVersion < MC_ENGINE_VERSION` |
| Portfolio mode | Two columns + “Combined E[$/wk]” sum row |

### 6.2 F8 Results integration

In `matrix-results.tsx`, when expanded row preset has chain pair and **both** cohorts exist in index:

- Small **chain E[$/wk]** column or chip next to primary pass/payout %
- Click opens inline `ChainEvPanel` compact variant

### 6.3 Firm compare integration (optional v1.2)

`matrix-firm-compare.tsx`: chain EV row for TPT tab only (firm-specific fees already in snapshots).

---

## 7. Data model & persistence

### 7.1 Cohort YAML (eval cohort saves)

Add to `buildCohortMarkdown()` when chain computable:

```yaml
chain_pair_id: prb-a0a-d1
chain_funded_preset: matrix-d1
chain_method: cohort_pair
chain_expected_usd_per_calendar_week: 104
chain_expected_net_per_account_usd: 1900
chain_weeks_p50: 18
chain_eval_pass_pct: 79
chain_funded_payout_pct: 72
chain_discretion_band_low_usd_per_week: 92
chain_discretion_band_high_usd_per_week: 118
```

Parse in `parseCohortMeta()` → optional fields on `CohortRecord`.

### 7.2 No new API routes

Use existing `GET /api/cohorts` + client-side `cohortForPreset()`.

---

## 8. Kernel future: `phase_split` sim mode (v2)

Not required for v1 panel but spec’d for accuracy.

### 8.1 Behavior

`McParams.simMode: "phase_split"` with:

```ts
phaseSplit: {
  evalRulePack: McRulePack;      // EOD, consistency, winning days
  fundedRulePack: McRulePack;    // intraday, no consistency
  evalLedgerTransform?: "win_cap" | "none";  // cap wins at $1490 on eval segment
  switchAt: "eval_pass_ready";   // same gate as eval_path
}
```

Single bootstrap sequence; at eval pass, swap rule pack and optionally apply funded exit transform on **remaining** trades (not historical — limitation documented).

### 8.2 When to build

- When same-ledger approx error > 15% vs cohort_pair for A0a/D1
- When sprint A1c cap must be simulated without separate TV export

Bump `MC_ENGINE_VERSION` to **3** when shipped.

---

## 9. Implementation plan

### Phase 1 — Chain math + Lab panel (MVP) · **~2–3 days**

| Task | File(s) |
|------|---------|
| Pair registry + lookup | `lib/strategy-chain.ts` |
| `computeChainEv(eval, funded, fees, opts)` | `lib/chain-ev.ts` |
| Unit tests (A0a+D1 fixture numbers) | `lib/chain-ev.test.ts` |
| `ChainEvPanel` component | `components/chain-ev-panel.tsx` |
| Wire Lab page: resolve pair, load counterpart cohort, dual-run | `app/lab/page.tsx` |
| CLI validation vs [[prop-firm-math]] table | `scripts/analyze-chain-ev.ts` |

**Exit criteria:** Lab shows chain panel for `matrix-a0a` after RUN; numbers within 10% of script baseline.

### Phase 2 — Results + persistence · **~1 day**

| Task | File(s) |
|------|---------|
| Cohort YAML read/write | `lib/cohort.ts` |
| Results chip / compact panel | `components/matrix-results.tsx` |
| Link from [[sim-queue]] S3–S5 to chain comparison |

### Phase 3 — Discretionary bands · **~1–2 days**

| Task | File(s) |
|------|---------|
| Ledger haircut transforms | `lib/ledger-haircut.ts` |
| Band row in `ChainEvPanel` | `components/chain-ev-panel.tsx` |
| Sim queue **S4** min-day pad script integration | `scripts/simulate-min-day-pad.ts` (new) |

### Phase 4 — Portfolio + phase_split kernel · **~3–5 days**

| Task | File(s) |
|------|---------|
| Portfolio parallel sum UI | `chain-ev.ts`, panel |
| `phase_split` in monte-carlo | `lib/monte-carlo.ts`, `mc-params-builder.ts` |
| MC v3 golden tests | `lib/mc-golden.test.ts` |

---

## 10. Testing & validation

### 10.1 Unit tests (`chain-ev.test.ts`)

```ts
// Fixture: eval pass 80%, weeks 12; funded payoutGivenPass 90%, median $3800, weeks 6
// Expected chain weeks = 18
// Expected E_chain bounded vs hand spreadsheet
```

### 10.2 Integration checklist

- [ ] `matrix-a0a` + saved `matrix-d1` cohort → chain E[$/wk] ≈ $104
- [ ] `matrix-a1c` chain < `matrix-a0a` chain → sprint eval flagged as losing on full loop
- [ ] `matrix-h0a`/`h0b` faster weeks, chain vs A0a documented
- [ ] Missing D1 cohort → CTA works; dual-run produces approximation warning
- [ ] Portfolio `A0a+B1a` shows parallel sum, not sequential
- [ ] Haircut band monotonic: low ≤ base ≤ high

### 10.3 Script

```bash
cd vault-app
npx tsx scripts/analyze-chain-ev.ts
# Prints chain table for all STRATEGY_CHAIN_PAIRS with saved cohorts
```

---

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Eval and funded ledgers differ (RR6, cap OFF) — same CSV misleading | Default to **counterpart cohort trades**; warn on same-ledger approx |
| Chained weeks sum overstates overlap (pass and first payout parallel time) | v1 documented approx; v2 sample joint distribution from `phase_split` |
| User optimizes sprint eval on pass% alone | Primary sort = **chain E[$/wk]**; sprint_score secondary |
| Discretionary band gives false confidence | Label “modeled leakage only — journal ε separate” |
| Psychology carryover not modeled | Playbook warning in panel footer; forward test gate unchanged |

---

## 12. Copy for panel footer

> **Chain EV** multiplies eval pass probability by funded extract on the **funded profile book** (often different exits than eval). It does not model discretion, news skips, or sizing mistakes — use the execution band and forward journal for live planning. **Sprint eval** (A1c) only wins if this panel beats A0a→D1.

---

## 13. Roadmap cross-links

Add to [[roadmap]] as **Track 5 — Chain EV tooling**:

| # | Item | Phase |
|---|------|-------|
| 5.1 | Chain panel MVP (A0a/D1, H0a/H0b) | Phase 1 |
| 5.2 | Cohort YAML + Results chip | Phase 2 |
| 5.3 | Execution bands + S4 min-day pad | Phase 3 |
| 5.4 | Portfolio parallel + `phase_split` MC v3 | Phase 4 |

---

## 14. Open questions (resolve at build kickoff)

1. **Funded leg payout % label** — show `payoutPct` (all sims) or `payoutGivenPassPct`? → **Both**; chain uses `payoutGivenPassPct`.
2. **Default firm** — TPT only in v1? → **Yes**; generalize via `firmMc.tpt50` snapshots.
3. **Auto-run funded on every Lab RUN** — perf cost at 2000 sims × 2? → **Yes on pair presets**; debounce; show spinner on funded leg only.

---

*Approved for implementation. Start with Phase 1.*
