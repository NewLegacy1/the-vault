"use client";

import { useEffect, useState } from "react";
import { CohortRecord } from "@/lib/cohort";
import { fmtUsd } from "@/lib/store";

interface IngestRow {
  hash: string;
  originalName: string;
  storedAs: string | null;
  kind: string;
  n: number;
  span: string;
  auditSeverity: "ok" | "warn" | "block" | null;
  stage0Verdict: string | null;
  stage0EvFull: number | null;
  stage0CiFull: [number, number] | null;
  ingestedAt: string;
}

export default function DataPage() {
  const [cohorts, setCohorts] = useState<CohortRecord[]>([]);
  const [ingests, setIngests] = useState<IngestRow[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/cohorts").then((r) => r.json()),
      fetch("/api/ingest").then((r) => r.json()),
    ])
      .then(([c, i]) => {
        if (c.error) throw new Error(c.error);
        setCohorts(c.cohorts ?? []);
        setIngests(i.rows ?? []);
        setErr("");
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="panel">
        <div className="panel-title">
          Ingest inbox
          <span className="sub">
            data/inbox/ · npm run ingest:watch · {ingests.length} ingested
          </span>
        </div>
        <div className="panel-body">
          <p className="small subtext" style={{ marginTop: 0 }}>
            Drop TV <b>List of trades</b> exports into{" "}
            <code className="inline">vault-app/data/inbox/</code> — they are
            fingerprinted, routed to <code className="inline">matrix/</code>,
            data-audited, and Stage-0 analyzed automatically.
          </p>
          {ingests.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th className="num">n</th>
                  <th>Span</th>
                  <th>Audit</th>
                  <th>Stage-0</th>
                  <th className="num">EV $ (CI)</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {ingests.slice(0, 12).map((r) => (
                  <tr key={r.hash}>
                    <td className="small accent">{r.originalName}</td>
                    <td className="num">{r.n || "—"}</td>
                    <td className="small">{r.span}</td>
                    <td className={"small " + (r.auditSeverity === "ok" ? "pos" : r.auditSeverity === "block" ? "neg" : "")}>
                      {r.auditSeverity ?? "—"}
                    </td>
                    <td className={"small " + (r.stage0Verdict === "toward" ? "pos" : r.stage0Verdict === "away" ? "neg" : "dim")}>
                      {r.stage0Verdict ?? "—"}
                    </td>
                    <td className="num small">
                      {r.stage0EvFull != null
                        ? `${r.stage0EvFull} [${r.stage0CiFull?.[0] ?? "—"}, ${r.stage0CiFull?.[1] ?? "—"}]`
                        : "—"}
                    </td>
                    <td className="small dim">{r.ingestedAt.slice(0, 16).replace("T", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && ingests.length === 0 && (
            <p className="small dim">
              Nothing ingested yet — drop a CSV into{" "}
              <code className="inline">data/inbox/</code> and run{" "}
              <code className="inline">npm run ingest</code>.
            </p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Obsidian cohort library
          <span className="sub">auto-saved from F4 LAB · strategies/cohorts/</span>
        </div>
        <div className="panel-body">
          <p className="small subtext">
            Every Lab <b>RUN</b> auto-saves a markdown note to your vault (when auto-save is on) with YAML frontmatter
            — pass rate, net P&L, regime tags, strategy version.
          </p>
          <div className="flow-diagram mt">
            <b>A/B + regime workflow</b><br />
            1. <b>F4 LAB → Study setup</b> — pick strategy version (PRB v1.5 BE-only, trail, custom, etc.)<br />
            2. Upload CSV → RUN Monte Carlo <span className="dim">(auto-saves to cohorts/)</span><br />
            3. Open Obsidian or ask Cursor agent to review <code className="inline">strategies/cohorts/</code><br />
            4. Repeat for next variant on same date range<br />
            5. Compare notes here or in Obsidian Dataview → promote winner to live config
          </div>
          <p className="small subtext mt">
            <span className="accent">Cursor agent:</span> Because this vault is your workspace, you can ask the agent to read and compare all cohort notes — see <code className="inline">strategies/AGENT.md</code>.
          </p>
          <button className="btn ghost mt" onClick={load}>Refresh list</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Saved cohorts
          <span className="sub">{loading ? "loading…" : `${cohorts.length} files`}</span>
        </div>
        <div className="panel-body">
          {err && <p className="small neg">{err}</p>}
          {!loading && cohorts.length === 0 && (
            <p className="small dim">No cohorts yet. Run a Lab test and click <span className="accent">SAVE TO OBSIDIAN</span>.</p>
          )}
          {cohorts.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>Span</th>
                  <th className="num">Net P&L</th>
                  <th className="num">MC pass</th>
                  <th className="num">MC bust</th>
                  <th>Regimes</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.id}>
                    <td className="accent">{c.variant}</td>
                    <td className="small">{c.span}</td>
                    <td className={"num " + (c.netPnl >= 0 ? "pos" : "neg")}>{fmtUsd(c.netPnl, true)}</td>
                    <td className="num">{c.mcPassPct}%</td>
                    <td className="num">{c.mcBustPct}%</td>
                    <td className="small">{c.regimes.join(", ") || "—"}</td>
                    <td className="small dim">{c.filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">What gets stored per test</div>
          <div className="panel-body small subtext">
            <ul style={{ paddingLeft: 16, lineHeight: 1.9 }}>
              <li>Backtest stats: trades, net P&L, W/L, max DD, date span</li>
              <li>Full Monte Carlo: pass/bust/payout %, weeks to pass/payout, fee model</li>
              <li>Your tags: variant name, regime chips, freeform notes</li>
              <li>Obsidian links back to SOP + checklist</li>
            </ul>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Obsidian Dataview query</div>
          <div className="panel-body">
            <pre style={{ fontSize: 11, color: "var(--sub)", lineHeight: 1.6 }}>
{`TABLE net_pnl, mc_pass_pct, trades, regimes
FROM "strategies/cohorts"
WHERE variant
SORT created DESC`}
            </pre>
            <p className="small dim mt">Paste into any Obsidian note. Requires Dataview plugin.</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Promotion rule (live config)</div>
        <div className="panel-body small subtext">
          <p>A variant only graduates from experiment → locked live when:</p>
          <ol style={{ paddingLeft: 16, marginTop: 8, lineHeight: 1.9 }}>
            <li><span className="accent">MC pass % ≥ baseline</span> cohort on same firm rules</li>
            <li><span className="accent">Net P&L ≥ baseline</span> on overlapping date range</li>
            <li><span className="accent">Forward test</span> — 20+ live trades without DD breach, journal within ~2R/month of replay</li>
            <li><span className="accent">Regime fit</span> — tagged for conditions you expect next month/quarter</li>
          </ol>
        </div>
      </div>
    </>
  );
}
