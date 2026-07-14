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
  normalizeStoredMcPct,
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

function FirmPassChart({ rows }: { rows: FirmMcSnapshot[] }) {
  if (rows.length === 0) return null;
  const W = 520;
  const H = 28 + rows.length * 48;
  const max = Math.max(...rows.map((r) => r.passPct), 1);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ background: "#000", border: "1px solid var(--border)", maxWidth: 560 }}
    >
      <text x={W / 2} y={16} fill="#9a9a9a" fontSize={10} textAnchor="middle" fontFamily="monospace" letterSpacing={1}>
        PASS RATE BY FIRM — SAME TRADE DATA
      </text>
      {rows.map((r, i) => {
        const y = 28 + i * 48;
        const bw = (r.passPct / max) * (W - 200);
        return (
          <g key={r.ruleId}>
            <text x={8} y={y + 22} fill="#7ec8e3" fontSize={11} fontFamily="monospace">
              {FIRM_LABELS[r.ruleId as MatrixCompareFirmId] ?? r.firmName}
            </text>
            <rect x={130} y={y + 8} width={Math.max(bw, 2)} height={22} fill="#3ecf8e" opacity={0.72} />
            <text x={W - 8} y={y + 22} fill="#e8e8e8" fontSize={11} textAnchor="end" fontFamily="monospace">
              {r.passPct}% · bust {r.bustPct}%
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
}

export function MatrixFirmCompare({ presetId, cohort }: MatrixFirmCompareProps) {
  const [ledgers] = useLocal<PresetLedgerStore>("vault.lab.ledgers", {});
  const [selectedFirm, setSelectedFirm] = useState<MatrixCompareFirmId>("tpt50");
  const [computed, setComputed] = useState<FirmMcSnapshot[] | null>(null);
  const [computeSource, setComputeSource] = useState<"ledger" | "cohort" | "saved" | "none">("none");
  const [computing, setComputing] = useState(false);

  const preset = presetById(presetId);
  const resolved = useMemo(
    () => resolveMatrixTrades(presetId, ledgers, cohort),
    [presetId, ledgers, cohort]
  );

  const sims = cohort?.mcSims ?? 2000;
  const maxTrades = cohort?.mcMaxTrades ?? 80;
  const payoutBuffer = cohort?.payoutBuffer ?? 2000;

  useEffect(() => {
    if (!presetId) return;
    if (resolved?.trades.length) {
      setComputing(true);
      const snaps = compareFirmsForTrades({
        trades: resolved.trades,
        dates: resolved.dates,
        sims,
        maxTrades,
        payoutBuffer,
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
  }, [presetId, resolved, cohort, sims, maxTrades, payoutBuffer]);

  const rows = computed ?? [];
  const best = rows.length
    ? rows.reduce((a, b) => (b.passPct > a.passPct ? b : a))
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
          </span>
        </div>
        <div className="panel-body">
          {computing && <p className="small dim">Running Monte Carlo across firms…</p>}

          {!computing && computeSource === "none" && !cohort && (
            <p className="small warn">
              Select a matrix row above, or run this branch in{" "}
              <Link href={`/lab?preset=${presetId}`} className="accent">
                F4 Lab
              </Link>
              .
            </p>
          )}

          {!computing && computeSource === "none" && cohort && (
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
              {computeSource === "ledger" && (
                <>
                  <span className="accent">Auto-computed</span> from your Lab CSV in this browser — same trades, each
                  firm&apos;s pass/DD/consistency rules. No re-run needed.
                </>
              )}
              {computeSource === "cohort" && (
                <>
                  <span className="accent">Auto-computed</span> from saved trade series in the cohort note — all firms
                  from one MC run.
                </>
              )}
              {computeSource === "saved" && resolved == null && (
                <>
                  Showing saved firm snapshots. Re-RUN in Lab once to store trades and refresh all tabs automatically.
                </>
              )}
              {best && (
                <>
                  {" "}
                  Best pass: <span className="pos">{best.passPct}%</span> on{" "}
                  {FIRM_LABELS[best.ruleId as MatrixCompareFirmId] ?? best.firmName}.
                </>
              )}
            </p>
          )}

          {rows.length > 0 && (
            <>
              <div className="chart-row" style={{ marginTop: 12, marginBottom: 14 }}>
                <FirmPassChart rows={rows} />
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Firm</th>
                    <th className="num">Pass %</th>
                    <th className="num">Bust %</th>
                    <th className="num">Payout %</th>
                    <th className="num">Wk→pass</th>
                    <th className="num">Pass line</th>
                    <th className="num">DD</th>
                    <th>Consistency</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
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
                        </td>
                        <td className={"num " + passClass(r.passPct)}>{r.passPct}%</td>
                        <td className="num neg">{r.bustPct}%</td>
                        <td className="num">{r.payoutPct}%</td>
                        <td className="num">{r.weeksToPassP50 ?? "—"}</td>
                        <td className="num">{fmtUsd(r.passAt)}</td>
                        <td className="num">{fmtUsd(r.trailingDD)}</td>
                        <td className="small dim">
                          {r.consistencyPct > 0 ? `${r.consistencyPct}%` : "none"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {activeSnap && (
                <div className="stat-strip" style={{ marginTop: 14 }}>
                  <div className="stat">
                    <div className="k">Pass probability</div>
                    <div className={"v " + passClass(activeSnap.passPct)}>{activeSnap.passPct}%</div>
                    <div className="d">reach {fmtUsd(activeSnap.passAt)} before DD</div>
                  </div>
                  <div className="stat">
                    <div className="k">Time to pass</div>
                    <div className="v cyan">{activeSnap.weeksToPassP50 ?? "—"} wks</div>
                    <div className="d">median weeks · {sims.toLocaleString()} sims</div>
                  </div>
                  <div className="stat">
                    <div className="k">Time to payout</div>
                    <div className="v magenta">{activeSnap.weeksToPayoutP50 ?? "—"} wks</div>
                    <div className="d">payout buffer ${payoutBuffer}</div>
                  </div>
                  <div className="stat">
                    <div className="k">Bust rate</div>
                    <div className="v neg">{activeSnap.bustPct}%</div>
                    <div className="d">DD breach before pass</div>
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
  const out: FirmMcSnapshot[] = [];
  for (const id of MATRIX_COMPARE_FIRM_IDS) {
    const entry = firmMcForTab(cohort, id);
    const rule = ruleById(id);
    if (!entry || !rule) continue;
    out.push({
      ruleId: id,
      firmName: rule.name,
      passPct: normalizeStoredMcPct(entry.passPct, cohort.mcPassPct),
      bustPct: normalizeStoredMcPct(entry.bustPct, cohort.mcBustPct),
      payoutPct: normalizeStoredMcPct(entry.payoutPct, cohort.mcPayoutPct),
      weeksToPassP50: entry.weeksToPassP50,
      weeksToPayoutP50: entry.weeksToPayoutP50,
      passAt: entry.passAt ?? rule.passAt,
      trailingDD: entry.trailingDD ?? rule.trailingDD,
      consistencyPct: entry.consistencyPct ?? rule.consistencyPct,
    });
  }
  return out;
}
