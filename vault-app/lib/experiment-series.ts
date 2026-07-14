/** Groups matrix / Lab presets into named experiment tracks for UI + cohort filing. */

export interface ExperimentSeries {
  id: string;
  /** Short title shown as matrix section header */
  label: string;
  /** Lower = earlier in the matrix */
  order: number;
  description?: string;
}

export const EXPERIMENT_SERIES: ExperimentSeries[] = [
  {
    id: "premium365",
    label: "Premium 365d matrix",
    order: 0,
    description: "A/B/D/B-tier control study — PRB + Macro on the premium year.",
  },
  {
    id: "hybrid-sleeve",
    label: "H · PRB × Macro sleeve",
    order: 10,
    description:
      "Portfolio union of PRB + Macro A-tier (0 same-day overlap on A). Quiet-only Macro filter variants.",
  },
  {
    id: "datahl",
    label: "X · Data H/L",
    order: 20,
    description: "Manual news-window replay models.",
  },
  {
    id: "custom",
    label: "Custom / one-off",
    order: 99,
    description: "Ad-hoc experiments — name them in hypothesis.",
  },
];

export function seriesById(id: string): ExperimentSeries | undefined {
  return EXPERIMENT_SERIES.find((s) => s.id === id);
}

export function seriesLabel(id: string | undefined): string {
  if (!id) return "Ungrouped";
  return seriesById(id)?.label ?? id;
}
