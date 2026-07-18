/**
 * Path B parity gate — Dual29 two-candle RB spec, leave + Powell (frozen-leg OTE).
 *
 *   cd vault-app
 *   npx tsx scripts/morningstar-pathb-replay.ts
 *
 * Uses committed synthetic CSV. Optional real export:
 *   data/tv-exports/morningstar-bars/mnq-1m-2026-07-15-17.csv
 */
import fs from "fs";
import path from "path";
import { PATHB_DEFAULTS } from "../lib/morningstar/defaults";
import { barsToCsv, buildSyntheticBars } from "../lib/morningstar/build-synthetic-fixture";
import { replayPathB } from "../lib/morningstar/pathb-engine";
import { detectRbAt, type Bar } from "../lib/morningstar/rb-pack";

const BARS_DIR = path.join(__dirname, "../data/tv-exports/morningstar-bars");
const SYNTH_CSV = path.join(BARS_DIR, "mnq-1m-fixture-synthetic.csv");
const REAL_CSV = path.join(BARS_DIR, "mnq-1m-2026-07-15-17.csv");
const EXPECT = path.join(BARS_DIR, "morningstar-jul16-17.expect.json");

type ExpectFile = {
  cases: Array<{
    id: string;
    ymd: number;
    sleeve: "leave" | "powell";
    require: boolean;
    dir?: number;
    entryNear?: number;
    entryTol?: number;
    note?: string;
  }>;
  unitChecks: {
    loneWickIsNotRb: boolean;
    twoCandleIsRb: boolean;
    sweepWickRequired: boolean;
  };
};

