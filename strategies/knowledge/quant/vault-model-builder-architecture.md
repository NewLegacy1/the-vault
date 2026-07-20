---
topic: vault-model-builder-architecture · researched: 2026-07-20 · sources: 6 · agent-cycle: adhoc-brain-reorg
status: active
tags: [quant, architecture, model-builder, application]
---
# Vault model builder + tester — architecture (APPLICATION)

**Product goal:** one cohesive loop from idea → measurable edge → prop-math go/no-go → ops —
not a second database of folklore, and not a QuantPad clone.

Hub entry: [[../_index]] · org rules: [[../ORGANIZATION]].

## Key findings

- **CLAIM (design):** the Vault already has the pieces of a model builder; the gap is **wiring + MOCs**, not more ICT notes.
- **EVIDENCE (in-repo):** event-study script, path MC / SCORECARD hierarchy, regime tags, Dual46 journal, knowledge notes with APPLICATION sections — each lives in a different layer.
- **Spine (authoritative):**  
  **idea → event-study → Stage-0 EV±CI → path MC `E[$/wk]` → ops**  
  (Dual46 / sleeve only after freeze-compatible evidence; one open Stage-0 at a time.)

## Four layers (never mix)

| Layer | Lives in | Job | Agents read for |
|---|---|---|---|
| 1. Raw | `vault-app/data/*-transcripts/` · `tv-exports/` | Sources + CSV only | Extraction, never “truth” |
| 2. Doctrine | `strategies/knowledge/` | CLAIM vs EVIDENCE + APPLICATION | Why bands / fill models / kills exist |
| 3. Ops state | `strategies/strategy-dev/` | Freeze, harvests, Stage-0 notes, kills, scorecard | What is live / parked / killed |
| 4. Executable | `vault-app/lib/` + `scripts/` | Regime tags, analyze-event-study, monte-carlo | What the product enforces |

If a “fact” isn’t in layer 4 (or a freeze/harvest in layer 3), the product does **not** enforce it.

```
transcripts / TV CSV          knowledge (why)
        \                       /
         \                     /
          v                   v
     strategy-dev (state) → lib/scripts (math)
                \
                 v
            Dual46 journal / Lab MC / ops playbooks
```

## Spine — what each stage must produce

| Stage | Artifact | Gate |
|---|---|---|
| Idea | Pre-registered event definition | Obeys kill-lesson hard constraints |
| Event-study | TV measure CSV → `analyze-event-study.ts` JSON | No invented Deep BT numbers |
| Stage-0 | EV± bootstrap CI + leakage checklist | SCORECARD **toward** / away / kill |
| Path MC | `E[$/wk]`, pass/bust/timeout under firm rules | Only after Stage-0 toward |
| Ops | Fill haircut, stand-down, payout cadence | Replay→live calib before “live edge” language |

Metric hierarchy (never invert): path MC / `E[$/wk]` → trade EV±CI → geometry diagnostics.
See `strategy-dev/00-charter/SCORECARD.md`.

## What the builder IS

- A **promotion machine**: doctrine explains → Stage-0 measures → lib computes → ops executes.
- Thin **hubs** (`hubs/`) so agents don’t grep 60+ filenames.
- Frozen measurables ([[mnq-relevant-regime-variables]]) shared by journal, ES splits, and MC.

## What NOT to do

1. **Do not** promote raw VTT / YouTube paraphrase into Dual46 rules or Lab “edge.”
2. **Do not** invent Deep Backtest / `E[$/wk]` numbers in knowledge notes — wait for CSV or stop at “waiting for export.”
3. **Do not** Lab-promote or claim income without Stage-0 **toward** + path MC `E[$/wk]`.
4. **Do not** reopen killed Track B (ORBreak, ERXor, MPSF) via param retune.
5. **Do not** edit `pine/Powell_Rejection_Block_v1.pine` (locked); variants = new files.
6. **Do not** mix layers: journal localStorage ≠ git; knowledge ≠ executable; harvest ≠ scorecard authority.
7. **Do not** spawn multiple open Stage-0 candidates or research cycles of ICT folklore when the gap is wiring.
8. **Do not** buy SaaS regime NLP before Phase-0 DIY tags are actually used in splits.
9. **Do not** treat WR / avg RR / “nice RR story” as promotion authority.
10. **Do not** delete archive notes — stubs + `archive/` keep link integrity.

## Related OS

- Math hub: [[../hubs/hub-math]] · Regimes: [[../hubs/hub-regimes]] · Ops: [[../hubs/hub-ops]] · Stage-0: [[../hubs/hub-stage0]]
- Process cousins: [[deltatrend-quant-process-event-first-workflow]] · [[event-study-methodology-intraday-setups]]
- Charter queue: [[../RESEARCH_CHARTER]] (CYCLE 4 = model-builder gaps)

## APPLICATION TO THE VAULT

1. Prefer CYCLE 4+ topics that close **wiring gaps** (ES columns, MC surface, regime helpers, fill haircuts) over new ICT lectures.
2. Any new note must name which layer it updates; if none → don’t write it ([[../ORGANIZATION]]).
3. When code lands (e.g. `or30Band*` in `regime-tags.ts`), update [[mnq-relevant-regime-variables]] in the same change.
4. Model-builder “done” for a feature = layer 4 enforces it + layer 3 harvest/scorecard mentions it + layer 2 has APPLICATION — not a lone markdown essay.

## Sources

1. `strategy-dev/00-charter/RESEARCH_AGENT_LOOP.md` · `SCORECARD.md` · `STRATEGY_DEV_AGENT.md`
2. [[../ORGANIZATION]] · [[../_index]]
3. [[deltatrend-quant-process-event-first-workflow]]
4. [[event-study-methodology-intraday-setups]] · [[monte-carlo-prop-firm-survival]]
5. [[mnq-relevant-regime-variables]] · `vault-app/lib/regime-tags.ts`
6. Kill lessons / Track B hard stops — `strategy-dev/50-analyses/kill-lessons-track-b.md`
