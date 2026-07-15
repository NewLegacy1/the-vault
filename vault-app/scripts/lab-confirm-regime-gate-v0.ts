/**
 * Phase 2.1 — Lab-engine MC confirm for regime-gate-v0 (Jul+Oct STAND_DOWN).
 * Uses the same buildMcParamsForLab path as F4 LAB (not autopsy proxy).
 *
 * Usage: npx tsx scripts/lab-confirm-regime-gate-v0.ts
 */
import fs from "fs";
import path from "path";
import { parseLabLedger } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { buildEquityCurve } from "../lib/equity-curve";
import { runMonteCarlo } from "../lib/monte-carlo";
import { buildMcParamsForLab } from "../lib/mc-params-builder";
import {
  compareFirmsForTrades,
  firmSnapshotsToCohortMc,
  MATRIX_REFERENCE_FIRM_ID,
} from "../lib/firm-matrix-compare";
import { derivePayoutCycle } from "../lib/payout-cycle";
import {
  buildCohortMarkdown,
  cohortRelativePath,
  mcToSummary,
  type CohortSaveInput,
} from "../lib/cohort";
import { presetById } from "../lib/lab-profile";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const COHORTS = path.join(__dirname, "../../strategies/cohorts");
const OOS_START = "2025-07-14";
const SIMS = 2000;
const MAX_TRADES = 220;
const PAYOUT_BUFFER = 2000;
const WIN = 50;
const LOSS = -50;

type Book = {
  id: string;
  presetId: string;
  ungatedFile: string;
  gatedFile: string;
};

const BOOKS: Book[] = [
  {
    id: "A0a",
    presetId: "matrix-a0a",
    ungatedFile: "prb-a0a-3y.csv",
    gatedFile: "prb-a0a-3y-gate-jul-oct.csv",
  },
  {
    id: "D1",
    presetId: "matrix-d1",
    ungatedFile: "prb-d1-3y.csv",
    gatedFile: "prb-d1-3y-gate-jul-oct.csv",
  },
];

function load(file: string) {
  const trades = parseLabLedger(fs.readFileSync(path.join(MATRIX, file), "utf8")).map(
    (t) => ({
      ...t,
      date: normalizeTradeDate(t.date),
    })
  );
  return {
    trades: trades.map((t) => t.pnl),
    dates: trades.map((t) => t.date),
    raw: trades,
  };
}

function filterOos(ds: ReturnType<typeof load>) {
  const idx = ds.dates
    .map((d, i) => (d >= OOS_START ? i : -1))
    .filter((i) => i >= 0);
  return {
    trades: idx.map((i) => ds.trades[i]),
    dates: idx.map((i) => ds.dates[i]),
    raw: idx.map((i) => ds.raw[i]),
  };
}

function bookStats(trades: number[], dates: string[]) {
  const wins = trades.filter((p) => p > WIN).length;
  const losses = trades.filter((p) => p < LOSS).length;
  const scratches = trades.length - wins - losses;
  const net = trades.reduce((s, p) => s + p, 0);
  const eq = buildEquityCurve(trades, dates);
  const span =
    dates.length >= 2
      ? `${dates[0]} → ${dates[dates.length - 1]}`
      : dates[0] ?? "";
  const ms =
    dates.length >= 2
      ? new Date(dates[dates.length - 1] + "T12:00:00Z").getTime() -
        new Date(dates[0] + "T12:00:00Z").getTime()
      : 0;
  const weeks = Math.max(ms / (7 * 86400000), 1 / 7);
  return {
    n: trades.length,
    net,
    wins,
    losses,
    scratches,
    maxDd: eq.maxDd,
    span,
    tpw: Math.round((trades.length / weeks) * 10) / 10,
  };
}

function runLabMc(
  trades: number[],
  dates: string[],
  phase: "eval" | "funded"
) {
  const built = buildMcParamsForLab({
    ruleId: MATRIX_REFERENCE_FIRM_ID,
    strategyPhase: phase,
    trades,
    dates,
    sims: SIMS,
    maxTrades: MAX_TRADES,
    payoutBuffer: PAYOUT_BUFFER,
  });
  if (!built) throw new Error("buildMcParamsForLab failed");
  const mc = runMonteCarlo(built.params);
  const cycle = derivePayoutCycle(mc);
  return { mc, cycle };
}

