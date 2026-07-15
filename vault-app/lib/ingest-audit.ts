import type { ParsedTrade } from "./csv";

export type IngestAuditSeverity = "ok" | "warn" | "block";

export type IngestAuditFinding = {
  id: string;
  severity: IngestAuditSeverity;
  message: string;
};

export type IngestAuditReport = {
  n: number;
  span: string;
  maxGapDays: number | null;
  gapCount: number;
  enrichmentCoveragePct: number;
  duplicateDateHits: number;
  unsorted: boolean;
  severity: IngestAuditSeverity;
  findings: IngestAuditFinding[];
  canRunMc: boolean;
};

function dayMs(d: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}/.test(d)) return null;
  const t = Date.parse(`${d.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(t) ? t : null;
}

/**
 * Upstream data audit before Lab RUN — catches gaps / thin enrichment early
 * (quant-dev “data audit” translated to TV CSV ingest).
 */
export function auditLabIngest(opts: {
  trades: number[];
  dates: string[];
  parsed?: ParsedTrade[];
  /** Calendar gap (days) above this → warn. */
  gapWarnDays?: number;
  /** Gap above this → block. */
  gapBlockDays?: number;
  /** Enrichment coverage below this % → warn (when parsed present). */
  enrichmentWarnPct?: number;
}): IngestAuditReport {
  const gapWarn = opts.gapWarnDays ?? 45;
  const gapBlock = opts.gapBlockDays ?? 120;
  const enrichWarn = opts.enrichmentWarnPct ?? 40;
  const { trades, dates } = opts;
  const findings: IngestAuditFinding[] = [];

  if (trades.length === 0) {
    return {
      n: 0,
      span: "—",
      maxGapDays: null,
      gapCount: 0,
      enrichmentCoveragePct: 0,
      duplicateDateHits: 0,
      unsorted: false,
      severity: "block",
      findings: [{ id: "empty", severity: "block", message: "No trades — upload a TV export." }],
      canRunMc: false,
    };
  }

  if (trades.length !== dates.length) {
    findings.push({
      id: "len_mismatch",
      severity: "block",
      message: `trades(${trades.length}) ≠ dates(${dates.length}) — corrupt parse.`,
    });
  }

  let unsorted = false;
  for (let i = 1; i < dates.length; i++) {
    if ((dates[i] ?? "") < (dates[i - 1] ?? "")) {
      unsorted = true;
      break;
    }
  }
  if (unsorted) {
    findings.push({
      id: "unsorted",
      severity: "warn",
      message: "Dates are not sorted ascending — review export merge order.",
    });
  }

  const sortedDates = [...dates].filter(Boolean).sort();
  const span =
    sortedDates.length >= 2
      ? `${sortedDates[0]} → ${sortedDates[sortedDates.length - 1]}`
      : sortedDates[0] ?? "—";

  let maxGapDays: number | null = null;
  let gapCount = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const a = dayMs(sortedDates[i - 1]!);
    const b = dayMs(sortedDates[i]!);
    if (a == null || b == null) continue;
    const gap = Math.round((b - a) / 86_400_000);
    if (gap > gapWarn) {
      gapCount++;
      if (maxGapDays == null || gap > maxGapDays) maxGapDays = gap;
    }
  }
  if (maxGapDays != null && maxGapDays >= gapBlock) {
    findings.push({
      id: "gap_block",
      severity: "block",
      message: `Largest calendar gap ${maxGapDays}d ≥ ${gapBlock}d — likely missing years or bad merge.`,
    });
  } else if (maxGapDays != null && maxGapDays >= gapWarn) {
    findings.push({
      id: "gap_warn",
      severity: "warn",
      message: `Largest calendar gap ${maxGapDays}d (${gapCount} gaps ≥${gapWarn}d) — confirm intentional stand-downs.`,
    });
  }

  const dateHits = new Map<string, number>();
  for (const d of dates) {
    if (!d) continue;
    dateHits.set(d, (dateHits.get(d) ?? 0) + 1);
  }
  let duplicateDateHits = 0;
  for (const n of dateHits.values()) {
    if (n > 3) duplicateDateHits += n - 3;
  }
  if (duplicateDateHits > 20) {
    findings.push({
      id: "dup_dates",
      severity: "warn",
      message: `Many same-day fills (${duplicateDateHits} excess) — check for double-export.`,
    });
  }

  let enrichmentCoveragePct = 0;
  if (opts.parsed && opts.parsed.length > 0) {
    const enriched = opts.parsed.filter(
      (t) =>
        t.mfeUsd != null ||
        t.maeUsd != null ||
        t.durationBars != null ||
        t.entryDatetime != null
    ).length;
    enrichmentCoveragePct = Math.round((enriched / opts.parsed.length) * 1000) / 10;
    if (enrichmentCoveragePct < enrichWarn) {
      findings.push({
        id: "enrich_thin",
        severity: "warn",
        message: `Enrichment coverage ${enrichmentCoveragePct}% < ${enrichWarn}% — Co-Pilot correlations / MFE autopsy weakened.`,
      });
    }
  } else {
    findings.push({
      id: "enrich_missing",
      severity: "warn",
      message: "Bare date+pnl ledger — re-export Premium columns when possible.",
    });
  }

  if (trades.length < 30) {
    findings.push({
      id: "thin_n",
      severity: "warn",
      message: `Only n=${trades.length} trades — MC noise high; prefer ≥~80 for settle.`,
    });
  }

  const finiteBad = trades.filter((x) => !Number.isFinite(x)).length;
  if (finiteBad > 0) {
    findings.push({
      id: "nan_pnl",
      severity: "block",
      message: `${finiteBad} non-finite PnL values.`,
    });
  }

  let severity: IngestAuditSeverity = "ok";
  if (findings.some((f) => f.severity === "block")) severity = "block";
  else if (findings.some((f) => f.severity === "warn")) severity = "warn";

  if (severity === "ok") {
    findings.push({
      id: "ok",
      severity: "ok",
      message: `Ingest OK · n=${trades.length} · ${span}`,
    });
  }

  return {
    n: trades.length,
    span,
    maxGapDays,
    gapCount,
    enrichmentCoveragePct,
    duplicateDateHits,
    unsorted,
    severity,
    findings,
    canRunMc: severity !== "block",
  };
}
