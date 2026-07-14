import { McEconomics, McResult } from "./monte-carlo";

/** Slim MC snapshot for Obsidian notes — no band/path arrays. */
export interface McSummary {
  sims: number;
  passRate: number;
  bustRate: number;
  timeoutRate: number;
  tradesToPassP50: number | null;
  tradesToPassP90: number | null;
  worstDrawdownP95: number;
  economics: McEconomics;
}

export function mcToSummary(mc: McResult): McSummary {
  return {
    sims: mc.sims,
    passRate: mc.passRate,
    bustRate: mc.bustRate,
    timeoutRate: mc.timeoutRate,
    tradesToPassP50: mc.tradesToPassP50,
    tradesToPassP90: mc.tradesToPassP90,
    worstDrawdownP95: mc.worstDrawdownP95,
    economics: mc.economics,
  };
}

export interface CohortRecord {
  id: string;
  filename: string;
  variant: string;
  regimes: string[];
  notes: string;
  datasetName: string;
  span: string;
  sources: string[];
  firm: string;
  created: string;
  trades: number;
  netPnl: number;
  wins: number;
  losses: number;
  scratches: number;
  maxDd: number;
  tradesPerWeek: number;
  mcPassPct: number;
  mcBustPct: number;
  mcPayoutPct: number;
  weeksToPassP50: number | null;
  weeksToPayoutP50: number | null;
  expectedAccounts: number;
}

export interface CohortSaveInput {
  variant: string;
  strategyPreset: string;
  strategyVersion: string;
  strategyConfig: string;
  hypothesis: string;
  regimes: string[];
  notes: string;
  datasetName: string;
  span: string;
  sources: string[];
  firm: string;
  trades: number;
  netPnl: number;
  wins: number;
  losses: number;
  scratches: number;
  maxDd: number;
  tradesPerWeek: number;
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
  mc: McSummary;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

export function cohortFilename(input: CohortSaveInput): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hms = now.toISOString().slice(11, 19).replace(/:/g, "");
  const ms = String(now.getUTCMilliseconds()).padStart(3, "0");
  return `${date}_${hms}${ms}_${slug(input.variant)}.md`;
}

