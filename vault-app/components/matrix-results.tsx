"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtUsd } from "@/lib/store";
import type { CohortRecord } from "@/lib/cohort";
import {
  firmMcForTab,
  type MatrixCompareFirmId,
} from "@/lib/firm-matrix-compare";
import { cohortForPreset } from "@/lib/matrix-cohort";
import { matrixPresets, type StrategyPreset } from "@/lib/lab-profile";
import { ruleById } from "@/lib/prop-firms";

function premiumMatrixPresets(): StrategyPreset[] {
  return matrixPresets().filter((p) => p.matrixTrack !== "experimental");
}

const FIRM_TABS: { id: MatrixCompareFirmId; label: string }[] = [
  { id: "tpt50", label: "TPT $50K" },
  { id: "alpha-zero-50", label: "Alpha Zero" },
  { id: "alpha-premium-50", label: "Alpha Premium" },
  { id: "apex50-eod", label: "Apex EOD" },
];

export interface MatrixResultsProps {
  activePresetId?: string;
  onSelectPreset: (presetId: string) => void;
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
  if (p.matrixTrack === "experimental") return "new";
  return "TV";
}

function fmtWeeks(w: number | null | undefined): string {
  if (w == null || !Number.isFinite(w)) return "—";
  return `${w}w`;
}

export function MatrixResults({
  activePresetId,
  onSelectPreset,
  refreshKey = 0,
  cohorts: cohortsProp,
  loading: loadingProp,
  loadErr: loadErrProp,
  onRefresh,
}: MatrixResultsProps) {
  const [cohortsLocal, setCohortsLocal] = useState<CohortRecord[]>([]);
  const [loadErrLocal, setLoadErrLocal] = useState("");
  const [loadingLocal, setLoadingLocal] = useState(!cohortsProp);
  const [firmTab, setFirmTab] = useState<MatrixCompareFirmId>("tpt50");
  const [pollKey, setPollKey] = useState(0);

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

  const rows = useMemo(() => matrixPresets(), []);
  const premiumRows = useMemo(() => premiumMatrixPresets(), []);
  const filled = useMemo(
    () => premiumRows.filter((p) => cohortForPreset(cohorts, p)).length,
    [premiumRows, cohorts]
  );

  const premium = premiumRows;
  const experimental = rows.filter((p) => p.matrixTrack === "experimental");
  const activeRule = ruleById(firmTab);

  const bestForFirm = useMemo(() => {
    let best: { presetId: string; passPct: number } | null = null;
    for (const preset of premiumRows) {
      const saved = cohortForPreset(cohorts, preset);
      if (!saved) continue;
      const mc = firmMcForTab(saved, firmTab);
      if (!mc) continue;
      if (!best || mc.passPct > best.passPct) {
        best = { presetId: preset.id, passPct: mc.passPct };
      }
    }
    return best;
  }, [premiumRows, cohorts, firmTab]);

  const renderTable = (section: StrategyPreset[], title: string) => (
    <>
      <div className="small dim" style={{ margin: "12px 0 6px", letterSpacing: 0.5 }}>
        {title}
      </div>
      <table>
        <thead>
          <tr>
            <th>Branch</th>
            <th>Phase</th>
            <th>Strategy</th>
            <th className="num">Trades</th>
            <th className="num">Net</th>
            <th className="num">Pass %</th>
            <th className="num">Bust %</th>
            <th className="num">Wk→pass</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {section.map((preset) => {
            const saved = cohortForPreset(cohorts, preset);
            const mc = saved ? firmMcForTab(saved, firmTab) : null;
            const active = preset.id === activePresetId;
            const isBest = bestForFirm?.presetId === preset.id && mc != null;
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
                <td className={"num " + (mc ? passClass(mc.passPct) : "")}>
                  {mc ? `${mc.passPct}%` : "—"}
                </td>
                <td className="num neg">{mc ? `${mc.bustPct}%` : "—"}</td>
                <td className="num">{mc ? fmtWeeks(mc.weeksToPassP50) : "—"}</td>
                <td className={"small " + (saved ? "pos" : "warn")}>{saved ? "saved" : "not run"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="matrix-results">
      <div className="frm-row" style={{ alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div className="small">
          <span className="accent">Matrix progress</span>
          <span className="dim"> — {filled}/{premiumRows.length} premium · click row for firm chart below</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {FIRM_TABS.map((tab) => (
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

      {activeRule && (
        <p className="small dim" style={{ marginTop: 0, marginBottom: 10, lineHeight: 1.55 }}>
          Table sorted by <span className="accent">{activeRule.name}</span> — full multi-firm chart loads in the panel below
          the selected row.
        </p>
      )}

      {loadErr && <p className="small neg">Could not load cohorts: {loadErr}</p>}
      {!loading && cohorts.length === 0 && !loadErr && (
        <p className="small warn">No cohorts yet — run MC in Lab with auto-save.</p>
      )}

      {renderTable(premium, "Premium 365d")}
      {experimental.length > 0 && renderTable(experimental, "Experimental / future strategies")}
    </div>
  );
}
