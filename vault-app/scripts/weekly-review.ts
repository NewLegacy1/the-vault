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

/** Recurse eval/funded/combined/research — root-only scan missed almost all cohorts. */
function walkMdFiles(dir: string, base = ""): { rel: string; abs: string }[] {
  if (!fs.existsSync(dir)) return [];
  const out: { rel: string; abs: string }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    let st: fs.Stats;
    try {
      st = fs.statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...walkMdFiles(abs, path.join(base, name)));
    } else if (name.endsWith(".md") && !name.startsWith("_")) {
      out.push({
        rel: path.join(base, name).replace(/\\/g, "/"),
        abs,
      });
    }
  }
  return out;
}

function loadCohorts(): CohortRecord[] {
  const out: CohortRecord[] = [];
  const repoRoot = path.join(__dirname, "../..");
  for (const dir of COHORT_DIRS) {
    for (const { rel, abs } of walkMdFiles(dir)) {
      try {
        const text = fs.readFileSync(abs, "utf8");
        const rec = parseCohortMeta(
          text,
          path.basename(rel),
          path.relative(repoRoot, abs).replace(/\\/g, "/")
        );
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
  const prior =
    rows.find((r) => r.id !== latest.id && r.strategyFamily === latest.strategyFamily) ??
    rows[1]!;
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
    `> Cohorts scanned (recursive): **${cohorts.length}**`,
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

  if (!latest.length) {
    lines.push("| — | no cohorts yet | — | — | — | — | — | — | — |");
  } else {
    for (const c of latest) {
      lines.push(
        `| ${c.created?.slice(0, 10) ?? "—"} | ${c.variant ?? c.id} | ${c.verdict ?? "—"} | ${c.compositeScore ?? "—"} | ${c.weeklyEdgeUsd ?? "—"} | ${c.mcPassPct ?? "—"} | ${c.mcBustPct ?? "—"} | ${c.mcPayoutPct ?? "—"} | ${c.trades ?? "—"} |`
      );
    }
  }

  lines.push(
    "",
    "## Notes",
    "",
    "- Dual46 May walk = chart study — not Lab promote.",
    "- Regime-gate-v0 remains the last Lab toward on gated PRB books (see away-session MC synthesis).",
    "- Track B matrix: do not reopen kills via param retune.",
    ""
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_MD, lines.join("\n"));
  console.log(`Wrote ${OUT_MD} (${cohorts.length} cohorts)`);
}

main();
