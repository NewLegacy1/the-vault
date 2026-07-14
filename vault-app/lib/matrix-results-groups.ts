import type { CohortRecord } from "@/lib/cohort";
import { cohortForPreset } from "@/lib/matrix-cohort";
import type { StrategyPreset } from "@/lib/lab-profile";
import { seriesById } from "@/lib/experiment-series";

export interface MatrixSubgroup {
  id: string;
  label: string;
  presets: StrategyPreset[];
}

export interface SeriesProgress {
  saved: number;
  total: number;
  bestPassPct: number | null;
  bestPresetId: string | null;
}

/** Split a series into logical sub-groups when the row count would clutter the table. */
export function matrixPresetsBySubgroup(seriesId: string, presets: StrategyPreset[]): MatrixSubgroup[] {
  if (presets.length <= 3) {
    return [{ id: "all", label: "All branches", presets }];
  }

  switch (seriesId) {
    case "premium365": {
      const prbEval = presets.filter((p) => p.family === "prb" && p.phase === "eval");
      const prbFunded = presets.filter((p) => p.family === "prb" && p.phase === "funded");
      const macroFunded = presets.filter((p) => p.family === "macro");
      const out: MatrixSubgroup[] = [];
      if (prbEval.length) out.push({ id: "prb-eval", label: "PRB · Evaluation", presets: prbEval });
      if (prbFunded.length) out.push({ id: "prb-funded", label: "PRB · Funded PRO", presets: prbFunded });
      if (macroFunded.length) out.push({ id: "macro-funded", label: "Macro · Funded", presets: macroFunded });
      return out.length ? out : [{ id: "all", label: "All branches", presets }];
    }
    case "hybrid-sleeve": {
      const h0 = presets.filter((p) => (p.matrixBranch ?? "").startsWith("H0"));
      const h1 = presets.filter((p) => (p.matrixBranch ?? "").startsWith("H1"));
      const out: MatrixSubgroup[] = [];
      if (h0.length) out.push({ id: "h0", label: "H0 · Baseline sleeve", presets: h0 });
      if (h1.length) out.push({ id: "h1", label: "H1 · Quiet Macro filter", presets: h1 });
      return out.length ? out : [{ id: "all", label: "All branches", presets }];
    }
    case "macro-income":
      return [{ id: "macro-income", label: "M0 → M2 income track", presets }];
    default: {
      const evals = presets.filter((p) => p.phase === "eval");
      const fundeds = presets.filter((p) => p.phase === "funded" || p.phase === "combined");
      const other = presets.filter(
        (p) => p.phase !== "eval" && p.phase !== "funded" && p.phase !== "combined"
      );
      const out: MatrixSubgroup[] = [];
      if (evals.length) out.push({ id: "eval", label: "Evaluation", presets: evals });
      if (fundeds.length) out.push({ id: "funded", label: "Funded / PRO", presets: fundeds });
      if (other.length) out.push({ id: "other", label: "Research / other", presets: other });
      return out.length > 1 ? out : [{ id: "all", label: "All branches", presets }];
    }
  }
}

export function seriesProgress(
  presets: StrategyPreset[],
  cohorts: CohortRecord[],
  primaryPct: (preset: StrategyPreset) => number | null
): SeriesProgress {
  let saved = 0;
  let bestPassPct: number | null = null;
  let bestPresetId: string | null = null;

  for (const preset of presets) {
    if (!cohortForPreset(cohorts, preset)) continue;
    saved += 1;
    const pct = primaryPct(preset);
    if (pct == null) continue;
    if (bestPassPct == null || pct > bestPassPct) {
      bestPassPct = pct;
      bestPresetId = preset.id;
    }
  }

  return { saved, total: presets.length, bestPassPct, bestPresetId };
}

export function seriesDescription(seriesId: string): string | undefined {
  return seriesById(seriesId)?.description;
}

export function presetSeriesId(preset: StrategyPreset): string {
  return preset.seriesId ?? (preset.matrixTrack === "experimental" ? "custom" : "premium365");
}
