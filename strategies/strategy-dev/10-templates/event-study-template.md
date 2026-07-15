---
status: template
tags: [stage-0, event-study, strategy-dev]
---
# Event study — {TITLE}

> Copy to `strategies/strategy-dev/50-analyses/event-study-{slug}.md`. Fill **before** new Pine `strategy()`.  
> Events are timestamps in experiment scope — **not** buy/sell signals.

## Meta

| Field | Value |
|---|---|
| Idea class | MR \| momentum \| breakout \| other |
| Purpose tags | event / context / reference / outcome |
| Instrument / TF | e.g. MNQ · HTF 15 / fill 5m (see [[stage-0-mtf-breadth]]) |
| Planned runs | 0a MNQ-5m · 0b MNQ-1m · (0d symbols only if toward) |
| Pre-registered date | |
| Artifact JSON | `vault-app/data/tv-exports/…` |

## Model / edge (predictive claim)

What relationship are we testing? (raw idea → quantitative feature)

### Event-defining feature

| Field | Value |
|---|---|
| Definition | |
| Value type | continuous \| binary \| ordinal |
| Transform / normalization | |
| Expected frequency band | too rare / ok / too dense |

### Outcome label

| Field | Value |
|---|---|
| Kind | barrier (stop/TP) \| forward return \| trade PnL |
| Spec | |

### Contextual features (hypotheses — pre-register before slicing)

1.  
2.  

## Execution / risk protocol (only after edge evidence)

Separate from the predictive study. Orders, risk $, BE/trail, prop firm, sizing.

## Results (fill after `analyze-event-study.ts`)

| Window | n | EV | EV CI 95% | Median | Verdict |
|---|---:|---:|---|---:|---|
| Full | | | | | |
| IS | | | | | |
| OOS | | | | | |
| Random baseline | | | | | |

Footnotes only: WR / avg RR / trade PnL SD (geometry).

## Four gates (if searchable params)

| Gate | Result | Artifact |
|---|---|---|
| IS excellence | | |
| IS price-perm quasi-p | | [[permutation-tests]] |
| Walk-forward | | |
| WF price-perm quasi-p | | |

## Scorecard closeout

- [ ] toward / away / kill — [[SCORECARD]]
- Context next step (if OOS unstable):
- Pine allowed? **only if** gates clear and SCORECARD toward
