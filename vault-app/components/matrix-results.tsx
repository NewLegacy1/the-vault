"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fmtUsd } from "@/lib/store";
import type { CohortRecord } from "@/lib/cohort";
import {
  firmMcForTab,
  type MatrixCompareFirmId,
} from "@/lib/firm-matrix-compare";
import { matrixPresets, type StrategyPreset } from "@/lib/lab-profile";
import { replayRecipeForPreset } from "@/lib/matrix-replay";
import { ruleById } from "@/lib/prop-firms";

/** Premium matrix rows only (excludes experimental) for progress denominator. */
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
    .filter((c) => {
      const v = c.variant.toLowerCase();
      const d = c.datasetName.toLowerCase();
      return v.includes(branch) || d.includes(` · ${branch}`) || d.endsWith(branch);
    })
    .sort((a, b) => b.created.localeCompare(a.created))[0];
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

export function MatrixResults({ activePresetId, onSelectPreset, refreshKey = 0 }: MatrixResultsProps) {
  const [cohorts, setCohorts] = useState<CohortRecord[]>([]);
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [firmTab, setFirmTab] = useState<MatrixCompareFirmId>("tpt50");
  const [pollKey, setPollKey] = useState(0);

  const loadCohorts = () => {
    setLoading(true);
    fetch("/api/cohorts", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        return data as { cohorts?: CohortRecord[]; source?: string };
      })
      .then((data) => {
        setCohorts(data.cohorts ?? []);
        setLoadErr("");
      })
      .catch((e) => setLoadErr(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCohorts();
  }, [refreshKey, pollKey]);

  useEffect(() => {
    const id = window.setInterval(() => setPollKey((k) => k + 1), 45000);
    return () => window.clearInterval(id);
  }, []);

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

  const detailPreset = activePresetId ? presetByIdFromRows(activePresetId, rows) : undefined;
  const detailCohort = detailPreset ? cohortForPreset(cohorts, detailPreset) : undefined;
  const detailMc = detailCohort ? firmMcForTab(detailCohort, firmTab) : null;
  const detailRecipe = activePresetId ? replayRecipeForPreset(activePresetId) : null;

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
            <th>Firm rules</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {section.map((preset) => {
            const saved = cohortForPreset(cohorts, preset);
            const mc = saved ? firmMcForTab(saved, firmTab) : null;
            const active = preset.id === activePresetId;
            const isBest = bestForFirm?.presetId === preset.id && mc != null;
            const ruleHint = activeRule
              ? `Pass ${fmtUsd(activeRule.passAt)} · DD ${fmtUsd(activeRule.trailingDD)}${
                  activeRule.consistencyPct > 0 ? ` · ${activeRule.consistencyPct}% cons` : ""
                }`
              : "";
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
                  {mc ? `${mc.passPct}%` : saved ? "—" : "—"}
                </td>
                <td className="num neg">{mc ? `${mc.bustPct}%` : saved ? "—" : "—"}</td>
                <td className="num">{mc ? fmtWeeks(mc.weeksToPassP50) : "—"}</td>
                <td className="small dim" style={{ maxWidth: 140, lineHeight: 1.35 }}>
                  {mc ? ruleHint : saved ? "Re-run in Lab for this firm" : "—"}
                </td>
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
          <span className="dim"> — {filled}/{premiumRows.length} premium saved</span>
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
          <span className="accent">{activeRule.name}</span> — pass {fmtUsd(activeRule.passAt)}
          {activeRule.passAtNote ? ` (${activeRule.profitTarget ? `target $${activeRule.profitTarget}` : "see rules"})` : ""}
          · trailing DD {fmtUsd(activeRule.trailingDD)} ({activeRule.ddMode ?? "eod"})
          {activeRule.consistencyPct > 0 ? ` · ${activeRule.consistencyPct}% consistency + ${activeRule.minDays} min days` : ""}
          {activeRule.dailyLossLimit ? ` · daily loss ${fmtUsd(activeRule.dailyLossLimit)}` : ""}
          . New Lab saves include all firm tabs; older cohorts show TPT only until re-run.
        </p>
      )}

      {bestForFirm && (
        <p className="small" style={{ marginTop: 0, marginBottom: 10 }}>
          <span className="accent">Best for {FIRM_TABS.find((t) => t.id === firmTab)?.label}</span>
          <span className="dim"> — </span>
          {bestForFirm.passPct}% pass
          <span className="dim"> (★ in table)</span>
        </p>
      )}

      {loadErr && (
        <p className="small neg">
          Could not load cohorts: {loadErr}
        </p>
      )}
      {!loading && cohorts.length === 0 && !loadErr && (
        <p className="small warn">No cohorts yet — run MC in Lab with auto-save.</p>
      )}

      {renderTable(premium, "Premium 365d")}
      {experimental.length > 0 && renderTable(experimental, "Experimental / future strategies")}

      {detailPreset && detailRecipe && (
        <div className="panel" style={{ marginTop: 14, borderColor: "var(--matrix-dim)" }}>
          <div className="panel-title">
            {detailPreset.matrixBranch} detail
            <span className="sub">{FIRM_TABS.find((t) => t.id === firmTab)?.label}</span>
          </div>
          <div className="panel-body small" style={{ lineHeight: 1.6 }}>
            {detailMc ? (
              <p style={{ marginTop: 0 }}>
                Pass <span className={passClass(detailMc.passPct)}>{detailMc.passPct}%</span>
                · bust {detailMc.bustPct}%
                · median {fmtWeeks(detailMc.weeksToPassP50)} to pass
                {detailMc.weeksToPayoutP50 != null && (
                  <> · {fmtWeeks(detailMc.weeksToPayoutP50)} to payout buffer</>
                )}
              </p>
            ) : (
              <p className="warn" style={{ marginTop: 0 }}>
                No MC for this firm — open Lab, pick {FIRM_TABS.find((t) => t.id === firmTab)?.label} as firm preset, RUN once.
              </p>
            )}
            <div className="accent" style={{ marginBottom: 6 }}>TV replay</div>
            <ol style={{ marginTop: 0, paddingLeft: 18 }}>
              {detailRecipe.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {detailRecipe.tvSyncLines.length > 0 && (
              <>
                <div className="accent" style={{ marginTop: 8 }}>Pine overrides</div>
                <ul style={{ marginTop: 4, paddingLeft: 18 }}>
                  {detailRecipe.tvSyncLines.map((l) => (
                    <li key={l}><code className="inline">{l}</code></li>
                  ))}
                </ul>
              </>
            )}
            <p style={{ marginBottom: 0 }}>
              <Link href={detailRecipe.labUrl} className="accent">
                Open in F4 Lab →
              </Link>
              {" · "}
              <Link href="/strategies" className="accent">
                F3 full recipes
              </Link>
            </p>
          </div>
        </div>
      )}

      <p className="small dim" style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.55 }}>
        Results load live from GitHub — no redeploy needed after each save. Cohorts live in{" "}
        <code className="inline">strategies/cohorts/</code>.
      </p>
    </div>
  );
}

function presetByIdFromRows(id: string, rows: StrategyPreset[]): StrategyPreset | undefined {
  return rows.find((p) => p.id === id);
}
