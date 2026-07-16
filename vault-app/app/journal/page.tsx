"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { compressChartShot } from "@/lib/journal-shot";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import {
  Account,
  JournalEntry,
  JournalLogMode,
  MORNINGSTAR_STUDY_ID,
  MorningBias,
  PrbFilter,
  RedFolderTag,
  SkipReason,
  StructTf,
  letterFromMsScore,
  uid,
} from "@/lib/types";
import { analyzeBiasJournal } from "@/lib/bias-journal";

const MORNING_BIASES: MorningBias[] = ["long", "short", "neutral", "skip"];
const PRB_FILTERS: PrbFilter[] = ["Both", "Long only", "Short only"];
const STRUCT_TFS: StructTf[] = ["15", "30", "60", "240", "chart"];
const SKIP_REASONS: { id: SkipReason; label: string }[] = [
  { id: "no_poi", label: "No POI" },
  { id: "counter_draw", label: "Counter draw" },
  { id: "eqhl", label: "EQH/EQL" },
  { id: "ndog", label: "NDOG/NWOG" },
  { id: "news", label: "News" },
  { id: "gut", label: "Gut skip" },
  { id: "low_grade", label: "Low MS grade" },
  { id: "other", label: "Other" },
];

function emptyForm(mode: JournalLogMode) {
  return {
    mode,
    date: todayStr(),
    accountId: "",
    direction: "long" as JournalEntry["direction"],
    morningBias: "neutral" as MorningBias,
    prbFilter: "Both" as PrbFilter,
    redFolder: "no" as RedFolderTag,
    redFolderTime: "",
    redFolderEvent: "",
    structureTf: "15" as StructTf,
    structureTag: "",
    msScore: 0,
    msPoi: false,
    msH4: false,
    msCisd: false,
    msIfvg1: false,
    msIfvg5: false,
    grade: "C" as JournalEntry["grade"],
    gradeLocked: false,
    pnl: "",
    r: "",
    mfeR: "",
    giveBack: false,
    skipReasons: [] as SkipReason[],
    notes: "",
    chartShot: "" as string,
  };
}

