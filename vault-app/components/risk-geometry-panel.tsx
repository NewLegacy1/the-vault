"use client";

import type { BootstrapEvCi, RiskGeometry } from "@/lib/risk-geometry";

function fmtUsd(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`;
}

export function RiskGeometryPanel({
  geometry,
  evCi,
}: {
  geometry: RiskGeometry;
  evCi: BootstrapEvCi;
}) {
  if (geometry.n === 0) return null;
  const coversZero = evCi.ciLow <= 0 && evCi.ciHigh >= 0;

  return (
    <div className="lab-enrichment" style={{ marginTop: 10 }}>
      <div className="small dim" style={{ marginBottom: 4 }}>
        Trade EV + risk geometry · path MC remains promote authority
      </div>
      <div
        className="small"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "4px 12px",
        }}
      >
        <span>
          Trade EV{" "}
          <span className={evCi.mean >= 0 ? "pos" : "neg"}>{fmtUsd(evCi.mean)}</span>
        </span>
        <span>
          EV CI 95%{" "}
          <span className={coversZero ? "warn" : "accent"}>
            [{fmtUsd(evCi.ciLow)}, {fmtUsd(evCi.ciHigh)}]
          </span>
          {coversZero ? <span className="dim"> · covers 0</span> : null}
        </span>
        <span>
          WR{" "}
          <span className="dim" title="Geometry diagnostic — not a promotion KPI">
            {geometry.winRatePct}%
          </span>
        </span>
        <span>
          RR{" "}
          <span className="dim" title="avgWin / |avgLoss| — geometry only">
            {geometry.rr}
          </span>
        </span>
        <span>
          Trade SD <span className="dim">{fmtUsd(geometry.tradePnlSd)}</span>
        </span>
      </div>
      <p className="small dim" style={{ marginTop: 4, marginBottom: 0 }}>
        WR / RR / SD = distribution shape for barrier intuition. Promote on path{" "}
        <span className="accent">E[$/wk]</span>, not these slices.
      </p>
    </div>
  );
}
