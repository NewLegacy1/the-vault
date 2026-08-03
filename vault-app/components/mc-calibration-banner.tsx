"use client";

import { describeMcCalibration, type McCalibrationReport } from "@/lib/mc-calibration";
import { MC_ENGINE_VERSION } from "@/lib/mc-engine-version";
import type { McRulePack } from "@/lib/mc-rule-pack";

export interface McCalibrationBannerProps {
  rulePack?: McRulePack;
  simMode?: "eval_path" | "funded_only";
  hasPayoutEconomics?: boolean;
  accountRecycling?: boolean;
  cohortEngineVersion?: number;
  compact?: boolean;
  /** From McResult — intraday trail ratcheted on unrealized MFE peaks (F2). */
  mfeTrailApplied?: boolean;
  /** Fraction of trades carrying mfeUsd (0–1). */
  mfeCoveragePct?: number;
}

export function McCalibrationBanner({
  rulePack,
  simMode,
  hasPayoutEconomics,
  accountRecycling,
  cohortEngineVersion,
  compact = false,
  mfeTrailApplied,
  mfeCoveragePct,
}: McCalibrationBannerProps) {
  const compactJoin = " · ";
  const report: McCalibrationReport = describeMcCalibration({
    rulePack,
    simMode,
    hasPayoutEconomics,
    accountRecycling,
  });

  const stale =
    cohortEngineVersion != null && cohortEngineVersion < MC_ENGINE_VERSION;

  const intradayTrail = rulePack?.trailingMode === "intraday";
  const mfeWarn =
    intradayTrail && mfeTrailApplied === false
      ? `Intraday trail on day-close equity only — ledger lacks MFE (${Math.round((mfeCoveragePct ?? 0) * 100)}% coverage, need ≥50%). Pass rates optimistic for Apex-style trails; export an enriched CSV with mfe_usd.`
      : null;
  const mfeOk = intradayTrail && mfeTrailApplied === true;

  if (compact) {
    return (
      <p className="small dim" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
        <span className="accent">MC v{MC_ENGINE_VERSION}</span>
        {report.modeled.length > 0 && (
          <>
            {" "}
            · Modeled: {report.modeled.join(compactJoin)}
          </>
        )}
        {report.notModeled.length > 0 && (
          <>
            {" "}
            · Not modeled: {report.notModeled.slice(0, 2).join(compactJoin)}
            {report.notModeled.length > 2 ? "…" : ""}
          </>
        )}
        {mfeOk && <span> · MFE trail ON</span>}
        {mfeWarn && <span className="warn"> · trail ignores unrealized MFE (no mfe_usd)</span>}
        {stale && <span className="warn"> · Re-RUN in Lab for calibrated rates</span>}
      </p>
    );
  }

  return (
    <div
      className="mc-calibration-banner"
      style={{
        marginTop: 8,
        marginBottom: 8,
        padding: "8px 10px",
        border: "1px solid var(--border)",
        background: "#080808",
        fontSize: 11,
        lineHeight: 1.55,
      }}
    >
      <div style={{ marginBottom: 4 }}>
        <span className="accent" style={{ letterSpacing: 1 }}>
          MC ENGINE v{MC_ENGINE_VERSION}
        </span>
        {stale && (
          <span className="warn" style={{ marginLeft: 8 }}>
            Cohort saved on v{cohortEngineVersion} — re-RUN in Lab to refresh
          </span>
        )}
      </div>
      {report.modeled.length > 0 && (
        <div>
          <span className="dim">Modeled: </span>
          {report.modeled.join(compactJoin)}
        </div>
      )}
      {report.approximated.length > 0 && (
        <div>
          <span className="dim">Approximated: </span>
          <span className="subtext">{report.approximated.join(compactJoin)}</span>
        </div>
      )}
      {report.notModeled.length > 0 && (
        <div>
          <span className="dim">Not modeled: </span>
          <span className="subtext">{report.notModeled.join(compactJoin)}</span>
        </div>
      )}
      {mfeOk && (
        <div>
          <span className="dim">MFE trail: </span>
          ON — peak ratchets on unrealized intraday MFE ({Math.round((mfeCoveragePct ?? 0) * 100)}% of trades carry mfe_usd)
        </div>
      )}
      {mfeWarn && (
        <div className="warn">{mfeWarn}</div>
      )}
    </div>
  );
}
