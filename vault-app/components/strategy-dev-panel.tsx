"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtUsd } from "@/lib/store";
import type { CohortRecord } from "@/lib/cohort";
import type { StrategyFamily } from "@/lib/lab-profile";

export type DevFilter = "all" | StrategyFamily | "eval" | "funded" | "combined";

export interface StrategyDevPanelProps {
  /** Highlight runs matching this family (from active study preset). */
  activeFamily?: StrategyFamily;
  activeVariant?: string;
  /** Current lab run stats — highlighted in comparison table. */
  currentRun?: {
    variant: string;
    trades: number;
    netPnl: number;
    mcPassPct: number;
    maxDd?: number;
  } | null;
  /** Default filter chip on load. */
  defaultFilter?: DevFilter;
  compact?: boolean;
}

function passClass(pct: number): string {
  if (pct >= 50) return "pos";
  if (pct >= 35) return "warn";
  return "neg";
}

export function StrategyDevPanel({
  activeFamily,
  activeVariant,
  currentRun,
  defaultFilter = "all",
  compact = false,
}: StrategyDevPanelProps) {
  const [cohorts, setCohorts] = useState<CohortRecord[]>([]);
  const [loadErr, setLoadErr] = useState("");
  const [filter, setFilter] = useState<DevFilter>(defaultFilter);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cohorts")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCohorts(data.cohorts ?? []);
      })
      .catch((e) => {
        if (!cancelled) setLoadErr(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return cohorts.filter((c) => {
      if (filter === "all") return true;
      if (filter === "eval" || filter === "funded" || filter === "combined") {
        return c.phase === filter;
      }
      return c.strategyFamily === filter;
    });
  }, [cohorts, filter]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.mcPassPct - a.mcPassPct || b.netPnl - a.netPnl),
    [filtered]
  );

  const leaders = useMemo(() => {
    const evalBest = cohorts
      .filter((c) => c.phase === "eval" || c.strategyFamily === "prb")
      .sort((a, b) => b.mcPassPct - a.mcPassPct)[0];
    const fundedBest = cohorts
      .filter((c) => c.phase === "funded" || c.strategyFamily === "macro")
      .sort((a, b) => b.weeklyEdgeUsd - a.weeklyEdgeUsd || b.netPnl - a.netPnl)[0];
    return { evalBest, fundedBest };
  }, [cohorts]);

  const filters: { id: DevFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "prb", label: "PRB" },
    { id: "macro", label: "Macro" },
    { id: "eval", label: "Eval" },
    { id: "funded", label: "Funded" },
    { id: "combined", label: "Hybrid" },
  ];

  return (
    <div className="strategy-dev-panel">
      {!compact && (
        <p className="small dim" style={{ marginTop: 0, lineHeight: 1.65 }}>
          Compares every saved Monte Carlo cohort from Obsidian. Optimizes for prop math — pass rate and
          expected accounts on eval, weekly edge on funded. Full charter:{" "}
          <code className="inline">strategies/strategy-dev/00-charter/STRATEGY_DEV_AGENT.md</code>
        </p>
      )}

      {(leaders.evalBest || leaders.fundedBest) && !compact && (
        <div className="stat-strip" style={{ marginBottom: 12 }}>
          {leaders.evalBest && (
            <div className="stat">
              <div className="k">Eval leader</div>
              <div className={"v " + passClass(leaders.evalBest.mcPassPct)}>{leaders.evalBest.mcPassPct}%</div>
              <div className="d">{leaders.evalBest.variant.slice(0, 42)}</div>
            </div>
          )}
          {leaders.fundedBest && (
            <div className="stat">
              <div className="k">Funded edge leader</div>
              <div className="v cyan">{fmtUsd(leaders.fundedBest.weeklyEdgeUsd)}/wk</div>
              <div className="d">{leaders.fundedBest.variant.slice(0, 42)}</div>
            </div>
          )}
          <div className="stat">
            <div className="k">Saved cohorts</div>
            <div className="v">{cohorts.length}</div>
            <div className="d">strategies/cohorts/</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={"chip" + (filter === f.id ? " active-acct" : "")}
            style={{ cursor: "pointer", background: filter === f.id ? undefined : "transparent" }}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        {activeFamily && filter !== activeFamily && (
          <button type="button" className="btn ghost" style={{ padding: "2px 10px", fontSize: 10 }} onClick={() => setFilter(activeFamily)}>
            Match study ({activeFamily})
          </button>
        )}
      </div>

      {loadErr && <p className="small neg">{loadErr}</p>}

      {currentRun && (
        <div className="lab-dataset-summary" style={{ marginBottom: 10 }}>
          <span className="accent">Current run</span> · {currentRun.variant} · {currentRun.trades} tr ·{" "}
          {fmtUsd(currentRun.netPnl, true)} · pass {currentRun.mcPassPct.toFixed(1)}%
          {activeVariant && <span className="dim"> — not saved until cohort auto-save fires</span>}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="small dim">No cohorts for this filter. RUN in F4 LAB with auto-save on.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Phase</th>
              <th className="num">Trades</th>
              <th className="num">Net</th>
              <th className="num">Pass %</th>
              <th className="num">Bust %</th>
              <th className="num">$/wk</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const isActive =
                (activeVariant && c.variant === activeVariant) ||
                (currentRun && c.variant === currentRun.variant);
              return (
                <tr key={c.filename} style={isActive ? { outline: "1px solid var(--matrix-dim)" } : undefined}>
                  <td className="small">
                    {c.variant}
                    {isActive && <span className="cyan"> · now</span>}
                  </td>
                  <td className="small dim">
                    {c.phase || "—"} / {c.strategyFamily || "—"}
                  </td>
                  <td className="num">{c.trades}</td>
                  <td className={"num " + (c.netPnl >= 0 ? "pos" : "neg")}>{fmtUsd(c.netPnl, true)}</td>
                  <td className={"num " + passClass(c.mcPassPct)}>{c.mcPassPct}%</td>
                  <td className="num neg">{c.mcBustPct}%</td>
                  <td className="num cyan">{fmtUsd(c.weeklyEdgeUsd)}</td>
                  <td className={"small " + (c.scorecardVerdict === "advance" ? "pos" : c.scorecardVerdict === "regress" ? "neg" : "warn")}>
                    {(c.scorecardVerdict || "hold").toUpperCase()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!compact && (
        <ul className="small dim mt" style={{ lineHeight: 1.6, paddingLeft: 18, marginBottom: 0 }}>
          <li>Eval track → PRB BE@2R + PDH/PDL (pass rate)</li>
          <li>Funded track → Macro A-tier (weekly edge)</li>
          <li>Hybrid → joint ledger MC → cohorts/combined/</li>
        </ul>
      )}
    </div>
  );
}
