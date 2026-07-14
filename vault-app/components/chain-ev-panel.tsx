"use client";

import Link from "next/link";
import { fmtUsd } from "@/lib/store";
import type { ChainEvContext } from "@/lib/chain-ev";
import { presetById } from "@/lib/lab-profile";
import { CHAIN_BASELINE_PAIR_ID } from "@/lib/strategy-chain";

export interface ChainEvPanelProps {
  context: ChainEvContext;
  compact?: boolean;
}

function methodLabel(method: ChainEvContext["result"]["method"]): string {
  switch (method) {
    case "cohort_pair":
      return "saved cohort pair";
    case "live_dual_run":
      return "live dual-run";
    case "same_ledger_approx":
      return "same-ledger approx";
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function ChainEvPanel({ context, compact = false }: ChainEvPanelProps) {
  const { pair, result, evalPresetId, fundedPresetId, evalCohortSaved, fundedCohortSaved, baselineExpectedUsdPerWeek } =
    context;
  const evalPreset = presetById(evalPresetId);
  const fundedPreset = presetById(fundedPresetId);
  const portfolioPreset = pair.portfolioLegPresetId ? presetById(pair.portfolioLegPresetId) : undefined;

  const primaryWk = result.combinedUsdPerCalendarWeek ?? result.expectedUsdPerCalendarWeek;
  const beatsBaseline =
    baselineExpectedUsdPerWeek != null && primaryWk != null && primaryWk >= baselineExpectedUsdPerWeek;
  const losesToBaseline =
    baselineExpectedUsdPerWeek != null && primaryWk != null && primaryWk < baselineExpectedUsdPerWeek * 0.95;

  if (compact) {
    return (
      <p className="small dim" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
        <span className="accent">Chain EV</span> {pair.label}:{" "}
        <span className={primaryWk != null && primaryWk > 0 ? "pos" : "neg"}>
          {primaryWk != null ? fmtUsd(primaryWk, true) : "—"}/wk
        </span>
        {result.weeksChainP50 != null && <> · {result.weeksChainP50}w cycle</>}
      </p>
    );
  }

  return (
    <div
      className="chain-ev-panel panel"
      style={{ marginBottom: 14, border: "1px solid var(--border)", background: "#060606" }}
    >
      <div className="panel-head" style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
        <span className="accent" style={{ letterSpacing: 1 }}>
          CHAIN EV
        </span>{" "}
        <span className="dim">— {pair.label} (TPT $50K)</span>
        <span className="small dim" style={{ marginLeft: 8 }}>
          {methodLabel(result.method)}
        </span>
      </div>

      <div className="panel-body" style={{ padding: "10px 12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div>
            <div className="small dim">EVAL · {evalPreset?.label ?? evalPresetId}</div>
            <div className="v" style={{ fontSize: 18 }}>
              {result.eval.passPct.toFixed(1)}% pass
            </div>
            <div className="small dim">
              wks→pass {result.eval.weeksToPassP50 ?? "—"}
              {result.sprintScore != null && <> · sprint {result.sprintScore}</>}
            </div>
            <div className="small dim">
              {evalCohortSaved ? <span className="pos">cohort saved</span> : <span className="warn">no saved cohort</span>}
            </div>
          </div>

          <div>
            <div className="small dim">FUNDED · {fundedPreset?.label ?? fundedPresetId}</div>
            <div className="v" style={{ fontSize: 18 }}>
              {result.funded.payoutPct.toFixed(1)}% payout
            </div>
            <div className="small dim">
              wks→pay {result.funded.weeksToPayoutP50 ?? result.funded.weeksToPassP50 ?? "—"}
              {result.funded.medianWithdrawnUsd > 0 && (
                <> · median {fmtUsd(result.funded.medianWithdrawnUsd)}</>
              )}
            </div>
            <div className="small dim">
              {fundedCohortSaved ? (
                <span className="pos">cohort saved</span>
              ) : (
                <span className="warn">using live / approx ledger</span>
              )}
            </div>
          </div>

          <div>
            <div className="small dim">CHAINED</div>
            <div
              className={"v " + (primaryWk != null && primaryWk > 50 ? "pos" : primaryWk != null && primaryWk > 0 ? "warn" : "neg")}
              style={{ fontSize: 20 }}
            >
              {primaryWk != null ? fmtUsd(primaryWk, true) : "—"}/wk
            </div>
            <div className="small dim">
              E[$/acct] {fmtUsd(result.expectedNetPerAccountUsd, true)}
              {result.weeksChainP50 != null && <> · {result.weeksChainP50}w total</>}
            </div>
            {result.medianUsdPerCalendarWeek != null && (
              <div className="small dim">
                median extract {fmtUsd(result.medianUsdPerCalendarWeek, true)}/wk
              </div>
            )}
            {pair.id !== CHAIN_BASELINE_PAIR_ID && baselineExpectedUsdPerWeek != null && (
              <div className={"small " + (beatsBaseline ? "pos" : losesToBaseline ? "neg" : "dim")}>
                vs A0a→D1 baseline {fmtUsd(baselineExpectedUsdPerWeek, true)}/wk
                {losesToBaseline && " — sprint eval may not beat control"}
              </div>
            )}
          </div>

          {pair.mode === "portfolio_parallel" && portfolioPreset && (
            <div>
              <div className="small dim">PARALLEL · {portfolioPreset.label}</div>
              <div className="v" style={{ fontSize: 18 }}>
                {result.portfolioLegUsdPerWeek != null
                  ? `${fmtUsd(result.portfolioLegUsdPerWeek, true)}/wk`
                  : "—"}
              </div>
              <div className="small dim">independent funded leg</div>
            </div>
          )}
        </div>

        {result.warnings.length > 0 && (
          <div className="small dim" style={{ lineHeight: 1.55, marginBottom: 8 }}>
            {result.warnings.map((w) => (
              <div key={w}>· {w}</div>
            ))}
          </div>
        )}

        <div className="small dim" style={{ lineHeight: 1.55 }}>
          Chain multiplies eval pass probability by funded <span className="accent">expected E[$/acct]</span> on the
          funded profile book. Save both cohorts for highest accuracy.{" "}
          <Link href="/results" className="accent">
            F8 Results
          </Link>
        </div>

        {!fundedCohortSaved && evalPresetId === context.evalPresetId && (
          <p className="small warn" style={{ marginTop: 8, marginBottom: 0 }}>
            Run <span className="accent">{fundedPreset?.label ?? fundedPresetId}</span> in Lab with its TV export to
            replace same-ledger approximation.
          </p>
        )}
      </div>
    </div>
  );
}
