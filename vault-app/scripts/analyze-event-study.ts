/**
 * Stage-0 event study on a trade ledger (fills as events; outcome = Net PnL).
 *
 * Usage:
 *   npx tsx scripts/analyze-event-study.ts
 *   npx tsx scripts/analyze-event-study.ts trackb-mpsf-3y.csv
 *   npx tsx scripts/analyze-event-study.ts trackb-mpsf-3y.csv --oos-start=2025-07-14
 *
 * IS/OOS cut: by default the last 30% of the ledger's calendar span is OOS
 * (derived from min/max trade dates). Pass --oos-start=YYYY-MM-DD to pin a
 * fixed cut instead.
 */
import fs from "fs";
import path from "path";
import { parseLabLedger } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import {
  bootstrapEvCi,
  computeRiskGeometry,
} from "../lib/risk-geometry";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const args = process.argv.slice(2);
const oosStartArg = args
  .find((a) => a.startsWith("--oos-start="))
  ?.slice("--oos-start=".length);
const ledgerArg = args.find((a) => !a.startsWith("--"));
const LEDGER = ledgerArg
  ? path.isAbsolute(ledgerArg)
    ? ledgerArg
    : path.join(MATRIX, ledgerArg)
  : path.join(MATRIX, "prb-a0a-3y.csv");
const stem = path.basename(LEDGER, path.extname(LEDGER));
const OUT_JSON = path.join(__dirname, "../data/tv-exports", `event-study-${stem}.json`);
const OUT_MD = path.join(
  __dirname,
  "../../strategies/strategy-dev/50-analyses",
  `event-study-${stem}.md`
);
/**
 * Historical fixed OOS cut (default until 2026-08-02, audit finding F8).
 * Kept as documentation only — the cut is now derived from the ledger span
 * (last 30% = OOS) unless pinned via --oos-start=YYYY-MM-DD.
 */
const LEGACY_OOS_START = "2025-07-14";
/** Fraction of the ledger's calendar span reserved for OOS. */
const OOS_SPAN_FRACTION = 0.3;
const MIN_IS_TRADES = 30;
const MIN_OOS_TRADES = 20;
const N_BOOT = 2000;

type OosCutDerivation = "span-30pct" | "cli-override";

/** OOS start = last 30% of the calendar span between first and last trade. */
function deriveOosStart(sortedDates: string[]): string | null {
  const valid = sortedDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (valid.length === 0) return null;
  const minMs = Date.parse(valid[0]!);
  const maxMs = Date.parse(valid[valid.length - 1]!);
  const cutMs = minMs + (maxMs - minMs) * (1 - OOS_SPAN_FRACTION);
  return new Date(cutMs).toISOString().slice(0, 10);
}

function windowStats(pnls: number[], label: string) {
  const geo = computeRiskGeometry(pnls);
  const ci = bootstrapEvCi(pnls, N_BOOT);
  const coversZero = ci.ciLow <= 0 && ci.ciHigh >= 0;
  return { label, geometry: geo, evCi: ci, coversZero };
}

