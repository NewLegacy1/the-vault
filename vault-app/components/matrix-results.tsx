"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtUsd } from "@/lib/store";
import type { CohortRecord } from "@/lib/cohort";
import {
  firmMcForTab,
  firmCompareLabel,
  mcCompareModeForPhase,
  MATRIX_FIRM_TABS,
  matrixPrimaryMcPct,
  matrixWeeksMc,
  type MatrixCompareFirmId,
} from "@/lib/firm-matrix-compare";
import { buildMcParamsForFirm } from "@/lib/mc-params-builder";
import { McCalibrationBanner } from "@/components/mc-calibration-banner";
import { cohortForPreset } from "@/lib/matrix-cohort";
import {
  matrixPresetsBySubgroup,
  seriesDescription,
  seriesProgress,
} from "@/lib/matrix-results-groups";
import { matrixPresetsBySeries, type StrategyPhase, type StrategyPreset } from "@/lib/lab-profile";
import { seriesLabel } from "@/lib/experiment-series";
import { ruleById } from "@/lib/prop-firms";

type StatusFilter = "all" | "saved" | "pending";
type PhaseFilter = "all" | StrategyPhase;

export interface MatrixResultsProps {
  activePresetId?: string;
  onSelectPreset: (presetId: string) => void;
  firmTab?: MatrixCompareFirmId;
  onFirmTabChange?: (firmId: MatrixCompareFirmId) => void;
  refreshKey?: number;
  cohorts?: CohortRecord[];
  loading?: boolean;
  loadErr?: string;
  onRefresh?: () => void;
}

function passClass(pct: number): string {
  if (pct >= 50) return "pos";
  if (pct >= 35) return "warn";
  return "neg";
}

function sourceLabel(p: StrategyPreset): string {
  if (p.dataSource === "derived-b0") return "derived";
  if (p.dataSource === "prebuilt-ledger") return "ledger";
  if (p.matrixTrack === "experimental") return "new";
  return "TV";
}

function fmtWeeks(w: number | null | undefined): string {
  if (w == null || !Number.isFinite(w)) return "—";
  return `${w}w`;
}

function presetJumpLabel(p: StrategyPreset): string {
  const branch = p.matrixBranch ?? p.id;
  const tail = p.label.split(" · ").slice(1).join(" · ") || p.label;
  return `${branch} · ${tail}`;
}

