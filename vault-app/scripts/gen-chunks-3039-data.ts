import fs from "fs";

const lines = fs
  .readFileSync("data/tv-exports/prb-chunks-30-39-merged.csv", "utf8")
  .trim()
  .split(/\r?\n/)
  .slice(1);
const trades = lines.map((l) => {
  const [date, pnl] = l.split(",");
  return { date, pnl: parseFloat(pnl) };
});

const fmt = trades.map((t) => `  { date: "${t.date}", dir: "L" as const, pnl: ${t.pnl} },`).join("\n");

const body = `// YTD chunk exports 30–39 only (96 trades, Dec 31 2024 → Jul 8 2026).
// Sequential TV windows — minimal overlap. Re-gen: npx tsx scripts/gen-chunks-3039-data.ts

import type { SeedTrade } from "./prb-data";

export const TRADES_YTD_CHUNKS_3039: SeedTrade[] = [
${fmt}
];
`;

fs.writeFileSync("lib/prb-chunks-3039-data.ts", body);
console.log(`wrote ${trades.length} trades`);
