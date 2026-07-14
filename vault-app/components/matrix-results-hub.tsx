"use client";

import { useMemo, useState } from "react";
import { MatrixFirmCompare } from "@/components/matrix-firm-compare";
import { MatrixReplayPanel } from "@/components/matrix-replay-panel";
import { MatrixResults } from "@/components/matrix-results";
import { cohortForPresetId } from "@/lib/matrix-cohort";
import { presetById } from "@/lib/lab-profile";
import type { CohortRecord } from "@/lib/cohort";

export interface MatrixResultsHubProps {
  cohorts: CohortRecord[];
  loading?: boolean;
  loadErr?: string;
  onRefresh?: () => void;
  activePresetId: string;
  onSelectPreset: (id: string) => void;
}

export function MatrixResultsHub({
  cohorts,
  loading,
  loadErr,
  onRefresh,
  activePresetId,
  onSelectPreset,
}: MatrixResultsHubProps) {
  const preset = presetById(activePresetId);
  const cohort = useMemo(
    () => (preset ? cohortForPresetId(cohorts, preset.id, preset.matrixBranch) : undefined),
    [cohorts, preset]
  );

  return (
    <>
      <MatrixResults
        activePresetId={activePresetId}
        onSelectPreset={onSelectPreset}
        cohorts={cohorts}
        loading={loading}
        loadErr={loadErr}
        onRefresh={onRefresh}
      />
      {activePresetId && (
        <>
          <MatrixFirmCompare presetId={activePresetId} cohort={cohort} />
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="panel-title">
              TV replay
              <span className="sub">TradingView export recipe</span>
            </div>
            <div className="panel-body">
              <MatrixReplayPanel activePresetId={activePresetId} onSelectPreset={onSelectPreset} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function useMatrixResultsState(defaultPreset = "matrix-a0a") {
  const [activePresetId, setActivePresetId] = useState(defaultPreset);
  return { activePresetId, setActivePresetId };
}
