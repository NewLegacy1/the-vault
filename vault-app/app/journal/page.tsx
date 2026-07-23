"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dual46StudyForm } from "@/components/Dual46StudyForm";
import { JournalEditPanel } from "@/components/JournalEditPanel";
import { VaultSyncPanel } from "@/components/VaultSyncPanel";
import { compressChartShot } from "@/lib/journal-shot";
import {
  MSV46_LIVE_2026_07_23_END_BALANCE,
  buildMsv46Live20260723Entries,
  findApex50LiveAccount,
} from "@/lib/msv46-live-2026-07-23";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import {
  Account,
  FORWARD_DISC_ID,
  JournalEntry,
  JournalLogMode,
  MORNINGSTAR_STUDY_ID,
  MorningBias,
  RedFolderTag,
  isPaperAccount,
  makePaperAccount,
  uid,
} from "@/lib/types";
import { analyzeBiasJournal } from "@/lib/bias-journal";
import { ruleById } from "@/lib/prop-firms";

const MORNING_BIASES: MorningBias[] = ["long", "short", "neutral", "skip"];

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
    date: todayStr(),
    accountId: "",
    direction: "skip" as JournalEntry["direction"],
    weekBias: "none" as "long" | "short" | "none",
    dayBias: "none" as "long" | "short" | "none",
    pathBModel: "—" as "Cont" | "Judas" | "—",
    pathBGrade: "—" as "OTE+KO" | "OTE" | "KO" | "—",
    stopPts: "",
    planRr: "",
    fillStatus: "no-arm" as "yes" | "no" | "no-arm" | "converted",
    dualOutcome: "skipped" as "WIN" | "LOSS" | "no fill" | "skipped",
    againstBias: false,
    entrySource: "disc" as "script" | "disc",
    entryTime: "",
    redFolder: "no" as RedFolderTag,
    redFolderTime: "",
    redFolderEvent: "",
    pnl: "",
    notes: "",
    chartShot: "" as string,
  };
}

function emptyForward() {
  return {
    date: todayStr(),
    direction: "long" as JournalEntry["direction"],
    morningBias: "neutral" as MorningBias,
    againstBias: true,
    stopPts: "",
    planRr: "",
    outcome: "WIN" as "WIN" | "LOSS",
    entryTime: "",
    tpNote: "",
    notes: "",
    chartShot: "" as string,
    /** Gross $ at 10 MNQ ($20/pt) — leave blank to skip. */
    pnl: "",
  };
}

