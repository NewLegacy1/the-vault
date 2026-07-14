import { Phase, PropRule } from "./types";
import { PropPhaseRuleSet, PropRulePhaseId, payoutSummary } from "./prop-phase-types";

/** Map vault account phase → which rulebook tab to highlight. */
export function suggestedPhaseTab(accountPhase: Phase): PropRulePhaseId | "transition" {
  switch (accountPhase) {
    case "eval":
      return "eval";
    case "funded":
      return "funded";
    case "passed":
      return "transition";
    case "blown":
    case "retired":
      return "eval";
    default: {
      const _exhaustive: never = accountPhase;
      return _exhaustive;
    }
  }
}

export function transitionChecklist(rule: PropRule): string[] {
  const evalP = rule.phases.find((p) => p.id === "eval");
  const fundedP = rule.phases.find((p) => p.id === "funded");
  const lines: string[] = [];
  if (evalP?.passAt) {
    lines.push(`Eval profit request line: ≥ ${fmt(evalP.passAt)} (${evalP.passAtNote ?? rule.passAtNote})`);
  }
  if (evalP?.minTradingDays) {
    lines.push(`Minimum ${evalP.minTradingDays} trading days completed`);
  }
  if (evalP?.evalConsistencyPct) {
    lines.push(`${evalP.evalConsistencyPct}% consistency satisfied (best day < half of total)`);
  }
  if (fundedP?.activationFee) {
    lines.push(`Pay activation fee (~$${fundedP.activationFee}) when prompted`);
  }
  if (fundedP?.ddMode === "intraday" && evalP?.ddMode === "eod") {
    lines.push("CRITICAL: Drawdown switches EOD → INTRADAY on funded — adjust risk before first PRO trade");
  }
  if (fundedP?.payout?.bufferRequired) {
    lines.push(`Funded buffer for withdrawals: ${fundedP.payout.bufferRequired}`);
  }
  return lines;
}

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function phaseDetailRows(phase: PropPhaseRuleSet): { label: string; value: string; warn?: boolean }[] {
  const rows: { label: string; value: string; warn?: boolean }[] = [
    { label: "Max drawdown", value: `${fmt(phase.trailingDD)} · ${phase.ddMode.toUpperCase()}` },
    { label: "DD behavior", value: phase.ddBehavior },
  ];
  if (phase.profitTarget != null) {
    rows.push({ label: "Profit target", value: fmt(phase.profitTarget) });
  }
  if (phase.passAt != null) {
    rows.push({ label: "Pass / request at", value: fmt(phase.passAt), warn: phase.passAt > (phase.profitTarget ?? 0) });
  }
  if (phase.passAtNote) {
    rows.push({ label: "Pass note", value: phase.passAtNote, warn: true });
  }
  if (phase.dailyLossLimit != null) {
    rows.push({
      label: "Daily loss limit",
      value: phase.dailyLossLimit ? fmt(phase.dailyLossLimit) : "None",
    });
  } else if (phase.id === "eval" || phase.id === "funded") {
    rows.push({ label: "Daily loss limit", value: "None (TPT-style) or see firm" });
  }
  if (phase.evalConsistencyPct) {
    rows.push({
      label: "Eval consistency",
      value: `${phase.evalConsistencyPct}% best-day cap`,
      warn: true,
    });
  }
  if (phase.evalConsistencyNote) {
    rows.push({ label: "Consistency math", value: phase.evalConsistencyNote });
  }
  if (phase.minTradingDays != null) {
    rows.push({
      label: "Min trading days",
      value: `${phase.minTradingDays}${phase.minTradingDaysNote ? ` — ${phase.minTradingDaysNote}` : ""}`,
    });
  }
  if (phase.payout) {
    rows.push({ label: "Profit split", value: phase.payout.profitSplit });
    rows.push({ label: "Withdrawal buffer", value: phase.payout.bufferRequired, warn: phase.payout.bufferRequired.includes("52") });
    rows.push({ label: "Min days before payout", value: phase.payout.minDaysBeforeFirstPayout });
    rows.push({ label: "Min winning days", value: phase.payout.minWinningDays });
    rows.push({
      label: "Payout consistency",
      value: phase.payout.payoutConsistency,
      warn: phase.payout.payoutConsistency !== "None" && phase.payout.payoutConsistency !== "None on PRO",
    });
    rows.push({ label: "Payout frequency", value: phase.payout.frequency });
    rows.push({ label: "Max per payout", value: phase.payout.maxPerPayout });
  }
  return rows;
}

export { payoutSummary };
