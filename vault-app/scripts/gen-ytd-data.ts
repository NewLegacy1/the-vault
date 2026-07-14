import fs from "fs";

const lines = fs.readFileSync("data/tv-exports/prb-ytd-merged.csv", "utf8").trim().split(/\r?\n/).slice(1);
const trades = lines.map((l) => {
  const [date, pnl] = l.split(",");
  return { date, pnl: parseFloat(pnl) };
});
const may = trades.filter((t) => t.date >= "2025-05-17");

const fmt = (arr: typeof trades) =>
  arr.map((t) => `  { date: "${t.date}", dir: "L" as const, pnl: ${t.pnl} },`).join("\n");

const body = `// Auto-imported from Downloads PRB exports Jul 14 2026.
// 40 chunk CSVs merged with 1 trade/day dedupe. Re-gen: npx tsx scripts/gen-ytd-data.ts

import type { SeedTrade } from "./prb-data";

export const TRADES_YTD_FULL: SeedTrade[] = [
${fmt(trades)}
];

export const TRADES_YTD_MAY17: SeedTrade[] = [
${fmt(may)}
];
`;

fs.writeFileSync("lib/prb-ytd-data.ts", body);
console.log(`wrote lib/prb-ytd-data.ts — ${trades.length} full, ${may.length} may17+`);
