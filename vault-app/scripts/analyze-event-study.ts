/**
 * Stage-0 event study on a trade ledger (fills as events; outcome = Net PnL).
 *
 * Usage:
 *   npx tsx scripts/analyze-event-study.ts
 *   npx tsx scripts/analyze-event-study.ts trackb-mpsf-3y.csv
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
const ledgerArg = process.argv[2];
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
const OOS_START = "2025-07-14";
const N_BOOT = 2000;

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

  const all = trades.map((t) => t.pnl);
  const is = trades.filter((t) => t.date < OOS_START).map((t) => t.pnl);
  const oos = trades.filter((t) => t.date >= OOS_START).map((t) => t.pnl);

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
    oosStart: OOS_START,
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

## Results

| Window | n | EV $ | EV CI 95% | Median | Covers 0? |
|---|---:|---:|---|---:|---|
| Full | ${full.geometry.n} | ${full.evCi.mean} | [${full.evCi.ciLow}, ${full.evCi.ciHigh}] | ${full.geometry.medianPnl} | ${full.coversZero} |
| IS (< ${OOS_START}) | ${isS.geometry.n} | ${isS.evCi.mean} | [${isS.evCi.ciLow}, ${isS.evCi.ciHigh}] | ${isS.geometry.medianPnl} | ${isS.coversZero} |
| OOS | ${oosS.geometry.n} | ${oosS.evCi.mean} | [${oosS.evCi.ciLow}, ${oosS.evCi.ciHigh}] | ${oosS.geometry.medianPnl} | ${oosS.coversZero} |
| Random baseline | ${randS.geometry.n} | ${randS.evCi.mean} | [${randS.evCi.ciLow}, ${randS.evCi.ciHigh}] | ${randS.geometry.medianPnl} | ${randS.coversZero} |

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
