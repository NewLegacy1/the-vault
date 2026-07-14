"use client";

import { useMemo, useState } from "react";
import { useLocal, fmtUsd } from "@/lib/store";
import { runMonteCarlo, McResult } from "@/lib/monte-carlo";
import { mergeTvCsvs, parseTvCsv, tradesPerWeek } from "@/lib/csv";
import { ALL_SEED_TRADES, TRADES_DEC_MAR, TRADES_APR_JUL } from "@/lib/prb-data";
import { PROP_RULES, ruleById } from "@/lib/prop-firms";
import { PropRule } from "@/lib/types";
import { buildEquityCurve, EquityStats } from "@/lib/equity-curve";
import { CohortSaveInput, mcToSummary, McSummary } from "@/lib/cohort";
import { analyzeEvalConsistency, EvalConsistencyReport } from "@/lib/eval-consistency";
import {
  analyzeGhostAutopsy,
  parseGhostAutopsyPaste,
  GHOST_PASTE_TEMPLATE,
  GhostAutopsyReport,
} from "@/lib/ghost-autopsy";

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

function suggestDatasetLabel(dates: string[]): string {
  if (dates.length < 2) return "";
  const a = dates[0].slice(0, 7);
  const b = dates[dates.length - 1].slice(0, 7);
  const y0 = dates[0].slice(2, 4);
  const y1 = dates[dates.length - 1].slice(2, 4);
  if (y0 !== y1) return `${y0}–${y1}`;
  return a === b ? a : `${a}–${b}`;
}

function datasetDisplayName(d: Dataset): string {
  if (d.label?.trim()) return d.label.trim();
  return d.name;
}

function datasetOptionSub(d: Dataset): string {
  const span =
    d.dates.length >= 2 ? `${d.dates[0].slice(0, 7)}→${d.dates[d.dates.length - 1].slice(0, 7)}` : "";
  return `${d.trades.length} tr${span ? ` · ${span}` : ""}`;
}