function main() {
  if (!fs.existsSync(LEDGER)) {
    console.error(`Missing ledger: ${LEDGER}`);
    console.error("Drop TV List of trades CSV into vault-app/data/tv-exports/matrix/");
    process.exit(1);
  }

  const trades = parseLabLedger(fs.readFileSync(LEDGER, "utf8"))
    .map((t) => ({ ...t, date: normalizeTradeDate(t.date) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.num - b.num);

  let oosStart: string;
  let oosCutDerivation: OosCutDerivation;
  if (oosStartArg) {
    oosStart = oosStartArg;
    oosCutDerivation = "cli-override";
  } else {
    const derived = deriveOosStart(trades.map((t) => t.date));
    oosStart = derived ?? LEGACY_OOS_START;
    oosCutDerivation = "span-30pct";
  }
  console.log(`OOS cut: ${oosStart} (${oosCutDerivation})`);

  const all = trades.map((t) => t.pnl);
  const is = trades.filter((t) => t.date < oosStart).map((t) => t.pnl);
  const oos = trades.filter((t) => t.date >= oosStart).map((t) => t.pnl);

  const warnings: string[] = [];
  if (is.length < MIN_IS_TRADES) {
    warnings.push(
      `IS window thin: n=${is.length} < ${MIN_IS_TRADES} — IS stats unreliable`
    );
  }
  if (oos.length < MIN_OOS_TRADES) {
    warnings.push(
      `OOS window thin: n=${oos.length} < ${MIN_OOS_TRADES} — OOS stats unreliable`
    );
  }
  for (const w of warnings) console.warn(`WARNING: ${w}`);

  // F13 caveat: this sign-flip baseline (shuffled |pnl| with random signs)
  // sanity-checks the bootstrap machinery only — it is NOT a matched control
  // for the event itself. The documented ideal for future Stage-0s is a
  // matched non-event-clock/session baseline (same instrument, same session
  // windows, no event trigger). Do not read this row as event significance.
  const abs = all.map((p) => Math.abs(p));
  const shuffled = [...abs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const randomBaseline = shuffled.map((a) => (Math.random() < 0.5 ? a : -a));

  const full = windowStats(all, "full");
  const isS = windowStats(is, "IS");
  const oosS = windowStats(oos, "OOS");
  const randS = windowStats(randomBaseline, "random_baseline");

  const blockStrategy =
    oosS.coversZero || (oosS.geometry.n > 0 && oosS.evCi.mean <= 0);

  const report = {
    title: `Event study — ${stem}`,
    note: stem.includes("mpsf")
      ? "Stage-0 B2 MPSF measure export — barrier PnL from TrackB_MPSF_measure_v0."
      : "Ledger fills as events — confirm purpose before promoting.",
    ledger: `matrix/${path.basename(LEDGER)}`,
    oosStart,
    oosCutDerivation,
    warnings,
    nBoot: N_BOOT,
    windows: { full, is: isS, oos: oosS, randomBaseline: randS },
    scorecard: {
      verdict: blockStrategy ? "away" : "toward",
      blockStrategy,
      reason: blockStrategy
        ? "OOS EV CI covers 0 or OOS mean ≤ 0 — do not invent new Pine promote from this alone"
        : "OOS EV CI exclusive of 0 — still requires prop path MC for promote",
    },
    geometryFootnote: "WR / RR / SD are geometry diagnostics only — see SCORECARD.md",
  };

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

  const md = `---
updated: ${new Date().toISOString().slice(0, 10)}
status: stage-0
verdict: ${report.scorecard.verdict}
tags: [stage-0, event-study, strategy-dev]
---
# Event study — ${stem}

> JSON: \`${path.basename(OUT_JSON)}\` · \`npx tsx scripts/analyze-event-study.ts ${path.basename(LEDGER)}\`  
> ${report.note}  
> OOS cut: **${oosStart}** (${oosCutDerivation === "span-30pct" ? "derived — last 30% of ledger span" : "CLI override --oos-start"})
${warnings.map((w) => `\n> ⚠️ ${w}`).join("")}

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | ${full.geometry.n} | ${full.evCi.mean} | [${full.evCi.ciLow}, ${full.evCi.ciHigh}] | ${full.geometry.medianPnl} | ${full.coversZero} |
| IS (< ${oosStart}) | ${isS.geometry.n} | ${isS.evCi.mean} | [${isS.evCi.ciLow}, ${isS.evCi.ciHigh}] | ${isS.geometry.medianPnl} | ${isS.coversZero} |
| OOS | ${oosS.geometry.n} | ${oosS.evCi.mean} | [${oosS.evCi.ciLow}, ${oosS.evCi.ciHigh}] | ${oosS.geometry.medianPnl} | ${oosS.coversZero} |
| Random baseline | ${randS.geometry.n} | ${randS.evCi.mean} | [${randS.evCi.ciLow}, ${randS.evCi.ciHigh}] | ${randS.geometry.medianPnl} | ${randS.coversZero} |

> Baseline caveat: the sign-flip baseline sanity-checks the bootstrap machinery, not the event — a matched non-event-clock/session baseline is the documented ideal for future Stage-0s.

### Geometry footnotes (not KPIs)

| Window | WR% | RR | Trade SD |
|---|---:|---:|---:|
| Full | ${full.geometry.winRatePct} | ${full.geometry.rr} | ${full.geometry.tradePnlSd} |
| IS | ${isS.geometry.winRatePct} | ${isS.geometry.rr} | ${isS.geometry.tradePnlSd} |
| OOS | ${oosS.geometry.winRatePct} | ${oosS.geometry.rr} | ${oosS.geometry.tradePnlSd} |

## SCORECARD

**${report.scorecard.verdict}** — ${report.scorecard.reason}

\`BLOCK_STRATEGY\`: **${blockStrategy}**

Path promote still requires F4 Lab trade-bootstrap MC.
`;

  fs.writeFileSync(OUT_MD, md);
  console.log(JSON.stringify(report.scorecard, null, 2));
  console.log("Wrote", OUT_JSON);
  console.log("Wrote", OUT_MD);
}

main();