export function MatrixResults({
  activePresetId,
  onSelectPreset,
  firmTab: firmTabProp,
  onFirmTabChange,
  refreshKey = 0,
  cohorts: cohortsProp,
  loading: loadingProp,
  loadErr: loadErrProp,
  onRefresh,
}: MatrixResultsProps) {
  const [cohortsLocal, setCohortsLocal] = useState<CohortRecord[]>([]);
  const [loadErrLocal, setLoadErrLocal] = useState("");
  const [loadingLocal, setLoadingLocal] = useState(!cohortsProp);
  const [firmTabLocal, setFirmTabLocal] = useState<MatrixCompareFirmId>("tpt50");
  const firmTab = firmTabProp ?? firmTabLocal;
  const setFirmTab = (id: MatrixCompareFirmId) => {
    onFirmTabChange?.(id);
    if (firmTabProp == null) setFirmTabLocal(id);
  };
  const [pollKey, setPollKey] = useState(0);
  const [seriesFilter, setSeriesFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const controlled = cohortsProp != null;

  const loadCohorts = () => {
    if (controlled) {
      onRefresh?.();
      return;
    }
    setLoadingLocal(true);
    fetch("/api/cohorts", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        return data as { cohorts?: CohortRecord[] };
      })
      .then((data) => {
        setCohortsLocal(data.cohorts ?? []);
        setLoadErrLocal("");
      })
      .catch((e) => setLoadErrLocal(String(e)))
      .finally(() => setLoadingLocal(false));
  };

  useEffect(() => {
    if (controlled) return;
    loadCohorts();
  }, [refreshKey, pollKey, controlled]);

  useEffect(() => {
    if (controlled) return;
    const id = window.setInterval(() => setPollKey((k) => k + 1), 45000);
    return () => window.clearInterval(id);
  }, [controlled]);

  const cohorts = cohortsProp ?? cohortsLocal;
  const loading = loadingProp ?? loadingLocal;
  const loadErr = loadErrProp ?? loadErrLocal;

  const seriesGroups = useMemo(() => matrixPresetsBySeries(), []);
  const allMatrixPresets = useMemo(() => seriesGroups.flatMap((g) => g.presets), [seriesGroups]);

  const primaryPctForPreset = useMemo(() => {
    return (preset: StrategyPreset): number | null => {
      const saved = cohortForPreset(cohorts, preset);
      if (!saved) return null;
      const mc = firmMcForTab(saved, firmTab);
      return matrixPrimaryMcPct(preset.phase, mc);
    };
  }, [cohorts, firmTab]);

  const visibleSeriesGroups = useMemo(() => {
    const matchesFilters = (preset: StrategyPreset) => {
      if (phaseFilter !== "all" && preset.phase !== phaseFilter) return false;
      const saved = Boolean(cohortForPreset(cohorts, preset));
      if (statusFilter === "saved" && !saved) return false;
      if (statusFilter === "pending" && saved) return false;
      return true;
    };

    return seriesGroups
      .filter((g) => seriesFilter === "all" || g.seriesId === seriesFilter)
      .map((g) => ({
        ...g,
        presets: g.presets.filter(matchesFilters),
      }))
      .filter((g) => g.presets.length > 0);
  }, [seriesGroups, seriesFilter, phaseFilter, statusFilter, cohorts]);

  const jumpPresets = useMemo(
    () => visibleSeriesGroups.flatMap((g) => g.presets),
    [visibleSeriesGroups]
  );

  const totalSaved = useMemo(
    () => allMatrixPresets.filter((p) => cohortForPreset(cohorts, p)).length,
    [allMatrixPresets, cohorts]
  );

  const activeRule = ruleById(firmTab);

  const firmCalibration = useMemo(() => {
    const preset = allMatrixPresets.find((p) => p.id === activePresetId);
    const compareMode = mcCompareModeForPhase(preset?.phase);
    return buildMcParamsForFirm({
      ruleId: firmTab,
      compareMode,
      trades: [],
      dates: [],
      sims: 1,
      maxTrades: 1,
      payoutBuffer: 2000,
    });
  }, [firmTab, activePresetId, allMatrixPresets]);

  const activeCohortEngineVersion = useMemo(() => {
    const preset = allMatrixPresets.find((p) => p.id === activePresetId);
    if (!preset) return undefined;
    return cohortForPreset(cohorts, preset)?.mcEngineVersion;
  }, [activePresetId, allMatrixPresets, cohorts]);

  const bestForFirm = useMemo(() => {
    let best: { presetId: string; passPct: number } | null = null;
    for (const preset of jumpPresets) {
      const pct = primaryPctForPreset(preset);
      if (pct == null) continue;
      if (!best || pct > best.passPct) {
        best = { presetId: preset.id, passPct: pct };
      }
    }
    return best;
  }, [jumpPresets, primaryPctForPreset]);

  const seriesShouldOpen = (seriesId: string, presets: StrategyPreset[]) => {
    if (seriesFilter !== "all" && seriesFilter === seriesId) return true;
    if (activePresetId && presets.some((p) => p.id === activePresetId)) return true;
    return seriesId === "premium365";
  };

  const subgroupShouldOpen = (presets: StrategyPreset[]) => {
    if (presets.length <= 3) return true;
    if (activePresetId && presets.some((p) => p.id === activePresetId)) return true;
    return presets.some((p) => cohortForPreset(cohorts, p));
  };

  const renderTable = (section: StrategyPreset[]) => {
    const sectionFunded = section.some((p) => p.phase === "funded");
    const sectionEval = section.some((p) => p.phase !== "funded");
    const primaryHeader =
      sectionFunded && sectionEval
        ? "Pass/Payout %"
        : sectionFunded
          ? "Payout %"
          : "Pass %";
    const weeksHeader =
      sectionFunded && !sectionEval ? "Wk→payout" : sectionFunded && sectionEval ? "Wk" : "Wk→pass";

    return (
      <table>
        <thead>
          <tr>
            <th>Branch</th>
            <th>Phase</th>
            <th>Strategy</th>
            <th className="num">Trades</th>
            <th className="num">Net</th>
            <th className="num">{primaryHeader}</th>
            <th className="num">Bust %</th>
            {sectionFunded && <th className="num">Recycle %</th>}
            <th className="num">{weeksHeader}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {section.map((preset) => {
            const saved = cohortForPreset(cohorts, preset);
            const mc = saved ? firmMcForTab(saved, firmTab) : null;
            const primaryPct = matrixPrimaryMcPct(preset.phase, mc);
            const weeks = matrixWeeksMc(preset.phase, mc);
            const isFundedRow = mcCompareModeForPhase(preset.phase) === "funded";
            const active = preset.id === activePresetId;
            const isBest = bestForFirm?.presetId === preset.id && primaryPct != null;
            return (
              <tr
                key={preset.id}
                style={{
                  cursor: "pointer",
                  outline: active ? "1px solid var(--matrix-dim)" : undefined,
                  background: isBest ? "rgba(0, 200, 120, 0.06)" : undefined,
                }}
                onClick={() => onSelectPreset(preset.id)}
                title={preset.uploadHint ?? preset.config}
              >
                <td className="accent cyan">
                  {preset.matrixBranch}
                  {isBest && <span className="pos" style={{ fontSize: 9, marginLeft: 4 }}>★</span>}
                </td>
                <td className="small dim">{preset.phase}</td>
                <td className="small">
                  {preset.label.split(" · ").slice(1).join(" · ") || preset.label}
                  <span className="dim" style={{ marginLeft: 6, fontSize: 10 }}>
                    {sourceLabel(preset)}
                  </span>
                </td>
                <td className="num">{saved ? saved.trades : "—"}</td>
                <td className={"num " + (saved && saved.netPnl >= 0 ? "pos" : saved ? "neg" : "")}>
                  {saved ? fmtUsd(saved.netPnl, true) : "—"}
                </td>
                <td className={"num " + (primaryPct != null ? passClass(primaryPct) : "")}>
                  {primaryPct != null ? `${primaryPct}%` : "—"}
                </td>
                <td className="num neg">{mc ? `${mc.bustPct}%` : "—"}</td>
                {sectionFunded && (
                  <td className="num">
                    {isFundedRow && mc?.recyclePct != null ? `${mc.recyclePct}%` : isFundedRow ? "—" : ""}
                  </td>
                )}
                <td className="num">{weeks != null ? fmtWeeks(weeks) : "—"}</td>
                <td className={"small " + (saved ? "pos" : "warn")}>{saved ? "saved" : "not run"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="matrix-results">
      <div className="frm-row" style={{ alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div className="small">
          <span className="accent">Matrix progress</span>
          <span className="dim">
            {" "}
            — {totalSaved}/{allMatrixPresets.length} saved · {visibleSeriesGroups.length} group
            {visibleSeriesGroups.length === 1 ? "" : "s"} shown
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {MATRIX_FIRM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={"chip" + (firmTab === tab.id ? " active-acct" : "")}
              style={{ cursor: "pointer", fontSize: 11 }}
              onClick={() => setFirmTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn ghost" style={{ fontSize: 11 }} onClick={loadCohorts}>
          Refresh
        </button>
        {loading && <span className="small dim">Loading…</span>}
      </div>

      <div className="matrix-results-toolbar">
        <div className="filter-field wide">
          <label htmlFor="matrix-series-filter">Test group</label>
          <select
            id="matrix-series-filter"
            value={seriesFilter}
            onChange={(e) => setSeriesFilter(e.target.value)}
          >
            <option value="all">All test groups</option>
            {seriesGroups.map((g) => (
              <option key={g.seriesId} value={g.seriesId}>
                {seriesLabel(g.seriesId)} ({g.presets.length})
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="matrix-phase-filter">Phase</label>
          <select
            id="matrix-phase-filter"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as PhaseFilter)}
          >
            <option value="all">All phases</option>
            <option value="eval">Evaluation</option>
            <option value="funded">Funded / PRO</option>
            <option value="combined">Combined</option>
            <option value="research">Research</option>
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="matrix-status-filter">Status</label>
          <select
            id="matrix-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All rows</option>
            <option value="saved">Saved only</option>
            <option value="pending">Not run yet</option>
          </select>
        </div>
        <div className="filter-field wide">
          <label htmlFor="matrix-jump-preset">Jump to test</label>
          <select
            id="matrix-jump-preset"
            value={activePresetId && jumpPresets.some((p) => p.id === activePresetId) ? activePresetId : ""}
            onChange={(e) => {
              if (e.target.value) onSelectPreset(e.target.value);
            }}
          >
            <option value="">Select a branch…</option>
            {visibleSeriesGroups.map((g) => (
              <optgroup key={g.seriesId} label={seriesLabel(g.seriesId)}>
                {g.presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {presetJumpLabel(p)}
                    {cohortForPreset(cohorts, p) ? " ✓" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {activeRule && (
        <>
          <McCalibrationBanner
            rulePack={firmCalibration?.rulePack}
            simMode={
              mcCompareModeForPhase(
                allMatrixPresets.find((p) => p.id === activePresetId)?.phase
              ) === "funded"
                ? "funded_only"
                : "eval_path"
            }
            hasPayoutEconomics
            cohortEngineVersion={activeCohortEngineVersion}
            compact
          />
          <p className="small dim" style={{ marginTop: 0, marginBottom: 10, lineHeight: 1.55 }}>
          Table uses <span className="accent">{activeRule.name}</span> ({firmCompareLabel(firmTab)}) — eval rows show pass %, funded rows show payout %
          (PRO survival + recycle). Expand a test group, click a row for the firm chart below.
          </p>
        </>
      )}

      {loadErr && <p className="small neg">Could not load cohorts: {loadErr}</p>}
      {!loading && cohorts.length === 0 && !loadErr && (
        <p className="small warn">No cohorts yet — run MC in Lab with auto-save.</p>
      )}

      {visibleSeriesGroups.length === 0 && !loading && (
        <div className="matrix-results-empty">
          No tests match these filters. Try <span className="accent">All test groups</span> or{" "}
          <span className="accent">All rows</span>.
        </div>
      )}

      {visibleSeriesGroups.map((g) => {
        const progress = seriesProgress(g.presets, cohorts, primaryPctForPreset);
        const subgroups = matrixPresetsBySubgroup(g.seriesId, g.presets);
        const desc = seriesDescription(g.seriesId);
        const badgeParts = [`${progress.saved}/${progress.total} saved`];
        if (progress.bestPassPct != null) badgeParts.push(`best ${progress.bestPassPct}%`);

        return (
          <details
            key={g.seriesId}
            className="panel matrix-series"
            open={seriesShouldOpen(g.seriesId, g.presets) || undefined}
          >
            <summary className="panel-title">
              {seriesLabel(g.seriesId)}
              {desc && <span className="sub">{desc}</span>}
              <span className="summary-badge">{badgeParts.join(" · ")}</span>
            </summary>
            <div className="panel-body" style={{ paddingTop: 8 }}>
              {subgroups.map((sub) => {
                const subProgress = seriesProgress(sub.presets, cohorts, primaryPctForPreset);
                const showNested = subgroups.length > 1;
                const subBadge =
                  subProgress.saved > 0
                    ? `${subProgress.saved}/${subProgress.total} saved`
                    : `${subProgress.total} branches`;

                if (!showNested) {
                  return <div key={sub.id}>{renderTable(sub.presets)}</div>;
                }

                return (
                  <details
                    key={sub.id}
                    className="panel matrix-subgroup"
                    open={subgroupShouldOpen(sub.presets) || undefined}
                  >
                    <summary className="panel-title">
                      {sub.label}
                      <span className="summary-badge">{subBadge}</span>
                    </summary>
                    <div className="panel-body">{renderTable(sub.presets)}</div>
                  </details>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
