"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useLocal, fmtUsd } from "@/lib/store";
import { runMonteCarlo, McResult } from "@/lib/monte-carlo";
import { mergeTvCsvs, parseTvCsv, tradesPerWeek } from "@/lib/csv";
import { ALL_SEED_TRADES, TRADES_DEC_MAR, TRADES_APR_JUL } from "@/lib/prb-data";
import { TRADES_YTD_FULL, TRADES_YTD_MAY17 } from "@/lib/prb-ytd-data";
import { TRADES_BE2R_PDH_12MO } from "@/lib/prb-be2r-data";
import { TRADES_YTD_CHUNKS_3039 } from "@/lib/prb-chunks-3039-data";
import { PROP_RULES, ruleById } from "@/lib/prop-firms";
import { PropRule } from "@/lib/types";
import { buildEquityCurve, EquityStats } from "@/lib/equity-curve";
import { CohortSaveInput, mcToSummary, McSummary, CohortRecord } from "@/lib/cohort";
import { analyzeEvalConsistency, EvalConsistencyReport } from "@/lib/eval-consistency";
import {
  analyzeGhostAutopsy,
  parseGhostAutopsyPaste,
  GHOST_PASTE_TEMPLATE,
  MACRO_GHOST_PASTE_TEMPLATE,
  GhostAutopsyReport,
} from "@/lib/ghost-autopsy";
import {
  CHART_FINDINGS,
  VERIFIED_BASELINE,
  analyzeBeRetest,
} from "@/lib/lab-findings";

interface Dataset {
  id: string;
  name: string;
  /** User label for A/B compares — e.g. "2025–26 BE" vs "2025–26 Trail" */
  label?: string;
  trades: number[];
  dates: string[];
  sources: string[];
  deduped?: number;
}

interface DateFilter {
  from: string;
  to: string;
}

function suggestDatasetLabel(dates: string[]): string {
  if (dates.length < 2) return "";
  const a = dates[0].slice(0, 7);
  const b = dates[dates.length - 1].slice(0, 7);
  const y0 = dates[0].slice(2, 4);
  const y1 = dates[dates.length - 1].slice(2, 4);
  if (y0 !== y1) return `${y0}–${y1}`;
  return a === b ? a : `${a}–${b}`;
}

function shortVariantName(variant: string): string {
  return variant.replace(/^PRB v[\d.]+ — /, "").replace(/ \(live locked\)/, "");
}

function suggestDatasetName(dates: string[], variant: string): string {
  const span = suggestDatasetLabel(dates);
  const short = shortVariantName(variant);
  return span ? `${span} · ${short}` : short;
}

function datasetDisplayName(d: Dataset, aliases?: Record<string, string>): string {
  const alias = aliases?.[d.id]?.trim();
  if (alias) return alias;
  if (d.label?.trim()) return d.label.trim();
  return d.name;
}

function datasetBounds(dates: string[]): { min: string; max: string } {
  const sorted = dates.filter(Boolean).sort();
  return { min: sorted[0] ?? "", max: sorted[sorted.length - 1] ?? "" };
}

function filterTradesByDate(
  trades: number[],
  dates: string[],
  from: string,
  to: string
): { trades: number[]; dates: string[] } {
  if (!from && !to) return { trades, dates };
  const outT: number[] = [];
  const outD: string[] = [];
  for (let i = 0; i < trades.length; i++) {
    const d = dates[i] ?? "";
    if (!d) continue;
    if (from && d < from) continue;
    if (to && d > to) continue;
    outT.push(trades[i]);
    outD.push(d);
  }
  return { trades: outT, dates: outD };
}

function applyDateFilter(ds: Dataset, filter?: DateFilter): Dataset {
  const from = filter?.from ?? "";
  const to = filter?.to ?? "";
  if (!from && !to) return ds;
  const { trades, dates } = filterTradesByDate(ds.trades, ds.dates, from, to);
  return { ...ds, trades, dates };
}

function datasetOptionSub(d: Dataset): string {
  const span =
    d.dates.length >= 2 ? `${d.dates[0].slice(0, 7)}→${d.dates[d.dates.length - 1].slice(0, 7)}` : "";
  return `${d.trades.length} tr${span ? ` · ${span}` : ""}`;
}

function downloadCohortMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CollapsiblePanel({
  title,
  sub,
  badge,
  defaultOpen = false,
  className,
  children,
}: {
  title: string;
  sub?: string;
  badge?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <details className={"panel" + (className ? ` ${className}` : "")} open={defaultOpen || undefined}>
      <summary className="panel-title">
        {title}
        {sub && <span className="sub">{sub}</span>}
        {badge && <span className="summary-badge">{badge}</span>}
      </summary>
      <div className="panel-body">{children}</div>
    </details>
  );
}

function isRecommendedSeed(d: Dataset): boolean {
  return d.name.includes("★");
}

const SEED_SETS: Dataset[] = [
  {
    id: "be2r-pdh-12mo",
    name: "PRB v1.5 — BE@2R + Auto PDH/PDL (69 trades) ★",
    label: "PRB BE@2R PDH Jul14 — 12mo",
    trades: TRADES_BE2R_PDH_12MO.map((t) => t.pnl),
    dates: TRADES_BE2R_PDH_12MO.map((t) => t.date),
    sources: ["Jul 14 TV exports · same 12mo windows · fewer fills (BE@2R + PDH/PDL filter)"],
  },
  {
    id: "ytd-chunks-3039",
    name: "PRB v1 — YTD chunks 30–39 (96 trades) ★",
    label: "PRB YTD chunks 30-39",
    trades: TRADES_YTD_CHUNKS_3039.map((t) => t.pnl),
    dates: TRADES_YTD_CHUNKS_3039.map((t) => t.date),
    sources: ["Downloads chunks 30-39 · sequential windows"],
  },
  {
    id: "ytd-full",
    name: "PRB v1 — YTD merged from TV exports (108 trades)",
    label: "PRB YTD Jul 14 — 1/day dedupe",
    trades: TRADES_YTD_FULL.map((t) => t.pnl),
    dates: TRADES_YTD_FULL.map((t) => t.date),
    sources: ["Downloads 40 CSVs · vault data/tv-exports"],
  },
  {
    id: "ytd-may17",
    name: "PRB v1 — May 17 2025+ (85 trades)",
    label: "PRB May17+ Jul 14",
    trades: TRADES_YTD_MAY17.map((t) => t.pnl),
    dates: TRADES_YTD_MAY17.map((t) => t.date),
    sources: ["Downloads 40 CSVs · May 17 subset"],
  },
  {
    id: "all",
    name: "PRB v1 — full record Dec 25–Jul 26 (37 trades)",
    trades: ALL_SEED_TRADES.map((t) => t.pnl),
    dates: ALL_SEED_TRADES.map((t) => t.date),
    sources: ["prb-data seed"],
  },
  {
    id: "decmar",
    name: "PRB v1 — Dec–Mar control (23 trades)",
    trades: TRADES_DEC_MAR.map((t) => t.pnl),
    dates: TRADES_DEC_MAR.map((t) => t.date),
    sources: ["prb-data seed"],
  },
  {
    id: "aprjul",
    name: "PRB v1 — Apr–Jul merged (14 trades)",
    trades: TRADES_APR_JUL.map((t) => t.pnl),
    dates: TRADES_APR_JUL.map((t) => t.date),
    sources: ["prb-data seed"],
  },
];

import { LabScorecardPanel } from "@/components/lab-scorecard-panel";
import {
  buildLabRunKey,
  isLabRunCohortSaved,
  loadLabRunCache,
  markLabRunCohortSaved,
  saveLabRunCache,
} from "@/lib/lab-run-cache";
import {
  buildScorecardMetrics,
  compareToBenchmark,
  mcPassRateSecondHalf,
  cohortToScorecardMetrics,
  type ScorecardRunEntry,
  type LabScorecardMetrics,
  type ScorecardComparison,
} from "@/lib/lab-scorecard";
import {
  DEFAULT_STUDY,
  LabStudy,
  REGIME_PRESETS,
  STRATEGY_PRESETS,
  presetById,
  studyReady,
  studyVariantName,
} from "@/lib/lab-profile";

