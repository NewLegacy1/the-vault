import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENRICHED_TRADE_CSV_HEADER,
  enrichedTradeToCsvRow,
  dedupeOnePerDay,
  mergeTvCsvs,
  tradeDedupeKey,
  type DedupeCollision,
  type ParsedTrade,
} from "./csv";
import { auditLabIngest } from "./ingest-audit";

function trade(over: Partial<ParsedTrade> & { num: number; date: string; pnl: number }): ParsedTrade {
  return { ...over };
}

function ledgerCsv(trades: ParsedTrade[]): string {
  return [ENRICHED_TRADE_CSV_HEADER, ...trades.map(enrichedTradeToCsvRow)].join("\n");
}

describe("tradeDedupeKey precedence", () => {
  it("uses entryDatetime when available", () => {
    const t = trade({ num: 1, date: "2025-03-03", pnl: -150, entryDatetime: "2025-03-03 09:31" });
    assert.equal(tradeDedupeKey(t), "2025-03-03|-150.00|dt:2025-03-03 09:31");
  });

  it("falls back to trade num + direction without entry time", () => {
    const t = trade({ num: 7, date: "2025-03-03", pnl: -150, direction: "long" });
    assert.equal(tradeDedupeKey(t), "2025-03-03|-150.00|n:7|long");
  });

  it("falls back to legacy date|pnl only when nothing better exists", () => {
    const t = trade({ num: NaN, date: "2025-03-03", pnl: -150 });
    assert.equal(tradeDedupeKey(t), "2025-03-03|-150.00");
  });
});

describe("mergeTvCsvs dedupe", () => {
  it("keeps two identical-pnl same-day trades with different entry times", () => {
    const a = trade({ num: 1, date: "2025-03-03", pnl: -150, entryDatetime: "2025-03-03 09:31" });
    const b = trade({ num: 2, date: "2025-03-03", pnl: -150, entryDatetime: "2025-03-03 13:05" });
    const collisions: DedupeCollision[] = [];
    const merged = mergeTvCsvs([ledgerCsv([a, b])], { collisions });
    assert.equal(merged.length, 2);
    assert.equal(collisions.length, 0);
  });

  it("keeps two identical-pnl same-day trades that differ only in trade num", () => {
    const a = trade({ num: 1, date: "2025-03-03", pnl: -150, direction: "long" });
    const b = trade({ num: 2, date: "2025-03-03", pnl: -150, direction: "long" });
    const merged = mergeTvCsvs([ledgerCsv([a, b])]);
    assert.equal(merged.length, 2);
  });

  it("drops a genuine duplicate (same entryDatetime) exactly once and reports it", () => {
    const t = trade({ num: 4, date: "2025-03-03", pnl: 320, entryDatetime: "2025-03-03 10:15" });
    const collisions: DedupeCollision[] = [];
    // Same trade appears in two overlapping chunk exports.
    const merged = mergeTvCsvs([ledgerCsv([t]), ledgerCsv([t])], { collisions });
    assert.equal(merged.length, 1);
    assert.equal(collisions.length, 1);
    assert.equal(collisions[0]!.reason, "merge_duplicate");
    assert.equal(collisions[0]!.date, "2025-03-03");
    assert.equal(collisions[0]!.pnl, 320);
    assert.equal(collisions[0]!.keptKey, tradeDedupeKey(t));
    assert.equal(collisions[0]!.droppedKey, tradeDedupeKey(t));
  });

  it("stays silent-collision-free for callers that do not pass collisions", () => {
    const t = trade({ num: 4, date: "2025-03-03", pnl: 320, entryDatetime: "2025-03-03 10:15" });
    const merged = mergeTvCsvs([ledgerCsv([t]), ledgerCsv([t])]);
    assert.equal(merged.length, 1);
  });
});

describe("dedupeOnePerDay neutral collision rule", () => {
  it("prefers the more complete row over the bigger win", () => {
    const bigWin = trade({ num: 1, date: "2025-04-01", pnl: 1500 });
    const complete = trade({
      num: 2,
      date: "2025-04-01",
      pnl: -150,
      entryDatetime: "2025-04-01 09:45",
      mfeUsd: 80,
    });
    const collisions: DedupeCollision[] = [];
    const out = dedupeOnePerDay([bigWin, complete], undefined, collisions);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.pnl, -150);
    assert.equal(collisions.length, 1);
    assert.equal(collisions[0]!.reason, "one_per_day");
    assert.equal(collisions[0]!.pnl, 1500);
    assert.equal(collisions[0]!.keptKey, tradeDedupeKey(complete));
    assert.equal(collisions[0]!.droppedKey, tradeDedupeKey(bigWin));
  });

  it("breaks completeness ties by earliest entry time", () => {
    const later = trade({
      num: 1,
      date: "2025-04-02",
      pnl: 900,
      entryDatetime: "2025-04-02 14:00",
      mfeUsd: 50,
    });
    const earlier = trade({
      num: 2,
      date: "2025-04-02",
      pnl: -200,
      entryDatetime: "2025-04-02 09:35",
      mfeUsd: 40,
    });
    const out = dedupeOnePerDay([later, earlier]);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.pnl, -200);
  });

  it("still honors the seed ledger and reports the dropped rows", () => {
    const seedMatch = trade({ num: 1, date: "2025-04-03", pnl: -150 });
    const other = trade({
      num: 2,
      date: "2025-04-03",
      pnl: 700,
      entryDatetime: "2025-04-03 10:00",
    });
    const collisions: DedupeCollision[] = [];
    const out = dedupeOnePerDay(
      [seedMatch, other],
      [{ date: "2025-04-03", pnl: -150 }],
      collisions
    );
    assert.equal(out.length, 1);
    assert.equal(out[0]!.pnl, -150);
    assert.equal(collisions.length, 1);
    assert.equal(collisions[0]!.reason, "one_per_day_seed");
    assert.equal(collisions[0]!.pnl, 700);
  });
});

describe("auditLabIngest dedupe surfacing", () => {
  it("warns with the dropped-row count when collisions are passed", () => {
    const collisions: DedupeCollision[] = [
      {
        date: "2025-03-03",
        pnl: 320,
        reason: "merge_duplicate",
        keptKey: "k",
        droppedKey: "k",
      },
      {
        date: "2025-04-01",
        pnl: 1500,
        reason: "one_per_day",
        keptKey: "a",
        droppedKey: "b",
      },
    ];
    const a = auditLabIngest({
      trades: [100, -50],
      dates: ["2025-03-03", "2025-04-01"],
      dedupeCollisions: collisions,
    });
    assert.equal(a.dedupeDroppedRows, 2);
    const f = a.findings.find((x) => x.id === "dedupe_drops");
    assert.ok(f);
    assert.equal(f!.severity, "warn");
    assert.match(f!.message, /2 rows dropped in dedupe/);
    assert.match(f!.message, /1 merge duplicates, 1 one-per-day/);
  });

  it("adds no dedupe finding when no collisions occurred", () => {
    const a = auditLabIngest({ trades: [100, -50], dates: ["2025-03-03", "2025-03-04"] });
    assert.equal(a.dedupeDroppedRows, 0);
    assert.ok(!a.findings.some((x) => x.id === "dedupe_drops"));
  });
});
