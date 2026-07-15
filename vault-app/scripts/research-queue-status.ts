/**
 * Research queue status — which Track B CSVs need Stage-0 analysis.
 * Usage: npm run research-queue
 */
import fs from "fs";
import path from "path";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const TV = path.join(__dirname, "../data/tv-exports");

/** Stems already closed in kill-lessons (no event-study JSON required). */
const CLOSED: Record<string, string> = {
  "trackb-orbreak-3y": "kill · B0",
  "trackb-erxor-3y": "kill · B1",
  "trackb-mpsf-3y": "kill · B2",
  "trackb-nr-exp-3y": "kill · B3",
  "trackb-vwapz-3y": "kill · B4",
  "trackb-1005-3y": "kill · B5",
  "trackb-gapfade-3y": "kill · B6",
  "trackb-pmcont-3y": "kill · B7",
  "trackb-mtf-pmcont-mnq-5m": "kill · B9",
  "trackb-lom-mnq-5m": "kill · B10",
};

function main() {
  const csvs = fs.existsSync(MATRIX)
    ? fs.readdirSync(MATRIX).filter((f) => f.startsWith("trackb-") && f.endsWith(".csv"))
    : [];
  const studies = fs.existsSync(TV)
    ? new Set(fs.readdirSync(TV).filter((f) => f.startsWith("event-study-trackb-") && f.endsWith(".json")))
    : new Set<string>();

  const rows = csvs.map((csv) => {
    const stem = csv.replace(/\.csv$/, "");
    const studyName = `event-study-${stem}.json`;
    const short = stem.replace(/^trackb-/, "").replace(/-3y$/, "");
    const statsPath = path.join(TV, `trackb-${short}-stats.json`);

    let analyzed = false;
    let verdict = "—";

    if (studies.has(studyName)) {
      analyzed = true;
      try {
        const j = JSON.parse(fs.readFileSync(path.join(TV, studyName), "utf8")) as {
          scorecard?: { verdict?: string; blockStrategy?: boolean };
        };
        verdict = `${j.scorecard?.verdict ?? "?"}${j.scorecard?.blockStrategy ? " · BLOCK" : ""}`;
      } catch {
        verdict = "unreadable";
      }
    } else if (CLOSED[stem]) {
      analyzed = true;
      verdict = CLOSED[stem];
    } else if (fs.existsSync(statsPath)) {
      analyzed = true;
      verdict = "stats present · check kill-lessons";
    }

    return {
      csv,
      analyzed,
      verdict,
      next: analyzed ? "closed — do not retune" : "RUN analyze-event-study.ts",
    };
  });

  const idle = rows.every((r) => r.analyzed);
  console.log(
    JSON.stringify(
      {
        trackbCsvs: rows.length,
        rows,
        idleHint: idle
          ? "All Track B CSVs closed — propose next Stage-0 from kill-lessons (one only)"
          : "Unanalyzed CSV present",
      },
      null,
      2,
    ),
  );
}

main();
