"use client";

import { useMemo, useState } from "react";
import {
  analyzeContextSlices,
  type ContextSliceId,
} from "@/lib/context-slice";

function fmtEv(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n * 10) / 10)}`;
}

export function ContextSlicePanel({
  trades,
  dates,
}: {
  trades: number[];
  dates: string[];
}) {
  const [focus, setFocus] = useState<ContextSliceId>("all");
  const rows = useMemo(() => analyzeContextSlices(trades, dates, 600), [trades, dates]);
  const selected = rows.find((r) => r.id === focus) ?? rows[0];

  if (trades.length === 0) return null;

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div className="panel-title">
        Context re-slice
        <span className="sub">event-study EV by context tag · before promoting a gate to Pine</span>
      </div>
      <div className="panel-body">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              className={"chip" + (focus === r.id ? " active-acct" : "")}
              style={{ cursor: "pointer", background: focus === r.id ? undefined : "transparent" }}
              onClick={() => setFocus(r.id)}
            >
              {r.label}
              <span className="dim"> · n={r.n}</span>
            </button>
          ))}
        </div>
        {selected && (
          <div className="small">
            <span className="accent">{selected.label}</span>
            <span className="dim"> · purpose={selected.purpose}</span>
            <div style={{ marginTop: 6 }}>
              Trade EV {fmtEv(selected.evCi.mean)}{" "}
              <span className="dim">
                CI [{fmtEv(selected.evCi.ciLow)}, {fmtEv(selected.evCi.ciHigh)}]
              </span>
              {selected.coversZero ? (
                <span className="warn"> · 0∈CI — need context hypothesis or kill</span>
              ) : (
                <span className="pos"> · CI excludes 0</span>
              )}
            </div>
            <p className="dim" style={{ marginTop: 6, marginBottom: 0 }}>
              Geometry (not KPI): WR {selected.geometry.winRatePct}% · RR{" "}
              {selected.geometry.rr} · SD ${Math.round(selected.geometry.tradePnlSd)}. Re-slice is Stage-0
              hygiene — prop Lab MC still required for promote.
            </p>
          </div>
        )}
        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Slice</th>
                <th className="num">n</th>
                <th className="num">EV</th>
                <th className="num">CI low</th>
                <th className="num">CI high</th>
                <th>0∈CI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={focus === r.id ? "row-up" : ""}>
                  <td>{r.label}</td>
                  <td className="num">{r.n}</td>
                  <td className={"num " + (r.evCi.mean >= 0 ? "pos" : "neg")}>
                    {fmtEv(r.evCi.mean)}
                  </td>
                  <td className="num">{fmtEv(r.evCi.ciLow)}</td>
                  <td className="num">{fmtEv(r.evCi.ciHigh)}</td>
                  <td>{r.coversZero ? <span className="warn">yes</span> : <span className="dim">no</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
