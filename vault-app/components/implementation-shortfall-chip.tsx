"use client";

import { fmtUsd } from "@/lib/store";
import type { ImplementationShortfall } from "@/lib/implementation-shortfall";

export function ImplementationShortfallChip({
  shortfall,
}: {
  shortfall: ImplementationShortfall;
}) {
  const gap = shortfall.shortfallUsdPerWeek;
  const leak = shortfall.leakagePct;

  return (
    <div className="panel" style={{ marginBottom: 14 }}>
      <div className="panel-title">
        Implementation shortfall
        <span className="sub">gross paper weekly vs net path MC after fees</span>
      </div>
      <div className="panel-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          <div className="stat">
            <div className="k">Gross E[$/wk]</div>
            <div className={"v " + (shortfall.grossUsdPerWeek >= 0 ? "pos" : "neg")}>
              {fmtUsd(shortfall.grossUsdPerWeek, true)}
            </div>
            <div className="d">
              EV {fmtUsd(shortfall.grossTradeEv, true)} × {shortfall.tradesPerWeek} tr/wk
            </div>
          </div>
          <div className="stat">
            <div className="k">Net E[$/wk]</div>
            <div
              className={
                "v " +
                (shortfall.netUsdPerWeek == null
                  ? "dim"
                  : shortfall.netUsdPerWeek >= 0
                    ? "pos"
                    : "neg")
              }
            >
              {shortfall.netUsdPerWeek == null ? "—" : fmtUsd(shortfall.netUsdPerWeek, true)}
            </div>
            <div className="d">path MC · E[$/acct] {fmtUsd(shortfall.netExpectedPerAccountUsd, true)}</div>
          </div>
          <div className="stat">
            <div className="k">Shortfall</div>
            <div className={"v " + (gap != null && gap > 0 ? "warn" : "dim")}>
              {gap == null ? "—" : fmtUsd(gap, true)}
            </div>
            <div className="d">
              {leak != null ? `${leak}% of |gross| leaked` : "fees + barriers + timeout"}
            </div>
          </div>
        </div>
        <p className="small dim" style={{ marginTop: 8, marginBottom: 0 }}>
          {shortfall.note} Never close a cohort on gross-only.
        </p>
      </div>
    </div>
  );
}
