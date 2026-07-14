"use client";

import Link from "next/link";
import { useMemo } from "react";
import { matrixPresetsBySeries, type StrategyPreset } from "@/lib/lab-profile";
import { seriesLabel } from "@/lib/experiment-series";
import { matrixPresetsBySubgroup, seriesDescription } from "@/lib/matrix-results-groups";
import { replayRecipeForPreset } from "@/lib/matrix-replay";

export interface MatrixReplayPanelProps {
  activePresetId: string;
  onSelectPreset: (id: string) => void;
}

function presetChipLabel(p: StrategyPreset): string {
  return p.matrixBranch ?? p.id;
}

export function MatrixReplayPanel({ activePresetId, onSelectPreset }: MatrixReplayPanelProps) {
  const seriesGroups = useMemo(() => matrixPresetsBySeries(), []);
  const recipe = useMemo(() => replayRecipeForPreset(activePresetId), [activePresetId]);

  const renderChips = (section: StrategyPreset[]) => (
    <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
      {section.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`chip ${activePresetId === p.id ? "locked" : ""}`}
          onClick={() => onSelectPreset(p.id)}
          title={p.label}
        >
          {presetChipLabel(p)}
          {p.dataSource === "derived-b0"
            ? " · derived"
            : p.dataSource === "prebuilt-ledger"
              ? " · ledger"
              : ""}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {seriesGroups.map((g) => {
        const subgroups = matrixPresetsBySubgroup(g.seriesId, g.presets);
        const desc = seriesDescription(g.seriesId);
        const open =
          g.presets.some((p) => p.id === activePresetId) || g.seriesId === "premium365";

        return (
          <details key={g.seriesId} className="panel matrix-series" open={open || undefined}>
            <summary className="panel-title">
              {seriesLabel(g.seriesId)}
              {desc && <span className="sub">replay</span>}
              <span className="summary-badge">{g.presets.length} branches</span>
            </summary>
            <div className="panel-body" style={{ paddingTop: 8 }}>
              {subgroups.map((sub) => {
                if (subgroups.length === 1) {
                  return <div key={sub.id}>{renderChips(sub.presets)}</div>;
                }
                const subOpen = sub.presets.some((p) => p.id === activePresetId);
                return (
                  <details
                    key={sub.id}
                    className="panel matrix-subgroup"
                    open={subOpen || undefined}
                    style={{ marginBottom: 8 }}
                  >
                    <summary className="panel-title">
                      {sub.label}
                      <span className="summary-badge">{sub.presets.length}</span>
                    </summary>
                    <div className="panel-body">{renderChips(sub.presets)}</div>
                  </details>
                );
              })}
            </div>
          </details>
        );
      })}

      {recipe && (
        <div className="panel" style={{ borderColor: "var(--accent)", marginTop: 8 }}>
          <div className="panel-title">
            {recipe.preset.label}
            <span className="sub">replay recipe</span>
          </div>
          <div className="panel-body">
            <table className="kv-table">
              <tbody>
                <tr>
                  <td className="dim">Pine</td>
                  <td>
                    <code className="inline">{recipe.pineFile}</code>
                  </td>
                </tr>
                <tr>
                  <td className="dim">TV export?</td>
                  <td>
                    {recipe.needsTvExport
                      ? "Yes — one CSV per row"
                      : recipe.derivedFromB0
                        ? "No — derived from B0 in Lab"
                        : "No — prebuilt vault ledger"}
                  </td>
                </tr>
                <tr>
                  <td className="dim">Phase</td>
                  <td>
                    {recipe.preset.phase} · {recipe.preset.family}
                  </td>
                </tr>
              </tbody>
            </table>

            <ol className="small" style={{ margin: "12px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
              {recipe.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            {recipe.tvSyncLines.length > 0 && (
              <table className="mt">
                <thead>
                  <tr>
                    <th>Pine input</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.tvSyncLines.map((line) => {
                    const parts = line.split(": ");
                    return (
                      <tr key={line}>
                        <td className="small">{parts[0]}</td>
                        <td className="small accent">{parts.slice(1).join(": ")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={recipe.labUrl} className="btn">
                Open in F4 Lab
              </Link>
              <span className="small dim" style={{ alignSelf: "center" }}>
                {recipe.preset.uploadHint}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