export function buildCohortMarkdown(input: CohortSaveInput): string {
  const eco = input.mc.economics;
  const regimesYaml = input.regimes.length ? `[${input.regimes.map((r) => `"${r}"`).join(", ")}]` : "[]";
  const passPct = (input.mc.passRate * 100).toFixed(1);
  const bustPct = (input.mc.bustRate * 100).toFixed(1);
  const payoutPct = (eco.payoutRate * 100).toFixed(1);

  const frontmatter = `---
variant: "${input.variant.replace(/"/g, '\\"')}"
strategy_preset: "${input.strategyPreset.replace(/"/g, '\\"')}"
strategy_version: "${input.strategyVersion.replace(/"/g, '\\"')}"
strategy_config: "${input.strategyConfig.replace(/"/g, '\\"')}"
hypothesis: "${input.hypothesis.replace(/"/g, '\\"')}"
regimes: ${regimesYaml}
date_start: "${input.span.split(" → ")[0] ?? ""}"
date_end: "${input.span.split(" → ")[1] ?? input.span.split(" → ")[0] ?? ""}"
trades: ${input.trades}
net_pnl: ${Math.round(input.netPnl)}
wins: ${input.wins}
losses: ${input.losses}
scratches: ${input.scratches}
max_dd: ${Math.round(input.maxDd)}
firm: "${input.firm.replace(/"/g, '\\"')}"
mc_pass_pct: ${passPct}
mc_bust_pct: ${bustPct}
mc_payout_pct: ${payoutPct}
mc_sims: ${input.sims}
weeks_to_pass_p50: ${eco.weeksToPassP50 ?? "null"}
weeks_to_payout_p50: ${eco.weeksToPayoutP50 ?? "null"}
expected_accounts: ${Number.isFinite(eco.expectedAccounts) ? eco.expectedAccounts : "null"}
tags: [cohort, prb, monte-carlo, lab]
created: "${new Date().toISOString()}"
dataset: "${input.datasetName.replace(/"/g, '\\"')}"
---`;

  const body = `
# ${input.variant}

> Lab cohort · ${input.firm} · ${input.span}
> Pine ${input.strategyVersion} · preset \`${input.strategyPreset}\`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | ${input.variant} |
| Pine version | ${input.strategyVersion} |
| Preset ID | \`${input.strategyPreset}\` |
| Config | ${input.strategyConfig} |
| Hypothesis | ${input.hypothesis.trim() || "—"} |

## Backtest record

| Metric | Value |
|--------|-------|
| Trades | ${input.trades} |
| Net P&L | $${Math.round(input.netPnl).toLocaleString()} |
| W / L / Scr | ${input.wins} / ${input.losses} / ${input.scratches} |
| Max drawdown | $${Math.round(input.maxDd).toLocaleString()} |
| Trades/week | ${input.tradesPerWeek} |
| Sources | ${input.sources.join(", ") || "seed"} |

## Monte Carlo (${input.firm})

| Metric | Value |
|--------|-------|
| Pass rate | ${passPct}% |
| Bust rate | ${bustPct}% |
| Payout rate | ${payoutPct}% |
| Median weeks to pass | ${eco.weeksToPassP50 ?? "—"} |
| Median weeks to payout | ${eco.weeksToPayoutP50 ?? "—"} |
| Expected accounts | ${Number.isFinite(eco.expectedAccounts) ? eco.expectedAccounts : "∞"} |
| Net after fees (median path) | $${eco.medianNetOnPass.toLocaleString()} |
| Sims / max trades | ${input.sims} / ${input.maxTrades} |
| Payout buffer | $${input.payoutBuffer} |

## Regime tags

${input.regimes.length ? input.regimes.map((r) => `- #${r}`).join("\n") : "_No regime tags — add for A/B comparison by market condition._"}

## Notes

${input.notes.trim() || input.hypothesis.trim() || "_No notes._"}

## A/B comparison

_Compare pass rate and net P&L against baseline cohorts in this folder. Promotion rule: MC pass ≥ baseline AND forward test holds 20+ trades._

## Links

- [[Powell_Rejection_Block_SOP]]
- [[PRB_Trade_Checklist]]
`;

  return frontmatter + body;
}

export function parseCohortMeta(content: string, filename: string): CohortRecord | null {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = m[1];
  const get = (key: string) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return line?.[1]?.replace(/^"|"$/g, "") ?? "";
  };
  const regimes = fm.match(/^regimes:\s*\[(.*)\]/m)?.[1]?.split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean) ?? [];

  return {
    id: filename.replace(/\.md$/, ""),
    filename,
    variant: get("variant"),
    regimes,
    notes: "",
    datasetName: get("dataset"),
    span: `${get("date_start")} → ${get("date_end")}`,
    sources: [],
    firm: get("firm"),
    created: get("created"),
    trades: parseInt(get("trades"), 10) || 0,
    netPnl: parseFloat(get("net_pnl")) || 0,
    wins: parseInt(get("wins"), 10) || 0,
    losses: parseInt(get("losses"), 10) || 0,
    scratches: parseInt(get("scratches"), 10) || 0,
    maxDd: parseFloat(get("max_dd")) || 0,
    tradesPerWeek: 0,
    mcPassPct: parseFloat(get("mc_pass_pct")) || 0,
    mcBustPct: parseFloat(get("mc_bust_pct")) || 0,
    mcPayoutPct: parseFloat(get("mc_payout_pct")) || 0,
    weeksToPassP50: parseFloat(get("weeks_to_pass_p50")) || null,
    weeksToPayoutP50: parseFloat(get("weeks_to_payout_p50")) || null,
    expectedAccounts: parseFloat(get("expected_accounts")) || 0,
  };
}
