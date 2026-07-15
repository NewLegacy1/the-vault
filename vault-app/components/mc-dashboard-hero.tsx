"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { McResult, McSimMode } from "@/lib/monte-carlo";

function fmtUsd(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`;
}

function OutcomeDonut({
  res,
  title,
}: {
  res: McResult;
  title: string;
}) {
  const pass = res.passRate;
  const bust = res.bustRate;
  const timeout = res.timeoutRate;
  const r = 54;
  const c = 2 * Math.PI * r;
  const passLen = pass * c;
  const bustLen = bust * c;
  const toLen = timeout * c;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke="#222" strokeWidth={14} />
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke="#00ff41"
          strokeWidth={14}
          strokeDasharray={`${passLen} ${c - passLen}`}
          strokeDashoffset={0}
          transform="rotate(-90 70 70)"
        />
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke="#ff3355"
          strokeWidth={14}
          strokeDasharray={`${bustLen} ${c - bustLen}`}
          strokeDashoffset={-passLen}
          transform="rotate(-90 70 70)"
        />
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke="#ffb347"
          strokeWidth={14}
          strokeDasharray={`${toLen} ${c - toLen}`}
          strokeDashoffset={-(passLen + bustLen)}
          transform="rotate(-90 70 70)"
        />
        <text x={70} y={66} textAnchor="middle" fill="#e8e8e8" fontSize={11} fontFamily="monospace">
          {res.sims.toLocaleString()}
        </text>
        <text x={70} y={80} textAnchor="middle" fill="#6a6a6a" fontSize={9} fontFamily="monospace">
          runs
        </text>
      </svg>
      <div className="small" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="dim" style={{ letterSpacing: 1 }}>{title}</div>
        <div>
          <span style={{ color: "#00ff41" }}>Pass {(pass * 100).toFixed(1)}%</span>
          {res.avgDaysPass != null && (
            <span className="dim"> · {res.avgDaysPass}d avg</span>
          )}
        </div>
        <div>
          <span style={{ color: "#ff3355" }}>Fail {(bust * 100).toFixed(1)}%</span>
          {res.avgDaysBust != null && (
            <span className="dim"> · {res.avgDaysBust}d avg</span>
          )}
        </div>
        <div>
          <span style={{ color: "#ffb347" }}>Timeout {(timeout * 100).toFixed(1)}%</span>
          {res.avgDaysTimeout != null && (
            <span className="dim"> · {res.avgDaysTimeout}d avg</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ScrubPnlHist({
  res,
  passAt,
  payoutAt,
  dd,
}: {
  res: McResult;
  passAt: number;
  payoutAt: number;
  dd: number;
}) {
  const maxStep = Math.max(0, (res.bands?.p50?.length ?? 1) - 1);
  const [step, setStep] = useState(Math.min(maxStep, Math.max(1, Math.floor(maxStep * 0.15))));

  const vals = useMemo(() => {
    const samples = res.samplePaths ?? [];
    const out: number[] = [];
    for (const sp of samples) {
      const v = sp.equity[Math.min(step, sp.equity.length - 1)];
      if (v != null) out.push(v);
    }
    if (out.length === 0 && res.bands?.p50) {
      out.push(res.bands.p50[Math.min(step, res.bands.p50.length - 1)] ?? 0);
    }
    return out;
  }, [res.samplePaths, res.bands, step]);

  const buckets = 28;
  const fMin = vals.length ? Math.min(...vals) : -dd;
  const fMax = vals.length ? Math.max(...vals) : payoutAt;
  const fRange = fMax - fMin || 1;
  const counts = Array.from({ length: buckets }, () => ({ n: 0, pass: 0, bust: 0, open: 0 }));
  for (const v of vals) {
    const b = Math.min(buckets - 1, Math.max(0, Math.floor(((v - fMin) / fRange) * buckets)));
    counts[b]!.n++;
    if (v <= -dd) counts[b]!.bust++;
    else if (v >= passAt) counts[b]!.pass++;
    else counts[b]!.open++;
  }
  const maxC = Math.max(...counts.map((x) => x.n), 1);
  const sorted = [...vals].sort((a, b) => a - b);
  const p5 = sorted[Math.floor(0.05 * sorted.length)] ?? 0;
  const p50 = sorted[Math.floor(0.5 * sorted.length)] ?? 0;
  const p95 = sorted[Math.floor(0.95 * sorted.length)] ?? 0;

  const W = 920;
  const H = 120;
  const PAD_L = 8;
  const PAD_R = 8;
  const histW = W - PAD_L - PAD_R;
  const bucketW = histW / buckets;

  return (
    <div>
      <div
        className="small"
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}
      >
        <span>
          Net P&amp;L at trade <span className="accent">{step}</span>
          <span className="dim"> · sample paths</span>
        </span>
        <span className="dim">
          p5 {fmtUsd(p5)} · med {fmtUsd(p50)} · p95 {fmtUsd(p95)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={maxStep}
        value={step}
        onChange={(e) => setStep(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#39ffba" }}
      />
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: "#000", border: "1px solid var(--border)" }}>
        {counts.map((c, i) => {
          const bh = (c.n / maxC) * (H - 20);
          const midVal = fMin + ((i + 0.5) / buckets) * fRange;
          const fill =
            midVal >= payoutAt
              ? "#39ffba"
              : midVal >= passAt
                ? "#00ff41"
                : midVal <= -dd
                  ? "#ff3355"
                  : "#ffb347";
          return (
            <rect
              key={i}
              x={PAD_L + i * bucketW + 1}
              y={H - 8 - bh}
              width={Math.max(bucketW - 2, 1)}
              height={Math.max(bh, 1)}
              fill={fill}
              opacity={0.7}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function McDashboardHero({
  res,
  firmName,
  passAt,
  payoutAt,
  dd,
  mode,
  onModeChange,
  windowBadge,
  children,
}: {
  res: McResult;
  firmName: string;
  passAt: number;
  payoutAt: number;
  dd: number;
  mode: McSimMode;
  onModeChange: (m: McSimMode) => void;
  windowBadge?: string;
  children: ReactNode;
}) {
  const eco = res.economics;
  const evMean = eco.expectedNetPerAccountUsd;
  const evP5 = res.netEvP05 ?? 0;
  const evP95 = res.netEvP95 ?? 0;

  return (
    <div className="panel">
      <div
        className="panel-title"
        style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}
      >
        <span>Monte Carlo simulation</span>
        <span className="sub">
          {firmName} · {res.sims.toLocaleString()} paths · {res.bootstrap}-block
          {windowBadge ? ` · ${windowBadge}` : ""}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button
            type="button"
            className={"btn " + (mode === "eval_path" ? "" : "ghost")}
            style={{ fontSize: 11 }}
            onClick={() => onModeChange("eval_path")}
          >
            Challenge
          </button>
          <button
            type="button"
            className={"btn " + (mode === "funded_only" ? "" : "ghost")}
            style={{ fontSize: 11 }}
            onClick={() => onModeChange("funded_only")}
          >
            Funded
          </button>
        </span>
      </div>
      <div className="panel-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(240px, 320px) 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <OutcomeDonut res={res} title={firmName} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
            }}
          >
            <div className="stat">
              <div className="k">Payout probability</div>
              <div className="v">{(eco.payoutRate * 100).toFixed(1)}%</div>
            </div>
            <div className="stat">
              <div className="k">Mean payout</div>
              <div className="v">{fmtUsd(eco.medianWithdrawnUsd)}</div>
              <div className="d">median withdrawn</div>
            </div>
            <div className="stat">
              <div className="k">Days to 1st payout</div>
              <div className="v">
                {eco.weeksToPayoutP50 != null
                  ? (eco.weeksToPayoutP50 * 7).toFixed(1)
                  : "—"}
              </div>
              <div className="d">from weeks P50 × 7</div>
            </div>
            <div className="stat">
              <div className="k">Net EV (mean)</div>
              <div className={"v " + (evMean >= 0 ? "pos" : "neg")}>{fmtUsd(evMean)}</div>
            </div>
            <div className="stat">
              <div className="k">Net EV, 5th pct</div>
              <div className={"v " + (evP5 >= 0 ? "pos" : "neg")}>{fmtUsd(evP5)}</div>
            </div>
            <div className="stat">
              <div className="k">Net EV, 95th pct</div>
              <div className={"v " + (evP95 >= 0 ? "pos" : "neg")}>{fmtUsd(evP95)}</div>
            </div>
          </div>
        </div>
        {children}
        <div style={{ marginTop: 14 }}>
          <ScrubPnlHist res={res} passAt={passAt} payoutAt={payoutAt} dd={dd} />
        </div>
      </div>
    </div>
  );
}
