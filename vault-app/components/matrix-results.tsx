"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtUsd } from "@/lib/store";
import type { CohortRecord } from "@/lib/cohort";
import { matrixPresets, type StrategyPreset } from "@/lib/lab-profile";

export interface MatrixResultsProps {
  activePresetId?: string;
  onSelectPreset: (presetId: string) => void;
  refreshKey?: number;
}

function passClass(pct: number): string {
  if (pct >= 50) return "pos";
  if (pct >= 35) return "warn";
  return "neg";
}

function cohortForPreset(cohorts: CohortRecord[], preset: StrategyPreset): CohortRecord | undefined {
  const byPreset = cohorts.filter((c) => c.strategyPreset === preset.id);
  if (byPreset.length) return byPreset.sort((a, b) => b.created.localeCompare(a.created))[0];
  const branch = preset.matrixBranch?.toLowerCase();
  if (!branch) return undefined;
  return cohorts
    .filter((c) => c.variant.toLowerCase().includes(branch) || c.datasetName.toLowerCase().includes(branch))
    .sort((a, b) => b.created.localeCompare(a.created))[0];
}

function sourceLabel(p: StrategyPreset): string {
  if (p.dataSource === "derived-b0") return "derived";
  if (p.matrixTrack === "experimental") return "new";
  return "TV";
}

export function MatrixResults({ activePresetId, onSelectPreset, refreshKey = 0 }: MatrixResultsProps) {
  const [cohorts, setCohorts] = useState<CohortRecord[]>([]);
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/cohorts")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setCohorts(data.cohorts ?? []);
          setLoadErr(data.error ?? "");
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadErr(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const rows = useMemo(() => matrixPresets(), []);
  const filled = useMemo(
    () => rows.filter((p) => cohortForPreset(cohorts, p)).length,
    [rows, cohorts]
  );

  const premium = rows.filter((p) => p.matrixTrack !== "experimental");
  const experimental = rows.filter((p) => p.matrixTrack === "experimental");

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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {section.map((preset) => {
            const saved = cohortForPreset(cohorts, preset);
            const active = preset.id === activePresetId;
            return (
              <tr
                key={preset.id}
                style={{
                  cursor: "pointer",
                  outline: active ? "1px solid var(--matrix-dim)" : undefined,
                }}
                onClick={() => onSelectPreset(preset.id)}
                title={preset.uploadHint ?? preset.config}
              >
                <td className="accent cyan">{preset.matrixBranch}</td>
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
                <td className={"num " + (saved ? passClass(saved.mcPassPct) : "")}>
                  {saved ? `${saved.mcPassPct}%` : "—"}
                </td>
                <td className="num neg">{saved ? `${saved.mcBustPct}%` : "—"}</td>
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
      <div className="frm-row" style={{ alignItems: "center", marginBottom: 8 }}>
        <div className="small">
          <span className="accent">Matrix progress</span>
          <span className="dim"> — {filled}/{rows.length} saved · click row to load study below</span>
        </div>
        {loading && <span className="small dim">Loading…</span>}
      </div>
      {loadErr && <p className="small neg">{loadErr}</p>}
      {renderTable(premium, "Premium 365d")}
      {experimental.length > 0 && renderTable(experimental, "Experimental / future strategies")}
      <p className="small dim" style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.55 }}>
        Add new strategies in <code className="inline">EXPERIMENTAL_STRATEGY_PRESETS</code> — they appear here automatically.
        Cohorts sync to Obsidian via <code className="inline">strategies/cohorts/</code> when GitHub save is configured.
      </p>
    </div>
  );
}
