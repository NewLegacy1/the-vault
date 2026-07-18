"use client";

import { useCallback, useState } from "react";
import { compressChartShot } from "@/lib/journal-shot";
import { ocrChartText } from "@/lib/morningstar/ocr-chart";
import {
  parseDual46Tag,
  parsedToSummary,
  type ParsedDual46Tag,
} from "@/lib/morningstar/parse-dual46-tag";
import { formatPlanRr, parsePlanRr } from "@/lib/morningstar/parse-plan-rr";
import { todayStr } from "@/lib/store";
import { JournalEntry, MORNINGSTAR_STUDY_ID, uid } from "@/lib/types";

type Dual46Form = {
  date: string;
  nwog: "above" | "below" | "filled" | "inside";
  weekBias: "long" | "short" | "none";
  dayBias: "long" | "short" | "none";
  armed: boolean;
  pathBModel: "Cont" | "Judas" | "—";
  pathBGrade: "OTE+KO" | "OTE" | "KO" | "—";
  /** script = Dual46 arm · disc = manual idea (NWOG / reverse fib / etc.) */
  source: "script" | "disc";
  direction: "long" | "short" | "skip";
  stopPts: string;
  planRr: string;
  fillStatus: "yes" | "no" | "no-arm";
  dualOutcome: "WIN" | "LOSS" | "no fill" | "skipped";
  notes: string;
  shots: string[];
  detected: string;
};

function emptyDual46(date = todayStr()): Dual46Form {
  return {
    date,
    nwog: "filled",
    weekBias: "none",
    dayBias: "none",
    armed: false,
    pathBModel: "—",
    pathBGrade: "—",
    source: "disc",
    direction: "skip",
    stopPts: "",
    planRr: "",
    fillStatus: "no-arm",
    dualOutcome: "skipped",
    notes: "",
    shots: [],
    detected: "",
  };
}

function applyParsed(prev: Dual46Form, p: ParsedDual46Tag): Dual46Form {
  if (p.confidence === "none") return { ...prev, detected: "No tag found — tap chips or paste tag text" };
  const next: Dual46Form = {
    ...prev,
    detected: parsedToSummary(p),
    armed: true,
    source: "script",
    fillStatus: p.dualOutcome === "no fill" ? "no" : "yes",
  };
  if (p.direction) next.direction = p.direction;
  if (p.pathBModel) next.pathBModel = p.pathBModel;
  if (p.pathBGrade) next.pathBGrade = p.pathBGrade;
  if (p.planRr != null) next.planRr = String(p.planRr);
  if (p.stopPts != null) next.stopPts = String(p.stopPts);
  if (p.dualOutcome) next.dualOutcome = p.dualOutcome;
  else if (p.direction) next.dualOutcome = "WIN";
  // Soft bias from side if still unset
  if (next.dayBias === "none" && p.direction) next.dayBias = p.direction;
  return next;
}

function dualGradeLetter(grade: Dual46Form["pathBGrade"]): JournalEntry["grade"] {
  if (grade === "OTE+KO") return "A+";
  if (grade === "OTE" || grade === "KO") return "B";
  return "-";
}

function toEntry(f: Dual46Form): JournalEntry {
  const stopPts = f.stopPts !== "" ? parseFloat(f.stopPts) : undefined;
  const planRr = parsePlanRr(f.planRr);
  const tag =
    f.armed && f.pathBModel !== "—"
      ? `Powell · ${f.pathBModel} · 1RB · ${f.pathBGrade}`
      : f.armed
        ? `Powell · 1RB · ${f.pathBGrade}`
        : undefined;
  const rMultiple =
    f.dualOutcome === "WIN" && planRr != null && Number.isFinite(planRr)
      ? planRr
      : f.dualOutcome === "LOSS"
        ? -1
        : 0;
  return {
    id: uid(),
    date: f.date,
    accountId: MORNINGSTAR_STUDY_ID,
    direction: f.direction,
    morningBias:
      f.dayBias === "long" ? "long" : f.dayBias === "short" ? "short" : "neutral",
    weekBias: f.weekBias,
    dayBias: f.dayBias,
    nwog: f.nwog,
    pathBModel: f.pathBModel,
    pathBGrade: f.pathBGrade,
    stopPts: stopPts != null && Number.isFinite(stopPts) ? stopPts : undefined,
    planRr: planRr != null && Number.isFinite(planRr) ? planRr : undefined,
    fillStatus: f.fillStatus,
    dualOutcome: f.dualOutcome,
    dualVersion: "Dual46",
    entrySource: f.source,
    grade: dualGradeLetter(f.pathBGrade),
    pnl: 0,
    rMultiple,
    giveBack: false,
    checklistFails: "",
    notes: [f.detected && f.detected.startsWith("No ") ? "" : f.detected, f.notes.trim()]
      .filter(Boolean)
      .join(" · "),
    strategy: "Morningstar",
    structureTf: "chart",
    structureTag: tag,
    chartShot: f.shots[0],
    chartShots: f.shots.length ? f.shots : undefined,
    msKeyOpen: f.pathBGrade === "OTE+KO" || f.pathBGrade === "KO",
    msOteOverlap: f.pathBGrade === "OTE+KO" || f.pathBGrade === "OTE",
    msRb: f.armed,
    msScore:
      (f.pathBGrade === "OTE+KO" ? 6 : f.pathBGrade === "OTE" || f.pathBGrade === "KO" ? 3 : 0) +
      (f.armed ? 1 : 0),
  };
}

