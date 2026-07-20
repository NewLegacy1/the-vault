---
created: 2026-07-20
tags: [handoff, dual46, cloud-to-local]
status: ACTIVE
---
# Handoff — cloud → local agent (2026-07-20)

**Repo:** `NewLegacy1/the-vault` · **default branch is `master` (not `main`).**  
Move-to-Local failed with `couldn't find remote ref refs/heads/main` — that is a Cursor/default-branch mismatch. Prefer staying on `master` + new local agent + `/remote-control`.

Cloud agent branch (only if needed): `cursor/cloud-agent-1784580173599-gqnk6`

---

## Product lanes (do not mix)

| Product | Status | Rule |
|---|---|---|
| **Dual46 (Morningstar Path B)** | Frozen · May walk IN PROGRESS | No Pine retune until June+May done. Journal on localhost:3000. |
| **JJ Fair-Value (JJ Simon)** | Separate product · parked | Own Stage-0 later. Not a Dual46 sleeve/add-on. Note: `strategies/knowledge/quant/jj-simon-fair-value-930-strategy.md` |
| **Regime context** | Research done · log tags while walking | Measurable vars only — no war NLP. |

---

## Where Dual46 left off

- **June:** DONE (+$16,925 gross @10 MNQ; script 2W/0L on 2 fills). Harvest + canvas archived.
- **May:** 5 rows (05-01→05-06): **0 script arms**; 1 disc LOSS −$260 (05-06); 1 no-fill; 3 skips. Harvest: `strategies/strategy-dev/50-analyses/morningstar-dual46-may-harvest.md`
- **Next walk action:** continue May from **05-07** onward; fill census fields every take (MFE, 5m-confirm, ×dATR, ATR, entry time).
- **Calendar:** skip **Mon May 25 Memorial Day** (holiday, not a Monday data point).

---

## Regime tags — log these (top 5)

From `strategies/knowledge/quant/mnq-relevant-regime-variables.md`:

1. **`vixPrevClose`** — `<16` / `16–20` / `>20` (prior close)
2. **`or30ratio`** — OR 09:30–10:00 ÷ 20-day median; `<0.75` / `0.75–1.25` / `>1.25`
3. **`redFolder` / `release10`** — already auto-matched in journal
4. **`megaCapEarnWeek`** — AAPL/MSFT/GOOGL/AMZN/META/NVDA reporting that week Y/N
5. **`oilShock`** — `|CL 1d| ≥ 3%` or `|CL 5d| ≥ 8%` (prior settles)

Ignore: war NLP scores, politician trades, SaaS “risk-on” labels without frozen defs.

Full options map: `strategies/knowledge/quant/macro-regime-context-data-options.md`  
Past-vs-live doctrine: `strategies/knowledge/quant/historical-data-vs-live-markets.md`

Forgotten-app candidates (user may still confirm): MACRO/SIGNAL, EdgeCypher, CondorEdge.

---

## Journal / app notes

- Newest-**logged**-first sort (May walk buried under June by date — fixed).
- NWOG = **position** (above/inside/below) + **filled** (independent).
- News auto-match from calendar bundle.
- Fields live: MFE, 5m-confirm, daily ATR, entry time, gap/tap — populate at log time.
- Journal data = **browser localStorage** (not git). Harvest notes are the durable backup.

---

## Research status

- Cycles 1–3 complete (~60+ notes). Charter: CYCLE 3 COMPLETE.
- Ad-hoc 2026-07-20: JJ Simon, historical-data-vs-live, macro-regime options, mnq-relevant regime vars.
- Prop asymmetry: score via path MC `E[$/wk]` under firm rules — no personal live account required.
- One open Stage-0 at a time; Dual46 May walk is current priority over opening JJ Stage-0.

---

## What the local agent should do if asked

1. Help continue May walk analysis / canvas / harvest updates (pull journal from localhost:3000 localStorage — never invent Deep BT numbers).
2. Optionally add the 5 regime tags to checklist / journal form if user wants them in the UI.
3. Remote Control: user enables Settings → Agents → Remote Control, then `/remote-control` on the **local** agent.
4. Never edit `pine/Powell_Rejection_Block_v1.pine`; never reopen killed Track B via param retune; never Lab-promote without Stage-0 toward + path MC.

## User preference (2026-07-20)

Wants **Remote Control** (PC left on), not cloud Move-to-Cloud. Default branch awareness: **master**.
