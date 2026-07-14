import { McEconomics, McResult } from "./monte-carlo";
import type { StrategyFamily, StrategyPhase } from "./lab-profile";
import { normalizeMcPct } from "./mc-pct";
import type { TradeEnrichmentSummary } from "./trade-enrichment";
import { enrichmentToYamlFields } from "./trade-enrichment";
import { payoutCycleYamlFields, type PayoutCycleMetrics } from "./payout-cycle";
import { MC_ENGINE_VERSION } from "./mc-engine-version";

export type { StrategyFamily, StrategyPhase };

/** Obsidian subfolder under strategies/cohorts/ */
export function cohortPhaseDir(phase: StrategyPhase): string {
  switch (phase) {
    case "eval":
      return "eval";
    case "funded":
      return "funded";
    case "combined":
      return "combined";
    case "research":
      return "research";
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

export function inferFamilyFromPreset(presetId: string): StrategyFamily {
  if (presetId.startsWith("prb")) return "prb";
  if (presetId.startsWith("macro")) return "macro";
  if (presetId.startsWith("datahl")) return "datahl";
  if (presetId.includes("hybrid") || presetId.includes("combined")) return "hybrid";
  return "custom";
}

export function cohortWikiLinks(family: StrategyFamily): string {
  switch (family) {
    case "prb":
      return `- [[Powell_Rejection_Block_SOP]]
- [[PRB_Trade_Checklist]]
- [[strategy-dev/findings-prb]]`;
    case "macro":
      return `- [[Macro_Model_SOP]]
- [[Macro_Trade_Checklist]]
- [[strategy-dev/findings-macro]]`;
    case "hybrid":
      return `- [[strategy-dev/hybrid-playbook]]
- [[Powell_Rejection_Block_SOP]]
- [[Macro_Model_SOP]]`;
    case "datahl":
      return `- [[strategy-dev/roadmap]]`;
    case "custom":
      return `- [[strategy-dev/STRATEGY_DEV_AGENT]]`;
    default: {
      const _exhaustive: never = family;
      return _exhaustive;
    }
  }
}

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

export interface CohortFirmMcEntry {
  passPct: number;
  bustPct: number;
  payoutPct: number;
  recyclePct?: number;
  medianNetPerAccountUsd?: number;
  expectedNetPerAccountUsd?: number;
  medianWithdrawnUsd?: number;
  mcMode?: "eval" | "funded";
  weeksToPassP50: number | null;
  weeksToPayoutP50: number | null;
  passAt?: number;
  trailingDD?: number;
  consistencyPct?: number;
  firmName?: string;
}

export interface CohortRecord {
  id: string;
  filename: string;
  relativePath: string;
  variant: string;
  /** Lab preset id — e.g. matrix-a0a, datahl-v0-cisd */
  strategyPreset: string;
  strategyFamily: string;
  phase: string;
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
  weeklyEdgeUsd: number;
  scorecardVerdict: string;
  compositeScore: number;
  mcPassPct: number;
  mcBustPct: number;
  mcPayoutPct: number;
  weeksToPassP50: number | null;
  weeksToPayoutP50: number | null;
  expectedAccounts: number;
  /** Multi-firm MC snapshots — populated on new Lab saves. */
  firmMc?: Record<string, CohortFirmMcEntry>;
  /** Trade series for cross-firm MC without re-upload. */
  tradePnls?: number[];
  tradeDates?: string[];
  mcSims?: number;
  mcMaxTrades?: number;
  payoutBuffer?: number;
  /** MC engine version when cohort was saved. */
  mcEngineVersion?: number;
  mcRulePack?: string[];
}

export interface CohortSaveInput {
  variant: string;
  strategyPreset: string;
  strategyVersion: string;
  strategyConfig: string;
  strategyFamily: StrategyFamily;
  phase: StrategyPhase;
  /** Experiment series id — e.g. premium365, hybrid-sleeve (matrix grouping). */
  experimentSeries?: string;
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
  weeklyEdgeUsd?: number;
  scorecardVerdict?: string;
  compositeScore?: number;
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
  mc: McSummary;
  firmMc?: Record<string, CohortFirmMcEntry>;
  tradePnls?: number[];
  tradeDates?: string[];
  mcEngineVersion?: number;
  mcRulePack?: string[];
  /** Premium field summary from uploaded TV CSV (MFE/MAE/duration/…). */
  enrichment?: TradeEnrichmentSummary | null;
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

export function cohortRelativePath(input: CohortSaveInput): string {
  const filename = cohortFilename(input);
  return `${cohortPhaseDir(input.phase)}/${filename}`;
}

export function buildCohortMarkdown(input: CohortSaveInput): string {
  const eco = input.mc.economics;
  const regimesYaml = input.regimes.length ? `[${input.regimes.map((r) => `"${r}"`).join(", ")}]` : "[]";
  const passPct = (input.mc.passRate * 100).toFixed(1);
  const bustPct = (input.mc.bustRate * 100).toFixed(1);
  const payoutPct = (eco.payoutRate * 100).toFixed(1);
  const firmMcLine = input.firmMc
    ? `firm_mc: ${JSON.stringify(input.firmMc)}\n`
    : "";
  const tradePnlsLine =
    input.tradePnls?.length && input.tradePnls.length <= 500
      ? `trade_pnls: ${JSON.stringify(input.tradePnls)}\n`
      : "";
  const tradeDatesLine =
    input.tradeDates?.length && input.tradeDates.length <= 500
      ? `trade_dates: ${JSON.stringify(input.tradeDates)}\n`
      : "";
  const enrichFields = input.enrichment ? enrichmentToYamlFields(input.enrichment) : null;
  const enrichYaml = enrichFields
    ? Object.entries(enrichFields)
        .map(([k, v]) => `${k}: ${v === null ? "null" : v}`)
        .join("\n") + "\n"
    : "";
  const weeksCycle = input.mc.economics.weeksToPayoutP50 ?? input.mc.economics.weeksToPassP50;
  const cycleMetrics: PayoutCycleMetrics = {
    passPct: Math.round(input.mc.passRate * 1000) / 10,
    payoutPct: Math.round(input.mc.economics.payoutRate * 1000) / 10,
    payoutGivenPassPct:
      input.mc.passRate > 0.01
        ? Math.round((input.mc.economics.payoutRate / input.mc.passRate) * 1000) / 10
        : null,
    bustPct: Math.round(input.mc.bustRate * 1000) / 10,
    recyclePct: null,
    medianWithdrawnUsd: Math.round(input.mc.economics.medianWithdrawnUsd),
    medianNetPerAccountUsd: Math.round(input.mc.economics.medianNetPerAccountUsd),
    expectedNetPerAccountUsd: Math.round(input.mc.economics.expectedNetPerAccountUsd),
    weeksToPassP50: input.mc.economics.weeksToPassP50,
    weeksToPayoutP50: input.mc.economics.weeksToPayoutP50,
    expectedUsdPerCalendarWeek:
      weeksCycle != null && weeksCycle > 0
        ? Math.round(input.mc.economics.expectedNetPerAccountUsd / weeksCycle)
        : null,
    expectedAccounts: input.mc.economics.expectedAccounts,
  };
  const cycleYaml =
    Object.entries(payoutCycleYamlFields(cycleMetrics))
      .map(([k, v]) => `${k}: ${v === null ? "null" : v}`)
      .join("\n") + "\n";

  const frontmatter = `---
variant: "${input.variant.replace(/"/g, '\\"')}"
strategy_preset: "${input.strategyPreset.replace(/"/g, '\\"')}"
strategy_family: "${input.strategyFamily}"
phase: "${input.phase}"
experiment_series: "${(input.experimentSeries ?? "").replace(/"/g, '\\"')}"
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
trades_per_week: ${input.tradesPerWeek}
weekly_edge_usd: ${Math.round(input.tradesPerWeek * (input.trades ? input.netPnl / input.trades : 0))}
scorecard_verdict: "${(input.scorecardVerdict ?? "hold").replace(/"/g, '\\"')}"
composite_score: ${input.compositeScore ?? "null"}
firm: "${input.firm.replace(/"/g, '\\"')}"
mc_pass_pct: ${passPct}
mc_bust_pct: ${bustPct}
mc_payout_pct: ${payoutPct}
mc_sims: ${input.sims}
weeks_to_pass_p50: ${eco.weeksToPassP50 ?? "null"}
weeks_to_payout_p50: ${eco.weeksToPayoutP50 ?? "null"}
expected_accounts: ${Number.isFinite(eco.expectedAccounts) ? eco.expectedAccounts : "null"}
tags: [cohort, ${input.strategyFamily}, ${input.phase}, monte-carlo, lab]
created: "${new Date().toISOString()}"
dataset: "${input.datasetName.replace(/"/g, '\\"')}"
mc_max_trades: ${input.maxTrades}
payout_buffer: ${input.payoutBuffer}
mc_engine_version: ${input.mcEngineVersion ?? MC_ENGINE_VERSION}
mc_rule_pack: ${JSON.stringify(input.mcRulePack ?? [])}
${firmMcLine}${tradePnlsLine}${tradeDatesLine}${enrichYaml}${cycleYaml}---`;

  const enr = input.enrichment;
  const enrichSection = enr
    ? `
## Premium trade stats (from CSV)

| Metric | Value |
|--------|-------|
| Enrichment coverage | ${enr.coveragePct}% (${enr.enrichedN}/${enr.n}) |
| Avg / median duration | ${enr.avgDurationBars ?? "—"} / ${enr.medianDurationBars ?? "—"} bars |
| Same-bar exits (0 bars) | ${enr.duration0Pct != null ? `${enr.duration0Pct}%` : "—"} |
| Avg MFE / MAE | $${enr.avgMfeUsd ?? "—"} / $${enr.avgMaeUsd ?? "—"} |
| Median loser MAE | $${enr.medianLoserMaeUsd ?? "—"} |
| BE-scratch candidates | ${enr.beScratchCandidates ?? "—"} (|PnL|<$50 & MFE≥$200) |
| Winner give-back (MFE≥2×PnL) | ${enr.winnerGivebackN ?? "—"} |
| Avg contracts | ${enr.avgQty ?? "—"} |

_MC still uses shuffled PnL — these fields are for management / frequency diagnosis._
`
    : "";

  const body = `
# ${input.variant}

> Lab cohort · ${input.firm} · ${input.span}
> Pine ${input.strategyVersion} · preset \`${input.strategyPreset}\`

## Strategy under test

| Field | Value |
|-------|-------|
| Variant | ${input.variant} |
| Family | ${input.strategyFamily} |
| Phase | ${input.phase} |
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
${enrichSection}
## Business loop (pass → payout → recycle)

| Metric | Value |
|--------|-------|
| **E[$ / calendar week]** | **$${cycleMetrics.expectedUsdPerCalendarWeek ?? "—"}** |
| E[$ / account] after fees | $${cycleMetrics.expectedNetPerAccountUsd} |
| Pass → P(payout given pass) | ${passPct}% → ${cycleMetrics.payoutGivenPassPct ?? "—"}% |
| Median trader withdraw | $${cycleMetrics.medianWithdrawnUsd} |
| Median weeks to payout | ${eco.weeksToPayoutP50 ?? "—"} |
| Bust rate | ${bustPct}% |
| Expected accounts | ${Number.isFinite(eco.expectedAccounts) ? eco.expectedAccounts : "∞"} |

_Raw ledger weekly edge (expectancy×tr/wk, not fee-aware): $${Math.round(input.tradesPerWeek * (input.trades ? input.netPnl / input.trades : 0)).toLocaleString()}/wk_

## Monte Carlo (${input.firm})

| Metric | Value |
|--------|-------|
| Pass rate | ${passPct}% |
| Bust rate | ${bustPct}% |
| Payout rate | ${payoutPct}% |
| Median weeks to pass | ${eco.weeksToPassP50 ?? "—"} |
| Median weeks to payout | ${eco.weeksToPayoutP50 ?? "—"} |
| Scorecard vs control | ${input.scorecardVerdict ?? "—"} (composite ${input.compositeScore ?? "—"}) |
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

${cohortWikiLinks(input.strategyFamily)}
- [[strategy-dev/prop-firm-math]]
- [[strategy-dev/roadmap]]
`;

  return frontmatter + body;
}

export function parseCohortMeta(content: string, filename: string, relativePath?: string): CohortRecord | null {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = m[1];
  const get = (key: string) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return line?.[1]?.replace(/^"|"$/g, "") ?? "";
  };
  const regimes = fm.match(/^regimes:\s*\[(.*)\]/m)?.[1]?.split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean) ?? [];
  const preset = get("strategy_preset");
  const family = get("strategy_family") || inferFamilyFromPreset(preset);

  let firmMc: Record<string, CohortFirmMcEntry> | undefined;
  const firmMcRaw = get("firm_mc");
  if (firmMcRaw) {
    try {
      const parsed = JSON.parse(firmMcRaw) as Record<string, CohortFirmMcEntry>;
      const refPass = normalizeMcPct(parseFloat(get("mc_pass_pct")) || 0);
      const refPayout = normalizeMcPct(parseFloat(get("mc_payout_pct")) || 0, refPass);
      firmMc = {};
      for (const [k, v] of Object.entries(parsed)) {
        firmMc[k] = {
          ...v,
          passPct: normalizeMcPct(v.passPct, refPass),
          bustPct: normalizeMcPct(v.bustPct, normalizeMcPct(parseFloat(get("mc_bust_pct")) || 0, refPass)),
          payoutPct: normalizeMcPct(v.payoutPct, refPayout),
          recyclePct:
            v.recyclePct != null ? normalizeMcPct(v.recyclePct, refPayout) : undefined,
        };
      }
    } catch {
      firmMc = undefined;
    }
  }

  let tradePnls: number[] | undefined;
  let tradeDates: string[] | undefined;
  const pnlsRaw = get("trade_pnls");
  const datesRaw = get("trade_dates");
  if (pnlsRaw) {
    try {
      tradePnls = JSON.parse(pnlsRaw) as number[];
    } catch {
      tradePnls = undefined;
    }
  }
  if (datesRaw) {
    try {
      tradeDates = JSON.parse(datesRaw) as string[];
    } catch {
      tradeDates = undefined;
    }
  }

  const mcSims = parseInt(get("mc_sims"), 10) || undefined;
  const mcMaxTrades = parseInt(get("mc_max_trades"), 10) || undefined;
  const payoutBuffer = parseInt(get("payout_buffer"), 10) || undefined;
  let mcRulePack: string[] | undefined;
  const rulePackRaw = get("mc_rule_pack");
  if (rulePackRaw) {
    try {
      mcRulePack = JSON.parse(rulePackRaw) as string[];
    } catch {
      mcRulePack = undefined;
    }
  }
  const mcEngineVersion = parseInt(get("mc_engine_version"), 10) || undefined;

  return {
    id: filename.replace(/\.md$/, ""),
    filename,
    relativePath: relativePath ?? filename,
    variant: get("variant"),
    strategyPreset: preset,
    strategyFamily: family,
    phase: get("phase") || "research",
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
    tradesPerWeek: parseFloat(get("trades_per_week")) || 0,
    weeklyEdgeUsd: parseFloat(get("weekly_edge_usd")) || 0,
    scorecardVerdict: get("scorecard_verdict") || "",
    compositeScore: parseFloat(get("composite_score")) || 0,
    mcPassPct: normalizeMcPct(parseFloat(get("mc_pass_pct")) || 0),
    mcBustPct: normalizeMcPct(parseFloat(get("mc_bust_pct")) || 0),
    mcPayoutPct: normalizeMcPct(parseFloat(get("mc_payout_pct")) || 0),
    weeksToPassP50: parseFloat(get("weeks_to_pass_p50")) || null,
    weeksToPayoutP50: parseFloat(get("weeks_to_payout_p50")) || null,
    expectedAccounts: parseFloat(get("expected_accounts")) || 0,
    firmMc,
    tradePnls,
    tradeDates,
    mcSims,
    mcMaxTrades,
    payoutBuffer,
    mcEngineVersion,
    mcRulePack,
  };
}