export default function JournalPage() {
  const [journal, setJournal] = useLocal<JournalEntry[]>("vault.journal", []);
  const [accounts] = useLocal<Account[]>("vault.accounts", []);
  const [activeId] = useLocal<string>("vault.activeAccount", "");
  const [filterAcct, setFilterAcct] = useState("");
  const [previewShot, setPreviewShot] = useState<string | null>(null);

  const [f, setF] = useState(() => emptyForm("morningstar"));
  const [logErr, setLogErr] = useState("");
  const [shotErr, setShotErr] = useState("");

  useEffect(() => {
    if (f.gradeLocked) return;
    setF((prev) => ({ ...prev, grade: letterFromMsScore(prev.msScore) }));
  }, [f.msScore, f.gradeLocked]);

  const toggleSkip = (id: SkipReason) => {
    setF((prev) => ({
      ...prev,
      skipReasons: prev.skipReasons.includes(id)
        ? prev.skipReasons.filter((x) => x !== id)
        : [...prev.skipReasons, id],
    }));
  };

  const onShot = async (file: File | null) => {
    setShotErr("");
    if (!file) {
      setF((prev) => ({ ...prev, chartShot: "" }));
      return;
    }
    try {
      const dataUrl = await compressChartShot(file);
      setF((prev) => ({ ...prev, chartShot: dataUrl }));
    } catch (e) {
      setShotErr(e instanceof Error ? e.message : "Could not compress snapshot");
      setF((prev) => ({ ...prev, chartShot: "" }));
    }
  };

  const add = () => {
    const isStudy = f.mode === "morningstar";
    const acct = isStudy ? MORNINGSTAR_STUDY_ID : f.accountId || activeId;
    if (!acct) {
      setLogErr("Live mode needs an account — pick one or switch to Morningstar study.");
      return;
    }
    if (f.redFolder === "yes" && !f.redFolderTime.trim()) {
      setLogErr("Red folder = yes needs news time (HHMM NY).");
      return;
    }
    setLogErr("");
    const fails =
      f.skipReasons.length > 0
        ? f.skipReasons.join(",")
        : "";
    const entry: JournalEntry = {
      id: uid(),
      date: f.date,
      accountId: acct,
      direction: f.direction,
      morningBias: f.morningBias,
      prbFilter: isStudy ? "Both" : f.prbFilter,
      redFolder: f.redFolder,
      redFolderTime: f.redFolder === "yes" ? f.redFolderTime.trim() : undefined,
      redFolderEvent: f.redFolder === "yes" ? f.redFolderEvent.trim() || undefined : undefined,
      grade: f.grade,
      pnl: parseFloat(f.pnl) || 0,
      rMultiple: parseFloat(f.r) || 0,
      mfeR: f.mfeR === "" ? undefined : parseFloat(f.mfeR) || 0,
      giveBack: f.giveBack,
      checklistFails: fails,
      skipReasons: f.skipReasons.length ? f.skipReasons : undefined,
      notes: f.notes,
      strategy: isStudy ? "Morningstar" : "PRB",
      structureTf: isStudy ? f.structureTf : undefined,
      structureTag: isStudy ? f.structureTag.trim() || undefined : undefined,
      msScore: isStudy ? f.msScore : undefined,
      msPoi: isStudy ? f.msPoi : undefined,
      msH4: isStudy ? f.msH4 : undefined,
      msCisd: isStudy ? f.msCisd : undefined,
      msIfvg1: isStudy ? f.msIfvg1 : undefined,
      msIfvg5: isStudy ? f.msIfvg5 : undefined,
      chartShot: f.chartShot || undefined,
    };
    setJournal([...journal, entry]);
    setF(emptyForm(f.mode));
    setShotErr("");
  };

  const rows = journal
    .filter((j) => {
      if (!filterAcct) return true;
      if (filterAcct === MORNINGSTAR_STUDY_ID) {
        return j.accountId === MORNINGSTAR_STUDY_ID || j.strategy === "Morningstar";
      }
      return j.accountId === filterAcct;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const trades = rows.filter((r) => r.direction !== "skip");
  const net = trades.reduce((s, j) => s + j.pnl, 0);
  const wins = trades.filter((j) => j.pnl > 50).length;
  const losses = trades.filter((j) => j.pnl < -50).length;
  const giveBacks10 = rows.slice(0, 10).filter((j) => j.giveBack).length;
  const msRows = rows.filter((j) => j.strategy === "Morningstar" || j.accountId === MORNINGSTAR_STUDY_ID);
  const avgMs =
    msRows.filter((j) => typeof j.msScore === "number").reduce((s, j) => s + (j.msScore ?? 0), 0) /
    Math.max(1, msRows.filter((j) => typeof j.msScore === "number").length);
  const biasStats = useMemo(() => analyzeBiasJournal(rows), [rows]);

  const acctLabel = (id: string, strategy?: string) => {
    if (id === MORNINGSTAR_STUDY_ID || strategy === "Morningstar") return "Morningstar";
    return accounts.find((a) => a.id === id)?.label ?? id.slice(0, 8);
  };

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Forward net</div>
          <div className={"v " + (net >= 0 ? "pos" : "neg")}>{fmtUsd(net, true)}</div>
          <div className="d">
            {trades.length} trades · {rows.length - trades.length} skips
          </div>
        </div>
        <div className="stat">
          <div className="k">W / L / scratch</div>
          <div className="v">
            {wins} / {losses} / {trades.length - wins - losses}
          </div>
        </div>
        <div className="stat">
          <div className="k">Peaked≥2R→&lt;1R (last 10)</div>
          <div className={"v " + (giveBacks10 >= 2 ? "warn" : "")}>{giveBacks10}</div>
          <div className="d">{giveBacks10 >= 2 ? "trail toggle signal" : "BE-only OK"}</div>
        </div>
        <div className="stat">
          <div className="k">Morningstar avg grade</div>
          <div className="v">{msRows.some((j) => typeof j.msScore === "number") ? avgMs.toFixed(1) + "/5" : "—"}</div>
          <div className="d">{msRows.length} study logs</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Log entry <span className="sub">Morningstar study default · trades and skips</span>
        </div>
        <div className="panel-body">
          <div className="frm-row" style={{ marginBottom: 12 }}>
            <label className="fld">
              Mode
              <select
                value={f.mode}
                onChange={(e) => {
                  const mode = e.target.value as JournalLogMode;
                  setF((prev) => ({ ...emptyForm(mode), date: prev.date }));
                  setLogErr("");
                }}
              >
                <option value="morningstar">Morningstar study</option>
                <option value="live">Live account (PRB)</option>
              </select>
            </label>
          </div>

          {logErr && (
            <p className="warn small" style={{ marginTop: 0 }}>
              {logErr}
            </p>
          )}

          <div className="frm-row">
            <label className="fld">
              Date
              <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            </label>
            {f.mode === "live" && (
              <>
                <label className="fld">
                  Account
                  <select
                    value={f.accountId || activeId}
                    onChange={(e) => setF({ ...f, accountId: e.target.value })}
                  >
                    <option value="">—</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fld">
                  PRB filter
                  <select
                    value={f.prbFilter}
                    onChange={(e) => setF({ ...f, prbFilter: e.target.value as PrbFilter })}
                    title="TV Direction filter that day (live PRB only)"
                  >
                    {PRB_FILTERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label className="fld">
              Morning bias
              <select
                value={f.morningBias}
                onChange={(e) => setF({ ...f, morningBias: e.target.value as MorningBias })}
                title="D→4H read"
              >
                {MORNING_BIASES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label className="fld">
              Dir
              <select
                value={f.direction}
                onChange={(e) => setF({ ...f, direction: e.target.value as JournalEntry["direction"] })}
              >
                <option value="long">long</option>
                <option value="short">short</option>
                <option value="skip">SKIP</option>
              </select>
            </label>
            <label className="fld">
              Red folder
              <select
                value={f.redFolder}
                onChange={(e) => setF({ ...f, redFolder: e.target.value as RedFolderTag })}
              >
                <option value="no">no</option>
                <option value="yes">yes</option>
                <option value="unknown">unknown</option>
              </select>
            </label>
            {f.redFolder === "yes" && (
              <>
                <label className="fld">
                  News time (HHMM NY)
                  <input
                    value={f.redFolderTime}
                    onChange={(e) => setF({ ...f, redFolderTime: e.target.value })}
                    placeholder="0830"
                    style={{ width: 80 }}
                  />
                </label>
                <label className="fld">
                  Event
                  <input
                    value={f.redFolderEvent}
                    onChange={(e) => setF({ ...f, redFolderEvent: e.target.value })}
                    placeholder="CPI / NFP / …"
                    style={{ width: 120 }}
                  />
                </label>
              </>
            )}
          </div>

          {f.mode === "morningstar" && (
            <>
              <div className="frm-row">
                <label className="fld">
                  Structure TF
                  <select
                    value={f.structureTf}
                    onChange={(e) => setF({ ...f, structureTf: e.target.value as StructTf })}
                  >
                    {STRUCT_TFS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fld">
                  Structure tag
                  <input
                    value={f.structureTag}
                    onChange={(e) => setF({ ...f, structureTag: e.target.value })}
                    placeholder="15m · PDH"
                    style={{ width: 140 }}
                  />
                </label>
                <label className="fld">
                  MS score /5
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={f.msScore}
                    onChange={(e) =>
                      setF({
                        ...f,
                        msScore: Math.max(0, Math.min(5, parseInt(e.target.value, 10) || 0)),
                        gradeLocked: false,
                      })
                    }
                    style={{ width: 70 }}
                  />
                </label>
                <label className="fld">
                  Letter
                  <select
                    value={f.grade}
                    onChange={(e) =>
                      setF({
                        ...f,
                        grade: e.target.value as JournalEntry["grade"],
                        gradeLocked: true,
                      })
                    }
                    title="Suggested from MS score; override if needed"
                  >
                    <option>A+</option>
                    <option>B</option>
                    <option>C</option>
                    <option>-</option>
                  </select>
                </label>
              </div>
              <div className="frm-row" style={{ alignItems: "center" }}>
                <span className="small dim" style={{ marginRight: 6 }}>
                  Flags
                </span>
                {(
                  [
                    ["msPoi", "POI"],
                    ["msH4", "4H"],
                    ["msCisd", "CISD"],
                    ["msIfvg1", "iFVG1"],
                    ["msIfvg5", "iFVG5"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="chk" style={{ marginRight: 8 }}>
                    <input
                      type="checkbox"
                      checked={f[key]}
                      onChange={(e) => setF({ ...f, [key]: e.target.checked })}
                    />
                    <span className="chk-box" aria-hidden="true" />
                    <span className="txt">{label}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="frm-row">
            <label className="fld">
              P&L $
              <input
                type="number"
                value={f.pnl}
                onChange={(e) => setF({ ...f, pnl: e.target.value })}
                style={{ width: 90 }}
              />
            </label>
            <label className="fld">
              R
              <input
                type="number"
                step="0.1"
                value={f.r}
                onChange={(e) => setF({ ...f, r: e.target.value })}
                style={{ width: 70 }}
              />
            </label>
            <label className="fld">
              MFE (R)
              <input
                type="number"
                step="0.1"
                value={f.mfeR}
                onChange={(e) => setF({ ...f, mfeR: e.target.value })}
                style={{ width: 70 }}
                title="Max favorable excursion in R"
              />
            </label>
            <label className="fld">
              Peaked ≥2R, exited &lt;1R
              <input
                type="checkbox"
                checked={f.giveBack}
                onChange={(e) => setF({ ...f, giveBack: e.target.checked })}
                title="Trail-toggle signal — trade peaked at least 2R then scratched under 1R"
              />
            </label>
            <label className="fld">
              Notes
              <input
                value={f.notes}
                onChange={(e) => setF({ ...f, notes: e.target.value })}
                placeholder="path / discretion"
                style={{ width: 220 }}
              />
            </label>
          </div>

          <div className="frm-row" style={{ alignItems: "center" }}>
            <span className="small dim" style={{ marginRight: 6 }}>
              Skip / fail reasons
            </span>
            {SKIP_REASONS.map((r) => (
              <label key={r.id} className="chk" style={{ marginRight: 6 }}>
                <input
                  type="checkbox"
                  checked={f.skipReasons.includes(r.id)}
                  onChange={() => toggleSkip(r.id)}
                />
                <span className="chk-box" aria-hidden="true" />
                <span className="txt">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="frm-row" style={{ alignItems: "flex-end" }}>
            <label className="fld">
              Chart snapshot
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onShot(e.target.files?.[0] ?? null)}
              />
            </label>
            {f.chartShot && (
              <button type="button" className="btn-ghost" onClick={() => setPreviewShot(f.chartShot)}>
                Preview
              </button>
            )}
            {f.chartShot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={f.chartShot}
                alt="Chart snapshot"
                style={{ height: 48, borderRadius: 4, border: "1px solid var(--border)" }}
              />
            )}
            <button type="button" className="btn" onClick={add}>
              Log
            </button>
          </div>
          {shotErr && (
            <p className="warn small" style={{ marginTop: 0 }}>
              {shotErr}
            </p>
          )}
          {f.mode === "morningstar" && (
            <p className="small dim" style={{ marginBottom: 0, lineHeight: 1.5 }}>
              Copy MS n/5 from the chart label. Letter auto-maps (4–5→A+, 3→B, ≤2→C). Grade is eyes-only —
              does not arm trades. No account required.
            </p>
          )}
          {f.mode === "live" && biasStats.filterMismatch > 0 && (
            <p className="small warn" style={{ marginBottom: 0 }}>
              Live filter-mismatch count in view: {biasStats.filterMismatch}
            </p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          History
          <span className="sub">
            <select value={filterAcct} onChange={(e) => setFilterAcct(e.target.value)}>
              <option value="">all</option>
              <option value={MORNINGSTAR_STUDY_ID}>Morningstar study</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Strat</th>
                <th>Bias</th>
                <th>Tag</th>
                <th>MS</th>
                <th>Red</th>
                <th>Dir</th>
                <th>Grade</th>
                <th className="num">P&L</th>
                <th className="num">R</th>
                <th className="num">MFE</th>
                <th>Shot</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id}>
                  <td>{j.date}</td>
                  <td className="small">{acctLabel(j.accountId, j.strategy)}</td>
                  <td className="small">{j.morningBias ?? "—"}</td>
                  <td className="small dim">{j.structureTag ?? "—"}</td>
                  <td className="small">
                    {typeof j.msScore === "number" ? `${j.msScore}/5` : "—"}
                  </td>
                  <td className="small dim">
                    {j.redFolder === "yes"
                      ? `${j.redFolderTime ?? "?"} ${j.redFolderEvent ?? ""}`.trim()
                      : (j.redFolder ?? "—")}
                  </td>
                  <td className={j.direction === "skip" ? "dim" : j.direction === "long" ? "pos" : "neg"}>
                    {j.direction.toUpperCase()}
                  </td>
                  <td>{j.grade}</td>
                  <td className={"num " + (j.pnl > 0 ? "pos" : j.pnl < 0 ? "neg" : "dim")}>
                    {j.direction === "skip" ? "—" : fmtUsd(j.pnl, true)}
                  </td>
                  <td className="num">{j.direction === "skip" ? "—" : j.rMultiple.toFixed(1)}</td>
                  <td className="num dim">
                    {typeof j.mfeR === "number" ? j.mfeR.toFixed(1) : "—"}
                  </td>
                  <td>
                    {j.chartShot ? (
                      <button type="button" className="btn-ghost" onClick={() => setPreviewShot(j.chartShot!)}>
                        view
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="small dim">
                    {[j.skipReasons?.join(", "), j.notes].filter(Boolean).join(" · ")}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn danger"
                      style={{ padding: "1px 7px" }}
                      onClick={() => setJournal(journal.filter((x) => x.id !== j.id))}
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={14} className="dim">
                    Nothing logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewShot && (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
          onClick={() => setPreviewShot(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewShot}
            alt="Chart"
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 6 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {f.mode === "live" && (
        <div className="panel">
          <div className="panel-title">
            Live bias tracker <span className="sub">PRB Direction filter vs trade — not used for Morningstar</span>
          </div>
          <div className="panel-body">
            <table className="kv-table">
              <tbody>
                <tr>
                  <td className="dim">Filter mismatch</td>
                  <td className={biasStats.filterMismatch > 0 ? "warn" : ""}>{biasStats.filterMismatch}</td>
                </tr>
                <tr>
                  <td className="dim">Aligned W / L</td>
                  <td>
                    {biasStats.alignedWins} / {biasStats.alignedLosses}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="small dim mt" style={{ marginBottom: 0 }}>
              Need an account? <Link href="/accounts">Accounts →</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
