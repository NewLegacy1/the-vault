"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dual46StudyForm } from "@/components/Dual46StudyForm";
import { JournalEditPanel } from "@/components/JournalEditPanel";
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
  uid,
} from "@/lib/types";
import { analyzeBiasJournal } from "@/lib/bias-journal";

const MORNING_BIASES: MorningBias[] = ["long", "short", "neutral", "skip"];
const PRB_FILTERS: PrbFilter[] = ["Both", "Long only", "Short only"];

const SKIP_REASONS: { id: SkipReason; label: string }[] = [
  { id: "no_setup", label: "No setup armed" },
  { id: "no_poi", label: "No draw POI" },
  { id: "counter_draw", label: "Against the draw" },
  { id: "eqhl", label: "EQH / EQL in way" },
  { id: "ndog", label: "NDOG / NWOG magnet" },
  { id: "news", label: "News / red folder" },
  { id: "gut", label: "Gut skip" },
  { id: "low_grade", label: "Low confluence" },
  { id: "other", label: "Other" },
];

/** Render NWOG read — new two-dim fields first, legacy single value as fallback. */
function nwogLabel(j: JournalEntry): string {
  if (j.nwogPos != null || j.nwogFilled != null) {
    const pos = j.nwogPos ?? "?";
    const state = j.nwogFilled == null ? "" : j.nwogFilled ? " · filled" : " · unfilled";
    return pos + state;
  }
  return j.nwog ?? "—";
}