function EquityCurveChart({
  curve,
  passAt,
  trailingDd,
}: {
  curve: EquityStats;
  passAt: number;
  trailingDd: number;
}) {
  const W = 920;
  const H = 300;
  const PAD_L = 56;
  const PAD_B = 44;
  const PAD_T = 20;
  const PAD_R = 16;
  const pts = curve.points;
  if (pts.length === 0) return null;

  const cumVals = pts.map((p) => p.cum);
  const all = [...cumVals, 0, passAt, -trailingDd];
  const yMin = Math.min(...all) * 1.1;
  const yMax = Math.max(...all) * 1.1;
  const n = pts.length;
  const x = (i: number) => PAD_L + (i / Math.max(n - 1, 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.cum).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  const labelIdx = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: "#000", border: "1px solid var(--border)" }}>
      <text x={PAD_L} y={16} fill="#00ff41" fontSize={11} fontFamily="monospace" letterSpacing={2}>
        ACTUAL REPLAY EQUITY
      </text>
      <path d={area} fill="rgba(0,255,65,0.07)" />
      <path d={line} stroke="#00ff41" strokeWidth={2} fill="none" />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(p.cum)}
          r={p.pnl > 50 ? 3.5 : p.pnl < -50 ? 3.5 : 2}
          fill={p.pnl > 50 ? "#00ff41" : p.pnl < -50 ? "#ff3355" : "#6a6a6a"}
          opacity={0.9}
        />
      ))}
      {[
        { v: 0, label: "$0", color: "#555" },
        { v: passAt, label: `PASS ${passAt >= 1000 ? `$${(passAt / 1000).toFixed(0)}k` : passAt}`, color: "#39ffba" },
        { v: -trailingDd, label: "-DD", color: "#ff3355" },
      ].map((g) => (
        <g key={g.label}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(g.v)} y2={y(g.v)} stroke={g.color} strokeDasharray="4 4" strokeWidth={1} />
          <text x={4} y={y(g.v) + 4} fill={g.color} fontSize={10} fontFamily="monospace">{g.label}</text>
        </g>
      ))}
      {labelIdx.map((i) => (
        <text key={i} x={x(i)} y={H - 6} fill="#9a9a9a" fontSize={9} textAnchor="middle" fontFamily="monospace">
          {pts[i]?.date?.slice(5) || `#${i + 1}`}
        </text>
      ))}
      <text x={W - PAD_R} y={PAD_T + 4} fill="#9a9a9a" fontSize={10} textAnchor="end" fontFamily="monospace">
        ● green win · ● red loss · ● gray scratch — actual replay equity
      </text>
    </svg>
  );
}

const PATH_STYLE: Record<string, { stroke: string; opacity: number }> = {
  payout: { stroke: "#39ffba", opacity: 0.35 },
  pass: { stroke: "#00ff41", opacity: 0.22 },
  "cons-block": { stroke: "#ffb347", opacity: 0.25 },
  bust: { stroke: "#ff3355", opacity: 0.28 },
  open: { stroke: "#7a8a7a", opacity: 0.14 },
};

function FanChart({
  res,
  passAt,
  payoutAt,
  dd,
  tradesPerWeek: tpw,
}: {
  res: McResult;
  passAt: number;
  payoutAt: number;
  dd: number;
  tradesPerWeek: number;
}) {
  const W = 920;
  const H = 440;
  const PAD_L = 58;
  const PAD_B = 72;
  const PAD_T = 28;
  const PAD_R = 16;
  const HIST_H = 48;
  const n = res.bands?.p50?.length ?? 0;
  if (n === 0) return null;

  const finals = res.finalEquities ?? [];
  const chartH = H - PAD_B - PAD_T - HIST_H;
  const all = [...(res.bands?.p05 ?? []), ...(res.bands?.p95 ?? []), ...finals, passAt, payoutAt, -dd];
  const yMin = Math.min(...all) * 1.12;
  const yMax = Math.max(...all) * 1.12;
  const x = (i: number) => PAD_L + (i / Math.max(n - 1, 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * chartH;
  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = (lo: number[], hi: number[]) =>
    path(hi) +
    " " +
    lo.map((v, i) => `L${x(lo.length - 1 - i).toFixed(1)},${y(lo[lo.length - 1 - i]).toFixed(1)}`).join(" ") +
    " Z";

  // Terminal histogram of final equity
  const buckets = 24;
  const fMin = finals.length ? Math.min(...finals) : 0;
  const fMax = finals.length ? Math.max(...finals) : 0;
  const fRange = fMax - fMin || 1;
  const counts = Array.from({ length: buckets }, () => 0);
  for (const v of finals) {
    const b = Math.min(buckets - 1, Math.max(0, Math.floor(((v - fMin) / fRange) * buckets)));
    counts[b]++;
  }
  const maxC = Math.max(...counts, 1);
  const histY = H - PAD_B + 8;
  const histW = W - PAD_L - PAD_R;
  const bucketW = histW / buckets;

  const xLabels = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: "#000", border: "1px solid var(--border)" }}>
      <defs>
        <linearGradient id="mcFanOuter" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#39ffba" stopOpacity={0.03} />
          <stop offset="50%" stopColor="#39ffba" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#39ffba" stopOpacity={0.03} />
        </linearGradient>
        <linearGradient id="mcFanInner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00ff41" stopOpacity={0.05} />
          <stop offset="50%" stopColor="#00ff41" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#00ff41" stopOpacity={0.05} />
        </linearGradient>
      </defs>

      <text x={PAD_L} y={16} fill="#39ffba" fontSize={11} fontFamily="monospace" letterSpacing={2}>
        MONTE CARLO — {(res.samplePaths ?? []).length} paths shown · {res.sims.toLocaleString()} total sims
      </text>

      {/* Spaghetti paths — classic MC look */}
      {(res.samplePaths ?? []).map((sp, i) => {
        const st = PATH_STYLE[sp.outcome];
        return (
          <path
            key={i}
            d={path(sp.equity.slice(0, n))}
            stroke={st.stroke}
            strokeWidth={0.7}
            fill="none"
            opacity={st.opacity}
          />
        );
      })}

      {/* Confidence cones */}
      <path d={area(res.bands.p05, res.bands.p95)} fill="url(#mcFanOuter)" stroke="none" />
      <path d={area(res.bands.p25, res.bands.p75)} fill="url(#mcFanInner)" stroke="none" />
      <path d={path(res.bands.p05)} stroke="#39ffba" strokeWidth={0.6} fill="none" opacity={0.35} strokeDasharray="3 3" />
      <path d={path(res.bands.p95)} stroke="#39ffba" strokeWidth={0.6} fill="none" opacity={0.35} strokeDasharray="3 3" />
      <path d={path(res.bands.p25)} stroke="#00ff41" strokeWidth={0.8} fill="none" opacity={0.45} />
      <path d={path(res.bands.p75)} stroke="#00ff41" strokeWidth={0.8} fill="none" opacity={0.45} />
      <path d={path(res.bands.p50)} stroke="#e8e8e8" strokeWidth={2.5} fill="none" />

      {/* Start anchor */}
      <circle cx={x(0)} cy={y(0)} r={4} fill="#00ff41" opacity={0.9} />

      {[
        { v: 0, label: "$0", color: "#555", dash: "" },
        { v: passAt, label: "PASS", color: "#00ff41", dash: "6 4" },
        { v: payoutAt, label: "PAYOUT", color: "#39ffba", dash: "6 4" },
        { v: -dd, label: "-DD", color: "#ff3355", dash: "6 4" },
      ].map((g) => (
        <g key={g.label}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={y(g.v)}
            y2={y(g.v)}
            stroke={g.color}
            strokeDasharray={g.dash}
            strokeWidth={1}
            opacity={0.85}
          />
          <text x={4} y={y(g.v) + 4} fill={g.color} fontSize={10} fontFamily="monospace">
            {g.label}
          </text>
        </g>
      ))}

      {xLabels.map((i) => (
        <g key={i}>
          <text x={x(i)} y={H - HIST_H - 18} fill="#9a9a9a" fontSize={10} textAnchor="middle" fontFamily="monospace">
            {i} trades
          </text>
          <text x={x(i)} y={H - HIST_H - 6} fill="#6a6a6a" fontSize={9} textAnchor="middle" fontFamily="monospace">
            ~{Math.round((i / tpw) * 10) / 10} wks
          </text>
        </g>
      ))}

      {/* Terminal outcome histogram */}
      <text x={PAD_L} y={histY - 2} fill="#6a6a6a" fontSize={9} fontFamily="monospace">
        FINAL EQUITY DISTRIBUTION
      </text>
      {counts.map((c, i) => {
        const bh = (c / maxC) * (HIST_H - 14);
        const bx = PAD_L + i * bucketW;
        const midVal = fMin + ((i + 0.5) / buckets) * fRange;
        const fill = midVal >= payoutAt ? "#39ffba" : midVal >= passAt ? "#00ff41" : midVal <= -dd ? "#ff3355" : "#555";
        return (
          <rect
            key={i}
            x={bx + 1}
            y={histY + HIST_H - 12 - bh}
            width={bucketW - 2}
            height={Math.max(bh, 1)}
            fill={fill}
            opacity={0.65}
          />
        );
      })}

      <text x={W - PAD_R} y={PAD_T + 6} fill="#6a6a6a" fontSize={9} textAnchor="end" fontFamily="monospace">
        cyan/green/red paths = payout / pass / bust · cone = 5–95% band
      </text>
    </svg>
  );
}

