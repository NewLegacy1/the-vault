"use client";

import { useEffect, useState } from "react";
import {
  PIPELINE_STATE_ORDER,
  stateLabel,
  type LintViolation,
  type StrategyEntry,
  type StrategyState,
} from "@/lib/registry";

/**
 * Pipeline board — every book as a first-class entity with a lifecycle state.
 * Data: data/registry/strategies.json via /api/registry (shared with the
 * research agent loop). Kill-lesson hard constraints render as lint warnings.
 */

const MOVABLE_STATES: StrategyState[] = [
  "idea",
  "stage0_draft",
  "waiting_csv",
  "analyzed",
  "toward",
  "away",
  "live_sprint",
  "funded",
  "retired",
];

function laneBadge(lane: StrategyEntry["lane"]): string {
  return lane.replace("_", " ").toUpperCase();
}

export default function PipelinePage() {
  const [entries, setEntries] = useState<StrategyEntry[]>([]);
  const [violations, setViolations] = useState<LintViolation[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/registry")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setEntries(d.entries ?? []);
        setViolations(d.violations ?? []);
        setErr("");
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const move = (id: string, state: StrategyState) => {
    fetch("/api/registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, state }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        load();
      })
      .catch((e) => setErr(String(e)));
  };

  const active = PIPELINE_STATE_ORDER.filter((s) => s !== "killed");
  const killed = entries.filter((e) => e.state === "killed");

  return (
    <>
      <div className="panel">
        <div className="panel-title">
          Strategy pipeline
          <span className="sub">
            data/registry/strategies.json · shared with the research agent loop
          </span>
        </div>
        <div className="panel-body">
          <p className="small subtext" style={{ marginTop: 0, lineHeight: 1.7 }}>
            Idea → Stage-0 → CSV → verdict → live, one book per card.{" "}
            Drop exports in <code className="inline">data/inbox/</code> (
            <a className="accent" href="/data">DATA</a> shows the ingest ledger) ·{" "}
            <a className="accent" href="/strategies">TV replay recipes</a> ·{" "}
            <a className="accent" href="/lab">Lab MC</a> ·{" "}
            <a className="accent" href="/results">firm comparison</a>.
          </p>
          {err && <p className="small neg">{err}</p>}
          {loading && <p className="small dim">loading…</p>}
          {violations.length > 0 && (
            <div className="small" style={{ marginBottom: 8 }}>
              {violations.map((v, i) => (
                <p key={i} className="neg" style={{ margin: "2px 0" }}>
                  ⚠ [{v.entryId}] {v.message}
                </p>
              ))}
            </div>
          )}
          {!loading && violations.length === 0 && (
            <p className="small pos" style={{ marginTop: 0 }}>
              Kill-lesson lint clean — one open Stage-0, no killed-family costumes, independence declared.
            </p>
          )}
        </div>
      </div>

      {active.map((state) => {
        const group = entries.filter((e) => e.state === state);
        if (group.length === 0) return null;
        return (
          <div className="panel" key={state}>
            <div className="panel-title">
              {stateLabel(state)}
              <span className="sub">{group.length} book(s)</span>
            </div>
            <div className="panel-body">
              <div className="grid grid-2">
                {group.map((e) => (
                  <div key={e.id} style={{ border: "1px solid var(--line, #333)", padding: 10 }}>
                    <p className="small" style={{ margin: 0 }}>
                      <span className="accent">{e.name}</span>{" "}
                      <span className="dim">· {laneBadge(e.lane)} · upd {e.updated}</span>
                    </p>
                    <p className="small subtext" style={{ margin: "6px 0" }}>
                      {e.summary}
                    </p>
                    {e.metrics && (
                      <p className="small" style={{ margin: "4px 0" }}>
                        {e.metrics}
                      </p>
                    )}
                    {e.independenceAxes && e.independenceAxes.length > 0 && (
                      <p className="small dim" style={{ margin: "4px 0" }}>
                        independence: {e.independenceAxes.join(" · ")}
                      </p>
                    )}
                    {e.artifacts && e.artifacts.length > 0 && (
                      <p className="small dim" style={{ margin: "4px 0" }}>
                        {e.artifacts.map((a) => a.label + " — " + a.path).join(" · ")}
                      </p>
                    )}
                    <label className="small dim">
                      move:{" "}
                      <select
                        value={e.state}
                        onChange={(ev) => move(e.id, ev.target.value as StrategyState)}
                      >
                        {MOVABLE_STATES.map((s) => (
                          <option key={s} value={s}>
                            {stateLabel(s)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {killed.length > 0 && (
        <div className="panel">
          <div className="panel-title">
            Graveyard
            <span className="sub">{killed.length} killed — never reopened via param retune</span>
          </div>
          <div className="panel-body">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Family tags (lint blacklist)</th>
                  <th>Constraint</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {killed.map((e) => (
                  <tr key={e.id}>
                    <td className="small accent">{e.name}</td>
                    <td className="small dim">{e.familyTags.join(", ")}</td>
                    <td className="small">{e.killConstraint ?? "—"}</td>
                    <td className="small subtext">{e.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
