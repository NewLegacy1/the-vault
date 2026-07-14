import type { CohortRecord } from "@/lib/cohort";
import type { StrategyPreset } from "@/lib/lab-profile";

export function cohortForPreset(
  cohorts: CohortRecord[],
  preset: StrategyPreset
): CohortRecord | undefined {
  const byPreset = cohorts.filter((c) => c.strategyPreset === preset.id);
  if (byPreset.length) return byPreset.sort((a, b) => b.created.localeCompare(a.created))[0];
  const branch = preset.matrixBranch?.toLowerCase();
  if (!branch) return undefined;
  return cohorts
    .filter((c) => {
      const v = c.variant.toLowerCase();
      const d = c.datasetName.toLowerCase();
      return v.includes(branch) || d.includes(` · ${branch}`) || d.endsWith(branch);
    })
    .sort((a, b) => b.created.localeCompare(a.created))[0];
}

export function cohortForPresetId(
  cohorts: CohortRecord[],
  presetId: string,
  matrixBranch?: string
): CohortRecord | undefined {
  const byPreset = cohorts.filter((c) => c.strategyPreset === presetId);
  if (byPreset.length) return byPreset.sort((a, b) => b.created.localeCompare(a.created))[0];
  const branch = matrixBranch?.toLowerCase();
  if (!branch) return undefined;
  return cohorts
    .filter((c) => {
      const v = c.variant.toLowerCase();
      const d = c.datasetName.toLowerCase();
      return v.includes(branch) || d.includes(` · ${branch}`) || d.endsWith(branch);
    })
    .sort((a, b) => b.created.localeCompare(a.created))[0];
}
