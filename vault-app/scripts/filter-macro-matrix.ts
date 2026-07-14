/**
 * Build B1/B3 matrix CSVs from Macro v1.4 premium merged export.
 * Usage: npx tsx scripts/filter-macro-matrix.ts [b1a|b1b|b1c|b3a|b3b|all]
 */
import fs from "fs";
import path from "path";
import {
  parseTvCsv,
  enrichedTradeToCsvRow,
  ENRICHED_TRADE_CSV_HEADER,
  type ParsedTrade,
} from "../lib/csv";

const SOURCE = path.join(__dirname, "../data/tv-exports/macro-v1.4-premium-merged.csv");
const OUT_DIR = path.join(__dirname, "../data/tv-exports/matrix");

/** Read vault enriched ledger or raw TV export. */
function loadTrades(filePath: string): ParsedTrade[] {
  const text = fs.readFileSync(filePath, "utf8");
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  if (firstLine.startsWith("date,pnl_usd")) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const out: ParsedTrade[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const pnl = parseFloat(cols[1]);
      const num = parseInt(cols[2], 10);
      if (!Number.isFinite(pnl) || !Number.isFinite(num)) continue;
      out.push({
        num,
        date: cols[0],
        pnl,
        tier: cols[3] || undefined,
        signal: cols[4] || undefined,
        direction: cols[5] === "long" || cols[5] === "short" ? cols[5] : undefined,
        qty: parseFloat(cols[6]) || undefined,
        mfeUsd: parseFloat(cols[7]) || undefined,
        maeUsd: parseFloat(cols[8]) || undefined,
        durationBars: parseFloat(cols[9]) || undefined,
        entryPrice: parseFloat(cols[10]) || undefined,
        exitPrice: parseFloat(cols[11]) || undefined,
      });
    }
    return out;
  }
  return parseTvCsv(text);
}

type MatrixBranch = "b1a" | "b1b" | "b1c" | "b3a" | "b3b";

function filterTrades(trades: ParsedTrade[], branch: MatrixBranch): ParsedTrade[] {
  let filtered: ParsedTrade[];
  switch (branch) {
    case "b1a":
      filtered = trades.filter((t) => t.tier === "A");
      break;
    case "b1b":
      filtered = trades.filter((t) => t.tier === "A" || t.tier === "H");
      break;
    case "b1c":
      filtered = trades.filter((t) => t.tier === "A+");
      break;
    case "b3a":
      filtered = trades.filter((t) => t.tier === "A").map((t) => ({ ...t, pnl: t.pnl * 0.5 }));
      break;
    case "b3b":
      filtered = trades.map((t) => ({ ...t, pnl: t.pnl * 0.5 }));
      break;
    default: {
      const _exhaustive: never = branch;
      return _exhaustive;
    }
  }
  return filtered;
}

function writeBranch(trades: ParsedTrade[], branch: MatrixBranch) {
  const outPath = path.join(OUT_DIR, `macro-matrix-${branch}.csv`);
  const rows = [ENRICHED_TRADE_CSV_HEADER, ...trades.map(enrichedTradeToCsvRow)];
  fs.writeFileSync(outPath, rows.join("\n"), "utf8");
  const net = trades.reduce((s, t) => s + t.pnl, 0);
  console.log(`${branch}: ${trades.length} trades · net $${Math.round(net)} → ${outPath}`);
}

function main() {
  const arg = (process.argv[2] ?? "all").toLowerCase() as MatrixBranch | "all";
  if (!fs.existsSync(SOURCE)) {
    console.error("Missing source:", SOURCE);
    console.error("Run merge-macro-v14-premium.ts first or place premium merged CSV there.");
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const trades = loadTrades(SOURCE);
  const branches: MatrixBranch[] =
    arg === "all" ? ["b1a", "b1b", "b1c", "b3a", "b3b"] : [arg as MatrixBranch];

  for (const branch of branches) {
    writeBranch(filterTrades(trades, branch), branch);
  }
}

main();
