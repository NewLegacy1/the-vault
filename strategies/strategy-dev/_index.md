---
updated: 2026-07-15
tags: [strategy-dev, moc, index]
---
# Strategy Dev — map of content

R&D knowledge for The Vault. Lab Monte Carlo notes live in [[cohorts/_index]], not here.

## Folder map

| Folder | Purpose |
|---|---|
| `00-charter/` | Agent charter, scorecard, cohort hygiene, research loop |
| `10-templates/` | Stage-0 + gate templates (copy before filling) |
| `20-playbooks/` | Eval / funded / hybrid / gated-live ops |
| `30-findings/` | Settled PRB & Macro formulas |
| `40-plans/` | Active briefs, sprints, queues, roadmap |
| `50-analyses/` | Autopsies, event studies, kill lessons, weekly review |
| `60-track-b/` | New-edge candidates (non-ICT) |
| `70-firms/` | Prop-firm math & TPT rules |

## Start here

1. **[[STRATEGY_DEV_AGENT]]** — charter + promotion rule
2. **[[execution-plan-post-3y]]** — active brief
3. **[[SCORECARD]]** · **[[sim-queue]]** · **[[findings-prb]]**
4. **[[kill-lessons-track-b]]** · **[[track-b-meta-progress]]** — before any new Track B idea

## By section

### 00 — Charter
- [[STRATEGY_DEV_AGENT]]
- [[SCORECARD]]
- [[cohort-hygiene]]
- [[failure-harvest]]
- [[RESEARCH_AGENT_LOOP]]

### 10 — Templates
- [[event-study-template]] · [[track-b-template]] · [[permutation-tests]]
- [[stage-0-mtf-breadth]] · [[kill-postmortem-template]]

### 20 — Playbooks
- [[eval-playbook]] · [[funded-playbook]] · [[hybrid-playbook]]
- [[gated-prb-live-guide]]

### 30 — Findings
- [[findings-prb]] · [[findings-macro]]

### 40 — Plans
- [[execution-plan-post-3y]] · [[parallel-impl-sprint2]] · [[parallel-impl-gated-prb]]
- [[roadmap]] · [[sim-queue]] · [[tier0-3y-checklist]] · [[calendar-3y]]
- [[mc-calibration-plan]] · [[chain-ev-spec]]

### 50 — Analyses
- [[kill-lessons-track-b]] · [[track-b-meta-progress]]
- [[morningstar-jul16-dual-sleeve-finding]] — **IMPORTANT** Path B early ~10:00 vs Powell OTE ~11:15
- [[phase1-autopsy-a0a-d1]] · [[phase2-chain-ev-gated]] · [[phase2-4-cofeature]]
- [[event-study-prb-a0a-pilot]] · [[markov-occupancy-prb-a0a]] · [[weekly-review-latest]]
- Track B event studies: [[event-study-b2-mpsf]] · [[event-study-trackb-mpsf-3y]] · [[event-study-b3-nr-expansion]] · [[event-study-trackb-nr-exp-3y]] · [[event-study-b4-vwap-z-fade]] · [[event-study-trackb-vwapz-3y]] · [[event-study-b5-1005-impulse]] · [[event-study-trackb-1005-3y]] · [[event-study-b6-gap-fade]] · [[event-study-trackb-gapfade-3y]] · [[event-study-b7-pm-continuation]] · [[event-study-trackb-pmcont-3y]] · [[event-study-b8-gap-cont]] · [[event-study-b9-mtf-pmcont]] · [[event-study-trackb-mtf-pmcont-mnq-5m]] · [[event-study-b10-lom]] · [[event-study-trackb-lom-mnq-5m]]

### 60 — Track B
- [[track-b-ideas]] (roster · paused overnight after B10)
- Candidates: [[track-b-candidate-v0]] · [[track-b-b1-erxor-v0]] · [[track-b-b2-mpsf-v0]] · [[track-b-b3-nr-expansion-v0]] · [[track-b-b4-vwap-z-fade-v0]] · [[track-b-b5-1005-impulse-v0]] · [[track-b-b6-gap-fade-v0]] · [[track-b-b7-pm-continuation-v0]] · [[track-b-b8-gap-cont-v0]] · [[track-b-b9-mtf-pmcont-v0]] · [[track-b-b10-lom-v0]]

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
| Charter / research loop | `00-charter/` |
| Templates | `10-templates/` |
