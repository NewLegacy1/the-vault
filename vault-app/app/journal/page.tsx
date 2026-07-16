"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

/** Context + LTF slots — check only what lit; empty day = leave all off (0/6 is valid). */
const MS_FLAGS: {
  key: "msPoi" | "msH4" | "msCisd" | "msIfvg1" | "msIfvg5" | "msRb5";
  label: string;
  hint: string;
}[] = [
  { key: "msPoi", label: "Draw POI", hint: "Context — PDH / PDL / PM / key open on the RB" },
  { key: "msH4", label: "4H wick OK", hint: "Context — 4H↑/↓ pts green (~15+) or grey (~8+)" },
  { key: "msCisd", label: "1m CISD", hint: "LTF — only if chart marked CISD inside the HTF box" },
  { key: "msIfvg1", label: "1m IFVG", hint: "LTF — only if 1IFVG lit inside the HTF box" },
  { key: "msIfvg5", label: "5m IFVG", hint: "LTF — only if 5IFVG lit inside the HTF box" },
  { key: "msRb5", label: "5m RB", hint: "LTF — only if 5RB counted inside the HTF box" },
];

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

type FormState = ReturnType<typeof emptyForm>;

function emptyForm(mode: JournalLogMode) {
  return {
    mode,
    date: todayStr(),
    accountId: "",
    direction: "skip" as JournalEntry["direction"],
    morningBias: "neutral" as MorningBias,
    prbFilter: "Both" as PrbFilter,
    redFolder: "no" as RedFolderTag,
    redFolderTime: "",
    redFolderEvent: "",
    structureTf: "15" as StructTf,
    structureTag: "",
    msPoi: false,
    msH4: false,
    msCisd: false,
    msIfvg1: false,
    msIfvg5: false,
    msRb5: false,
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

function msScoreFromFlags(f: FormState): number {
  return (
    (f.msPoi ? 1 : 0) +
    (f.msH4 ? 1 : 0) +
    (f.msCisd ? 1 : 0) +
    (f.msIfvg1 ? 1 : 0) +
    (f.msIfvg5 ? 1 : 0) +
    (f.msRb5 ? 1 : 0)
  );
}

function msLtfFromFlags(f: FormState): number {
  return (f.msCisd ? 1 : 0) + (f.msIfvg1 ? 1 : 0) + (f.msIfvg5 ? 1 : 0) + (f.msRb5 ? 1 : 0);
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

  const msScore = msScoreFromFlags(f);
  const msLtf = msLtfFromFlags(f);
  const letter = letterFromMsScore(msScore);
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

  const add = () => {
    const isStudy = f.mode === "morningstar";
    const acct = isStudy ? MORNINGSTAR_STUDY_ID : f.accountId || activeId;
    if (!acct) {
      setLogErr("Live mode needs an account — pick one or switch to Morningstar study.");
      return;
    }
    if (f.redFolder === "yes" && !f.redFolderTime.trim()) {
      setLogErr("Red folder = yes needs news time (HHMM NY). Use F7 News → Look up a day.");
      return;
    }
    if (isStudy && !f.structureTag.trim() && tookTrade) {
      setLogErr("Paste the chart tag (e.g. 15m · PDH) so we know which RB you took.");
      return;
    }
    setLogErr("");
    const score = isStudy ? msScoreFromFlags(f) : undefined;
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
      grade: isStudy ? letterFromMsScore(score ?? 0) : "B",
      pnl: tookTrade && f.showOutcome ? parseFloat(f.pnl) || 0 : 0,
      rMultiple: tookTrade && f.showOutcome ? parseFloat(f.r) || 0 : 0,
      mfeR:
        tookTrade && f.showOutcome && f.mfeR !== "" ? parseFloat(f.mfeR) || 0 : undefined,
      giveBack: tookTrade && f.showOutcome ? f.giveBack : false,
      checklistFails: f.skipReasons.join(","),
      skipReasons: f.skipReasons.length ? f.skipReasons : undefined,
      notes: f.notes,
      strategy: isStudy ? "Morningstar" : "PRB",
      structureTf: isStudy ? f.structureTf : undefined,
      structureTag: isStudy ? f.structureTag.trim() || undefined : undefined,
      msScore: score,
      msPoi: isStudy ? f.msPoi : undefined,
      msH4: isStudy ? f.msH4 : undefined,
      msCisd: isStudy ? f.msCisd : undefined,
      msIfvg1: isStudy ? f.msIfvg1 : undefined,
      msIfvg5: isStudy ? f.msIfvg5 : undefined,
      msRb5: isStudy ? f.msRb5 : undefined,
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
  const msRows = rows.filter((j) => j.strategy === "Morningstar" || j.accountId === MORNINGSTAR_STUDY_ID);
  const scored = msRows.filter((j) => typeof j.msScore === "number");
  const avgMs = scored.reduce((s, j) => s + (j.msScore ?? 0), 0) / Math.max(1, scored.length);
  const biasStats = useMemo(() => analyzeBiasJournal(rows), [rows]);

  const acctLabel = (id: string, strategy?: string) => {
    if (id === MORNINGSTAR_STUDY_ID || strategy === "Morningstar") return "Morningstar";
    return accounts.find((a) => a.id === id)?.label ?? id.slice(0, 8);
  };

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Study logs</div>
          <div className="v">{msRows.length}</div>
          <div className="d">
            {msRows.filter((j) => j.direction === "skip").length} skips · {trades.length} takes
          </div>
        </div>
        <div className="stat">
          <div className="k">Avg Morningstar</div>
          <div className="v">{scored.length ? `${avgMs.toFixed(1)}/5` : "—"}</div>
          <div className="d">from confluence flags</div>
        </div>
        <div className="stat">
          <div className="k">Logged P&L (optional)</div>
          <div className={"v " + (net >= 0 ? "pos" : "neg")}>{fmtUsd(net, true)}</div>
          <div className="d">
            {wins}W / {losses}L · only if you filled outcome
          </div>
        </div>
        <div className="stat">
          <div className="k">News calendar</div>
          <div className="v accent">
            <Link href="/news">F7</Link>
          </div>
          <div className="d">look up red-folder day</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Morningstar log
          <span className="sub">tap what you saw on the chart · score fills itself · snapshot optional</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.55 }}>
            Chart screenshots can&apos;t reliably auto-read TradingView labels yet — OCR misses MS grades too
            often. Fast path: check the 5 confluence boxes (same as chart), attach a shot for later, skip
            P&amp;L unless you care.
          </p>

          {logErr && (
            <p className="warn small" style={{ marginTop: 0 }}>
              {logErr}
            </p>
          )}

          <div className="frm-row" style={{ marginBottom: 8 }}>
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
            <label className="fld">
              Date
              <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            </label>
          </div>

          {f.mode === "live" && (
            <div className="frm-row">
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
                TV Direction filter
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
            </div>
          )}

          {/* 1 · Session */}
          <div className="accent small" style={{ letterSpacing: 1, marginTop: 8 }}>
            1 · SESSION
          </div>
          <div className="frm-row">
            <label className="fld">
              Morning bias (D→4H)
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
              What I did
              <select
                value={f.direction}
                onChange={(e) =>
                  setF({
                    ...f,
                    direction: e.target.value as JournalEntry["direction"],
                    showOutcome: e.target.value !== "skip" ? f.showOutcome : false,
                  })
                }
                title="Direction of the trade you took — or SKIP if you passed"
              >
                <option value="skip">Skipped the setup</option>
                <option value="long">Took the long</option>
                <option value="short">Took the short</option>
              </select>
            </label>
            <label className="fld">
              Red-folder news?
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
                    placeholder="CPI"
                    style={{ width: 100 }}
                  />
                </label>
              </>
            )}
          </div>
          <p className="small dim" style={{ marginTop: 0 }}>
            Red folder? <Link href="/news">F7 Look up a day</Link> — copy the time. No Forex Factory needed.
          </p>

          {f.mode === "morningstar" && (
            <>
              {/* 2 · Setup on chart */}
              <div className="accent small" style={{ letterSpacing: 1, marginTop: 12 }}>
                2 · SETUP ON CHART
              </div>
              <div className="frm-row">
                <label className="fld">
                  Arming structure TF
                  <select
                    value={f.structureTf}
                    onChange={(e) => setF({ ...f, structureTf: e.target.value as StructTf })}
                  >
                    {STRUCT_TFS.map((t) => (
                      <option key={t} value={t}>
                        {t === "15"
                          ? "15m"
                          : t === "30"
                            ? "30m"
                            : t === "60"
                              ? "1H"
                              : t === "240"
                                ? "4H"
                                : "Chart"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fld">
                  Chart tag (from RB label)
                  <input
                    value={f.structureTag}
                    onChange={(e) => setF({ ...f, structureTag: e.target.value })}
                    placeholder="15m · PDH"
                    style={{ width: 160 }}
                  />
                </label>
              </div>

              {/* 3 · Confluence → auto grade */}
              <div className="accent small" style={{ letterSpacing: 1, marginTop: 12 }}>
                3 · CONFLUENCE (same as Morningstar chart marks)
              </div>
              <p className="small dim" style={{ marginTop: 0, marginBottom: 8 }}>
                Check only what lit. No armed setup / no LTF stack → leave LTF boxes off (0 is valid). Use
                skip reason <b>No setup armed</b>. Context (POI / 4H) can still be checked from the session
                even when nothing armed.
              </p>
              <div className="frm-row" style={{ alignItems: "stretch", gap: 8 }}>
                {MS_FLAGS.map((flag) => (
                  <label
                    key={flag.key}
                    className={"chk" + (f[flag.key] ? " done" : "")}
                    title={flag.hint}
                    style={{
                      minWidth: 120,
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "8px 10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={f[flag.key]}
                      onChange={(e) => setF({ ...f, [flag.key]: e.target.checked })}
                    />
                    <span className="chk-box" aria-hidden="true" />
                    <span className="txt">
                      <b>{flag.label}</b>
                      <span className="note">{flag.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div
                className="mt"
                style={{
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--border-hi)",
                  background: "var(--panel, transparent)",
                }}
              >
                <span className="dim small">Auto grade · </span>
                <span className="accent" style={{ fontSize: 18, fontWeight: 600 }}>
                  {msScore}/6 · {letter}
                </span>
                <span className="dim small">
                  {" "}
                  · chart LTF {msLtf}/4
                  {msScore === 0 ? " · empty stack OK" : msScore >= 5 ? " · A+ band" : msScore >= 3 ? " · B band" : " · C band"}
                </span>
              </div>

              {/* 4 · Why skip / why weak */}
              <div className="accent small" style={{ letterSpacing: 1, marginTop: 16 }}>
                4 · WHY SKIP / WHY WEAK (optional)
              </div>
              <div className="frm-row" style={{ alignItems: "center" }}>
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
              <label className="fld" style={{ maxWidth: "100%", marginTop: 8 }}>
                Notes
                <input
                  value={f.notes}
                  onChange={(e) => setF({ ...f, notes: e.target.value })}
                  placeholder="one line — what you saw"
                  style={{ width: "100%", maxWidth: 480 }}
                />
              </label>
            </>
          )}

          {/* 5 · Snapshot */}
          <div className="accent small" style={{ letterSpacing: 1, marginTop: 16 }}>
            5 · CHART SNAPSHOT (optional · not auto-parsed)
          </div>
          <div className="frm-row" style={{ alignItems: "flex-end" }}>
            <label className="fld">
              Upload PNG/JPG
              <input type="file" accept="image/*" onChange={(e) => onShot(e.target.files?.[0] ?? null)} />
            </label>
            {f.chartShot && (
              <>
                <button type="button" className="btn-ghost" onClick={() => setPreviewShot(f.chartShot)}>
                  Preview
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.chartShot}
                  alt="Chart"
                  style={{ height: 48, borderRadius: 4, border: "1px solid var(--border)" }}
                />
              </>
            )}
          </div>
          {shotErr && (
            <p className="warn small" style={{ marginTop: 0 }}>
              {shotErr}
            </p>
          )}

          {/* Optional outcome — collapsed */}
          {tookTrade && (
            <details
              className="mt"
              open={f.showOutcome}
              onToggle={(e) => setF({ ...f, showOutcome: (e.target as HTMLDetailsElement).open })}
            >
              <summary className="small dim" style={{ cursor: "pointer" }}>
                Optional · P&amp;L / R / MFE (skip this for study — not required)
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
                  R multiple
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
                  />
                </label>
                <label className="fld">
                  Peaked ≥2R, exited &lt;1R
                  <input
                    type="checkbox"
                    checked={f.giveBack}
                    onChange={(e) => setF({ ...f, giveBack: e.target.checked })}
                  />
                </label>
              </div>
            </details>
          )}

          <div className="frm-row mt">
            <button type="button" className="btn" onClick={add}>
              Log setup
            </button>
          </div>
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
                <th>Did</th>
                <th>Tag</th>
                <th>Grade</th>
                <th>Red</th>
                <th>Shot</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id}>
                  <td>{j.date}</td>
                  <td
                    className={
                      j.direction === "skip" ? "dim" : j.direction === "long" ? "pos" : "neg"
                    }
                  >
                    {j.direction === "skip" ? "SKIP" : j.direction.toUpperCase()}
                  </td>
                  <td className="small dim">{j.structureTag ?? "—"}</td>
                  <td>
                    {typeof j.msScore === "number" ? (
                      <>
                        <span className="accent">{j.msScore}/6</span> {j.grade}
                      </>
                    ) : (
                      j.grade
                    )}
                  </td>
                  <td className="small dim">
                    {j.redFolder === "yes"
                      ? `${j.redFolderTime ?? "?"} ${j.redFolderEvent ?? ""}`.trim()
                      : (j.redFolder ?? "—")}
                  </td>
                  <td>
                    {j.chartShot ? (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setPreviewShot(j.chartShot!)}
                      >
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
                  <td colSpan={8} className="dim">
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

      {f.mode === "live" && biasStats.filterMismatch > 0 && (
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
