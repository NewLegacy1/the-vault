---
updated: 2026-08-02
tags: [charter, pipeline, registry, ingest, vault-store, strategy-dev]
---
# Pipeline registry & hands-free data plumbing

> Built 2026-08-02 (three-phase build-out after the system audit).
> The app and the research agent loop now share **three machine-readable stores**
> instead of prose-only state. This note is the map.

## 1. Vault store — journal / accounts / ledger (server-backed)

| | |
|---|---|
| File | `vault-app/data/vault-store/store.json` |
| Snapshots | `vault-app/data/vault-store/snapshots/` (25/key · extra `-preshrink` snap when an array shrinks) |
| API | `GET/POST /api/vault-store?key=vault.journal` |
| Client | `lib/store.ts` `useLocal` — localStorage is now only a cache |

**Agent rule change:** to read the journal, read `store.json` directly — no
browser localStorage pull needed. localStorage remains per-origin cache; the
server file is authoritative once the app has loaded once. Stale-tab
overwrites are recoverable from snapshots.

## 2. Ingest inbox — TV export → Stage-0, hands-free

| | |
|---|---|
| Drop folder | `vault-app/data/inbox/` |
| Run | `npm run ingest` (or `ingest:watch` during a session) |
| Ledger | `vault-app/data/tv-exports/ingest-ledger.json` (sha256-fingerprinted, re-drops are no-ops) |
| Output | file routed to `matrix/` · data audit · `analyze-event-study.ts` JSON + analysis note |
| UI | DATA page · ingest panel |

The human step shrinks to: TV Deep Backtest → export → drop in inbox.
Everything after is automatic and idempotent.

## 3. Strategy registry — lifecycle as data

| | |
|---|---|
| File | `vault-app/data/registry/strategies.json` |
| Lib | `vault-app/lib/registry.ts` (states · lint) |
| API | `GET/POST /api/registry` |
| UI | PIPELINE page (board, state moves; killed books locked) |

States: `idea → stage0_draft → waiting_csv → analyzed → toward/away → live_sprint → funded → retired`, plus `killed` (terminal).

**Machine-checked kill-lesson lint** (mirrors [[kill-lessons-track-b]]):

1. `kill_family` — candidate sharing a `familyTags` entry with a killed book (no costume retunes).
2. `one_stage0` — more than one book in `stage0_draft`/`waiting_csv`.
3. `independence` — candidate declares &lt;2 independence axes vs gated PRB (rule 12).

Killed entries carry their hard-constraint number (`killConstraint`) and the
family tags that make the blacklist work. **When a book is killed:** set state
`killed`, add its family tags, keep the five harvest extracts in
[[kill-lessons-track-b]] as before — the registry is the index, not the story.

## Loop integration (updates [[RESEARCH_AGENT_LOOP]])

```text
1. INGEST    — npm run ingest (inbox → matrix → Stage-0 auto)
2. ANALYZE   — read ingest-ledger.json verdicts (script already ran)
3. SCORECARD — write note; update registry entry state (analyzed → toward/away/killed)
4. HARVEST   — kill-lessons + registry familyTags on kill
5. COMPARE   — as before
6. PROPOSE   — new candidate = new registry entry (idea) — lint must pass
7. STOP GATE — unchanged (no Lab promote, no PRB edits, no kill retunes)
```

## App IA (post-reorg 2026-08-02)

| Tab | Role |
|---|---|
| OPS (home) | Live day: sprint card triggers, pass progress, adherence, weekly rollup |
| ACCOUNTS | Boxes + fees ledger |
| PIPELINE | Registry board — research lifecycle + lint |
| LAB | Path MC on a CSV |
| JOURNAL | All logging |
| DATA | Cohort library + ingest ledger |
| NEWS | Calendar / red-folder |
| RESULTS | Matrix cohorts + firm comparison |
| BRAIN | Obsidian knowledge in-app |

`/strategies` (TV replay recipes) is out of the nav, linked from PIPELINE.

## Related

- [[RESEARCH_AGENT_LOOP]] · [[SCORECARD]] · [[kill-lessons-track-b]] · [[sim-queue]] · [[prop-firm-math]]
