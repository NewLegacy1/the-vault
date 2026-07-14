---
updated: 2026-07-14
tags: [cohorts, agent-only, hygiene, strategy-dev]
audience: agent
---
# Cohort hygiene — agent knowledge only

> **Not for UI.** The Strategy Dev panel and Lab UI do not surface these warnings. The agent reads this file before comparing cohorts, updating findings, or recommending MC baselines.

## Trust hierarchy

| Tier | Cohort | Use for |
|---|---|---|
| **Canonical** | `cohorts/funded/2026-07-14_macro_v1_4_premium_365d_canonical.md` | Macro MC baseline, tier splits, funded playbook |
| **Pending re-run** | Premium 365d PRB exports (not saved yet) | Future eval leaderboard — do not use pre-premium PRB files |
| **Archived** | `cohorts/_archive_pre_premium/` | Historical reference only — **never** MC compare against canonical |

## Auto-ignore rules

Reject or archive a cohort when **any** of:

1. **`date_start` mismatch** — title says "Jul 25–Jul 26" or "12mo" but `date_start: 2024-12-31` (chunk-merge contamination from multi-export merges).
2. **Duplicate auto-save** — same variant + config + stats, different timestamp filename (keep newest **only if** span is clean).
3. **Wrong preset at save** — e.g. macro v1.3 filename with v1.4 tier stats (preset/export mismatch).
4. **Span < ~300 calendar days** when claiming "365d" or "12mo" deep backtest.
5. **Mixed-input exports** — pivot length, risk $, or filter flags differ across chunks in one merged CSV.

## Known bad inventory (Jul 2026)

| Pattern | Count | Issue |
|---|---|---|
| `prb_v1_5_12mo_control_jul_25_jul_26` | 4× in archive | Duplicate saves; `date_start: 2024-12-31` |
| `prb_v1_5_be_2r_auto_pdh_pdl` | 5–9× in archive | Duplicate auto-saves; same date contamination |
| `macro_model_v1_3_tiered` | 1× archived | Wrong preset / duplicated v1.4 stats |
| Root-level flat cohort files | moved to archive | Legacy path before subfolder routing |

## MC compare protocol

Before citing pass rates in findings or playbooks:

1. Confirm `date_start` / `date_end` match dataset label (~365d for premium matrix).
2. Confirm `strategy_family` and `phase` match the question (eval PRB vs funded Macro).
3. For Macro: **only** canonical v1.4 premium unless a newer canonical supersedes it.
4. For PRB eval: wait for post-premium 365d cohorts (matrix branches A0–A3 in agent notes); do not cite archived 54.9% against new exports without re-verification.
5. When duplicates exist, pick **one** representative with clean span — never average duplicate MC runs.

## Archive policy

- Pre-premium / contaminated cohorts → `strategies/cohorts/_archive_pre_premium/`
- Do not delete — agent may need to explain why an old number is wrong.
- `_index.md` Dataview queries should use `eval/`, `funded/`, `combined/`, `research/` only — not `_archive_*`.

## Clean re-run matrix (reference)

When user runs premium 365d matrix:

| Branch | Strategy | Phase | Purpose |
|---|---|---|---|
| A0–A3 | PRB variants | eval | Pass rate, consistency, BE/PDH branches |
| B0–B3 | Macro variants | funded | Tier filters, A-only book |
| C1–C2 | Hybrid | combined | Portfolio MC |
| D1 | PRB funded | funded | Runner/trail regime |

New saves land in phase subfolders with correct YAML `phase` + `strategy_family`.
