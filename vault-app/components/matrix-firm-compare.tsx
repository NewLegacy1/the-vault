"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FirmRulesCard } from "@/components/firm-rules-card";
import { fmtUsd, useLocal } from "@/lib/store";
import type { CohortRecord } from "@/lib/cohort";
import {
  compareFirmsForTrades,
  firmMcForTab,
  MATRIX_COMPARE_FIRM_IDS,
  mcCompareModeForPhase,
  type FirmMcSnapshot,
  type MatrixCompareFirmId,
} from "@/lib/firm-matrix-compare";
import { presetById } from "@/lib/lab-profile";
import type { PresetLedgerStore } from "@/lib/lab-ledger";
import { resolveMatrixTrades } from "@/lib/resolve-matrix-trades";
import { ruleById } from "@/lib/prop-firms";

const FIRM_LABELS: Record<MatrixCompareFirmId, string> = {
  tpt50: "TPT $50K",
  "alpha-zero-50": "Alpha Zero",
  "alpha-premium-50": "Alpha Premium",
  "apex50-eod": "Apex EOD",
};

function passClass(pct: number): string {
  if (pct >= 50) return "pos";
  if (pct >= 35) return "warn";
  return "neg";
}

function snapshotPrimaryPct(r: FirmMcSnapshot): number {
  return r.mcMode === "funded" ? r.payoutPct : r.passPct;
}

