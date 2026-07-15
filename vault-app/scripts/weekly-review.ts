/**
 * Hermes-style weekly review — read-only markdown from cohorts + scorecard.
 * No Pine writes. Forces path MC + EV before WR.
 *
 * Usage: npx tsx scripts/weekly-review.ts
 */
import fs from "fs";
import path from "path";
import { parseCohortMeta, type CohortRecord } from "../lib/cohort";

const COHORT_DIRS = [
  path.join(__dirname, "../../strategies/cohorts"),
  path.join(__dirname, "../data/cohorts"),
];
const OUT_DIR = path.join(__dirname, "../../strategies/strategy-dev/50-analyses");
const OUT_MD = path.join(OUT_DIR, "weekly-review-latest.md");

function loadCohorts(): CohortRecord[] {
  const out: CohortRecord[] = [];
  for (const dir of COHORT_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".md") || name.startsWith("_")) continue;
      const full = path.join(dir, name);
      try {
        const text = fs.readFileSync(full, "utf8");
        const rec = parseCohortMeta(text, name, path.relative(path.join(__dirname, "../.."), full));
        if (rec) out.push(rec);
      } catch {
        /* skip */
      }
    }
  }
  return out.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
}

function decayFlag(rows: CohortRecord[]): string {
  if (rows.length < 2) return "Insufficient cohorts for decay check.";
  const latest = rows[0]!;
  const prior = rows.find((r) => r.id !== latest.id && r.strategyFamily === latest.strategyFamily) ?? rows[1]!;
  const dWeek = (latest.weeklyEdgeUsd ?? 0) - (prior.weeklyEdgeUsd ?? 0);
  const dPass = (latest.mcPassPct ?? 0) - (prior.mcPassPct ?? 0);
  if (dWeek < -50 || dPass < -5) {
    return `**away / α-decay watch** — latest weekly edge Δ=${dWeek.toFixed(0)} vs prior; pass Δ=${dPass.toFixed(1)}pp.`;
  }
  if (dWeek > 20 && dPass >= 0) {
    return `**toward** — latest weekly edge Δ=+${dWeek.toFixed(0)}; pass Δ=${dPass.toFixed(1)}pp vs prior cohort.`;
  }
  return `**hold** — mixed vs prior (weekly Δ=${dWeek.toFixed(0)}, pass Δ=${dPass.toFixed(1)}pp).`;
}

function main() {
  const cohorts = loadCohorts();
  const asOf = new Date().toISOString().slice(0, 10);
  const latest = cohorts.slice(0, 12);

  const lines: string[] = [
    "---",
    `updated: ${asOf}`,
    "tags: [weekly-review, read-only, hermes]",
    "---",
    `# Weekly review — ${asOf}`,
    "",
    "> Read-only. No Pine mutation. Path MC + net EV before WR.",
    "",
    "## Cadence checklist",
    "",
    "- [ ] Path MC / `E[$/wk]` reviewed for active books",
    "- [ ] Trade EV ± CI (Stage-0) checked — WR/RR only as geometry",
    "- [ ] Decay: latest OOS / cohort vs prior",
    "- [ ] No promote from public SOP without private Stage-0 lift",
    "",
    "## Decay check",
    "",
    decayFlag(cohorts),
    "",
    "## Recent cohorts (path MC first)",
    "",
    "| Created | Variant | Verdict | Composite | E[$/wk] | Pass% | Bust% | Payout% | Trades |",
    "|---|---|---|---|---|---|---|---|---|",
  ];

  for (const c of latest) {
    lines.push(
      `| ${c.created?.slice(0, 10) ?? "—"} | ${c.variant || c.strategyPreset || c.id} | ${c.scorecardVerdict || "—"} | ${c.compositeScore || "—"} | ${Math.round(c.weeklyEdgeUsd || 0)} | ${(c.mcPassPct ?? 0).toFixed(1)} | ${(c.mcBustPct ?? 0).toFixed(1)} | ${(c.mcPayoutPct ?? 0).toFixed(1)} | ${c.trades} |`
    );
  }

  if (latest.length === 0) {
    lines.push("| — | no cohorts yet | — | — | — | — | — | — | — |");
  }

  lines.push(
    "",
    "## Geometry footnote (do not promote on these alone)",
    "",
    "WR / RR / PF belong below path economics. If a cohort note leads with WR↑ without MC, treat as incomplete.",
    "",
    "## Next actions",
    "",
    "1. Hold or kill based on SCORECARD primary metrics.",
    "2. Stage-0 context slice if event EV CI covers 0.",
    "3. Do not open Pine strategy.entry for blocked events.",
    ""
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_MD, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT_MD} (${cohorts.length} cohorts scanned)`);
}

main();