type Props = { onSave: (entry: JournalEntry) => void };

export function Dual46StudyForm({ onSave }: Props) {
  const [f, setF] = useState(() => emptyDual46());
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [tagPaste, setTagPaste] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const ingestText = useCallback((text: string) => {
    const p = parseDual46Tag(text);
    setF((prev) => applyParsed(prev, p));
    if (p.matched) setTagPaste(p.matched);
  }, []);

  const addShot = useCallback(
    async (file: File) => {
      setErr("");
      setBusy("Compressing…");
      try {
        const dataUrl = await compressChartShot(file);
        setF((prev) => ({ ...prev, shots: [...prev.shots, dataUrl].slice(0, 6) }));
        setBusy("Reading tag from chart…");
        const text = await ocrChartText(dataUrl);
        ingestText(text);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not read snapshot");
      } finally {
        setBusy("");
      }
    },
    [ingestText]
  );

  const onPaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const cd = e.clipboardData;
      if (!cd) return;

      // Prefer image
      for (const item of Array.from(cd.items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await addShot(file);
          return;
        }
      }
      // Plain text tag
      const text = cd.getData("text/plain");
      if (text && /powell|LONG|SHORT|OTE/i.test(text)) {
        e.preventDefault();
        ingestText(text);
        setTagPaste(text.trim().slice(0, 200));
      }
    },
    [addShot, ingestText]
  );

  const save = () => {
    if (!f.shots.length && f.direction === "skip" && !f.armed) {
      setErr("Paste a chart (or mark skip with bias) before logging.");
      return;
    }
    if (f.direction !== "skip" && f.armed && f.pathBGrade === "—") {
      setErr("Need a grade — paste tag again or tap OTE+KO / OTE / KO.");
      return;
    }
    setErr("");
    onSave(toEntry(f));
    setF((prev) => ({
      ...emptyDual46(prev.date),
      nwog: prev.nwog,
      weekBias: prev.weekBias,
      dayBias: prev.dayBias,
    }));
    setTagPaste("");
  };

  const chip = (active: boolean, label: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      className={"chip" + (active ? " locked" : "")}
      onClick={onClick}
      style={{ cursor: "pointer", marginRight: 4, marginBottom: 4 }}
    >
      {label}
    </button>
  );

  return (
    <div onPaste={onPaste}>
      <p className="small dim" style={{ marginTop: 0, lineHeight: 1.5 }}>
        One page: paste chart → we OCR the Powell tag → confirm bias → log. Or paste the label text if OCR
        misses.
      </p>

      {err && (
        <p className="warn small" style={{ marginTop: 0 }}>
          {err}
        </p>
      )}

      <div className="frm-row">
        <label className="fld">
          Date
          <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </label>
      </div>

      <div
        className="shot-paste shot-paste--lg"
        tabIndex={0}
        onPaste={onPaste}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file?.type.startsWith("image/")) await addShot(file);
        }}
      >
        <div style={{ fontSize: 14 }}>
          <b>Ctrl+V</b> chart snapshot here
        </div>
        <div className="small dim" style={{ marginTop: 4 }}>
          Auto-reads: LONG/SHORT · Cont/Judas · OTE+KO · 1:R · WIN/LOSS · stop pts
        </div>
        {busy && <div className="accent small" style={{ marginTop: 8 }}>{busy}</div>}
        <label className="fld" style={{ marginTop: 10 }}>
          Or file
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await addShot(file);
              e.target.value = "";
            }}
          />
        </label>
        {f.shots.length > 0 && (
          <div className="shot-row">
            {f.shots.map((s, i) => (
              <div key={i} className="shot-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s} alt={`Shot ${i + 1}`} onClick={() => setPreview(s)} />
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setF((prev) => ({ ...prev, shots: prev.shots.filter((_, j) => j !== i) }))}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="fld" style={{ maxWidth: "100%", marginTop: 10 }}>
        Or paste / edit tag text
        <input
          value={tagPaste}
          onChange={(e) => setTagPaste(e.target.value)}
          onBlur={() => {
            if (tagPaste.trim()) ingestText(tagPaste);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagPaste.trim()) {
              e.preventDefault();
              ingestText(tagPaste);
            }
          }}
          placeholder="LONG · Powell · Cont · 1RB · OTE+KO · 1:5 WIN"
          style={{ width: "100%", maxWidth: 640 }}
        />
      </label>

      {f.detected && (
        <div
          className="mt"
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border-hi)",
            borderRadius: 6,
            background: "#0a0a0a",
          }}
        >
          <span className="dim small">Detected · </span>
          <span className="accent">{f.detected}</span>
        </div>
      )}

      <div className="accent small" style={{ letterSpacing: 1, marginTop: 14 }}>
        SOURCE (required)
      </div>
      <div className="frm-row">
        {chip(f.source === "script", "SCRIPT arm", () => setF({ ...f, source: "script", armed: true }))}
        {chip(f.source === "disc", "DISCRETIONARY note", () => setF({ ...f, source: "disc" }))}
      </div>
      <p className="small dim" style={{ marginTop: 0 }}>
        Script = v46 printed the plan. Disc = your idea (NWOG / reverse fib / 2nd entry) — does not count for Dual46 WR.
      </p>

      <div className="accent small" style={{ letterSpacing: 1, marginTop: 8 }}>
        BIAS (only if not obvious)
      </div>
      <div className="frm-row" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="dim small" style={{ marginBottom: 4 }}>
            NWOG
          </div>
          {(["above", "below", "filled", "inside"] as const).map((v) =>
            chip(f.nwog === v, v, () => setF({ ...f, nwog: v }))
          )}
        </div>
        <div>
          <div className="dim small" style={{ marginBottom: 4 }}>
            Week
          </div>
          {(["long", "short", "none"] as const).map((v) =>
            chip(f.weekBias === v, v === "long" ? "L" : v === "short" ? "S" : "none", () =>
              setF({ ...f, weekBias: v })
            )
          )}
        </div>
        <div>
          <div className="dim small" style={{ marginBottom: 4 }}>
            Day
          </div>
          {(["long", "short", "none"] as const).map((v) =>
            chip(f.dayBias === v, v === "long" ? "L" : v === "short" ? "S" : "none", () =>
              setF({ ...f, dayBias: v })
            )
          )}
        </div>
      </div>

      <div className="accent small" style={{ letterSpacing: 1, marginTop: 8 }}>
        FIX IF OCR MISSED
      </div>
      <div className="frm-row" style={{ alignItems: "flex-start" }}>
        <div>
          {chip(f.direction === "long", "LONG", () => setF({ ...f, direction: "long", armed: true }))}
          {chip(f.direction === "short", "SHORT", () => setF({ ...f, direction: "short", armed: true }))}
          {chip(f.direction === "skip", "SKIP", () =>
            setF({ ...f, direction: "skip", dualOutcome: "skipped", armed: false })
          )}
        </div>
        <div>
          {chip(f.pathBModel === "Cont", "Cont", () => setF({ ...f, pathBModel: "Cont", armed: true }))}
          {chip(f.pathBModel === "Judas", "Judas", () => setF({ ...f, pathBModel: "Judas", armed: true }))}
        </div>
        <div>
          {(["OTE+KO", "OTE", "KO"] as const).map((v) =>
            chip(f.pathBGrade === v, v, () => setF({ ...f, pathBGrade: v, armed: true }))
          )}
        </div>
        <div>
          {(["WIN", "LOSS", "no fill", "skipped"] as const).map((v) =>
            chip(f.dualOutcome === v, v, () => setF({ ...f, dualOutcome: v }))
          )}
        </div>
      </div>
      <div className="frm-row">
        <label className="fld">
          Stop
          <input
            value={f.stopPts}
            onChange={(e) => setF({ ...f, stopPts: e.target.value })}
            style={{ width: 70 }}
          />
        </label>
        <label className="fld">
          RR (reward multiple)
          <input
            value={f.planRr}
            onChange={(e) => setF({ ...f, planRr: e.target.value })}
            onBlur={() => {
              const n = parsePlanRr(f.planRr);
              if (n != null) setF((prev) => ({ ...prev, planRr: String(n) }));
            }}
            placeholder="5 or 1:5 or 1-3.8"
            style={{ width: 110 }}
            title="Type 5, 1:5, or 1-5 — we store the reward multiple (5)"
          />
          <span className="dim" style={{ fontSize: 10, marginTop: 2 }}>
            saves as {formatPlanRr(parsePlanRr(f.planRr))}
          </span>
        </label>
        <label className="fld" style={{ maxWidth: 320, flex: 1 }}>
          Note
          <input
            value={f.notes}
            onChange={(e) => setF({ ...f, notes: e.target.value })}
            placeholder="optional"
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <div className="frm-row mt">
        <button type="button" className="btn" onClick={save} disabled={!!busy}>
          Log setup
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setF(emptyDual46(f.date));
            setTagPaste("");
          }}
        >
          Clear
        </button>
      </div>

      {preview && (
        <div role="dialog" className="shot-modal" onClick={() => setPreview(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Chart" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