function parseCsv(text: string): Bar[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(/[,;]/).map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const idx = (names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };
  const iT = idx(["time", "date", "datetime", "unix"]);
  const iO = idx(["open"]);
  const iH = idx(["high"]);
  const iL = idx(["low"]);
  const iC = idx(["close"]);
  const iV = idx(["volume"]);
  if (iT < 0 || iO < 0 || iH < 0 || iL < 0 || iC < 0) {
    throw new Error(`CSV missing OHLC columns. Header: ${header.join(",")}`);
  }
  const bars: Bar[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r]!.split(/[,;]/).map((c) => c.trim().replace(/"/g, ""));
    const rawT = cols[iT]!;
    let time = Number(rawT);
    if (!Number.isFinite(time)) time = Date.parse(rawT);
    if (!Number.isFinite(time)) continue;
    if (time < 1e12) time *= 1000;
    bars.push({
      time,
      open: Number(cols[iO]),
      high: Number(cols[iH]),
      low: Number(cols[iL]),
      close: Number(cols[iC]),
      volume: iV >= 0 ? Number(cols[iV]) : 0,
    });
  }
  return bars.sort((a, b) => a.time - b.time);
}

function ensureSynthetic(): void {
  fs.mkdirSync(BARS_DIR, { recursive: true });
  const bars = buildSyntheticBars();
  fs.writeFileSync(SYNTH_CSV, barsToCsv(bars), "utf8");
}

function runUnitChecks(expect: ExpectFile): string[] {
  const fails: string[] = [];

  // Lone bullish long-wick candle after a BULLISH candle — NOT an RB (Dual29 spec)
  const loneWick: Bar[] = [
    { time: 0, open: 100, high: 106, low: 99, close: 105 }, // bullish A
    { time: 60_000, open: 105, high: 108, low: 92, close: 107 }, // bullish long wick B
  ];
  const hitLone = detectRbAt(loneWick, 1, PATHB_DEFAULTS.minWick1, PATHB_DEFAULTS);
  if (expect.unitChecks.loneWickIsNotRb && hitLone?.bull) {
    fails.push("unit: lone long-wick bullish candle incorrectly counted as bull RB");
  }

  // Bearish A -> bullish block B sweeping A's wick — IS an RB.
  // Zone = A body end (100) -> B low (92) = 8 pts >= minWick1.
  const twoCandle: Bar[] = [
    { time: 0, open: 104, high: 105, low: 99, close: 100 }, // bearish A
    { time: 60_000, open: 100, high: 107, low: 92, close: 106 }, // bullish block B, sweeps 99
  ];
  const hitTwo = detectRbAt(twoCandle, 1, PATHB_DEFAULTS.minWick1, PATHB_DEFAULTS);
  if (expect.unitChecks.twoCandleIsRb && !hitTwo?.bull) {
    fails.push("unit: bearish->bullish block pair should be a bull RB");
  }
  if (hitTwo?.bull && (hitTwo.wsBull !== 100 || hitTwo.low !== 92)) {
    fails.push(
      `unit: bull RB zone wrong — wick-start=${hitTwo?.wsBull} (want 100, A body end) extreme=${hitTwo?.low} (want 92)`
    );
  }

  // Same pair but block low does NOT sweep A's wick low — rejected when sweep required
  const noSweep: Bar[] = [
    { time: 0, open: 104, high: 105, low: 90, close: 100 }, // bearish A, deep wick 90
    { time: 60_000, open: 100, high: 107, low: 92, close: 106 }, // B low 92 > A low 90
  ];
  const hitNoSweep = detectRbAt(noSweep, 1, PATHB_DEFAULTS.minWick1, PATHB_DEFAULTS);
  if (expect.unitChecks.sweepWickRequired && hitNoSweep?.bull) {
    fails.push("unit: block wick must sweep candle-1 wick — pair without sweep counted as RB");
  }
  return fails;
}

function checkCases(
  label: string,
  result: ReturnType<typeof replayPathB>,
  expect: ExpectFile
): string[] {
  const fails: string[] = [];
  console.log(`\n[${label}] arms=${result.arms.length}`);
  for (const a of result.arms) {
    console.log(
      `  ${a.ymd} ${a.sleeve} dir=${a.dir} entry=${a.entry.toFixed(2)} tag=${a.tag} t=${new Date(a.time).toISOString()}`
    );
  }
  for (const c of expect.cases) {
    const map = c.sleeve === "leave" ? result.leaveByDay : result.powellByDay;
    const arm = map[String(c.ymd)];
    if (c.require) {
      if (!arm) fails.push(`${label}: missing required ${c.id}`);
      else if (c.dir != null && arm.dir !== c.dir) {
        fails.push(`${label}: ${c.id} dir=${arm.dir} expected ${c.dir}`);
      } else if (c.entryNear != null) {
        const tol = c.entryTol ?? 8;
        if (Math.abs(arm.entry - c.entryNear) > tol) {
          fails.push(
            `${label}: ${c.id} entry=${arm.entry.toFixed(2)} not near morning Day-IL wick-start ${c.entryNear}±${tol}`
          );
        }
      }
    } else if (arm) {
      fails.push(`${label}: ${c.id} must NOT arm (got ${arm.tag} @ ${arm.entry})`);
    }
  }
  return fails;
}

function main(): void {
  if (!fs.existsSync(EXPECT)) {
    console.error(`Missing expect file: ${EXPECT}`);
    process.exit(1);
  }
  const expect = JSON.parse(fs.readFileSync(EXPECT, "utf8")) as ExpectFile;
  ensureSynthetic();

  // Gate exercises BOTH sleeves; keep RB-wick geom so synthetic Jul16 parity stays stable
  const gateCfg = {
    ...PATHB_DEFAULTS,
    sleeve: "KO-leave + KO-retest" as const,
    powellGeom: "1m RB wick" as const,
  };

  const fails: string[] = [];
  fails.push(...runUnitChecks(expect));

  const synthBars = parseCsv(fs.readFileSync(SYNTH_CSV, "utf8"));
  if (synthBars.length === 0) {
    console.error("Synthetic CSV empty — waiting for bars.");
    process.exit(1);
  }
  fails.push(...checkCases("synthetic", replayPathB(synthBars, gateCfg), expect));

  if (fs.existsSync(REAL_CSV)) {
    const realBars = parseCsv(fs.readFileSync(REAL_CSV, "utf8"));
    console.log(`\n[real-export] bars=${realBars.length} (informational; synthetic is the gate)`);
    const real = replayPathB(realBars, gateCfg);
    for (const a of real.arms) {
      console.log(
        `  ${a.ymd} ${a.sleeve} dir=${a.dir} entry=${a.entry.toFixed(2)} tag=${a.tag}`
      );
    }
  } else {
    console.log(`\n[real-export] not present (optional). Drop at:\n  ${REAL_CSV}`);
  }

  if (fails.length) {
    console.error("\nFAIL");
    for (const f of fails) console.error(" -", f);
    process.exit(1);
  }
  console.log("\nPASS — Path B parity gate green (synthetic + unit checks).");
}

main();