export default function JournalPage() {
  const [journal, setJournal] = useLocal<JournalEntry[]>("vault.journal", []);
  const [accounts, setAccounts] = useLocal<Account[]>("vault.accounts", []);
  const [activeId, setActiveId] = useLocal<string>("vault.activeAccount", "");
  const [previewShot, setPreviewShot] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [mode, setMode] = useState<JournalLogMode>("morningstar");
  const [f, setF] = useState(emptyLive);
  const [fwd, setFwd] = useState(emptyForward);
  const [logErr, setLogErr] = useState("");
  const [shotErr, setShotErr] = useState("");
  /** MSv46 live / forward KPI sleeve filter — script arms vs disc freestyle. */
  const [liveKpiSleeve, setLiveKpiSleeve] = useState<"all" | "script" | "disc">("all");

  const tookTrade = f.direction === "long" || f.direction === "short";
  const selectedLiveId = f.accountId || activeId;
  const selectedLiveAcct = accounts.find((a) => a.id === selectedLiveId);
  const liveIsPaper = selectedLiveAcct ? isPaperAccount(selectedLiveAcct) : false;

  /** Review table follows journal mode — Dual46 study vs live prop vs paper. */
  const reviewFilter =
    mode === "morningstar"
      ? MORNINGSTAR_STUDY_ID
      : mode === "forward"
        ? FORWARD_DISC_ID
        : selectedLiveId || "";

  /** Ensure default Paper / forward-test account exists; return its id. */
  const ensurePaperAccount = (): string => {
    const existing = accounts.find(isPaperAccount);
    if (existing) {
      setActiveId(existing.id);
      return existing.id;
    }
    const acct = makePaperAccount("Paper / forward test", todayStr());
    setAccounts([...accounts, acct]);
    setActiveId(acct.id);
    return acct.id;
  };

  const onShot = async (file: File | null, target: "live" | "forward" = "live") => {
    setShotErr("");
    if (!file) {
      if (target === "forward") setFwd((prev) => ({ ...prev, chartShot: "" }));
      else setF((prev) => ({ ...prev, chartShot: "" }));
      return;
    }
    try {
      const dataUrl = await compressChartShot(file);
      if (target === "forward") setFwd((prev) => ({ ...prev, chartShot: dataUrl }));
      else setF((prev) => ({ ...prev, chartShot: dataUrl }));
    } catch (e) {
      setShotErr(e instanceof Error ? e.message : "Could not compress snapshot");
      if (target === "forward") setFwd((prev) => ({ ...prev, chartShot: "" }));
      else setF((prev) => ({ ...prev, chartShot: "" }));
    }
  };

  const pasteShot = async (e: React.ClipboardEvent, target: "live" | "forward") => {
    const cd = e.clipboardData;
    if (!cd) return;
    for (const item of Array.from(cd.items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await onShot(file, target);
        return;
      }
    }
  };

  const addForward = () => {
    if (fwd.direction !== "long" && fwd.direction !== "short") {
      setLogErr("Pick long or short.");
      return;
    }
    const stopPts = fwd.stopPts !== "" ? parseFloat(fwd.stopPts) : undefined;
    const planRr = fwd.planRr !== "" ? parseFloat(fwd.planRr) : undefined;
    if (stopPts == null || !Number.isFinite(stopPts) || stopPts <= 0) {
      setLogErr("Stop pts required.");
      return;
    }
    if (planRr == null || !Number.isFinite(planRr) || planRr <= 0) {
      setLogErr("Plan R (e.g. 4.08) required.");
      return;
    }
    setLogErr("");
    const paperId = ensurePaperAccount();
    const rMultiple = fwd.outcome === "WIN" ? planRr : -1;
    const tpPts = Math.round(stopPts * planRr * 100) / 100;
    const noteBits = [
      fwd.againstBias ? "against daily bias" : "with daily bias",
      fwd.tpNote.trim() || undefined,
      fwd.entryTime.trim() ? `entry ${fwd.entryTime.trim()} NY` : undefined,
      `SL ${stopPts}pt · TP ~${tpPts}pt · ${planRr}R`,
      fwd.notes.trim() || undefined,
    ].filter(Boolean);
    const entry: JournalEntry = {
      id: uid(),
      date: fwd.date,
      loggedAt: new Date().toISOString(),
      accountId: paperId,
      direction: fwd.direction,
      morningBias: fwd.morningBias,
      dayBias:
        fwd.morningBias === "long" || fwd.morningBias === "short"
          ? fwd.morningBias
          : "none",
      redFolder: "unknown",
      grade: "B",
      pnl: fwd.pnl !== "" ? parseFloat(fwd.pnl) || 0 : 0,
      rMultiple,
      stopPts,
      planRr,
      entryTime: fwd.entryTime.trim() || undefined,
      entrySource: "disc",
      dualOutcome: fwd.outcome,
      fillStatus: "yes",
      giveBack: false,
      checklistFails: fwd.againstBias ? "counter_draw" : "",
      skipReasons: fwd.againstBias ? ["counter_draw"] : undefined,
      notes: noteBits.join(" · "),
      strategy: "ForwardDisc",
      chartShot: fwd.chartShot || undefined,
    };
    setJournal([...journal, entry]);
    setFwd(emptyForward());
    setShotErr("");
    setF((prev) => ({ ...prev, accountId: paperId }));
  };

  const addLive = () => {
    const acct = f.accountId || activeId;
    if (!acct) {
      setLogErr("Pick an account — Apex eval or Add paper / forward test.");
      return;
    }
    if (f.redFolder === "yes" && !f.redFolderTime.trim()) {
      setLogErr("Red folder = yes needs news time (HHMM NY).");
      return;
    }
    if (tookTrade && (f.fillStatus === "yes" || f.fillStatus === "converted")) {
      const stopPts = f.stopPts !== "" ? parseFloat(f.stopPts) : NaN;
      const planRr = f.planRr !== "" ? parseFloat(f.planRr) : NaN;
      if (!Number.isFinite(stopPts) || stopPts <= 0) {
        setLogErr("Stop pts required for a fill.");
        return;
      }
      if (!Number.isFinite(planRr) || planRr <= 0) {
        setLogErr("Plan R required for a fill (e.g. 5 or capped real R).");
        return;
      }
    }
    setLogErr("");
    const paper = accounts.find((a) => a.id === acct && isPaperAccount(a));
    const stopPts = f.stopPts !== "" ? parseFloat(f.stopPts) : undefined;
    const planRr = f.planRr !== "" ? parseFloat(f.planRr) : undefined;
    const rMultiple =
      f.dualOutcome === "WIN" && planRr != null && Number.isFinite(planRr)
        ? planRr
        : f.dualOutcome === "LOSS"
          ? -1
          : 0;
    const tag =
      f.pathBModel !== "—"
        ? `Powell · ${f.pathBModel} · 1RB · ${f.pathBGrade}`
        : f.pathBGrade !== "—"
          ? `Powell · 1RB · ${f.pathBGrade}`
          : undefined;
    const entry: JournalEntry = {
      id: uid(),
      date: f.date,
      loggedAt: new Date().toISOString(),
      accountId: acct,
      direction: f.direction,
      morningBias:
        f.dayBias === "long" ? "long" : f.dayBias === "short" ? "short" : "neutral",
      weekBias: f.weekBias,
      dayBias: f.dayBias,
      pathBModel: f.pathBModel,
      pathBGrade: f.pathBGrade,
      stopPts: stopPts != null && Number.isFinite(stopPts) ? stopPts : undefined,
      planRr: planRr != null && Number.isFinite(planRr) ? planRr : undefined,
      fillStatus: f.fillStatus,
      dualOutcome: f.dualOutcome,
      entryTime: f.entryTime.trim() || undefined,
      entrySource: f.entrySource,
      redFolder: f.redFolder,
      redFolderTime: f.redFolder === "yes" ? f.redFolderTime.trim() : undefined,
      redFolderEvent: f.redFolder === "yes" ? f.redFolderEvent.trim() || undefined : undefined,
      grade:
        f.pathBGrade === "OTE+KO" ? "A+" : f.pathBGrade === "OTE" || f.pathBGrade === "KO" ? "B" : "-",
      pnl: f.pnl !== "" ? parseFloat(f.pnl) || 0 : 0,
      rMultiple,
      giveBack: false,
      checklistFails: f.againstBias ? "counter_draw" : "",
      skipReasons: f.againstBias ? ["counter_draw"] : undefined,
      notes: f.notes,
      strategy: paper ? "ForwardDisc" : "MSv46",
      structureTag: tag,
      structureTf: "chart",
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
      if (mode === "morningstar") {
        return (
          j.accountId === MORNINGSTAR_STUDY_ID ||
          j.strategy === "Morningstar" ||
          j.dualVersion === "Dual46"
        );
      }
      if (mode === "forward") {
        return (
          j.accountId === FORWARD_DISC_ID ||
          j.strategy === "ForwardDisc" ||
          accounts.some((a) => a.id === j.accountId && isPaperAccount(a))
        );
      }
      // MSv46 live — selected / active prop account only
      if (!reviewFilter) return j.strategy === "MSv46";
      return (
        j.accountId === reviewFilter &&
        (j.strategy === "MSv46" || j.strategy === "PRB" || !j.strategy)
      );
    })
    .sort((a, b) => (b.j.loggedAt ?? "").localeCompare(a.j.loggedAt ?? "") || b.idx - a.idx)
    .map(({ j }) => j);

  const dualRows = rows.filter((j) => j.dualVersion === "Dual46" || j.strategy === "Morningstar");
  const takes = dualRows.filter((j) => j.direction !== "skip");
  const wins = dualRows.filter((j) => j.dualOutcome === "WIN").length;
  const losses = dualRows.filter((j) => j.dualOutcome === "LOSS").length;
  const skips = dualRows.filter((j) => j.direction === "skip" || j.dualOutcome === "skipped").length;
  const biasStats = useMemo(() => analyzeBiasJournal(rows), [rows]);

  const liveAcctId = f.accountId || activeId;
  const liveAcct = accounts.find((a) => a.id === liveAcctId);
  const liveRule = liveAcct && !isPaperAccount(liveAcct) ? ruleById(liveAcct.ruleId) : undefined;

  const liveBook = useMemo(() => {
    const acctId = liveAcctId;
    return journal.filter((j) => {
      if (mode === "forward") {
        return (
          j.strategy === "ForwardDisc" ||
          j.accountId === FORWARD_DISC_ID ||
          (acctId && j.accountId === acctId && accounts.some((a) => a.id === j.accountId && isPaperAccount(a)))
        );
      }
      // MSv46 live prop book for selected / active account
      if (!acctId) return j.strategy === "MSv46";
      return j.accountId === acctId && (j.strategy === "MSv46" || j.strategy === "PRB");
    });
  }, [journal, mode, liveAcctId, accounts]);

  /** Missing entrySource → disc (legacy live logs were always disc). */
  const liveKpiBook = useMemo(() => {
    if (liveKpiSleeve === "all") return liveBook;
    return liveBook.filter((j) => {
      const sleeve = j.entrySource === "script" ? "script" : "disc";
      return sleeve === liveKpiSleeve;
    });
  }, [liveBook, liveKpiSleeve]);

  const liveTakes = liveKpiBook.filter((j) => j.direction === "long" || j.direction === "short");
  const liveWins = liveKpiBook.filter((j) => j.dualOutcome === "WIN").length;
  const liveLosses = liveKpiBook.filter((j) => j.dualOutcome === "LOSS").length;
  const liveTradePnl = liveKpiBook.reduce((s, j) => s + (j.pnl || 0), 0);
  const liveNetR = liveTakes.reduce((s, j) => s + (j.rMultiple || 0), 0);
  const liveToTarget =
    liveRule != null ? liveRule.passAt - liveTradePnl : null;
  const liveScriptN = liveBook.filter(
    (j) =>
      j.entrySource === "script" && (j.direction === "long" || j.direction === "short")
  ).length;
  const liveDiscN = liveBook.filter(
    (j) =>
      j.entrySource !== "script" && (j.direction === "long" || j.direction === "short")
  ).length;

  const scriptTakes = dualRows.filter((j) => j.entrySource === "script" && j.direction !== "skip");
  const discTakes = dualRows.filter((j) => j.entrySource === "disc" && j.direction !== "skip");

  const acctLabel = (id: string, strategy?: string) => {
    if (id === MORNINGSTAR_STUDY_ID || strategy === "Morningstar") return "Dual46";
    const acct = accounts.find((a) => a.id === id);
    if (acct && isPaperAccount(acct)) return acct.label || "Paper";
    if (id === FORWARD_DISC_ID || strategy === "ForwardDisc") return "Paper / forward";
    if (strategy === "MSv46") return acct?.label ?? "MSv46";
    return acct?.label ?? id.slice(0, 8);
  };

  return (
    <>
      <div className="stat-strip">
        {mode === "morningstar" ? (
          <>
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
              <div className="d">WIN/LOSS tags</div>
            </div>
            <div className="stat">
              <div className="k">Script / disc</div>
              <div className="v">
                {scriptTakes.length}
                <span className="dim"> / </span>
                {discTakes.length}
              </div>
              <div className="d">takes only · scorecard = script</div>
            </div>
            <div className="stat">
              <div className="k">Paste</div>
              <div className="v accent">Ctrl+V</div>
              <div className="d">OCR Path B tag</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat" style={{ minWidth: 160 }}>
              <div className="k">KPI sleeve</div>
              <div className="v" style={{ display: "flex", flexWrap: "wrap", gap: 4, fontSize: 12 }}>
                {(
                  [
                    { id: "all" as const, label: `All (${liveScriptN + liveDiscN})` },
                    { id: "script" as const, label: `Arms (${liveScriptN})` },
                    { id: "disc" as const, label: `Disc (${liveDiscN})` },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={"chip" + (liveKpiSleeve === opt.id ? " active-acct" : "")}
                    onClick={() => setLiveKpiSleeve(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="d">
                {liveKpiSleeve === "script"
                  ? "script arms only · scorecard sleeve"
                  : liveKpiSleeve === "disc"
                    ? "discretionary only · not the arm"
                    : "combined book"}
              </div>
            </div>
            <div className="stat">
              <div className="k">Trade P&amp;L</div>
              <div className={"v " + (liveTradePnl >= 0 ? "pos" : "neg")}>
                {fmtUsd(liveTradePnl, true)}
              </div>
              <div className="d">
                {mode === "forward"
                  ? "paper book · no fees"
                  : liveAcct
                    ? `${liveAcct.label} · ${liveKpiSleeve === "all" ? "trading only" : liveKpiSleeve}`
                    : "pick account · trading only"}
              </div>
            </div>
            <div className="stat">
              <div className="k">W / L</div>
              <div className="v">
                <span className="pos">{liveWins}W</span> / <span className="neg">{liveLosses}L</span>
              </div>
              <div className="d">{liveTakes.length} takes · {liveKpiSleeve}</div>
            </div>
            <div className="stat">
              <div className="k">Net R</div>
              <div className={"v " + (liveNetR >= 0 ? "pos" : "neg")}>
                {liveNetR >= 0 ? "+" : ""}
                {liveNetR.toFixed(1)}R
              </div>
              <div className="d">sum of logged R multiples</div>
            </div>
            <div className="stat">
              <div className="k">{liveToTarget != null ? "To target" : "Fills"}</div>
              <div className={"v " + (liveToTarget != null && liveToTarget <= 0 ? "pos" : "accent")}>
                {liveToTarget != null
                  ? liveToTarget <= 0
                    ? "HIT"
                    : fmtUsd(liveToTarget)
                  : liveKpiBook.filter((j) => j.fillStatus === "yes" || j.fillStatus === "converted")
                      .length}
              </div>
              <div className="d">
                {liveToTarget != null
                  ? liveKpiSleeve === "all"
                    ? `${fmtUsd(liveRule!.passAt)} pass · trail ${fmtUsd(liveRule!.trailingDD)}`
                    : `${fmtUsd(liveRule!.passAt)} pass · vs ${liveKpiSleeve} P&L only`
                  : "yes + converted"}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">
          Journal log
          <span className="sub">Dual46 study · MSv46 live (prop) · Forward quick</span>
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
                <option value="live">MSv46 live (prop account)</option>
                <option value="forward">Quick forward trade (paper)</option>
              </select>
            </label>
          </div>

          {mode === "morningstar" ? (
            <Dual46StudyForm onSave={(entry) => setJournal([...journal, entry])} />
          ) : mode === "forward" ? (
            <>
              <p className="small dim" style={{ marginTop: 0 }}>
                Saves under your <b>Paper / forward test</b> account (creates it if missing). Same
                book as Accounts → Add paper / forward test. Not Dual46.
              </p>
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
                    value={fwd.date}
                    onChange={(e) => setFwd({ ...fwd, date: e.target.value })}
                  />
                </label>
                <label className="fld">
                  Daily bias
                  <select
                    value={fwd.morningBias}
                    onChange={(e) =>
                      setFwd({ ...fwd, morningBias: e.target.value as MorningBias })
                    }
                  >
                    {MORNING_BIASES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fld">
                  Did
                  <select
                    value={fwd.direction}
                    onChange={(e) =>
                      setFwd({
                        ...fwd,
                        direction: e.target.value as JournalEntry["direction"],
                      })
                    }
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </label>
                <label className="chk" style={{ alignSelf: "end", marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={fwd.againstBias}
                    onChange={(e) => setFwd({ ...fwd, againstBias: e.target.checked })}
                  />
                  <span className="chk-box" aria-hidden="true" />
                  <span className="txt">Against bias</span>
                </label>
              </div>
              <div className="frm-row">
                <label className="fld">
                  Stop pts
                  <input
                    type="number"
                    step="0.25"
                    value={fwd.stopPts}
                    onChange={(e) => setFwd({ ...fwd, stopPts: e.target.value })}
                    style={{ width: 90 }}
                    placeholder="18"
                  />
                </label>
                <label className="fld">
                  Plan R
                  <input
                    type="number"
                    step="0.01"
                    value={fwd.planRr}
                    onChange={(e) => setFwd({ ...fwd, planRr: e.target.value })}
                    style={{ width: 90 }}
                    placeholder="4.08"
                  />
                </label>
                <label className="fld">
                  Outcome
                  <select
                    value={fwd.outcome}
                    onChange={(e) =>
                      setFwd({ ...fwd, outcome: e.target.value as "WIN" | "LOSS" })
                    }
                  >
                    <option value="WIN">WIN</option>
                    <option value="LOSS">LOSS</option>
                  </select>
                </label>
                <label className="fld">
                  Entry HH:MM
                  <input
                    value={fwd.entryTime}
                    onChange={(e) => setFwd({ ...fwd, entryTime: e.target.value })}
                    style={{ width: 90 }}
                    placeholder="10:15"
                  />
                </label>
              </div>
              <label className="fld" style={{ maxWidth: "100%" }}>
                TP / level note
                <input
                  value={fwd.tpNote}
                  onChange={(e) => setFwd({ ...fwd, tpNote: e.target.value })}
                  style={{ width: "100%", maxWidth: 480 }}
                  placeholder="TP @ 10:00 key open · 1m+5m RB midnight"
                />
              </label>
              <label className="fld" style={{ maxWidth: "100%" }}>
                Notes
                <input
                  value={fwd.notes}
                  onChange={(e) => setFwd({ ...fwd, notes: e.target.value })}
                  style={{ width: "100%", maxWidth: 480 }}
                />
              </label>
              <div
                className="shot-paste shot-paste--lg"
                tabIndex={0}
                onPaste={(e) => void pasteShot(e, "forward")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file?.type.startsWith("image/")) void onShot(file, "forward");
                }}
                style={{ marginBottom: 10 }}
              >
                <div style={{ fontSize: 14 }}>
                  <b>Ctrl+V</b> chart snapshot here
                </div>
                <div className="small dim" style={{ marginTop: 4 }}>
                  Or drop / choose a file
                </div>
                {fwd.chartShot && (
                  <div className="frm-row mt" style={{ justifyContent: "center" }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setPreviewShot(fwd.chartShot)}
                    >
                      Preview pasted
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setFwd((prev) => ({ ...prev, chartShot: "" }))}
                    >
                      Clear
                    </button>
                  </div>
                )}
                <label className="fld" style={{ marginTop: 10 }}>
                  Or file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onShot(e.target.files?.[0] ?? null, "forward")}
                  />
                </label>
              </div>
              {shotErr && <p className="warn small">{shotErr}</p>}
              <div className="frm-row">
                <label className="fld">
                  Optional $ P&amp;L (10 MNQ = $20/pt)
                  <input
                    type="number"
                    value={fwd.pnl}
                    onChange={(e) => setFwd({ ...fwd, pnl: e.target.value })}
                    style={{ width: 110 }}
                    placeholder="1460"
                  />
                </label>
              </div>
              <div className="frm-row mt">
                <button type="button" className="btn" onClick={addForward}>
                  Log forward trade
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    setFwd({
                      ...emptyForward(),
                      date: "2026-07-21",
                      direction: "long",
                      morningBias: "short",
                      againstBias: true,
                      stopPts: "18",
                      planRr: "4.08",
                      outcome: "WIN",
                      entryTime: "10:15",
                      tpNote: "TP @ 10:00 key open · 1m+5m RB · midnight open context",
                      notes: "Forward test · price continued higher after TP; still banked 4.08R",
                      pnl: "1460",
                    })
                  }
                >
                  Prefill today&apos;s 4.08R long
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="small dim" style={{ marginTop: 0, lineHeight: 1.5 }}>
                This <b>is</b> the pre-trade gate — fill bias + Path B, then log. No separate
                checklist. Apex account selected above.
              </p>
              <div className="frm-row" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    let acct =
                      accounts.find((a) => a.id === (f.accountId || activeId) && !isPaperAccount(a)) ||
                      findApex50LiveAccount(accounts);

                    let nextAccounts = accounts;
                    if (!acct) {
                      const rule = ruleById("apex50-intraday");
                      if (!rule) {
                        setLogErr("Apex rule missing — add account on Accounts page.");
                        return;
                      }
                      acct = {
                        id: uid(),
                        firm: rule.firm,
                        label: "Apex 50K Intraday",
                        size: rule.size,
                        phase: "eval",
                        startDate: todayStr(),
                        ruleId: rule.id,
                        currentBalance: rule.size,
                        notes: "Auto-created on Jul 23 session import · change phase on Accounts if funded",
                      };
                      nextAccounts = [...accounts, acct];
                    }

                    const incoming = buildMsv46Live20260723Entries(acct.id);
                    const byId = new Map(journal.map((j) => [j.id, j] as const));
                    for (const row of incoming) byId.set(row.id, row);
                    setJournal([...byId.values()]);
                    setAccounts(
                      nextAccounts.map((a) =>
                        a.id === acct!.id
                          ? { ...a, currentBalance: MSV46_LIVE_2026_07_23_END_BALANCE }
                          : a
                      )
                    );
                    setActiveId(acct.id);
                    setF((prev) => ({ ...prev, accountId: acct!.id }));
                    setLogErr("");
                    setMode("live");
                  }}
                >
                  Import Jul 23 Tradovate session (4 fills)
                </button>
                <span className="small dim" style={{ alignSelf: "center" }}>
                  Creates Apex 50K if missing · T4 = <b>script</b> Cont/OTE · safe to re-click
                </span>
              </div>
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
                        {isPaperAccount(a) ? `Paper · ${a.label}` : a.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ alignSelf: "end", marginBottom: 2 }}
                  onClick={() => {
                    const id = ensurePaperAccount();
                    setF((prev) => ({ ...prev, accountId: id }));
                    setLogErr("");
                  }}
                >
                  Add paper
                </button>
              </div>
              {liveIsPaper && (
                <p className="small dim" style={{ marginTop: 0 }}>
                  Paper selected — saved as ForwardDisc. Use Apex account for MSv46 prop logs.
                </p>
              )}
              <div className="frm-row">
                <label className="fld">
                  Week bias
                  <select
                    value={f.weekBias}
                    onChange={(e) =>
                      setF({ ...f, weekBias: e.target.value as "long" | "short" | "none" })
                    }
                  >
                    <option value="none">none</option>
                    <option value="long">long</option>
                    <option value="short">short</option>
                  </select>
                </label>
                <label className="fld">
                  Day bias
                  <select
                    value={f.dayBias}
                    onChange={(e) =>
                      setF({ ...f, dayBias: e.target.value as "long" | "short" | "none" })
                    }
                  >
                    <option value="none">none</option>
                    <option value="long">long</option>
                    <option value="short">short</option>
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
                      })
                    }
                  >
                    <option value="skip">Skip</option>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </label>
                <label className="chk" style={{ alignSelf: "end", marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={f.againstBias}
                    onChange={(e) => setF({ ...f, againstBias: e.target.checked })}
                  />
                  <span className="chk-box" aria-hidden="true" />
                  <span className="txt">Against bias</span>
                </label>
              </div>
              <div className="frm-row">
                <label className="fld">
                  Cont / Judas
                  <select
                    value={f.pathBModel}
                    onChange={(e) =>
                      setF({ ...f, pathBModel: e.target.value as "Cont" | "Judas" | "—" })
                    }
                  >
                    <option value="—">—</option>
                    <option value="Cont">Cont</option>
                    <option value="Judas">Judas</option>
                  </select>
                </label>
                <label className="fld">
                  Src
                  <select
                    value={f.entrySource}
                    onChange={(e) =>
                      setF({
                        ...f,
                        entrySource: e.target.value as "script" | "disc",
                      })
                    }
                  >
                    <option value="disc">disc</option>
                    <option value="script">script</option>
                  </select>
                </label>
                <label className="fld">
                  Grade
                  <select
                    value={f.pathBGrade}
                    onChange={(e) =>
                      setF({
                        ...f,
                        pathBGrade: e.target.value as "OTE+KO" | "OTE" | "KO" | "—",
                      })
                    }
                  >
                    <option value="—">—</option>
                    <option value="OTE+KO">OTE+KO</option>
                    <option value="OTE">OTE</option>
                    <option value="KO">KO</option>
                  </select>
                </label>
                <label className="fld">
                  Fill
                  <select
                    value={f.fillStatus}
                    onChange={(e) =>
                      setF({
                        ...f,
                        fillStatus: e.target.value as "yes" | "no" | "no-arm" | "converted",
                      })
                    }
                  >
                    <option value="no-arm">no-arm</option>
                    <option value="yes">yes</option>
                    <option value="no">no fill</option>
                    <option value="converted">converted</option>
                  </select>
                </label>
                <label className="fld">
                  Outcome
                  <select
                    value={f.dualOutcome}
                    onChange={(e) =>
                      setF({
                        ...f,
                        dualOutcome: e.target.value as "WIN" | "LOSS" | "no fill" | "skipped",
                      })
                    }
                  >
                    <option value="skipped">skipped</option>
                    <option value="WIN">WIN</option>
                    <option value="LOSS">LOSS</option>
                    <option value="no fill">no fill</option>
                  </select>
                </label>
              </div>
              <div className="frm-row">
                <label className="fld">
                  Stop pts
                  <input
                    type="number"
                    step="0.25"
                    value={f.stopPts}
                    onChange={(e) => setF({ ...f, stopPts: e.target.value })}
                    style={{ width: 90 }}
                    placeholder="18"
                  />
                </label>
                <label className="fld">
                  Plan R
                  <input
                    type="number"
                    step="0.01"
                    value={f.planRr}
                    onChange={(e) => setF({ ...f, planRr: e.target.value })}
                    style={{ width: 90 }}
                    placeholder="5"
                  />
                </label>
                <label className="fld">
                  Entry HH:MM
                  <input
                    value={f.entryTime}
                    onChange={(e) => setF({ ...f, entryTime: e.target.value })}
                    style={{ width: 90 }}
                    placeholder="10:15"
                  />
                </label>
                <label className="fld">
                  P&amp;L $
                  <input
                    type="number"
                    value={f.pnl}
                    onChange={(e) => setF({ ...f, pnl: e.target.value })}
                    style={{ width: 100 }}
                    placeholder="0"
                  />
                </label>
              </div>
              <div className="frm-row">
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
                  </>
                )}
              </div>
              <label className="fld" style={{ maxWidth: "100%" }}>
                Notes
                <input
                  value={f.notes}
                  onChange={(e) => setF({ ...f, notes: e.target.value })}
                  style={{ width: "100%", maxWidth: 480 }}
                  placeholder="one-line why · Apex size · trail note"
                />
              </label>
              <div
                className="shot-paste shot-paste--lg"
                tabIndex={0}
                onPaste={(e) => void pasteShot(e, "live")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file?.type.startsWith("image/")) void onShot(file, "live");
                }}
                style={{ marginTop: 10 }}
              >
                <div style={{ fontSize: 14 }}>
                  <b>Ctrl+V</b> chart snapshot here
                </div>
                <div className="small dim" style={{ marginTop: 4 }}>
                  Click this box first, then paste — or drop / choose a file
                </div>
                {f.chartShot && (
                  <div className="frm-row mt" style={{ justifyContent: "center" }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setPreviewShot(f.chartShot)}
                    >
                      Preview pasted
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setF((prev) => ({ ...prev, chartShot: "" }))}
                    >
                      Clear
                    </button>
                  </div>
                )}
                <label className="fld" style={{ marginTop: 10 }}>
                  Or file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onShot(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              {shotErr && <p className="warn small">{shotErr}</p>}
              <div className="frm-row mt">
                <button type="button" className="btn" onClick={addLive}>
                  Log MSv46 live
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

      <VaultSyncPanel />

      <div className="panel">
        <div className="panel-title">
          Review
          <span className="sub">
            {mode === "morningstar"
              ? "Dual46 study only"
              : mode === "forward"
                ? "Paper / forward only"
                : liveAcct
                  ? `${liveAcct.label} · MSv46 live`
                  : "MSv46 live — pick an account above"}
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
                <th>P&amp;L</th>
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
                const showPnl =
                  j.direction === "long" ||
                  j.direction === "short" ||
                  (j.pnl != null && j.pnl !== 0);
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
                    <td
                      className={
                        !showPnl
                          ? "dim"
                          : (j.pnl || 0) > 0
                            ? "pos"
                            : (j.pnl || 0) < 0
                              ? "neg"
                              : "dim"
                      }
                      style={{ fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      {showPnl ? fmtUsd(j.pnl || 0, true) : "—"}
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
