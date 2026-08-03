# Ingest inbox

Drop TradingView **List of trades** CSV exports (or vault enriched ledger CSVs /
event-study JSONs) here, then run from `vault-app/`:

```bash
npm run ingest         # one pass
npm run ingest:watch   # keep watching while you trade / export
```

Each file is fingerprinted (sha256), classified, routed to
`data/tv-exports/matrix/`, data-audited, and Stage-0 analyzed automatically
(`scripts/analyze-event-study.ts` — writes the JSON + analysis note).
Results are appended to `data/tv-exports/ingest-ledger.json` and shown on the
DATA page. Originals move to `processed/`; unrecognized files move to
`unrecognized/`. Nothing is ever deleted, and re-dropping a file is a no-op.