function OutcomeChart({ hist, sims }: { hist: McResult["outcomeHist"]; sims: number }) {
  const rows = hist ?? [];
  if (rows.length === 0) return null;
  const W = 260;
  const H = 200;
  const max = Math.max(...rows.map((h) => h.count), 1);
  const barH = 36;
  const gap = 14;
  const startY = 24;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: "#000", border: "1px solid var(--border)" }}>
      <text x={W / 2} y={14} fill="#9a9a9a" fontSize={10} textAnchor="middle" fontFamily="monospace" letterSpacing={1}>
        OUTCOME DISTRIBUTION
      </text>
      {rows.map((h, i) => {
        const bw = (h.count / max) * (W - 80);
        const y = startY + i * (barH + gap);
        const pct = ((h.count / sims) * 100).toFixed(1);
        return (
          <g key={h.label}>
            <text x={4} y={y + 22} fill={h.color} fontSize={11} fontFamily="monospace">
              {h.label}
            </text>
            <rect x={56} y={y + 6} width={Math.max(bw, 2)} height={barH - 12} fill={h.color} opacity={0.75} />
            <text x={W - 4} y={y + 22} fill="#e8e8e8" fontSize={11} textAnchor="end" fontFamily="monospace">
              {pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function FirmRulesCard({ rule }: { rule: PropRule }) {
  return (
    <div className="firm-card">
      <div className="firm-card-head">
        <span className="accent">{rule.name}</span>
        {!rule.verified && <span className="chip warn-chip">verify fees</span>}
      </div>
      <div className="kv mt">
        <span className="k">Profit target</span><span>{fmtUsd(rule.profitTarget)}</span>
        <span className="k">MC pass line</span>
        <span className="accent">
          {fmtUsd(rule.passAt)}
          {rule.passAt > rule.profitTarget && (
            <span className="subtext small"> (+{fmtUsd(rule.passAt - rule.profitTarget)} buffer)</span>
          )}
        </span>
        <span className="k">Trailing DD</span>
        <span>{fmtUsd(rule.trailingDD)} · {rule.ddMode.toUpperCase()}</span>
        {rule.dailyLossLimit != null && (
          <>
            <span className="k">Daily loss limit</span><span>{fmtUsd(rule.dailyLossLimit)}</span>
          </>
        )}
        <span className="k">Min days</span><span>{rule.minDays > 0 ? rule.minDays : "none"}</span>
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
      <p className="small dim" style={{ marginTop: 4 }}>Source: {rule.source}</p>
    </div>
  );
}

function EvalConsistencyCard({
  report,
  winCapUsd,
  onWinCapChange,
}: {
  report: EvalConsistencyReport;
  winCapUsd: number;
  onWinCapChange: (n: number) => void;
}) {
  if (!report.applicable) {
    return (
      <p className="small dim">Selected firm has no eval consistency rule — checker not applicable.</p>
    );
  }

  const statusClass = report.passRequestReady
    ? "pos"
    : report.blockedAtTarget
      ? "neg"
      : "warn";

  return (
    <>
      <div className="stat-strip" style={{ marginBottom: 12 }}>
        <div className="stat">
          <div className="k">Pass request</div>
          <div className={`v ${statusClass}`}>{report.passRequestReady ? "READY" : "NOT YET"}</div>
          <div className="d">
            {fmtUsd(report.totalPnl, true)} / {fmtUsd(report.passAt)} line
          </div>
        </div>
        <div className="stat">
          <div className="k">Best day %</div>
          <div className={`v ${report.bestDayPctOfTotal < report.consistencyPct ? "pos" : "neg"}`}>
            {report.bestDayPctOfTotal.toFixed(1)}%
          </div>
          <div className="d">
            need &lt; {report.consistencyPct}% · ${report.bestDayPnl.toFixed(0)} on {report.bestDayDate || "—"}
          </div>
        </div>
        <div className="stat">
          <div className="k">Trading days</div>
          <div className="v cyan">{report.tradingDays}</div>
          <div className="d">
            {report.winningDays} winning · min {report.minDays} required
          </div>
        </div>
        <div className="stat">
          <div className="k">Win cap flag</div>
          <div className="v">{report.oversizedWins.length}</div>
          <div className="d">days over ${winCapUsd} (eval risk)</div>
        </div>
      </div>

      <p className={`small ${statusClass}`}>{report.recommendation}</p>

      <div className="frm-row mt">
        <label className="fld">
          Eval win cap (flag trades above)
          <input
            type="number"
            value={winCapUsd}
            onChange={(e) => onWinCapChange(parseInt(e.target.value, 10) || 1490)}
            style={{ width: 100 }}
            title="Trades above this USD are flagged as consistency risks on eval"
          />
        </label>
        <span className="small dim" style={{ alignSelf: "flex-end", paddingBottom: 6 }}>
          Plan ~{report.minWinsNeeded}+ capped wins to reach ${report.passAt.toLocaleString()} pass line
        </span>
      </div>

      {report.oversizedWins.length > 0 && (
        <div className="mt">
          <div className="small accent" style={{ marginBottom: 6 }}>Oversized wins (eval consistency risk)</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th className="num">P&L</th>
                <th className="num">Over cap</th>
              </tr>
            </thead>
            <tbody>
              {report.oversizedWins.map((w) => (
                <tr key={w.date}>
                  <td>{w.date}</td>
                  <td className="num pos">{fmtUsd(w.pnl, true)}</td>
                  <td className="num neg">+{fmtUsd(w.pnl - w.capUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.daily.length > 0 && (
        <div className="mt">
          <div className="small dim" style={{ marginBottom: 6 }}>Daily path (chronological)</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th className="num">Day P&L</th>
                <th className="num">Cumulative</th>
                <th className="num">Best day %</th>
                <th>Pass OK?</th>
              </tr>
            </thead>
            <tbody>
              {report.daily.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td className={"num " + (d.pnl >= 0 ? "pos" : "neg")}>{fmtUsd(d.pnl, true)}</td>
                  <td className="num">{fmtUsd(d.cumulative, true)}</td>
                  <td className={"num " + (d.bestDayPct < report.consistencyPct ? "" : "neg")}>
                    {d.cumulative > 0 ? `${d.bestDayPct.toFixed(1)}%` : "—"}
                  </td>
                  <td className="small">{d.passRequestOk ? <span className="pos">✓</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.firstPassAtDate && (
        <p className="small dim mt">
          First crossed pass line on {report.firstPassAtDate}
          {report.firstPassAtOk ? " with consistency OK" : " but consistency still blocked"}.
        </p>
      )}
    </>
  );
}

function ChartFindingsCard() {
  const verdictClass = (v: string) =>
    v === "keep" ? "pos" : v === "reject" ? "neg" : v === "try" ? "cyan" : "warn";

  return (
    <>
      <p className="small dim" style={{ marginTop: 0, lineHeight: 1.6 }}>
        Verified baseline: {VERIFIED_BASELINE.trades} trades · {fmtUsd(VERIFIED_BASELINE.netUsd, true)} ·{" "}
        ~{VERIFIED_BASELINE.winRatePct}% WR · {VERIFIED_BASELINE.span}. Full graveyard lives in F3 Strategies.
      </p>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Verdict</th>
            <th>Finding</th>
          </tr>
        </thead>
        <tbody>
          {CHART_FINDINGS.map((f) => (
            <tr key={f.id}>
              <td className="small">{f.area}</td>
              <td className={"small " + verdictClass(f.verdict)}>{f.verdict.toUpperCase()}</td>
              <td className="small">{f.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function GhostAutopsyCard({
  report,
  paste,
  onPasteChange,
  onLoadTemplate,
  screenshotName,
  onScreenshot,
}: {
  report: GhostAutopsyReport;
  paste: string;
  onPasteChange: (v: string) => void;
  onLoadTemplate: () => void;
  screenshotName: string | null;
  onScreenshot: (file: File | null) => void;
}) {
  const beVerdict = report.beAudit ? analyzeBeRetest(report.beAudit) : null;

  return (
    <>
      <p className="small dim" style={{ marginTop: 0, lineHeight: 1.6 }}>
        {report.strategyKind === "macro" ? (
          <>
            Copy <b>MISSED (1 filter)</b> and <b>CONFLUENCE</b> tables from Macro Model v1 Pine (bottom-right + middle-right).
            Confluence rows show which TS/SMT combos worked on core setups — TS and SMT are optional per SOP.
          </>
        ) : (
          <>
            Copy the <b>MISSED (failed 1 filter)</b> table (bottom-right) and <b>BE +1R retest</b> table (bottom-center) from Pine.
            Paste both below — screenshot upload is for your reference only (no OCR yet).
          </>
        )}{" "}
        Green ghost rows = filters blocking net-positive trades; this panel maps them to Pine inputs to A/B.
      </p>
      <div className="frm-row">
        <label className="fld" style={{ flex: 1 }}>
          Screenshot (optional reference)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onScreenshot(e.target.files?.[0] ?? null)}
          />
        </label>
        {screenshotName && <span className="small dim">{screenshotName}</span>}
        <button type="button" className="chip" onClick={onLoadTemplate}>
          Load blank template
        </button>
      </div>
      <textarea
        value={paste}
        onChange={(e) => onPasteChange(e.target.value)}
        rows={8}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 12, marginTop: 8 }}
        placeholder="Paste MISSED filter rows + BE +1R retest block (Ghosts / Real fills / TOTAL)"
      />
      {report.beAudit && (
        <>
          <div className="small accent mt" style={{ marginBottom: 6 }}>BE +1R retest audit (paste bottom-center table)</div>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th className="num">Scratch</th>
                <th className="num">Missed 5R</th>
                <th className="num">Retest→win</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ghosts</td>
                <td className="num">{report.beAudit.ghostScratch}</td>
                <td className={"num " + (report.beAudit.ghostMissed5R > 0 ? "warn" : "")}>{report.beAudit.ghostMissed5R}</td>
                <td className="num pos">{report.beAudit.ghostRetestWin}</td>
              </tr>
              <tr>
                <td>Real fills</td>
                <td className="num">{report.beAudit.realScratch}</td>
                <td className={"num " + (report.beAudit.realMissed5R > 0 ? "warn" : "")}>{report.beAudit.realMissed5R}</td>
                <td className="num pos">{report.beAudit.realRetestWin}</td>
              </tr>
              <tr>
                <td><b>TOTAL</b></td>
                <td className="num">{report.beAudit.ghostScratch + report.beAudit.realScratch}</td>
                <td className="num warn">{report.beAudit.ghostMissed5R + report.beAudit.realMissed5R}</td>
                <td className="num pos">{report.beAudit.ghostRetestWin + report.beAudit.realRetestWin}</td>
              </tr>
            </tbody>
          </table>
          {beVerdict && (
            <p className={"small mt " + beVerdict.tone} style={{ lineHeight: 1.65 }}>
              <b>{beVerdict.headline}</b> — {beVerdict.detail}
            </p>
          )}
        </>
      )}
      {report.beAudit && (
        <div className="stat-strip mt">
          <div className="stat">
            <div className="k">BE scratches</div>
            <div className="v">{report.beAudit.ghostScratch + report.beAudit.realScratch}</div>
            <div className="d">
              ghost {report.beAudit.ghostScratch} · real {report.beAudit.realScratch}
            </div>
          </div>
          <div className="stat">
            <div className="k">Missed 5R (CF)</div>
            <div className={"v " + (report.beAudit.ghostMissed5R + report.beAudit.realMissed5R > 0 ? "warn" : "")}>
              {report.beAudit.ghostMissed5R + report.beAudit.realMissed5R}
            </div>
            <div className="d">would have won with orig stop</div>
          </div>
          <div className="stat">
            <div className="k">Retest → win</div>
            <div className="v pos">{report.beAudit.ghostRetestWin + report.beAudit.realRetestWin}</div>
            <div className="d">+1R then entry touch → 5R</div>
          </div>
        </div>
      )}
      {report.rows.length > 0 && (
        <>
          <div className="stat-strip mt">
            <div className="stat">
              <div className="k">Ghost setups</div>
              <div className="v">{report.totalN}</div>
              <div className="d">
                {report.totalWins}W / {report.totalLosses}L / {report.totalScratches}scr
              </div>
            </div>
            <div className="stat">
              <div className="k">Ghost net R</div>
              <div className={"v " + (report.totalNetR > 0 ? "pos" : "")}>{report.totalNetR.toFixed(1)}R</div>
              <div className="d">simulated near-misses</div>
            </div>
            <div className="stat">
              <div className="k">Relax candidates</div>
              <div className="v pos">{report.relaxCandidates.length}</div>
              <div className="d">n≥3 · wins≥2 · net R&gt;0</div>
            </div>
            <div className="stat">
              <div className="k">Keep strict</div>
              <div className="v">{report.keepStrict.length}</div>
              <div className="d">filters earning keep</div>
            </div>
          </div>
          <table className="mt">
            <thead>
              <tr>
                <th>Filter</th>
                <th className="num">n</th>
                <th className="num">W/L/scr</th>
                <th className="num">net R</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {report.rows
                .filter((r) => r.n > 0)
                .map((r) => {
                  const relax = report.relaxCandidates.some((c) => c.reason === r.reason);
                  const keep = report.keepStrict.some((c) => c.reason === r.reason);
                  const verdict = relax ? "A/B relax?" : keep ? "Keep" : r.netR > 0 ? "Watch" : "—";
                  const cls = relax ? "pos" : keep ? "dim" : r.netR > 0 ? "warn" : "";
                  return (
                    <tr key={r.reason}>
                      <td className="small">{r.reason}</td>
                      <td className="num">{r.n}</td>
                      <td className="num small">
                        {r.wins}/{r.losses}/{r.scratches}
                      </td>
                      <td className={"num " + (r.netR > 0 ? "pos" : "")}>{r.netR.toFixed(1)}</td>
                      <td className={"small " + cls}>{verdict}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <ul className="small mt" style={{ lineHeight: 1.65, paddingLeft: 18 }}>
            {report.recommendations.map((rec) => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
          {report.pineHints.length > 0 && (
            <div className="mt">
              <div className="small accent" style={{ marginBottom: 6 }}>Pine inputs to A/B (relax candidates only)</div>
              <table>
                <thead>
                  <tr>
                    <th>Filter</th>
                    <th>Pine input</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {report.pineHints.map((h) => (
                    <tr key={h.reason}>
                      <td className="small">{h.reason}</td>
                      <td className="small cyan">{h.input}</td>
                      <td className="small dim">{h.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

function buildDatasetFromParsed(
  id: string,
  name: string,
  parsed: ReturnType<typeof parseTvCsv>,
  sources: string[],
  deduped = 0,
  label?: string
): Dataset {
  const dates = parsed.map((t) => t.date);
  return {
    id,
    name,
    label: label ?? (id.startsWith("m") ? suggestDatasetLabel(dates) : undefined),
    trades: parsed.map((t) => t.pnl),
    dates,
    sources,
    deduped,
  };
}

export default function LabPage() {
  const [uploads, setUploads] = useLocal<Dataset[]>("vault.lab.datasets", []);
  const [dsId, setDsId, dsReady] = useLocal<string>("vault.lab.dsId", "be2r-pdh-12mo");
  const [datasetAliases, setDatasetAliases] = useLocal<Record<string, string>>("vault.lab.datasetAliases", {});
  const [dateFilters, setDateFilters] = useLocal<Record<string, DateFilter>>("vault.lab.dateFilters", {});
  const [ruleId, setRuleId, ruleReady] = useLocal<string>("vault.lab.ruleId", PROP_RULES[0].id);
  const [sims, setSims, simsReady] = useLocal<number>("vault.lab.sims", 2000);
  const [maxTrades, setMaxTrades, maxTradesReady] = useLocal<number>("vault.lab.maxTrades", 80);
  const [payoutBuffer, setPayoutBuffer, payoutReady] = useLocal<number>("vault.lab.payoutBuffer", 1000);
  const [res, setRes] = useState<McResult | null>(null);
  const [study, setStudy, studyHydrated] = useLocal<LabStudy>("vault.lab.study", DEFAULT_STUDY);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [saveMsg, setSaveMsg] = useState("");
  const [autoSave, setAutoSave] = useLocal<boolean>("vault.lab.autosave", true);
  const [winCapUsd, setWinCapUsd] = useLocal<number>("vault.lab.winCapUsd", 1490);
  const [ghostPaste, setGhostPaste] = useLocal<string>("vault.lab.ghostPaste", "");
  const [ghostScreenshot, setGhostScreenshot] = useState<string | null>(null);
  const [scorecardComparison, setScorecardComparison] = useState<ScorecardComparison | null>(null);
  const [scorecardHistory, setScorecardHistory] = useLocal<ScorecardRunEntry[]>("vault.lab.scorecardHistory", []);
  const [savedCohorts, setSavedCohorts] = useState<LabScorecardMetrics[]>([]);
  const mcResultsRef = useRef<HTMLDivElement>(null);

  const activePreset = presetById(study.presetId);
  const variantName = studyVariantName(study);

  const datasets = [...SEED_SETS, ...uploads];
  const safeDsId = typeof dsId === "string" ? dsId : SEED_SETS[0].id;
  const ds = datasets.find((d) => d.id === safeDsId) ?? SEED_SETS[0];
  const dateFilter = dateFilters[safeDsId] ?? { from: "", to: "" };
  const dsBounds = useMemo(() => datasetBounds(ds.dates), [ds.dates]);
  const activeDs = useMemo(() => applyDateFilter(ds, dateFilter), [ds, dateFilter]);
  const dateFilterActive = Boolean(dateFilter.from || dateFilter.to);
  const displayName = datasetDisplayName(ds, datasetAliases);
  const rule = ruleById(typeof ruleId === "string" ? ruleId : PROP_RULES[0].id) ?? PROP_RULES[0];
  const canRun = studyReady(study) && activeDs.trades.length > 0;
  const storageReady = dsReady && ruleReady && simsReady && maxTradesReady && payoutReady && studyHydrated;

  const runKey = useMemo(
    () =>
      buildLabRunKey({
        dsId: safeDsId,
        presetId: study.presetId,
        customLabel: study.customLabel,
        hypothesis: study.hypothesis,
        ruleId: typeof ruleId === "string" ? ruleId : PROP_RULES[0].id,
        sims: Number(sims) || 2000,
        maxTrades: Number(maxTrades) || 80,
        payoutBuffer: Number(payoutBuffer) || 1000,
        winCapUsd,
        dateFrom: dateFilter.from,
        dateTo: dateFilter.to,
      }),
    [safeDsId, study, ruleId, sims, maxTrades, payoutBuffer, winCapUsd, dateFilter]
  );

  const equity = useMemo(() => buildEquityCurve(activeDs.trades, activeDs.dates), [activeDs]);

  const consistency = useMemo(
    () => analyzeEvalConsistency(activeDs.trades, activeDs.dates, rule, { winCapUsd }),
    [activeDs, rule, winCapUsd]
  );

  const stats = useMemo(() => {
    const t = activeDs.trades;
    const wins = t.filter((x) => x > 50).length;
    const losses = t.filter((x) => x < -50).length;
    const net = t.reduce((s, x) => s + x, 0);
    const tpw = tradesPerWeek(activeDs.dates);
    const span =
      activeDs.dates.length >= 2
        ? `${activeDs.dates[0]} → ${activeDs.dates[activeDs.dates.length - 1]}`
        : "dates unknown";
    return {
      n: t.length,
      fullN: ds.trades.length,
      wins,
      losses,
      scr: t.length - wins - losses,
      net,
      avg: net / (t.length || 1),
      tpw: Math.round(tpw * 10) / 10,
      span,
      fullSpan:
        ds.dates.length >= 2 ? `${ds.dates[0]} → ${ds.dates[ds.dates.length - 1]}` : span,
    };
  }, [activeDs, ds]);

  const computeMcRun = useMemo(() => {
    return () => {
      const mcResult = runMonteCarlo({
        trades: activeDs.trades,
        dates: activeDs.dates,
        sims: Number(sims) || 2000,
        maxTrades: Number(maxTrades) || 80,
        passAt: rule.passAt,
        trailingDD: rule.trailingDD,
        fees: {
          evalFee: rule.evalFee ?? 0,
          activationFee: rule.activationFee ?? 0,
          monthlyFee: rule.monthlyFee ?? 0,
          payoutBuffer: Number(payoutBuffer) || 1000,
        },
        consistency:
          rule.consistencyPct > 0
            ? { consistencyPct: rule.consistencyPct, minDays: rule.minDays }
            : undefined,
        bootstrap: "week",
      });
      const secondHalfPass = mcPassRateSecondHalf(
        activeDs.trades,
        activeDs.dates,
        rule,
        Number(sims) || 2000,
        Number(maxTrades) || 80,
        Number(payoutBuffer) || 1000
      );
      const metrics = buildScorecardMetrics({
        id: `${study.presetId}-${safeDsId}`,
        label: variantName,
        dataset: displayName,
        span: stats.span,
        trades: activeDs.trades,
        dates: activeDs.dates,
        stats,
        mc: mcResult,
        consistency,
        secondHalfPassRatePct: secondHalfPass,
      });
      const comparison = compareToBenchmark(metrics);
      return { mcResult, comparison };
    };
  }, [activeDs, rule, sims, maxTrades, payoutBuffer, stats, consistency, study.presetId, safeDsId, variantName, displayName]);

  useEffect(() => {
    if (!storageReady) return;
    const cached = loadLabRunCache(runKey);
    if (!cached?.hasRun || !canRun) {
      setRes(null);
      setScorecardComparison(null);
      setSaveStatus("idle");
      setSaveMsg("");
      return;
    }
    try {
      const { mcResult, comparison } = computeMcRun();
      setRes(mcResult);
      setScorecardComparison(comparison);
      if (cached.cohortSaved) {
        setSaveStatus("ok");
        setSaveMsg(cached.saveMsg || "Cohort already saved for this dataset + variant");
      } else {
        setSaveStatus("idle");
        setSaveMsg("");
      }
    } catch {
      setRes(null);
      setScorecardComparison(null);
      setSaveStatus("idle");
      setSaveMsg("");
    }
  }, [runKey, storageReady, canRun, computeMcRun]);

  const ghostReport = useMemo(
    () => analyzeGhostAutopsy(parseGhostAutopsyPaste(ghostPaste), ghostPaste),
    [ghostPaste]
  );

  useEffect(() => {
    fetch("/api/cohorts")
      .then((r) => r.json())
      .then((data: { cohorts?: CohortRecord[] }) => {
        const rows = (data.cohorts ?? [])
          .map((c) => cohortToScorecardMetrics(c))
          .filter((x): x is LabScorecardMetrics => x != null);
        setSavedCohorts(rows);
      })
      .catch(() => {});
  }, [saveStatus]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArr = [...files];
    let pending = fileArr.length;
    const texts: string[] = new Array(fileArr.length);
    const names: string[] = new Array(fileArr.length);

    fileArr.forEach((f, idx) => {
      names[idx] = f.name;
      const reader = new FileReader();
      reader.onload = () => {
        texts[idx] = String(reader.result);
        pending--;
        if (pending === 0) finishUpload(texts, names);
      };
      reader.readAsText(f);
    });
    e.target.value = "";
  };

  const finishUpload = (texts: string[], names: string[]) => {
    const newSets: Dataset[] = [];

    if (texts.length === 1) {
      const parsed = parseTvCsv(texts[0]);
      if (parsed.length === 0) {
        alert("No trades parsed — make sure this is a TradingView 'List of trades' CSV export.");
        return;
      }
      newSets.push(
        buildDatasetFromParsed("u" + Date.now(), `${names[0]} (${parsed.length} trades)`, parsed, [names[0]])
      );
    } else {
      // Individual files
      texts.forEach((text, i) => {
        const parsed = parseTvCsv(text);
        if (parsed.length > 0) {
          newSets.push(
            buildDatasetFromParsed(
              "u" + Date.now() + i,
              `${names[i]} (${parsed.length} trades)`,
              parsed,
              [names[i]]
            )
          );
        }
      });
      // Merged year dataset (dedupes overlapping bar-replay windows)
      const rawCount = texts.reduce((n, tx) => n + parseTvCsv(tx).length, 0);
      const merged = mergeTvCsvs(texts, { onePerDay: true, seed: ALL_SEED_TRADES });
      if (merged.length > 0) {
        const span =
          merged[0].date && merged[merged.length - 1].date
            ? `${merged[0].date} → ${merged[merged.length - 1].date}`
            : "";
        const deduped = rawCount - merged.length;
        newSets.push(
          buildDatasetFromParsed(
            "m" + Date.now(),
            `MERGED ${names.length} files — ${merged.length} trades${span ? ` · ${span}` : ""}${deduped > 0 ? ` · ${deduped} dupes dropped` : ""}`,
            merged,
            names,
            deduped
          )
        );
      }
    }

    if (newSets.length === 0) {
      alert("No trades parsed from selected files — re-export from TradingView Strategy Tester.");
      return;
    }
    const mergedPick = newSets.find((d) => d.id.startsWith("m")) ?? newSets[newSets.length - 1];
    const autoName = suggestDatasetName(mergedPick.dates, variantName);
    const labeled = newSets.map((d) =>
      d.id === mergedPick.id ? { ...d, label: autoName } : d
    );
    setUploads([...uploads, ...labeled]);
    setDatasetAliases({ ...datasetAliases, [mergedPick.id]: autoName });
    setDsId(mergedPick.id);
  };

  const mergeAllUploads = () => {
    const leaves = uploads.filter((u) => !u.id.startsWith("m"));
    if (leaves.length < 2) return;
    const allTrades = leaves.flatMap((u) =>
      u.trades.map((pnl, i) => ({ num: i, date: u.dates[i] ?? "", pnl }))
    );
    const seen = new Set<string>();
    const sorted = allTrades
      .filter((t) => t.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter((t) => {
        const k = `${t.date}|${t.pnl.toFixed(2)}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    const deduped = allTrades.filter((t) => t.date).length - sorted.length;
    const merged = buildDatasetFromParsed(
      "m" + Date.now(),
      `MERGED all uploads — ${sorted.length} trades · ${sorted[0]?.date} → ${sorted[sorted.length - 1]?.date}${deduped > 0 ? ` · ${deduped} dupes dropped` : ""}`,
      sorted,
      leaves.flatMap((u) => u.sources),
      deduped
    );
    const autoName = suggestDatasetName(merged.dates, variantName);
    const labeled = { ...merged, label: autoName };
    setUploads([...uploads, labeled]);
    setDatasetAliases({ ...datasetAliases, [labeled.id]: autoName });
    setDsId(labeled.id);
  };

  const removeUpload = (id: string) => {
    setUploads(uploads.filter((u) => u.id !== id));
    const nextAliases = { ...datasetAliases };
    delete nextAliases[id];
    setDatasetAliases(nextAliases);
    const nextFilters = { ...dateFilters };
    delete nextFilters[id];
    setDateFilters(nextFilters);
    if (dsId === id) setDsId(SEED_SETS[0].id);
  };

  const setDisplayName = (id: string, name: string) => {
    const trimmed = name.trim();
    setDatasetAliases({ ...datasetAliases, [id]: trimmed });
    if (id.startsWith("u") || id.startsWith("m")) {
      setUploads(uploads.map((u) => (u.id === id ? { ...u, label: trimmed || undefined } : u)));
    }
  };

  const setDateFilterFor = (id: string, patch: Partial<DateFilter>) => {
    const prev = dateFilters[id] ?? { from: "", to: "" };
    setDateFilters({ ...dateFilters, [id]: { ...prev, ...patch } });
  };

  const clearDateFilterFor = (id: string) => {
    const next = { ...dateFilters };
    delete next[id];
    setDateFilters(next);
  };

  const applyStudyLabel = () => {
    setDisplayName(ds.id, suggestDatasetName(ds.dates, variantName));
  };

  const applyPreset = (presetId: string) => {
    const preset = presetById(presetId);
    setStudy({
      ...study,
      presetId,
      regimes: preset?.defaultRegimes ?? study.regimes,
    });
    setSaveStatus("idle");
  };

  const toggleRegime = (r: string) => {
    setStudy({
      ...study,
      regimes: study.regimes.includes(r)
        ? study.regimes.filter((x) => x !== r)
        : [...study.regimes, r],
    });
  };

  const persistCohort = async (
    mcResult: McResult,
    comparison?: ScorecardComparison | null,
    opts?: { allowDownload?: boolean; force?: boolean }
  ) => {
    if (!studyReady(study)) return;
    if (!opts?.force && isLabRunCohortSaved(runKey)) {
      const cached = loadLabRunCache(runKey);
      setSaveStatus("ok");
      setSaveMsg(cached?.saveMsg || "Already saved for this dataset + variant — skipped");
      return;
    }
    setSaveStatus("saving");
    const preset = presetById(study.presetId);
    const payload: CohortSaveInput = {
      variant: variantName,
      strategyPreset: study.presetId,
      strategyVersion: preset?.version ?? "custom",
      strategyConfig: preset?.config ?? "",
      hypothesis: study.hypothesis,
      regimes: study.regimes,
      notes: study.hypothesis,
      datasetName: displayName + (dateFilterActive ? ` · ${stats.span}` : ""),
      span: stats.span,
      sources: dateFilterActive
        ? [...ds.sources, `Date filter: ${stats.n} of ${stats.fullN} trades`]
        : ds.sources,
      firm: rule.name,
      trades: stats.n,
      netPnl: stats.net,
      wins: stats.wins,
      losses: stats.losses,
      scratches: stats.scr,
      maxDd: equity.maxDd,
      tradesPerWeek: stats.tpw,
      weeklyEdgeUsd: comparison?.current.weeklyEdgeUsd,
      scorecardVerdict: comparison?.verdict,
      compositeScore: comparison?.compositeScore,
      sims,
      maxTrades,
      payoutBuffer,
      mc: mcToSummary(mcResult),
    };
    try {
      const r = await fetch("/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "save failed");
      const okMsg =
        data.mode === "github"
          ? `Committed ${data.filename} → ${data.repoPath ?? "strategies/cohorts/"} on GitHub`
          : data.mode === "download" && data.markdown && opts?.allowDownload
            ? `Downloaded ${data.filename} — drop into strategies/cohorts/`
            : `Saved → strategies/cohorts/${data.filename}`;
      setSaveStatus("ok");
      setSaveMsg(okMsg);
      markLabRunCohortSaved(runKey, okMsg);
      saveLabRunCache(runKey, {
        cohortSaved: true,
        saveMsg: okMsg,
        verdict: comparison?.verdict,
        compositeScore: comparison?.compositeScore,
      });
      if (data.mode === "download" && data.markdown && opts?.allowDownload) {
        downloadCohortMarkdown(data.filename, data.markdown);
      } else if (data.mode === "download" && data.markdown && !opts?.allowDownload) {
        const failMsg =
          data.githubError
            ? `GitHub save failed: ${data.githubError}`
            : "GitHub save unavailable — MC results still shown above";
        setSaveMsg(failMsg);
      }
    } catch (e) {
      setSaveStatus("err");
      setSaveMsg(String(e));
    }
  };

  const run = () => {
    if (!canRun) return;
    setSaveStatus("idle");
    const { mcResult, comparison } = computeMcRun();
    setRes(mcResult);
    setScorecardComparison(comparison);
    const entry: ScorecardRunEntry = {
      id: `${Date.now()}-${study.presetId}`,
      at: new Date().toISOString(),
      variant: variantName,
      dataset: displayName,
      verdict: comparison.verdict,
      compositeScore: comparison.compositeScore,
      metrics: comparison.current,
    };
    setScorecardHistory([entry, ...scorecardHistory].slice(0, 24));
    const alreadySaved = isLabRunCohortSaved(runKey);
    const prevCache = loadLabRunCache(runKey);
    saveLabRunCache(runKey, {
      cohortSaved: alreadySaved,
      saveMsg: alreadySaved ? prevCache?.saveMsg ?? "" : "",
      verdict: comparison.verdict,
      compositeScore: comparison.compositeScore,
    });
    requestAnimationFrame(() => {
      mcResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (autoSave) {
      if (alreadySaved) {
        setSaveStatus("ok");
        setSaveMsg(prevCache?.saveMsg || "Already saved for this dataset + variant — skipped re-commit");
      } else {
        void persistCohort(mcResult, comparison);
      }
    }
  };

  const eco = res?.economics;

  return (
    <>
      <div className="lab-intro">
        Pick a strategy, load trades (upload TV CSV or use a seed), then <span className="accent">RUN</span>.
        Monte Carlo results appear below after the first run.
      </div>

      <div className="panel lab-workflow">
        <div className="panel-title">
          Run a study
          <span className="sub">strategy · data · firm</span>
        </div>
        <div className="panel-body">
          <div className="lab-step">
            <span className="lab-step-num">1</span>
            <div className="lab-step-body">
              <div className="frm-row">
                <label className="fld" style={{ minWidth: 280, flex: 1 }}>
                  Strategy version
                  <select value={study.presetId} onChange={(e) => applyPreset(e.target.value)}>
                    <optgroup label="PRB">
                      {STRATEGY_PRESETS.filter((p) => p.id.startsWith("prb") || p.id === "custom").map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Macro">
                      {STRATEGY_PRESETS.filter((p) => p.id.startsWith("macro")).map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      {STRATEGY_PRESETS.filter((p) => p.id.startsWith("datahl")).map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                {study.presetId === "custom" && (
                  <label className="fld" style={{ flex: 1, minWidth: 200 }}>
                    Custom variant name
                    <input
                      value={study.customLabel}
                      onChange={(e) => setStudy({ ...study, customLabel: e.target.value })}
                      placeholder="e.g. Macro v1.4 — pivot 5 only"
                    />
                  </label>
                )}
              </div>
              <label className="fld" style={{ marginTop: 8 }}>
                Hypothesis <span className="dim">(optional — saved to cohort notes)</span>
                <input
                  value={study.hypothesis}
                  onChange={(e) => setStudy({ ...study, hypothesis: e.target.value })}
                  placeholder="e.g. v1.4 A-tier only beats v1.2 baseline on TPT pass rate"
                />
              </label>
              {activePreset && (
                <div className="small dim" style={{ marginTop: 6 }}>
                  <span className="cyan">Pine {activePreset.version}</span> · {activePreset.config}
                </div>
              )}
              {!studyReady(study) && (
                <p className="small warn" style={{ marginTop: 6, marginBottom: 0 }}>
                  Select a strategy version (or name your custom experiment) before running.
                </p>
              )}
            </div>
          </div>

          <div className="lab-step">
            <span className="lab-step-num">2</span>
            <div className="lab-step-body">
              <div className="frm-row">
                <label className="fld" style={{ minWidth: 280, flex: 1 }}>
                  Dataset
                  <select value={safeDsId} onChange={(e) => setDsId(e.target.value)}>
                    <optgroup label="Recommended seeds">
                      {SEED_SETS.filter(isRecommendedSeed).map((d) => (
                        <option key={d.id} value={d.id}>
                          {datasetDisplayName(d, datasetAliases)} — {datasetOptionSub(d)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Archive seeds">
                      {SEED_SETS.filter((d) => !isRecommendedSeed(d)).map((d) => (
                        <option key={d.id} value={d.id}>
                          {datasetDisplayName(d, datasetAliases)} — {datasetOptionSub(d)}
                        </option>
                      ))}
                    </optgroup>
                    {uploads.length > 0 && (
                      <optgroup label="Your uploads">
                        {uploads.map((d) => (
                          <option key={d.id} value={d.id}>
                            {datasetDisplayName(d, datasetAliases)} — {datasetOptionSub(d)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>
                <label className="fld">
                  Upload TV CSVs
                  <input type="file" accept=".csv" multiple onChange={onFiles} />
                </label>
              </div>
              <div className="lab-dataset-summary">
                <span className="accent">{variantName}</span>
                {displayName && displayName !== ds.name && <span className="cyan"> · {displayName}</span>}
                <span className="dim"> — </span>
                {stats.n} trades · {stats.wins}W/{stats.losses}L · net {fmtUsd(stats.net, true)}
                {activeDs.dates.length >= 2 && <span className="dim"> · {stats.span}</span>}
                {dateFilterActive && stats.fullN !== stats.n && (
                  <span className="warn"> (filtered from {stats.fullN})</span>
                )}
              </div>
              {ds.trades.length > 0 && activeDs.trades.length === 0 && (
                <p className="small warn" style={{ marginTop: 6, marginBottom: 0 }}>
                  No trades in selected date range — widen dates in Advanced options.
                </p>
              )}
            </div>
          </div>

          <div className="lab-step lab-step-run">
            <span className="lab-step-num">3</span>
            <div className="lab-step-body">
              <div className="frm-row">
                <label className="fld" style={{ minWidth: 220 }}>
                  Firm preset
                  <select value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
                    {PROP_RULES.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </label>
                <button className="btn" onClick={run} disabled={!canRun} title={!canRun ? "Set strategy version and load a dataset first" : ""}>
                  RUN Monte Carlo
                </button>
              </div>
              <div className="small dim" style={{ marginTop: 6 }}>
                {rule.name}: pass {fmtUsd(rule.passAt)} · DD {fmtUsd(rule.trailingDD)}
                {rule.consistencyPct > 0 ? ` · ${rule.consistencyPct}% consistency` : ""}
              </div>
              {!res && (
                <p className="small dim" style={{ marginTop: 6, marginBottom: 0 }}>
                  Pass %, fan chart, and scorecard appear below after RUN.
                </p>
              )}
            </div>
          </div>

          <CollapsiblePanel
            title="Advanced options"
            sub="dates · sims · regimes · naming · uploads"
            className="lab-advanced"
            defaultOpen={false}
          >
            <div className="frm-row">
              <label className="fld" style={{ minWidth: 220 }}>
                Display name
                <input
                  value={datasetAliases[safeDsId] ?? ds.label ?? ""}
                  onChange={(e) => setDisplayName(safeDsId, e.target.value)}
                  placeholder={
                    suggestDatasetLabel(ds.dates)
                      ? `e.g. ${suggestDatasetLabel(ds.dates)} BE-only`
                      : "e.g. 25–26 Trail experiment"
                  }
                />
              </label>
              <button type="button" className="btn ghost" onClick={applyStudyLabel} title="Set name from date span + strategy version">
                Name from study
              </button>
              {dsBounds.min && dsBounds.max && (
                <>
                  <label className="fld">
                    From
                    <input
                      type="date"
                      min={dsBounds.min}
                      max={dateFilter.to || dsBounds.max}
                      value={dateFilter.from}
                      onChange={(e) => setDateFilterFor(safeDsId, { from: e.target.value })}
                    />
                  </label>
                  <label className="fld">
                    To
                    <input
                      type="date"
                      min={dateFilter.from || dsBounds.min}
                      max={dsBounds.max}
                      value={dateFilter.to}
                      onChange={(e) => setDateFilterFor(safeDsId, { to: e.target.value })}
                    />
                  </label>
                  {dateFilterActive && (
                    <button type="button" className="btn ghost" onClick={() => clearDateFilterFor(safeDsId)}>
                      All dates
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="frm-row">
              <label className="fld">
                Sims
                <input type="number" value={sims} onChange={(e) => setSims(parseInt(e.target.value) || 1000)} style={{ width: 80 }} />
              </label>
              <label className="fld">
                Max trades
                <input type="number" value={maxTrades} onChange={(e) => setMaxTrades(parseInt(e.target.value) || 60)} style={{ width: 80 }} />
              </label>
              <label className="fld">
                Payout buffer
                <input type="number" value={payoutBuffer} onChange={(e) => setPayoutBuffer(parseInt(e.target.value) || 1000)} style={{ width: 80 }} title="Extra funded profit before first payout" />
              </label>
            </div>
            <div className="small dim" style={{ marginBottom: 6 }}>Market / test conditions (optional)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {REGIME_PRESETS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={"chip" + (study.regimes.includes(r) ? " active-acct" : "")}
                  style={{ cursor: "pointer", background: study.regimes.includes(r) ? undefined : "transparent" }}
                  onClick={() => toggleRegime(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <label className="small" style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
              Auto-save once per dataset + variant <span className="dim">(GitHub → strategies/cohorts/)</span>
            </label>
            {uploads.length > 0 && (
              <>
                <hr className="hr" />
                <div className="small dim" style={{ marginBottom: 6 }}>Manage uploads</div>
                {uploads.length >= 2 && (
                  <button className="btn ghost" onClick={mergeAllUploads} style={{ marginBottom: 8 }}>
                    Merge all into one year
                  </button>
                )}
                <ul className="upload-list">
                  {uploads.map((u) => (
                    <li key={u.id} style={{ flexWrap: "wrap", gap: 6 }}>
                      <input
                        type="text"
                        value={datasetAliases[u.id] ?? u.label ?? ""}
                        onChange={(e) => setDisplayName(u.id, e.target.value)}
                        placeholder={suggestDatasetLabel(u.dates) || "name e.g. 25–26 BE"}
                        style={{ width: 180, fontSize: 11 }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="dim" style={{ fontSize: 11 }}>{u.trades.length} tr · {u.name.slice(0, 48)}{u.name.length > 48 ? "…" : ""}</span>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 8px", fontSize: 10 }}
                        onClick={() => setDsId(u.id)}
                      >
                        use
                      </button>
                      <button className="btn danger" style={{ marginLeft: "auto", padding: "2px 8px", fontSize: 10 }} onClick={() => removeUpload(u.id)}>×</button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CollapsiblePanel>
        </div>
      </div>

      {res && eco && (
        <div ref={mcResultsRef}>
          <div className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-body" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <div className="small">
                <span className="accent">Monte Carlo results:</span> {variantName}
                {study.hypothesis && <span className="subtext"> — {study.hypothesis}</span>}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {saveStatus === "saving" && <span className="small cyan">Saving cohort note…</span>}
                {saveStatus === "ok" && <span className="small pos">{saveMsg}</span>}
                {saveStatus === "err" && (
                  <>
                    <span className="small neg">{saveMsg}</span>
                    <button className="btn ghost" onClick={() => res && persistCohort(res, scorecardComparison)}>Retry save</button>
                  </>
                )}
                {!autoSave && res && (
                  <button className="btn ghost" onClick={() => persistCohort(res, scorecardComparison, { allowDownload: true, force: true })}>Save cohort note</button>
                )}
                {res && isLabRunCohortSaved(runKey) && (
                  <span className="small dim">Saved · re-RUN won&apos;t re-commit</span>
                )}
              </div>
            </div>
          </div>

          <div className="stat-strip">
            <div className="stat">
              <div className="k">Pass probability</div>
              <div className={"v " + (res.passRate >= 0.7 ? "pos" : res.passRate >= 0.4 ? "warn" : "neg")}>
                {(res.passRate * 100).toFixed(1)}%
              </div>
              <div className="d">
                {res.consistencyAware
                  ? `consistency pass · ${rule.consistencyPct}% rule · ${rule.minDays}+ days`
                  : `reach ${fmtUsd(rule.passAt)} before DD`}
              </div>
              {res.consistencyAware && res.grossPassRate != null && (
                <div className="d dim" style={{ marginTop: 2 }}>
                  gross {fmtUsd(rule.passAt)} hit {(res.grossPassRate * 100).toFixed(1)}%
                  {res.consistencyBlockedRate != null && res.consistencyBlockedRate > 0 && (
                    <span className="warn"> · {(res.consistencyBlockedRate * 100).toFixed(1)}% blocked</span>
                  )}
                </div>
              )}
            </div>
            <div className="stat">
              <div className="k">Time to pass</div>
              <div className="v cyan">{eco.weeksToPassP50 ?? "—"} wks</div>
              <div className="d">median · p90 {eco.weeksToPassP90 ?? "—"} wks · {res.tradesToPassP50 ?? "—"} trades</div>
            </div>
            <div className="stat">
              <div className="k">Time to payout</div>
              <div className="v magenta">{eco.weeksToPayoutP50 ?? "—"} wks</div>
              <div className="d">at {fmtUsd(eco.payoutAt)} · p90 {eco.weeksToPayoutP90 ?? "—"} wks</div>
            </div>
            <div className="stat">
              <div className="k">Accounts needed</div>
              <div className="v orange">{Number.isFinite(eco.expectedAccounts) ? eco.expectedAccounts : "∞"}</div>
              <div className="d">expected · 90% chance ≤ {eco.accountsFor90Pct} tries</div>
            </div>
            <div className="stat">
              <div className="k">Net after fees</div>
              <div className={"v " + (eco.expectedNetUntilPass >= 0 ? "pos" : "neg")}>
                {fmtUsd(eco.expectedNetUntilPass, true)}
              </div>
              <div className="d">amortized until pass · per attempt {fmtUsd(eco.expectedNetPerAttempt, true)}</div>
            </div>
            <div className="stat">
              <div className="k">Payout rate</div>
              <div className="v magenta">{((eco.payoutRate ?? 0) * 100).toFixed(1)}%</div>
              <div className="d">reach {fmtUsd(eco.payoutAt)} within {maxTrades} trades</div>
            </div>
            <div className="stat">
              <div className="k">Bust rate</div>
              <div className="v neg">{(res.bustRate * 100).toFixed(1)}%</div>
              <div className="d">DD breach before pass · {(res.timeoutRate * 100).toFixed(1)}% unresolved</div>
            </div>
          </div>

          {scorecardComparison && (
            <CollapsiblePanel
              title="Experiment scorecard"
              sub="vs PRB v1.5 12mo control · ADVANCE / HOLD / REGRESS"
              defaultOpen={false}
            >
              <LabScorecardPanel
                comparison={scorecardComparison}
                history={scorecardHistory}
                savedCohorts={savedCohorts}
              />
            </CollapsiblePanel>
          )}

          <div className="panel">
            <div className="panel-title">
              Monte Carlo simulation
              <span className="sub">
                {res.sims.toLocaleString()} paths · {res.bootstrap}-block bootstrap
                {res.consistencyAware ? " · consistency-aware" : ""}
              </span>
            </div>
            <div className="panel-body chart-row">
              <FanChart
                res={res}
                passAt={rule.passAt}
                payoutAt={eco.payoutAt}
                dd={rule.trailingDD}
                tradesPerWeek={eco.tradesPerWeek}
              />
              <OutcomeChart hist={res.outcomeHist} sims={res.sims} />
            </div>
          </div>

          <CollapsiblePanel title="Fee breakdown" sub="median pass path">
            <div className="small subtext">
              <div className="kv">
                <span className="k">Gross at payout</span><span className="accent">{fmtUsd(eco.payoutAt)}</span>
                <span className="k">Eval fee</span><span>−{fmtUsd(rule.evalFee ?? 0)}</span>
                <span className="k">Activation</span><span>−{fmtUsd(rule.activationFee ?? 0)}</span>
                <span className="k">Monthly (eval period)</span><span>−{fmtUsd((rule.monthlyFee ?? 0) * Math.max(1, Math.ceil((eco.weeksToPayoutP50 ?? 4) / 4)))}</span>
                <span className="k">Median net on pass</span><span className="pos">{fmtUsd(eco.medianNetOnPass, true)}</span>
              </div>
              <p className="dim mt">
                Failed attempts cost {fmtUsd(eco.evalCostPerAttempt)} each. At {(res.passRate * 100).toFixed(0)}% pass rate,
                expect ~{Number.isFinite(eco.expectedAccounts) ? eco.expectedAccounts : "∞"} accounts before one clean pass.
              </p>
            </div>
          </CollapsiblePanel>
        </div>
      )}

      {activeDs.trades.length > 0 && (
        <CollapsiblePanel
          title="Actual replay"
          sub="real P&L · equity curve · consistency"
          badge={`${stats.n} tr · ${fmtUsd(equity.net, true)}`}
          defaultOpen={false}
        >
          <div className="stat-strip" style={{ marginBottom: 14 }}>
            <div className="stat">
              <div className="k">Actual net P&L</div>
              <div className={"v " + (equity.net >= 0 ? "pos" : "neg")}>{fmtUsd(equity.net, true)}</div>
              <div className="d">{stats.n} trades · {stats.span}</div>
            </div>
            <div className="stat">
              <div className="k">Win rate</div>
              <div className="v cyan">{stats.n ? ((stats.wins / stats.n) * 100).toFixed(0) : 0}%</div>
              <div className="d">{stats.wins}W / {stats.losses}L / {stats.scr}scr</div>
            </div>
            <div className="stat">
              <div className="k">Peak equity</div>
              <div className="v pos">{fmtUsd(Math.round(equity.peak))}</div>
              <div className="d">highest cumulative point</div>
            </div>
            <div className="stat">
              <div className="k">Max drawdown</div>
              <div className="v neg">{fmtUsd(Math.round(equity.maxDd))}</div>
              <div className="d">vs {fmtUsd(rule.trailingDD)} firm trail</div>
            </div>
            <div className="stat">
              <div className="k">Avg / trade</div>
              <div className={"v " + (stats.avg >= 0 ? "pos" : "neg")}>{fmtUsd(Math.round(stats.avg), true)}</div>
              <div className="d">~{stats.tpw} trades per week</div>
            </div>
          </div>
          <EquityCurveChart curve={equity} passAt={rule.passAt} trailingDd={rule.trailingDD} />
          {rule.consistencyPct > 0 && (
            <>
              <hr className="hr" />
              <EvalConsistencyCard
                report={consistency}
                winCapUsd={winCapUsd}
                onWinCapChange={setWinCapUsd}
              />
            </>
          )}
        </CollapsiblePanel>
      )}

      <CollapsiblePanel title="Reference & tools" sub="firm rules · chart findings · ghost autopsy" defaultOpen={false}>
        <div className="lab-ref-section">
          <div className="lab-ref-heading">Firm rules — {rule.name}</div>
          <FirmRulesCard rule={rule} />
        </div>
        <hr className="hr" />
        <div className="lab-ref-section">
          <div className="lab-ref-heading">Settled chart findings</div>
          <ChartFindingsCard />
        </div>
        <hr className="hr" />
        <div className="lab-ref-section">
          <div className="lab-ref-heading">Missed-trade autopsy + BE retest</div>
          <GhostAutopsyCard
            report={ghostReport}
            paste={ghostPaste}
            onPasteChange={setGhostPaste}
            onLoadTemplate={() =>
              setGhostPaste(study.presetId.startsWith("macro") ? MACRO_GHOST_PASTE_TEMPLATE : GHOST_PASTE_TEMPLATE)
            }
            screenshotName={ghostScreenshot}
            onScreenshot={(file) => {
              if (!file) {
                setGhostScreenshot(null);
                return;
              }
              setGhostScreenshot(file.name);
            }}
          />
        </div>
      </CollapsiblePanel>
    </>
  );
}
