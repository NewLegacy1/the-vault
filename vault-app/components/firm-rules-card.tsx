"use client";

import { fmtUsd } from "@/lib/store";
import type { PropRule } from "@/lib/types";

export function FirmRulesCard({ rule }: { rule: PropRule }) {
  return (
    <div className="firm-card">
      <div className="firm-card-head">
        <span className="accent">{rule.name}</span>
        {!rule.verified && <span className="chip warn-chip">verify fees</span>}
      </div>
      <div className="kv mt">
        <span className="k">Profit target</span>
        <span>{fmtUsd(rule.profitTarget)}</span>
        <span className="k">MC pass line</span>
        <span className="accent">
          {fmtUsd(rule.passAt)}
          {rule.passAt > rule.profitTarget && (
            <span className="subtext small"> (+{fmtUsd(rule.passAt - rule.profitTarget)} buffer)</span>
          )}
        </span>
        <span className="k">Trailing DD</span>
        <span>
          {fmtUsd(rule.trailingDD)} · {rule.ddMode.toUpperCase()}
        </span>
        {rule.dailyLossLimit != null && (
          <>
            <span className="k">Daily loss limit</span>
            <span>{fmtUsd(rule.dailyLossLimit)}</span>
          </>
        )}
        <span className="k">Min days</span>
        <span>{rule.minDays > 0 ? rule.minDays : "none"}</span>
        <span className="k">Eval consistency</span>
        <span>{rule.consistencyPct > 0 ? `${rule.consistencyPct}% best-day cap` : "none"}</span>
        {(rule.evalFee || rule.monthlyFee) && (
          <>
            <span className="k">Typical cost</span>
            <span className="small subtext">
              {rule.evalFee ? `eval ~${fmtUsd(rule.evalFee)}` : ""}
              {rule.monthlyFee ? ` · ${fmtUsd(rule.monthlyFee)}/mo` : ""}
              {rule.activationFee ? ` · activation ${fmtUsd(rule.activationFee)}` : ""}
            </span>
          </>
        )}
      </div>
      <p className="small subtext mt">{rule.passAtNote}</p>
      <p className="small dim" style={{ marginTop: 4 }}>
        Source: {rule.source}
      </p>
    </div>
  );
}
