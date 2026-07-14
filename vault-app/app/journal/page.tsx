"use client";

import { useMemo, useState } from "react";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import { Account, JournalEntry, MorningBias, PrbFilter, RedFolderTag, uid } from "@/lib/types";
import { analyzeBiasJournal } from "@/lib/bias-journal";

const MORNING_BIASES: MorningBias[] = ["long", "short", "neutral", "skip"];
const PRB_FILTERS: PrbFilter[] = ["Both", "Long only", "Short only"];
const RED_FOLDER_TAGS: RedFolderTag[] = ["unknown", "yes", "no"];

export default function JournalPage() {
  const [journal, setJournal] = useLocal<JournalEntry[]>("vault.journal", []);
  const [accounts] = useLocal<Account[]>("vault.accounts", []);
  const [activeId] = useLocal<string>("vault.activeAccount", "");
  const [filterAcct, setFilterAcct] = useState("");

  const [f, setF] = useState({
    date: todayStr(),
    accountId: "",
    direction: "long" as JournalEntry["direction"],
    morningBias: "neutral" as MorningBias,
    prbFilter: "Both" as PrbFilter,
    redFolder: "unknown" as RedFolderTag,
    grade: "B" as JournalEntry["grade"],
    pnl: "",
    r: "",
    giveBack: false,
    fails: "",
    notes: "",
  });

  const add = () => {
    const acct = f.accountId || activeId;
    if (!acct) return;
    const entry: JournalEntry = {
      id: uid(),
      date: f.date,
      accountId: acct,
      direction: f.direction,
      morningBias: f.morningBias,
      prbFilter: f.prbFilter,
      redFolder: f.redFolder,
      grade: f.grade,
      pnl: parseFloat(f.pnl) || 0,
      rMultiple: parseFloat(f.r) || 0,
      giveBack: f.giveBack,
      checklistFails: f.fails,
      notes: f.notes,
    };
    setJournal([...journal, entry]);
    setF({ ...f, pnl: "", r: "", giveBack: false, fails: "", notes: "" });
  };

  const rows = journal
    .filter((j) => !filterAcct || j.accountId === filterAcct)
    .sort((a, b) => b.date.localeCompare(a.date));

  const trades = rows.filter((r) => r.direction !== "skip");
  const net = trades.reduce((s, j) => s + j.pnl, 0);
  const wins = trades.filter((j) => j.pnl > 50).length;
  const losses = trades.filter((j) => j.pnl < -50).length;
  const giveBacks10 = rows.slice(0, 10).filter((j) => j.giveBack).length;
  const biasStats = useMemo(() => analyzeBiasJournal(rows), [rows]);

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Forward net</div>
          <div className={"v " + (net >= 0 ? "pos" : "neg")}>{fmtUsd(net, true)}</div>
          <div className="d">{trades.length} trades · {rows.length - trades.length} skips logged</div>
        </div>
        <div className="stat">
          <div className="k">W / L / scratch</div>
          <div className="v">{wins} / {losses} / {trades.length - wins - losses}</div>
        </div>
        <div className="stat">
          <div className="k">Give-backs (last 10 entries)</div>
          <div className={"v " + (giveBacks10 >= 2 ? "warn" : "")}>{giveBacks10}</div>
          <div className="d">{giveBacks10 >= 2 ? "CONSIDER TRAIL TOGGLE" : "BE-only OK"}</div>
        </div>
        <div className="stat">
          <div className="k">Bias / filter mismatch</div>
          <div className={"v " + (biasStats.filterMismatch > 0 ? "warn" : "")}>{biasStats.filterMismatch}</div>
          <div className="d">
            {biasStats.filterMismatch > 0
              ? `${fmtUsd(biasStats.mismatchNet, true)} on mismatched days`
              : "log morning bias + PRB filter"}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Morning bias tracker
          <span className="sub">D→4H read vs PRB filter vs trade — the Feb–Mar discretion dataset</span>
        </div>
        <div className="panel-body">
          <table className="kv-table">
            <tbody>
              <tr>
                <td className="dim">Entries with bias logged</td>
                <td>{biasStats.withBias} / {biasStats.logged}</td>
              </tr>
              <tr>
                <td className="dim">Both filter on bearish read</td>
                <td className={biasStats.bothOnBearishRead > 0 ? "warn" : ""}>{biasStats.bothOnBearishRead}</td>
              </tr>
              <tr>
                <td className="dim">Aligned W / L</td>
                <td>{biasStats.alignedWins} / {biasStats.alignedLosses}</td>
              </tr>
              <tr>
                <td className="dim">Mismatch losses</td>
                <td className={biasStats.mismatchLosses > 0 ? "neg" : ""}>{biasStats.mismatchLosses}</td>
              </tr>
            </tbody>
          </table>
          <p className="small dim mt" style={{ lineHeight: 1.6, marginBottom: 0 }}>
            Log <strong>skip</strong> days too — skipped sessions with a bearish morning read while Pine stayed on
            Both is valuable data for the 12-month replay comparison.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Log entry <span className="sub">trades AND skips</span></div>
        <div className="panel-body">
          <div className="frm-row">
            <label className="fld">
              Date
              <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            </label>
            <label className="fld">
              Account
              <select value={f.accountId || activeId} onChange={(e) => setF({ ...f, accountId: e.target.value })}>
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
                title="D→4H read before session"
              >
                {MORNING_BIASES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label className="fld">
              PRB filter
              <select
                value={f.prbFilter}
                onChange={(e) => setF({ ...f, prbFilter: e.target.value as PrbFilter })}
                title="Direction filter in Pine that day"
              >
                {PRB_FILTERS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label className="fld">
              Red folder
              <select
                value={f.redFolder}
                onChange={(e) => setF({ ...f, redFolder: e.target.value as RedFolderTag })}
              >
                {RED_FOLDER_TAGS.map((b) => (
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
              Grade
              <select
                value={f.grade}
                onChange={(e) => setF({ ...f, grade: e.target.value as JournalEntry["grade"] })}
              >
                <option>A+</option>
                <option>B</option>
                <option>C</option>
                <option>-</option>
              </select>
            </label>
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
              Give-back?
              <input
                type="checkbox"
                checked={f.giveBack}
                onChange={(e) => setF({ ...f, giveBack: e.target.checked })}
                title="peaked >=2R, exited <1R"
              />
            </label>
            <label className="fld">
              Checklist fails
              <input
                value={f.fails}
                onChange={(e) => setF({ ...f, fails: e.target.value })}
                placeholder="e.g. eqhl, gap"
              />
            </label>
            <label className="fld">
              Notes
              <input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} style={{ width: 220 }} />
            </label>
            <button type="button" className="btn" onClick={add}>
              Log
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          History
          <span className="sub">
            <select value={filterAcct} onChange={(e) => setFilterAcct(e.target.value)}>
              <option value="">all accounts</option>
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
                <th>Bias</th>
                <th>Filter</th>
                <th>Red</th>
                <th>Dir</th>
                <th>Grade</th>
                <th className="num">P&L</th>
                <th className="num">R</th>
                <th>GB</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id}>
                  <td>{j.date}</td>
                  <td className="small">{j.morningBias ?? "—"}</td>
                  <td className="small dim">{j.prbFilter ?? "—"}</td>
                  <td className="small dim">{j.redFolder ?? "—"}</td>
                  <td className={j.direction === "skip" ? "dim" : j.direction === "long" ? "pos" : "neg"}>
                    {j.direction.toUpperCase()}
                  </td>
                  <td>{j.grade}</td>
                  <td className={"num " + (j.pnl > 0 ? "pos" : j.pnl < 0 ? "neg" : "dim")}>
                    {j.direction === "skip" ? "—" : fmtUsd(j.pnl, true)}
                  </td>
                  <td className="num">{j.direction === "skip" ? "—" : j.rMultiple.toFixed(1)}</td>
                  <td>{j.giveBack ? <span className="warn">GB</span> : ""}</td>
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
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="dim">
                    Nothing logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