function saveCohort(opts: {
  book: Book;
  labelSuffix: string;
  hypothesis: string;
  ds: ReturnType<typeof load>;
  window: "full" | "oos";
}) {
  const preset = presetById(opts.book.presetId)!;
  const stats = bookStats(opts.ds.trades, opts.ds.dates);
  const phase: "eval" | "funded" = preset.phase === "funded" ? "funded" : "eval";
  const { mc } = runLabMc(opts.ds.trades, opts.ds.dates, phase);
  const snapshots = compareFirmsForTrades({
    trades: opts.ds.trades,
    dates: opts.ds.dates,
    sims: SIMS,
    maxTrades: MAX_TRADES,
    payoutBuffer: PAYOUT_BUFFER,
    strategyPhase: phase,
  });
  const input: CohortSaveInput = {
    variant: `${preset.label} · ${opts.labelSuffix}`,
    strategyPreset: opts.book.presetId,
    strategyVersion: preset.version,
    strategyConfig: preset.config,
    strategyFamily: preset.family,
    phase: preset.phase,
    experimentSeries: preset.seriesId ?? "premium365",
    hypothesis: opts.hypothesis,
    regimes: [...(preset.defaultRegimes ?? ["baseline"]), "regime-gate-v0"],
    notes: opts.hypothesis,
    datasetName: `${opts.labelSuffix}${opts.window === "oos" ? " · OOS 12m" : ""}`,
    span: stats.span,
    sources: [opts.book.gatedFile.includes("gate") && opts.labelSuffix.includes("gate")
      ? opts.book.gatedFile
      : opts.book.ungatedFile],
    firm: "TPT $50K Test → PRO (reference) · multi-firm matrix",
    trades: stats.n,
    netPnl: stats.net,
    wins: stats.wins,
    losses: stats.losses,
    scratches: stats.scratches,
    maxDd: stats.maxDd,
    tradesPerWeek: stats.tpw,
    sims: SIMS,
    maxTrades: MAX_TRADES,
    payoutBuffer: PAYOUT_BUFFER,
    mc: mcToSummary(mc),
    mcEngineVersion: mc.engineVersion,
    mcRulePack: mc.rulePackFeatures,
    firmMc: firmSnapshotsToCohortMc(snapshots),
    tradePnls: opts.ds.trades,
    tradeDates: opts.ds.dates,
  };
  // Fix sources for gated vs ungated clearly
  input.sources = [
    opts.labelSuffix.includes("gate") ? opts.book.gatedFile : opts.book.ungatedFile,
  ];

  const rel = cohortRelativePath(input);
  const abs = path.join(COHORTS, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buildCohortMarkdown(input), "utf8");
  const cycle = derivePayoutCycle(mc);
  return { rel, cycle, stats, mc };
}