const SEED_SETS: Dataset[] = [
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
  const n = res.bands.p50.length;
  if (n === 0) return null;

  const chartH = H - PAD_B - PAD_T - HIST_H;
  const all = [...res.bands.p05, ...res.bands.p95, ...res.finalEquities, passAt, payoutAt, -dd];
  const yMin = Math.min(...all) * 1.12;
  const yMax = Math.max(...all) * 1.12;
  const x = (i: number) => PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * chartH;
  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = (lo: number[], hi: number[]) =>
    path(hi) +
    " " +
    lo.map((v, i) => `L${x(lo.length - 1 - i).toFixed(1)},${y(lo[lo.length - 1 - i]).toFixed(1)}`).join(" ") +
    " Z";

  // Terminal histogram of final equity
  const finals = res.finalEquities;
  const buckets = 24;
  const fMin = Math.min(...finals);
  const fMax = Math.max(...finals);
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
        MONTE CARLO — {res.samplePaths.length} paths shown · {res.sims.toLocaleString()} total sims
      </text>

      {/* Spaghetti paths — classic MC look */}
      {res.samplePaths.map((sp, i) => {
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
  const W = 260;
  const H = 200;
  const max = Math.max(...hist.map((h) => h.count), 1);
  const barH = 36;
  const gap = 14;
  const startY = 24;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: "#000", border: "1px solid var(--border)" }}>
      <text x={W / 2} y={14} fill="#9a9a9a" fontSize={10} textAnchor="middle" fontFamily="monospace" letterSpacing={1}>
        OUTCOME DISTRIBUTION
      </text>
      {hist.map((h, i) => {
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
  return (
    <>
      <p className="small dim" style={{ marginTop: 0, lineHeight: 1.6 }}>
        Copy the <b>MISSED (failed 1 filter)</b> table from Pine (bottom-right on chart). Paste rows below —
        screenshot upload is for your reference only (no OCR yet). Green ghost rows in TV = filters blocking net-positive
        trades; this panel maps them to Pine inputs to A/B.
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
        placeholder="Paste: reason [tab] n [tab] W/L/scr [tab] net R — one row per filter"
      />
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
  const [dsId, setDsId] = useState("all");
  const [ruleId, setRuleId] = useState(PROP_RULES[0].id);
  const [sims, setSims] = useState(2000);
  const [maxTrades, setMaxTrades] = useState(80);
  const [payoutBuffer, setPayoutBuffer] = useState(1000);
  const [res, setRes] = useState<McResult | null>(null);
  const [study, setStudy] = useLocal<LabStudy>("vault.lab.study", DEFAULT_STUDY);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [saveMsg, setSaveMsg] = useState("");
  const [autoSave, setAutoSave] = useLocal<boolean>("vault.lab.autosave", true);
  const [winCapUsd, setWinCapUsd] = useLocal<number>("vault.lab.winCapUsd", 1490);
  const [ghostPaste, setGhostPaste] = useLocal<string>("vault.lab.ghostPaste", "");
  const [ghostScreenshot, setGhostScreenshot] = useState<string | null>(null);

  const activePreset = presetById(study.presetId);
  const variantName = studyVariantName(study);

  const datasets = [...SEED_SETS, ...uploads];
  const ds = datasets.find((d) => d.id === dsId) ?? SEED_SETS[0];
  const rule = ruleById(ruleId) ?? PROP_RULES[0];
  const canRun = studyReady(study) && ds.trades.length > 0;

  const equity = useMemo(() => buildEquityCurve(ds.trades, ds.dates), [ds]);

  const consistency = useMemo(
    () => analyzeEvalConsistency(ds.trades, ds.dates, rule, { winCapUsd }),
    [ds, rule, winCapUsd]
  );

  const ghostReport = useMemo(
    () => analyzeGhostAutopsy(parseGhostAutopsyPaste(ghostPaste)),
    [ghostPaste]
  );

  const stats = useMemo(() => {
    const t = ds.trades;
    const wins = t.filter((x) => x > 50).length;
    const losses = t.filter((x) => x < -50).length;
    const net = t.reduce((s, x) => s + x, 0);
    const tpw = tradesPerWeek(ds.dates);
    const span =
      ds.dates.length >= 2
        ? `${ds.dates[0]} → ${ds.dates[ds.dates.length - 1]}`
        : "dates unknown";
    return {
      n: t.length,
      wins,
      losses,
      scr: t.length - wins - losses,
      net,
      avg: net / (t.length || 1),
      tpw: Math.round(tpw * 10) / 10,
      span,
    };
  }, [ds]);

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
      const merged = mergeTvCsvs(texts);
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
    setUploads([...uploads, ...newSets]);
    setDsId(mergedPick.id);
    setRes(null);
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
    setUploads([...uploads, merged]);
    setDsId(merged.id);
    setRes(null);
  };

  const removeUpload = (id: string) => {
    setUploads(uploads.filter((u) => u.id !== id));
    if (dsId === id) setDsId("all");
    setRes(null);
  };

  const setDatasetLabel = (id: string, label: string) => {
    setUploads(uploads.map((u) => (u.id === id ? { ...u, label: label || undefined } : u)));
  };

  const labelFromStudy = () => {
    const span = suggestDatasetLabel(ds.dates);
    const short = variantName.replace(/^PRB v[\d.]+ — /, "").replace(/ \(live locked\)/, "");
    return span ? `${span} ${short}` : short;
  };

  const applyStudyLabel = () => {
    if (!ds.id.startsWith("u") && !ds.id.startsWith("m")) return;
    setDatasetLabel(ds.id, labelFromStudy());
  };

  const applyPreset = (presetId: string) => {
    const preset = presetById(presetId);
    setStudy({
      ...study,
      presetId,
      regimes: preset?.defaultRegimes ?? study.regimes,
    });
    setRes(null);
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

  const persistCohort = async (mcResult: McResult) => {
    if (!studyReady(study)) return;
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
      datasetName: datasetDisplayName(ds) + (ds.label ? ` · ${ds.name}` : ""),
      span: stats.span,
      sources: ds.sources,
      firm: rule.name,
      trades: stats.n,
      netPnl: stats.net,
      wins: stats.wins,
      losses: stats.losses,
      scratches: stats.scr,
      maxDd: equity.maxDd,
      tradesPerWeek: stats.tpw,
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
      setSaveStatus("ok");
      setSaveMsg(`Auto-saved → strategies/cohorts/${data.filename}`);
    } catch (e) {
      setSaveStatus("err");
      setSaveMsg(String(e));
    }
  };

  const run = async () => {
    if (!canRun) return;
    setSaveStatus("idle");
    const mcResult = runMonteCarlo({
      trades: ds.trades,
      dates: ds.dates,
      sims,
      maxTrades,
      passAt: rule.passAt,
      trailingDD: rule.trailingDD,
      fees: {
        evalFee: rule.evalFee ?? 0,
        activationFee: rule.activationFee ?? 0,
        monthlyFee: rule.monthlyFee ?? 0,
        payoutBuffer,
      },
    });
    setRes(mcResult);
    if (autoSave) await persistCohort(mcResult);
  };

  const eco = res?.economics;

  return (
    <>
      <div className="panel">
        <div className="panel-title">
          Study setup
          <span className="sub">define strategy version before upload &amp; run</span>
        </div>
        <div className="panel-body">
          <div className="frm-row">
            <label className="fld" style={{ minWidth: 280 }}>
              Strategy version
              <select value={study.presetId} onChange={(e) => applyPreset(e.target.value)}>
                {STRATEGY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            {study.presetId === "custom" && (
              <label className="fld" style={{ flex: 1, minWidth: 200 }}>
                Custom variant name
                <input
                  value={study.customLabel}
                  onChange={(e) => setStudy({ ...study, customLabel: e.target.value })}
                  placeholder="e.g. PRB v1.5 — IFVG entry experiment"
                />
              </label>
            )}
          </div>
          {activePreset && (
            <div className="small subtext" style={{ marginBottom: 10 }}>
              <span className="cyan">Pine {activePreset.version}</span> · {activePreset.config}
            </div>
          )}
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
          <label className="fld">
            Hypothesis — what are you testing vs baseline?
            <input
              value={study.hypothesis}
              onChange={(e) => setStudy({ ...study, hypothesis: e.target.value })}
              placeholder="e.g. Trail 2.0/1.5 beats BE-only in Feb–Mar give-back months"
            />
          </label>
          {!studyReady(study) && (
            <p className="small warn mt">Select a strategy version (or name your custom experiment) before running.</p>
          )}
          <label className="small" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
            Auto-save every RUN to Obsidian <span className="dim">(strategies/cohorts/)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">
            Monte Carlo — prop pass simulator
            <span className="sub">multi-CSV · firm rules · fee model</span>
          </div>
          <div className="panel-body">
            <div className="frm-row">
              <label className="fld">
                Dataset
                <select value={dsId} onChange={(e) => { setDsId(e.target.value); setRes(null); }}>
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {datasetDisplayName(d)} — {datasetOptionSub(d)}
                    </option>
                  ))}
                </select>
              </label>
              {(ds.id.startsWith("u") || ds.id.startsWith("m")) && (
                <label className="fld" style={{ minWidth: 200 }}>
                  Dataset label
                  <input
                    value={ds.label ?? ""}
                    onChange={(e) => setDatasetLabel(ds.id, e.target.value)}
                    placeholder='e.g. 2025–26 BE-only'
                  />
                </label>
              )}
              {(ds.id.startsWith("u") || ds.id.startsWith("m")) && (
                <button type="button" className="btn ghost" onClick={applyStudyLabel} title="Set label from study + date span">
                  Label from study
                </button>
              )}
              <label className="fld">
                Upload TV CSVs
                <input type="file" accept=".csv" multiple onChange={onFiles} />
              </label>
              <label className="fld">
                Firm preset
                <select value={ruleId} onChange={(e) => { setRuleId(e.target.value); setRes(null); }}>
                  {PROP_RULES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </label>
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
              <button className="btn" onClick={run} disabled={!canRun} title={!canRun ? "Set strategy version and load a dataset first" : ""}>
                RUN
              </button>
            </div>

            <div className="small subtext">
              <span className="accent">Study:</span> {variantName}
              {ds.label && <span className="cyan"> · Dataset: {ds.label}</span>}
              {study.regimes.length > 0 && <span className="dim"> · {study.regimes.join(", ")}</span>}
            </div>
            <div className="small subtext" style={{ marginTop: 4 }}>
              {stats.n} trades · {stats.wins}W / {stats.losses}L / {stats.scr}scr · net {fmtUsd(stats.net, true)} ·
              avg {fmtUsd(Math.round(stats.avg), true)}/trade · ~{stats.tpw} trades/wk
            </div>
            {ds.dates.length >= 2 && (
              <div className="small dim" style={{ marginTop: 4 }}>Span: {stats.span}</div>
            )}
            {ds.sources.length > 0 && ds.id.startsWith("m") && (
              <div className="small cyan" style={{ marginTop: 4 }}>
                Merged from: {ds.sources.join(", ")}
              </div>
            )}

            {uploads.length > 0 && (
              <>
                <hr className="hr" />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="small dim">Your uploads ({uploads.length})</span>
                  {uploads.length >= 2 && (
                    <button className="btn ghost" onClick={mergeAllUploads}>Merge all into one year</button>
                  )}
                </div>
                <ul className="upload-list">
                  {uploads.map((u) => (
                    <li key={u.id} style={{ flexWrap: "wrap", gap: 6 }}>
                      <input
                        type="text"
                        value={u.label ?? ""}
                        onChange={(e) => setDatasetLabel(u.id, e.target.value)}
                        placeholder={suggestDatasetLabel(u.dates) || "label e.g. 2025–26 BE"}
                        style={{ width: 140, fontSize: 11 }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="dim" style={{ fontSize: 11 }}>{u.trades.length} tr · {u.name.slice(0, 48)}{u.name.length > 48 ? "…" : ""}</span>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 8px", fontSize: 10 }}
                        onClick={() => { setDsId(u.id); setRes(null); }}
                      >
                        use
                      </button>
                      <button className="btn danger" style={{ marginLeft: "auto", padding: "2px 8px", fontSize: 10 }} onClick={() => removeUpload(u.id)}>×</button>
                    </li>
                  ))}
                </ul>
                <p className="small dim mt">
                  Label each merge by variant — e.g. <code className="inline">2025–26 BE</code> and <code className="inline">2025–26 Trail</code>. Use <b>Label from study</b> to auto-fill from study setup + date span.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Selected firm rules</div>
          <div className="panel-body">
            <FirmRulesCard rule={rule} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Missed-trade autopsy (ghosts)
          <span className="sub">paste from Pine bottom-right table · after each replay</span>
        </div>
        <div className="panel-body">
          <GhostAutopsyCard
            report={ghostReport}
            paste={ghostPaste}
            onPasteChange={setGhostPaste}
            onLoadTemplate={() => setGhostPaste(GHOST_PASTE_TEMPLATE)}
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
      </div>

      {ds.trades.length > 0 && (
        <>
          <div className="stat-strip">
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

          <div className="panel">
            <div className="panel-title">
              Actual equity curve
              <span className="sub">real replay P&L — not simulated</span>
            </div>
            <div className="panel-body">
              <EquityCurveChart curve={equity} passAt={rule.passAt} trailingDd={rule.trailingDD} />
            </div>
          </div>

          {rule.consistencyPct > 0 && (
            <div className="panel">
              <div className="panel-title">
                Eval consistency checker
                <span className="sub">daily P&L path · TPT / Alpha 50% rule — MC does not model this</span>
              </div>
              <div className="panel-body">
                <EvalConsistencyCard
                  report={consistency}
                  winCapUsd={winCapUsd}
                  onWinCapChange={setWinCapUsd}
                />
              </div>
            </div>
          )}
        </>
      )}

      {res && eco && (
        <>
          <div className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-body" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <div className="small">
                <span className="accent">Results for:</span> {variantName}
                {study.hypothesis && <span className="subtext"> — {study.hypothesis}</span>}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {saveStatus === "saving" && <span className="small cyan">Saving to Obsidian…</span>}
                {saveStatus === "ok" && <span className="small pos">{saveMsg}</span>}
                {saveStatus === "err" && (
                  <>
                    <span className="small neg">{saveMsg}</span>
                    <button className="btn ghost" onClick={() => res && persistCohort(res)}>Retry save</button>
                  </>
                )}
                {!autoSave && res && (
                  <button className="btn ghost" onClick={() => persistCohort(res)}>Save to Obsidian</button>
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
              <div className="d">reach {fmtUsd(rule.passAt)} before DD</div>
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

          <div className="panel">
            <div className="panel-title">
              Monte Carlo simulation
              <span className="sub">{res.sims.toLocaleString()} random futures · not your actual trades</span>
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

          <div className="panel">
            <div className="panel-title">Fee breakdown (median pass path)</div>
            <div className="panel-body small subtext">
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
          </div>
        </>
      )}

      <div className="panel">
        <div className="panel-title">All firm presets ($50K class)</div>
        <div className="panel-body grid grid-2">
          {PROP_RULES.map((r) => (
            <div
              key={r.id}
              className="firm-card"
              style={{ cursor: "pointer", opacity: r.id === ruleId ? 1 : 0.85 }}
              onClick={() => { setRuleId(r.id); setRes(null); }}
            >
              <div className="firm-card-head">
                <span>{r.name}</span>
                <span className="accent">{fmtUsd(r.passAt)} pass</span>
              </div>
              <div className="small subtext">
                target {fmtUsd(r.profitTarget)} · DD {fmtUsd(r.trailingDD)} {r.ddMode}
                {r.consistencyPct > 0 ? ` · ${r.consistencyPct}% consistency` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">What MC can and cannot tell you</div>
        <div className="panel-body small subtext">
          <p><span className="accent">CAN:</span> Pass/bust odds, calendar weeks to pass/payout, expected account attempts, net profit after fees — stack multiple bar-replay CSVs for a full year of trade distribution.</p>
          <p className="mt"><span className="cyan">CANNOT:</span> Regime detection, min winning days, daily loss limits, intraday trail severity. Tag cohorts in F6 DATA for year-round variant selection.</p>
        </div>
      </div>
    </>
  );
}