function emptyLive() {
  return {
    mode: "live" as JournalLogMode,
    date: todayStr(),
    accountId: "",
    direction: "skip" as JournalEntry["direction"],
    morningBias: "neutral" as MorningBias,
    prbFilter: "Both" as PrbFilter,
    redFolder: "no" as RedFolderTag,
    redFolderTime: "",
    redFolderEvent: "",
    showOutcome: false,
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
  const [filterAcct, setFilterAcct] = useState(MORNINGSTAR_STUDY_ID);
  const [previewShot, setPreviewShot] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [mode, setMode] = useState<JournalLogMode>("morningstar");
  const [f, setF] = useState(emptyLive);
  const [logErr, setLogErr] = useState("");
  const [shotErr, setShotErr] = useState("");

  const tookTrade = f.direction === "long" || f.direction === "short";

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

  const addLive = () => {
    const acct = f.accountId || activeId;
    if (!acct) {
      setLogErr("Live mode needs an account — pick one or switch to Dual46 study.");
      return;
    }
    if (f.redFolder === "yes" && !f.redFolderTime.trim()) {
      setLogErr("Red folder = yes needs news time (HHMM NY).");
      return;
    }
    setLogErr("");
    const entry: JournalEntry = {
      id: uid(),
      date: f.date,
      loggedAt: new Date().toISOString(),
      accountId: acct,
      direction: f.direction,
      morningBias: f.morningBias,
      prbFilter: f.prbFilter,
      redFolder: f.redFolder,
      redFolderTime: f.redFolder === "yes" ? f.redFolderTime.trim() : undefined,
      redFolderEvent: f.redFolder === "yes" ? f.redFolderEvent.trim() || undefined : undefined,
      grade: "B",
      pnl: tookTrade && f.showOutcome ? parseFloat(f.pnl) || 0 : 0,
      rMultiple: tookTrade && f.showOutcome ? parseFloat(f.r) || 0 : 0,
      mfeR: tookTrade && f.showOutcome && f.mfeR !== "" ? parseFloat(f.mfeR) || 0 : undefined,
      giveBack: tookTrade && f.showOutcome ? f.giveBack : false,
      checklistFails: f.skipReasons.join(","),
      skipReasons: f.skipReasons.length ? f.skipReasons : undefined,
      notes: f.notes,
      strategy: "PRB",
      chartShot: f.chartShot || undefined,
    };
    setJournal([...journal, entry]);
    setF(emptyLive());
    setShotErr("");
  };

  // Newest-logged first (walk months run backwards in time, so date sort
  // buried fresh May rows under June — looked like saves were failing).
  // Legacy rows have no loggedAt; array position is their true log order.
  const rows = journal
    .map((j, idx) => ({ j, idx }))
    .filter(({ j }) => {
      if (!filterAcct) return true;
      if (filterAcct === MORNINGSTAR_STUDY_ID) {
        return j.accountId === MORNINGSTAR_STUDY_ID || j.strategy === "Morningstar";
      }
      return j.accountId === filterAcct;
    })
    .sort((a, b) => (b.j.loggedAt ?? "").localeCompare(a.j.loggedAt ?? "") || b.idx - a.idx)
    .map(({ j }) => j);

  const dualRows = rows.filter((j) => j.dualVersion === "Dual46" || j.strategy === "Morningstar");
  const takes = dualRows.filter((j) => j.direction !== "skip");
  const wins = dualRows.filter((j) => j.dualOutcome === "WIN").length;
  const losses = dualRows.filter((j) => j.dualOutcome === "LOSS").length;
  const skips = dualRows.filter((j) => j.direction === "skip" || j.dualOutcome === "skipped").length;
  const biasStats = useMemo(() => analyzeBiasJournal(rows), [rows]);

  const acctLabel = (id: string, strategy?: string) => {
    if (id === MORNINGSTAR_STUDY_ID || strategy === "Morningstar") return "Dual46";
    return accounts.find((a) => a.id === id)?.label ?? id.slice(0, 8);
  };

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Dual46 logs</div>
          <div className="v">{dualRows.length}</div>
          <div className="d">
            {skips} skip · {takes.length} take
          </div>
        </div>
        <div className="stat">
          <div className="k">Outcomes</div>
          <div className="v">
            <span className="pos">{wins}W</span> / <span className="neg">{losses}L</span>
          </div>
          <div className="d">from WIN/LOSS tags</div>
        </div>
        <div className="stat">
          <div className="k">Walk months</div>
          <div className="v accent">Jun → May</div>
          <div className="d">then Nov–Dec 2025</div>
        </div>
        <div className="stat">
          <div className="k">How to log</div>
          <div className="v accent">Ctrl+V</div>
          <div className="d">paste + OCR here</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Dual46 day study
          <span className="sub">paste chart → OCR tag → bias → log · all on this page</span>
        </div>
        <div className="panel-body">
          <div className="frm-row" style={{ marginBottom: 12 }}>
            <label className="fld">
              Mode
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as JournalLogMode);
                  setLogErr("");
                }}
              >
                <option value="morningstar">Dual46 Path B study</option>
                <option value="live">Live account (PRB)</option>
              </select>
            </label>
          </div>

          {mode === "morningstar" ? (
            <Dual46StudyForm onSave={(entry) => setJournal([...journal, entry])} />
          ) : (
            <>
              {logErr && (
                <p className="warn small" style={{ marginTop: 0 }}>
                  {logErr}
                </p>
              )}
              <div className="frm-row">
                <label className="fld">
                  Date
                  <input
                    type="date"
                    value={f.date}
                    onChange={(e) => setF({ ...f, date: e.target.value })}
                  />
                </label>
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
                  Morning bias
                  <select
                    value={f.morningBias}
                    onChange={(e) => setF({ ...f, morningBias: e.target.value as MorningBias })}
                  >
                    {MORNING_BIASES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fld">
                  Direction filter
                  <select
                    value={f.prbFilter}
                    onChange={(e) => setF({ ...f, prbFilter: e.target.value as PrbFilter })}
                  >
                    {PRB_FILTERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fld">
                  Did
                  <select
                    value={f.direction}
                    onChange={(e) =>
                      setF({
                        ...f,
                        direction: e.target.value as JournalEntry["direction"],
                        showOutcome: e.target.value !== "skip" ? f.showOutcome : false,
                      })
                    }
                  >
                    <option value="skip">Skip</option>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
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
              </div>
              {f.redFolder === "yes" && (
                <div className="frm-row">
                  <label className="fld">
                    Time HHMM
                    <input
                      value={f.redFolderTime}
                      onChange={(e) => setF({ ...f, redFolderTime: e.target.value })}
                      style={{ width: 80 }}
                    />
                  </label>
                  <label className="fld">
                    Event
                    <input
                      value={f.redFolderEvent}
                      onChange={(e) => setF({ ...f, redFolderEvent: e.target.value })}
                      style={{ width: 100 }}
                    />
                  </label>
                </div>
              )}
              <div className="frm-row">
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
              <label className="fld" style={{ maxWidth: "100%" }}>
                Notes
                <input
                  value={f.notes}
                  onChange={(e) => setF({ ...f, notes: e.target.value })}
                  style={{ width: "100%", maxWidth: 480 }}
                />
              </label>
              <div className="frm-row">
                <label className="fld">
                  Snapshot
                  <input type="file" accept="image/*" onChange={(e) => onShot(e.target.files?.[0] ?? null)} />
                </label>
                {f.chartShot && (
                  <button type="button" className="btn-ghost" onClick={() => setPreviewShot(f.chartShot)}>
                    Preview
                  </button>
                )}
              </div>
              {shotErr && <p className="warn small">{shotErr}</p>}
              {tookTrade && (
                <details
                  className="mt"
                  open={f.showOutcome}
                  onToggle={(e) => setF({ ...f, showOutcome: (e.target as HTMLDetailsElement).open })}
                >
                  <summary className="small dim" style={{ cursor: "pointer" }}>
                    Optional P&amp;L / R
                  </summary>
                  <div className="frm-row mt">
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
                  </div>
                </details>
              )}
              <div className="frm-row mt">
                <button type="button" className="btn" onClick={addLive}>
                  Log live
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {editId &&
        (() => {
          const target = journal.find((x) => x.id === editId);
          if (!target) return null;
          return (
            <JournalEditPanel
              key={target.id}
              entry={target}
              onSave={(updated) => {
                setJournal(journal.map((x) => (x.id === updated.id ? updated : x)));
                setEditId(null);
              }}
              onCancel={() => setEditId(null)}
            />
          );
        })()}

      <div className="panel">
        <div className="panel-title">
          Review
          <span className="sub">
            <select value={filterAcct} onChange={(e) => setFilterAcct(e.target.value)}>
              <option value={MORNINGSTAR_STUDY_ID}>Dual46 study</option>
              <option value="">all</option>
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
                <th></th>
                <th>Date</th>
                <th>Bias</th>
                <th>Did</th>
                <th>Tag</th>
                <th>Src</th>
                <th>NWOG</th>
                <th>News</th>
                <th>Fill</th>
                <th>Out</th>
                <th>Stop</th>
                <th>RR</th>
                <th>Shot</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => {
                const shots = j.chartShots?.length ? j.chartShots : j.chartShot ? [j.chartShot] : [];
                return (
                  <tr key={j.id} style={editId === j.id ? { outline: "1px solid var(--matrix-dim)" } : undefined}>
                    <td>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: "1px 7px" }}
                        title="Edit entry"
                        onClick={() => setEditId(editId === j.id ? null : j.id)}
                      >
                        edit
                      </button>
                    </td>
                    <td>{j.date}</td>
                    <td className="small dim">
                      {[j.weekBias, j.dayBias].filter(Boolean).join("/") || j.morningBias || "—"}
                    </td>
                    <td
                      className={
                        j.direction === "skip" ? "dim" : j.direction === "long" ? "pos" : "neg"
                      }
                    >
                      {j.direction === "skip" ? "SKIP" : j.direction.toUpperCase()}
                    </td>
                    <td className="small dim">{j.structureTag ?? acctLabel(j.accountId, j.strategy)}</td>
                    <td className="small dim">{j.entrySource ?? "—"}</td>
                    <td className="small dim">{nwogLabel(j)}</td>
                    <td className={"small " + (j.redFolder === "yes" ? "warn" : "dim")}>
                      {j.redFolder === "yes"
                        ? `${j.redFolderEvent ?? "red"}${j.redFolderTime ? ` ${j.redFolderTime}` : ""}`
                        : j.redFolder === "no"
                          ? "—"
                          : "?"}
                    </td>
                    <td className="small dim">{j.fillStatus ?? "—"}</td>
                    <td
                      className={
                        j.dualOutcome === "WIN" ? "pos" : j.dualOutcome === "LOSS" ? "neg" : "dim"
                      }
                    >
                      {j.dualOutcome ?? j.grade}
                    </td>
                    <td className="small dim">{j.stopPts != null ? j.stopPts : "—"}</td>
                    <td className="small dim">
                      {j.planRr != null ? `1:${j.planRr}` : "—"}
                    </td>
                    <td>
                      {shots.length ? (
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => setPreviewShot(shots[0])}
                        >
                          {shots.length > 1 ? `${shots.length} imgs` : "view"}
                        </button>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="small dim">{j.notes}</td>
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
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={15} className="dim">
                    Nothing logged yet — paste a chart above and hit Log.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewShot && (
        <div role="dialog" className="shot-modal" onClick={() => setPreviewShot(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewShot} alt="Chart" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {mode === "live" && biasStats.filterMismatch > 0 && (
        <div className="panel">
          <div className="panel-body small warn">
            Live filter-mismatch count: {biasStats.filterMismatch}.{" "}
            <Link href="/accounts">Accounts</Link>
          </div>
        </div>
      )}
    </>
  );
}