function main() {
  console.log("=== Phase 2.1 Lab-engine confirm · regime-gate-v0 ===\n");
  console.log(`MC: sims=${SIMS} maxTrades=${MAX_TRADES} buffer=${PAYOUT_BUFFER} firm=tpt50\n`);

  const rows: {
    book: string;
    window: string;
    kind: string;
    n: number;
    eWeek: number | null;
    pass: number;
    bust: number;
    cohort?: string;
  }[] = [];

  for (const book of BOOKS) {
    const preset = presetById(book.presetId)!;
    const ungated = load(book.ungatedFile);
    const gated = load(book.gatedFile);
    const ungatedOos = filterOos(ungated);
    const gatedOos = filterOos(gated);

    const pairs: {
      kind: "ungated" | "gated";
      window: "full" | "oos";
      ds: ReturnType<typeof load>;
      save: boolean;
    }[] = [
      { kind: "ungated", window: "full", ds: ungated, save: false },
      { kind: "gated", window: "full", ds: gated, save: true },
      { kind: "ungated", window: "oos", ds: ungatedOos, save: false },
      { kind: "gated", window: "oos", ds: gatedOos, save: true },
    ];

    for (const p of pairs) {
      const { mc, cycle } = runLabMc(p.ds.trades, p.ds.dates, preset.phase);
      let cohort: string | undefined;
      if (p.save) {
        const saved = saveCohort({
          book,
          labelSuffix: p.window === "oos" ? "regime-gate-v0 · OOS" : "regime-gate-v0",
          hypothesis:
            p.window === "oos"
              ? "regime-gate-v0 · OOS 12m · Jul+Oct STAND_DOWN"
              : "regime-gate-v0 · Jul+Oct STAND_DOWN · Lab confirm",
          ds: p.ds,
          window: p.window,
        });
        cohort = saved.rel;
      }
      rows.push({
        book: book.id,
        window: p.window,
        kind: p.kind,
        n: p.ds.trades.length,
        eWeek: cycle.expectedUsdPerCalendarWeek,
        pass: Math.round(mc.passRate * 1000) / 10,
        bust: Math.round(mc.bustRate * 1000) / 10,
        cohort,
      });
      console.log(
        `${book.id} ${p.window.padEnd(4)} ${p.kind.padEnd(7)} n=${p.ds.trades.length} E[$/wk]=$${cycle.expectedUsdPerCalendarWeek} pass=${(mc.passRate * 100).toFixed(1)}% bust=${(mc.bustRate * 100).toFixed(1)}%${cohort ? ` → ${cohort}` : ""}`
      );
    }
    console.log("");
  }

  // Verdict per book
  console.log("=== SETTLEMENT ===\n");
  const verdicts: Record<string, "PASS" | "FAIL"> = {};
  for (const book of BOOKS) {
    const fullU = rows.find((r) => r.book === book.id && r.window === "full" && r.kind === "ungated")!;
    const fullG = rows.find((r) => r.book === book.id && r.window === "full" && r.kind === "gated")!;
    const oosU = rows.find((r) => r.book === book.id && r.window === "oos" && r.kind === "ungated")!;
    const oosG = rows.find((r) => r.book === book.id && r.window === "oos" && r.kind === "gated")!;

    const eFullUp =
      fullG.eWeek != null && fullU.eWeek != null && fullG.eWeek > fullU.eWeek;
    const eOosUp =
      oosG.eWeek != null && oosU.eWeek != null && oosG.eWeek >= oosU.eWeek;
    const bustDown = fullG.bust < fullU.bust;
    const nOk = fullG.n >= 80;

    const pass = eFullUp && eOosUp && bustDown && nOk;
    verdicts[book.id] = pass ? "PASS" : "FAIL";

    console.log(`${book.id}: ${verdicts[book.id]}`);
    console.log(
      `  full E[$/wk] ${fullU.eWeek} → ${fullG.eWeek} (${eFullUp ? "↑" : "FAIL"}) · bust ${fullU.bust}% → ${fullG.bust}% (${bustDown ? "↓" : "FAIL"}) · n=${fullG.n} (${nOk ? "ok" : "thin"})`
    );
    console.log(
      `  OOS  E[$/wk] ${oosU.eWeek} → ${oosG.eWeek} (${eOosUp ? "≥" : "FAIL"}) · bust ${oosU.bust}% → ${oosG.bust}%`
    );
  }

  const overall =
    verdicts.A0a === "PASS" && verdicts.D1 === "PASS"
      ? "PASS"
      : verdicts.A0a === "PASS" || verdicts.D1 === "PASS"
        ? "PASS_PARTIAL"
        : "FAIL";

  const out = {
    generated: new Date().toISOString(),
    gate: "regime-gate-v0",
    rule: "STAND_DOWN calendar month in {7,10}",
    hygiene: {
      yearMonthJulOct: "all cells w=0 across 2023–2026 (see autopsy byMonth)",
      stackedMarch: false,
      note: "calendar ops overlay — not causal market regime",
    },
    mc: { sims: SIMS, maxTrades: MAX_TRADES, payoutBuffer: PAYOUT_BUFFER },
    rows,
    verdicts,
    overall,
  };
  const outPath = path.join(MATRIX, "../regime-gate-v0-lab-confirm.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nOverall: ${overall}`);
  console.log(`Wrote ${outPath}`);
}

main();
