/**
 * Non-overlapping regime occupancy + transition matrix (Lab footnote).
 *
 * Usage: npx tsx scripts/analyze-markov-occupancy.ts
 */
import fs from "fs";
import path from "path";
import { parseLabLedger } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { buildMarkovOccupancy, tagJulOctRegime } from "../lib/markov-occupancy";

const CSV = path.join(__dirname, "../data/tv-exports/matrix/prb-a0a-3y.csv");
const OUT_JSON = path.join(__dirname, "../data/tv-exports/markov-occupancy-prb-a0a.json");
const OUT_MD = path.join(__dirname, "../../strategies/strategy-dev/50-analyses/markov-occupancy-prb-a0a.md");

function main() {
  const trades = parseLabLedger(fs.readFileSync(CSV, "utf8"))
    .map((t) => ({ ...t, date: normalizeTradeDate(t.date) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const dates = trades.map((t) => t.date);
  const result = buildMarkovOccupancy({
    dates,
    tagDay: tagJulOctRegime,
    windowDays: 7,
  });

  const payload = {
    title: "PRB A0a Jul+Oct regime occupancy",
    ledger: "matrix/prb-a0a-3y.csv",
    ...result,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8");

  const md = [
    "---",
    `updated: ${new Date().toISOString().slice(0, 10)}`,
    "tags: [markov, footnote, regime]",
    "---",
    "# Markov occupancy — PRB A0a (Jul+Oct)",
    "",
    `> ${result.note}`,
    "",
    `- Windows: **${result.nWindows}** × ${result.windowDays}d non-overlapping`,
    `- π: ${result.labels.map((L) => `${L}=${((result.pi[L] ?? 0) * 100).toFixed(1)}%`).join(" · ")}`,
    "",
    "## Transition P",
    "",
    "| From \\ To |" + result.labels.map((L) => ` ${L} |`).join(""),
    "|---|" + result.labels.map(() => "---:|").join(""),
  ];
  for (const a of result.labels) {
    md.push(
      `| ${a} |` +
        result.labels.map((b) => ` ${((result.transitionP[a]?.[b] ?? 0) * 100).toFixed(1)}% |`).join("")
    );
  }
  md.push(
    "",
    "Lab footnote only. Do not promote stand-down / stickiness without path MC + Stage-0.",
    ""
  );
  fs.writeFileSync(OUT_MD, md.join("\n"), "utf8");
  console.log(`Wrote ${OUT_JSON}`);
  console.log(`Wrote ${OUT_MD}`);
}

main();