function FirmPassChart({ rows, fundedMode }: { rows: FirmMcSnapshot[]; fundedMode: boolean }) {
  if (rows.length === 0) return null;
  const W = 520;
  const H = 28 + rows.length * 48;
  const max = Math.max(...rows.map((r) => snapshotPrimaryPct(r)), 1);
  const chartTitle = fundedMode
    ? "PAYOUT RATE BY FIRM — FUNDED / PRO RULES"
    : "PASS RATE BY FIRM — EVAL RULES";

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ background: "#000", border: "1px solid var(--border)", maxWidth: 560 }}
    >
      <text x={W / 2} y={16} fill="#9a9a9a" fontSize={10} textAnchor="middle" fontFamily="monospace" letterSpacing={1}>
        {chartTitle}
      </text>
      {rows.map((r, i) => {
        const y = 28 + i * 48;
        const primary = snapshotPrimaryPct(r);
        const bw = (primary / max) * (W - 200);
        return (
          <g key={r.ruleId}>
            <text x={8} y={y + 22} fill="#7ec8e3" fontSize={11} fontFamily="monospace">
              {FIRM_LABELS[r.ruleId as MatrixCompareFirmId] ?? r.firmName}
            </text>
            <rect x={130} y={y + 8} width={Math.max(bw, 2)} height={22} fill="#3ecf8e" opacity={0.72} />
            <text x={W - 8} y={y + 22} fill="#e8e8e8" fontSize={11} textAnchor="end" fontFamily="monospace">
              {primary}%
              {fundedMode && r.recyclePct != null ? ` · recycle ${r.recyclePct}%` : ""}
              {" · bust "}
              {r.bustPct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export interface MatrixFirmCompareProps {
  presetId: string;
  cohort?: CohortRecord;
  /** Pre-computed from Lab RUN — avoids duplicate MC work. */
  initialSnapshots?: FirmMcSnapshot[];
  sims?: number;
  maxTrades?: number;
  payoutBuffer?: number;
  /** Lab embed: hide empty-state prompts. */
  embeddedInLab?: boolean;
}

export function MatrixFirmCompare({
  presetId,
  cohort,
  initialSnapshots,
  sims: simsProp,
  maxTrades: maxTradesProp,
  payoutBuffer: payoutBufferProp,
  embeddedInLab = false,
}: MatrixFirmCompareProps) {
  const [ledgers] = useLocal<PresetLedgerStore>("vault.lab.ledgers", {});
  const [selectedFirm, setSelectedFirm] = useState<MatrixCompareFirmId>("tpt50");
  const [computed, setComputed] = useState<FirmMcSnapshot[] | null>(null);
  const [computeSource, setComputeSource] = useState<"ledger" | "cohort" | "saved" | "none">("none");
  const [computing, setComputing] = useState(false);

  const preset = presetById(presetId);
  const compareMode = mcCompareModeForPhase(preset?.phase ?? cohort?.phase);
  const fundedMode = compareMode === "funded";
  const resolved = useMemo(
    () => resolveMatrixTrades(presetId, ledgers, cohort),
    [presetId, ledgers, cohort]
  );

  const sims = simsProp ?? cohort?.mcSims ?? 2000;
  const maxTrades = maxTradesProp ?? cohort?.mcMaxTrades ?? 80;
  const payoutBuffer = payoutBufferProp ?? cohort?.payoutBuffer ?? 2000;

  useEffect(() => {
    if (!presetId) return;
    if (initialSnapshots?.length) {
      setComputed(initialSnapshots);
      setComputeSource("ledger");
      setComputing(false);
      return;
    }
    if (resolved?.trades.length) {
      setComputing(true);
      const snaps = compareFirmsForTrades({
        trades: resolved.trades,
        dates: resolved.dates,
        sims,
        maxTrades,
        payoutBuffer,
        strategyPhase: preset?.phase,
        compareMode,
      });
      setComputed(snaps);
      setComputeSource(resolved.source);
      setComputing(false);
      return;
    }

    if (cohort?.firmMc && Object.keys(cohort.firmMc).length > 0) {
      const snaps = compareFirmsFromCohortOnly(cohort);
      setComputed(snaps.length ? snaps : null);
      setComputeSource("saved");
      return;
    }

    if (cohort) {
      const snaps = compareFirmsFromCohortOnly(cohort);
      setComputed(snaps.length ? snaps : null);
      setComputeSource("saved");
      return;
    }

    setComputed(null);
    setComputeSource("none");
  }, [presetId, resolved, cohort, sims, maxTrades, payoutBuffer, initialSnapshots, preset?.phase, compareMode]);

  const rows = computed ?? [];
  const best = rows.length
    ? rows.reduce((a, b) => (snapshotPrimaryPct(b) > snapshotPrimaryPct(a) ? b : a))
    : null;
  const activeRule = ruleById(selectedFirm);
  const activeSnap = rows.find((r) => r.ruleId === selectedFirm);

  if (!preset) return null;

  return (
    <div className="matrix-firm-compare">
      <div className="panel" style={{ borderColor: "var(--accent)" }}>
        <div className="panel-title">
          Firm comparison
          <span className="sub">
            {preset.matrixBranch} · {preset.label.split(" · ").slice(1).join(" · ") || preset.label}
            {fundedMode ? " · funded PRO + recycle" : " · eval pass path"}
          </span>
        </div>
        <div className="panel-body">
          {computing && <p className="small dim">Running Monte Carlo across firms…</p>}

          {!computing && !embeddedInLab && computeSource === "none" && !cohort && (
            <p className="small warn">
              Select a matrix row above, or run this branch in{" "}
              <Link href={`/lab?preset=${presetId}`} className="accent">
                F4 Lab
              </Link>
              .
            </p>
          )}

          {!computing && !embeddedInLab && computeSource === "none" && cohort && (
            <p className="small warn">
              Trade data not stored for this cohort yet. Open Lab with your CSV still in browser (auto-computes), or
              re-RUN once to save trades + all firms permanently.
              <Link href={`/lab?preset=${presetId}`} className="accent" style={{ marginLeft: 6 }}>
                Open Lab →
              </Link>
            </p>
          )}

          {computeSource !== "none" && (
            <p className="small dim" style={{ marginTop: 0, lineHeight: 1.55 }}>
              {embeddedInLab && (
                <>
                  <span className="accent">All firms</span> from one RUN — same trades, each prop&apos;s rules.
                  {fundedMode
                    ? " Funded presets use PRO survival, payout buffer, and TPT recycle-before-PRO+."
                    : " Eval presets use pass line / DD / consistency."}{" "}
                  Fan chart below uses TPT as reference. Full matrix on{" "}
                  <Link href="/results" className="accent">
                    F8 Results
                  </Link>
                  .
                </>
              )}
              {!embeddedInLab && computeSource === "ledger" && (
                <>
                  <span className="accent">Auto-computed</span> from your Lab CSV in this browser — same trades, each
                  firm&apos;s pass/DD/consistency rules. No re-run needed.
                </>
              )}
              {!embeddedInLab && computeSource === "cohort" && (
                <>
                  <span className="accent">Auto-computed</span> from saved trade series in the cohort note — all firms
                  from one MC run.
                </>
              )}
              {!embeddedInLab && computeSource === "saved" && resolved == null && (
                <>
                  Showing saved firm snapshots. Re-RUN in Lab once to store trades and refresh all tabs automatically.
                </>
              )}
              {best && (
                <>
                  {" "}
                  Best {fundedMode ? "payout" : "pass"}:{" "}
                  <span className="pos">{snapshotPrimaryPct(best)}%</span> on{" "}
                  {FIRM_LABELS[best.ruleId as MatrixCompareFirmId] ?? best.firmName}.
                </>
              )}
            </p>
          )}

          {rows.length > 0 && (
            <>
              <div className="chart-row" style={{ marginTop: 12, marginBottom: 14 }}>
                <FirmPassChart rows={rows} fundedMode={fundedMode} />
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Firm</th>
                    <th className="num">{fundedMode ? "Payout %" : "Pass %"}</th>
                    <th className="num">Bust %</th>
                    {!fundedMode && <th className="num">Payout %</th>}
                    {fundedMode && <th className="num">Recycle %</th>}
                    <th className="num">{fundedMode ? "Wk→payout" : "Wk→pass"}</th>
                    <th className="num">DD</th>
                    <th>Consistency</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const primary = snapshotPrimaryPct(r);
                    const isBest = best?.ruleId === r.ruleId;
                    const active = selectedFirm === r.ruleId;
                    return (
                      <tr
                        key={r.ruleId}
                        style={{
                          cursor: "pointer",
                          background: isBest ? "rgba(0, 200, 120, 0.06)" : undefined,
                          outline: active ? "1px solid var(--matrix-dim)" : undefined,
                        }}
                        onClick={() => setSelectedFirm(r.ruleId as MatrixCompareFirmId)}
                      >
                        <td className="accent">
                          {FIRM_LABELS[r.ruleId as MatrixCompareFirmId] ?? r.firmName}
                          {isBest && <span className="pos" style={{ fontSize: 9, marginLeft: 4 }}>★</span>}
                          {r.ddMode === "intraday" && (
                            <span className="warn" style={{ fontSize: 9, marginLeft: 4 }}>
                              intraday
                            </span>
                          )}
                        </td>
                        <td className={"num " + passClass(primary)}>{primary}%</td>
                        <td className="num neg">{r.bustPct}%</td>
                        {!fundedMode && <td className="num">{r.payoutPct}%</td>}
                        {fundedMode && (
                          <td className="num">{r.recyclePct != null ? `${r.recyclePct}%` : "—"}</td>
                        )}
                        <td className="num">{r.weeksToPassP50 ?? "—"}</td>
                        <td className="num">{fmtUsd(r.trailingDD)}</td>
                        <td className="small dim">
                          {r.consistencyPct > 0
                            ? fundedMode
                              ? `${r.consistencyPct}% payout`
                              : `${r.consistencyPct}% eval`
                            : "none"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {activeSnap && (
                <div className="stat-strip" style={{ marginTop: 14 }}>
                  <div className="stat">
                    <div className="k">{fundedMode ? "Payout probability" : "Pass probability"}</div>
                    <div className={"v " + passClass(snapshotPrimaryPct(activeSnap))}>
                      {snapshotPrimaryPct(activeSnap)}%
                    </div>
                    <div className="d">
                      {fundedMode
                        ? `clear $${payoutBuffer} buffer before DD · ${activeSnap.ddMode} trail`
                        : `reach ${fmtUsd(activeSnap.passAt)} before DD`}
                    </div>
                  </div>
                  {fundedMode && activeSnap.recyclePct != null && (
                    <div className="stat">
                      <div className="k">Recycle rate</div>
                      <div className="v cyan">{activeSnap.recyclePct}%</div>
                      <div className="d">withdraw + restart before $5k PRO+ (TPT)</div>
                    </div>
                  )}
                  <div className="stat">
                    <div className="k">{fundedMode ? "Time to payout" : "Time to pass"}</div>
                    <div className="v cyan">{activeSnap.weeksToPassP50 ?? "—"} wks</div>
                    <div className="d">median weeks · {sims.toLocaleString()} sims</div>
                  </div>
                  <div className="stat">
                    <div className="k">Bust rate</div>
                    <div className="v neg">{activeSnap.bustPct}%</div>
                    <div className="d">DD breach · {fmtUsd(activeSnap.trailingDD)} trail</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {activeRule && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="panel-title">
            Firm rules
            <span className="sub">{activeRule.name}</span>
          </div>
          <div className="panel-body">
            <FirmRulesCard rule={activeRule} />
          </div>
        </div>
      )}
    </div>
  );
}

function compareFirmsFromCohortOnly(cohort: CohortRecord): FirmMcSnapshot[] {
  const compareMode = mcCompareModeForPhase(cohort.phase);
  const out: FirmMcSnapshot[] = [];
  for (const id of MATRIX_COMPARE_FIRM_IDS) {
    const entry = firmMcForTab(cohort, id);
    const rule = ruleById(id);
    if (!entry || !rule) continue;
    const fundedPhase = rule.phases.find((p) => p.id === "funded");
    const evalPhase = rule.phases.find((p) => p.id === "eval");
    const phaseRules = compareMode === "funded" ? fundedPhase : evalPhase;
    out.push({
      ruleId: id,
      firmName: rule.name,
      mcMode: entry.mcMode ?? compareMode,
      passPct: entry.passPct,
      bustPct: entry.bustPct,
      payoutPct: entry.payoutPct,
      recyclePct: entry.recyclePct,
      weeksToPassP50: entry.weeksToPassP50,
      weeksToPayoutP50: entry.weeksToPayoutP50,
      passAt: entry.passAt ?? rule.passAt,
      trailingDD: entry.trailingDD ?? rule.trailingDD,
      consistencyPct: entry.consistencyPct ?? rule.consistencyPct,
      ddMode: phaseRules?.ddMode ?? rule.ddMode,
    });
  }
  return out;
}
