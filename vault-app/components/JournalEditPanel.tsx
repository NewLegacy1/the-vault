"use client";

import { useCallback, useState } from "react";
import { compressChartShot } from "@/lib/journal-shot";
import { formatPlanRr, parsePlanRr } from "@/lib/morningstar/parse-plan-rr";
import { JournalEntry } from "@/lib/types";

type EditState = {
  date: string;
  direction: "long" | "short" | "skip";
  entrySource: "script" | "disc" | "";
  pathBModel: "Cont" | "Judas" | "—";
  pathBGrade: "OTE+KO" | "OTE" | "KO" | "—";
  dualOutcome: "WIN" | "LOSS" | "no fill" | "skipped" | "";
  fillStatus: "yes" | "no" | "no-arm" | "";
  stopPts: string;
  planRr: string;
  notes: string;
  shots: string[];
};

function fromEntry(j: JournalEntry): EditState {
  return {
    date: j.date,
    direction: j.direction,
    entrySource: j.entrySource ?? "",
    pathBModel: j.pathBModel ?? "—",
    pathBGrade: j.pathBGrade ?? "—",
    dualOutcome: j.dualOutcome ?? "",
    fillStatus: j.fillStatus ?? "",
    stopPts: j.stopPts != null ? String(j.stopPts) : "",
    planRr: j.planRr != null ? String(j.planRr) : "",
    notes: j.notes ?? "",
    shots: j.chartShots?.length ? [...j.chartShots] : j.chartShot ? [j.chartShot] : [],
  };
}

type Props = {
  entry: JournalEntry;
  onSave: (updated: JournalEntry) => void;
  onCancel: () => void;
};

export function JournalEditPanel({ entry, onSave, onCancel }: Props) {
  const [f, setF] = useState<EditState>(() => fromEntry(entry));
  const [shotErr, setShotErr] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const addShot = useCallback(async (file: File) => {
    setShotErr("");
    try {
      const dataUrl = await compressChartShot(file);
      setF((prev) => ({ ...prev, shots: [...prev.shots, dataUrl].slice(0, 8) }));
    } catch (e) {
      setShotErr(e instanceof Error ? e.message : "Could not compress snapshot");
    }
  }, []);

  const onPaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await addShot(file);
          return;
        }
      }
    },
    [addShot]
  );

  const save = () => {
    const stopPts = f.stopPts !== "" ? parseFloat(f.stopPts) : undefined;
    const planRr = parsePlanRr(f.planRr);
    const rMultiple =
      f.dualOutcome === "WIN" && planRr != null
        ? planRr
        : f.dualOutcome === "LOSS"
          ? -1
          : entry.rMultiple;
    onSave({
      ...entry,
      date: f.date,
      direction: f.direction,
      entrySource: f.entrySource || undefined,
      pathBModel: f.pathBModel,
      pathBGrade: f.pathBGrade,
      dualOutcome: f.dualOutcome || undefined,
      fillStatus: f.fillStatus || undefined,
      stopPts: stopPts != null && Number.isFinite(stopPts) ? stopPts : undefined,
      planRr,
      rMultiple,
      notes: f.notes,
      chartShot: f.shots[0],
      chartShots: f.shots.length ? f.shots : undefined,
    });
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
    <div className="panel" onPaste={onPaste}>
      <div className="panel-title">
        Edit entry
        <span className="sub">
          {entry.date} · {entry.structureTag ?? entry.strategy ?? entry.id}
        </span>
      </div>
      <div className="panel-body">
        <div className="frm-row">
          <label className="fld">
            Date
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </label>
          <label className="fld">
            Stop pts
            <input
              value={f.stopPts}
              onChange={(e) => setF({ ...f, stopPts: e.target.value })}
              style={{ width: 80 }}
            />
          </label>
          <label className="fld">
            RR (reward multiple)
            <input
              value={f.planRr}
              onChange={(e) => setF({ ...f, planRr: e.target.value })}
              placeholder="5 or 1:5"
              style={{ width: 100 }}
            />
            <span className="dim" style={{ fontSize: 10, marginTop: 2 }}>
              saves as {formatPlanRr(parsePlanRr(f.planRr))}
            </span>
          </label>
        </div>

        <div className="frm-row" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="dim small" style={{ marginBottom: 4 }}>
              Side
            </div>
            {chip(f.direction === "long", "LONG", () => setF({ ...f, direction: "long" }))}
            {chip(f.direction === "short", "SHORT", () => setF({ ...f, direction: "short" }))}
            {chip(f.direction === "skip", "SKIP", () => setF({ ...f, direction: "skip" }))}
          </div>
          <div>
            <div className="dim small" style={{ marginBottom: 4 }}>
              Source
            </div>
            {chip(f.entrySource === "script", "script", () => setF({ ...f, entrySource: "script" }))}
            {chip(f.entrySource === "disc", "disc", () => setF({ ...f, entrySource: "disc" }))}
          </div>
          <div>
            <div className="dim small" style={{ marginBottom: 4 }}>
              Model
            </div>
            {(["Cont", "Judas", "—"] as const).map((v) =>
              chip(f.pathBModel === v, v, () => setF({ ...f, pathBModel: v }))
            )}
          </div>
          <div>
            <div className="dim small" style={{ marginBottom: 4 }}>
              Grade
            </div>
            {(["OTE+KO", "OTE", "KO", "—"] as const).map((v) =>
              chip(f.pathBGrade === v, v, () => setF({ ...f, pathBGrade: v }))
            )}
          </div>
        </div>

        <div className="frm-row" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="dim small" style={{ marginBottom: 4 }}>
              Fill
            </div>
            {(["yes", "no", "no-arm"] as const).map((v) =>
              chip(f.fillStatus === v, v, () => setF({ ...f, fillStatus: v }))
            )}
          </div>
          <div>
            <div className="dim small" style={{ marginBottom: 4 }}>
              Outcome
            </div>
            {(["WIN", "LOSS", "no fill", "skipped"] as const).map((v) =>
              chip(f.dualOutcome === v, v, () => setF({ ...f, dualOutcome: v }))
            )}
          </div>
        </div>

        <label className="fld" style={{ maxWidth: "100%" }}>
          Notes
          <input
            value={f.notes}
            onChange={(e) => setF({ ...f, notes: e.target.value })}
            style={{ width: "100%", maxWidth: 640 }}
          />
        </label>

        <div className="accent small" style={{ letterSpacing: 1, marginTop: 12 }}>
          IMAGES (paste here to add · click to preview · x to remove)
        </div>
        <div
          className="shot-paste"
          tabIndex={0}
          onPaste={onPaste}
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/")) await addShot(file);
          }}
        >
          <div className="small dim">
            <b>Ctrl+V</b> another screenshot here, or add a file
          </div>
          <label className="fld" style={{ marginTop: 8 }}>
            Add file
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;
                for (const file of Array.from(files)) await addShot(file);
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
                    onClick={() =>
                      setF((prev) => ({ ...prev, shots: prev.shots.filter((_, k) => k !== i) }))
                    }
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
          {shotErr && <p className="warn small">{shotErr}</p>}
        </div>

        <div className="frm-row mt">
          <button type="button" className="btn" onClick={save}>
            Save changes
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
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
