---
updated: 2026-07-20
tags: [organization, knowledge, best-practices]
---
# Knowledge brain — organization rules

## Verdict

Keep the brain. Cap growth with **promotion + archive**, not endless topic waves.
Target: a **model builder + tester** where notes explain *why*, code runs *math*.

## Four layers (never mix)

| Layer | Lives in | Job |
|---|---|---|
| 1. Raw | `vault-app/data/*-transcripts/` | Sources only |
| 2. Doctrine | `strategies/knowledge/` | CLAIM/EVIDENCE + APPLICATION |
| 3. Ops state | `strategies/strategy-dev/` | Freeze, harvests, Stage-0, kills |
| 4. Executable | `vault-app/lib/` + scripts | Path MC, event-study, regime tags |

If a “fact” isn’t in layer 4, the product doesn’t enforce it.

## When to write a new note

Write **only if** at least one is true:

1. It changes Dual46 post-May backlog or Stage-0 scoring.
2. It defines a frozen measurable (band, fill model, sample-size rule).
3. It kills a tempting wrong idea (Track-B costume, NLP regime, etc.).

Otherwise: add 3 bullets to an existing note’s APPLICATION, or skip.

## Note format (required)

```yaml
---
topic: slug · researched: YYYY-MM-DD · sources: N · agent-cycle: id
status: active | parked | archived   # optional but preferred
---
# Title
## Key findings   # label **CLAIM** vs **EVIDENCE**
## Details / mechanics
## APPLICATION TO THE VAULT
## Sources
```

- One topic per file, kebab-case.
- Prefer `[[wikilinks]]` to hubs; backtick paths OK for code.
- Never invent Deep Backtest / `E[$/wk]` numbers in knowledge notes.

## Where it goes

| Content | Folder |
|---|---|
| Expectancy, MC, sizing, sample size, WF, leakage | `quant/` (link from [[hubs/hub-math]]) |
| VIX/OR/news/oil day tags | `quant/` + [[hubs/hub-regimes]] |
| Fills, slippage, platforms, stand-downs | `quant/ops-*` + [[hubs/hub-ops]] |
| ICT / Powell teaching | `ict/` · `powell/` + [[hubs/hub-doctrine]] |
| Parked product (JJ) | `archive/parked/` |
| Vendor channel dumps | `archive/vendor/` |
| Superseded duplicate | `archive/superseded/` + stub at old path |

## Archive vs delete

- **Archive** when: parked product, superseded, soft ops, adjacent lore.
- **Delete** only: empty stubs, accidental duplicates with identical content, broken drafts with zero APPLICATION.
- Always leave a **redirect stub** at the old path for 1+ month (or forever if strategy-dev links it).

## Research cycles (future)

1. Prefer topics that close a **model-builder gap** (wiring, math, validation) over more ICT folklore.
2. Max ~10 topics/cycle; stop when APPLICATION would only say “log another column.”
3. After each cycle: update [[_index]], hubs, and [[RESEARCH_CHARTER]] checkboxes.
4. One open Stage-0 at a time — knowledge cycles don’t spawn parallel candidates.

## Hygiene checklist (monthly)

- [ ] Broken links / missing files referenced by HANDOFF or Dual46 lock
- [ ] Duplicate ad-hoc headings in RESEARCH_CHARTER
- [ ] Any note without APPLICATION → fix or archive
- [ ] Runtime drift: does `regime-tags.ts` still match [[quant/mnq-relevant-regime-variables]]?
