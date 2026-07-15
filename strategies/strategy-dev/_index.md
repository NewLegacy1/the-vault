---
updated: 2026-07-15
tags: [strategy-dev, moc, index]
---
# Strategy Dev — map of content

R&D knowledge for The Vault. Lab Monte Carlo notes live in [[cohorts/_index]], not here.

## Folder map

| Folder | Purpose |
|---|---|
| `00-charter/` | Agent charter, scorecard, cohort hygiene |
| `10-templates/` | Stage-0 + gate templates (copy before filling) |
| `20-playbooks/` | Eval / funded / hybrid / gated-live ops |
| `30-findings/` | Settled PRB & Macro formulas |
| `40-plans/` | Active briefs, sprints, queues, roadmap |
| `50-analyses/` | Autopsies, event studies, weekly review |
| `60-track-b/` | New-edge candidates (non-ICT) |
| `70-firms/` | Prop-firm math & TPT rules |

## Start here

1. **[[STRATEGY_DEV_AGENT]]** — charter + promotion rule
2. **[[execution-plan-post-3y]]** — active brief
3. **[[SCORECARD]]** · **[[sim-queue]]** · **[[findings-prb]]**

## By section

### 00 — Charter
- [[STRATEGY_DEV_AGENT]]
- [[SCORECARD]]
- [[cohort-hygiene]]

### 10 — Templates
- [[event-study-template]] · [[track-b-template]] · [[permutation-tests]]

### 20 — Playbooks
- [[eval-playbook]] · [[funded-playbook]] · [[hybrid-playbook]]
- [[gated-prb-live-guide]] — paper/live ops overlay

### 30 — Findings
- [[findings-prb]] · [[findings-macro]]

### 40 — Plans
- [[execution-plan-post-3y]] · [[parallel-impl-sprint2]] · [[parallel-impl-gated-prb]]
- [[roadmap]] · [[sim-queue]] · [[tier0-3y-checklist]] · [[calendar-3y]]
- [[mc-calibration-plan]] · [[chain-ev-spec]]

### 50 — Analyses
- [[phase1-autopsy-a0a-d1]] · [[phase2-chain-ev-gated]] · [[phase2-4-cofeature]]
- [[event-study-prb-a0a-pilot]] · [[event-study-b2-mpsf]] · [[markov-occupancy-prb-a0a]]
- [[weekly-review-latest]]

### 60 — Track B
- [[track-b-ideas]] · [[track-b-candidate-v0]] · [[track-b-b1-erxor-v0]] · [[track-b-b2-mpsf-v0]]

### 70 — Firms
- [[prop-firm-math]] · [[tpt-rules]]

## Write conventions

| Kind | Land in |
|---|---|
| New Lab MC cohort | `strategies/cohorts/{eval\|funded\|combined\|research}/` (auto) |
| Settled A/B claim | `30-findings/` |
| Sprint / queue / brief | `40-plans/` |
| Script-generated analysis | `50-analyses/` |
| Track B candidate / kill note | `60-track-b/` |
| Event study fill-in | `50-analyses/event-study-{slug}.md` (from template) |
