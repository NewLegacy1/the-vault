"use client";

import { useLocal } from "@/lib/store";
import {
  STRATEGY_VARIANTS,
  DEFAULT_VARIANT_ID,
  variantById,
  experimentStorageKey,
  buildTvSyncLines,
  type StrategyVariantId,
  type StrategyVariant,
} from "@/lib/strategy-variants";
import {
  PROP_PASS_EXPERIMENTS,
  REPLAY_12MO_CONTROL,
  PROP_PASS_STORAGE_KEY,
  mergePropPassOverrides,
  type PropPassPreset,
} from "@/lib/prop-pass-experiments";

/** Bump when pine/Powell_Rejection_Block_v1.pine changes — reminds you to re-paste in TV. */
const PRB_PINE_REV = "v1.9 (Jul 13 2026)";
const PRB_PINE_FILE = "pine/Powell_Rejection_Block_v1.pine";
const PRB_PINE_FEATURES = [
  "Instrument sizing: Auto / MNQ / NQ (6 mini cap)",
  "Manual mode (no auto orders)",
  "Eval max win cap $1,490",
];

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: { key: string; label: string; def: string; type?: string; options?: string[] };
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "select" && field.options) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 200 }}>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "bool") {
    const on = value === "ON" || value === "true";
    return (
      <button type="button" className={`chip ${on ? "locked" : ""}`} onClick={() => onChange(on ? "OFF" : "ON")}>
        {on ? "ON" : "OFF"}
      </button>
    );
  }
  return <input value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 100 }} />;
}

function PineRefreshBox({ pineFile, rev, features }: { pineFile: string; rev: string; features: string[] }) {
  return (
    <div className="flow-diagram" style={{ marginTop: 12 }}>
      <b>Pine script in this vault: {rev}</b>
      <div className="small dim" style={{ marginTop: 6 }}>
        File: <code className="inline">{pineFile}</code>
      </div>
      <ul className="small dim" style={{ margin: "8px 0", paddingLeft: 18, lineHeight: 1.55 }}>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="small" style={{ lineHeight: 1.65 }}>
        <span className="warn">TradingView does not auto-sync.</span> After any vault pine edit: open Pine Editor →
        select all → paste from <code className="inline">{pineFile}</code> → <b>Save</b> → refresh chart. If inputs
        like &quot;Eval max win cap&quot; or &quot;Manual levels only&quot; are missing, you&apos;re on old code.
      </div>
    </div>
  );
}

function PrbStrategiesPage() {
  const prb = variantById("prb-v15")!;
  const storageKey = experimentStorageKey("prb-v15");
  const [exp, setExp] = useLocal<Record<string, string>>(storageKey, {});
  const [status, setStatus] = useLocal<Record<string, "pending" | "exported" | "in-lab">>(
    PROP_PASS_STORAGE_KEY,
    {}
  );
  const [activePresetId, setActivePresetId] = useLocal<string>("vault.propPass.active", "12mo-control");

  const activePreset = PROP_PASS_EXPERIMENTS.find((p) => p.id === activePresetId) ?? PROP_PASS_EXPERIMENTS[0];
  const merged = mergePropPassOverrides(
    { ...Object.fromEntries(prb.experimentFields.map((f) => [f.key, f.def])), ...exp },
    activePreset
  );
  const syncLines = buildTvSyncLines(prb, merged);
  const c = REPLAY_12MO_CONTROL;

  const applyPreset = (preset: PropPassPreset) => {
    setActivePresetId(preset.id);
    setExp(mergePropPassOverrides({}, preset));
  };

  const manualOn = merged.manualOnly === "ON";
  const evalCap = merged.evalMaxWinUsd && merged.evalMaxWinUsd !== "0" ? merged.evalMaxWinUsd : null;

  return (
    <>
      {/* ── Hero: what you're testing ── */}
      <div className="panel" style={{ borderColor: "var(--accent)" }}>
        <div className="panel-title">
          You are testing
          <span className="sub">F3 — read this first</span>
        </div>
        <div className="panel-body">
          <div className="accent" style={{ fontSize: 18, letterSpacing: 1, marginBottom: 8 }}>
            {activePreset.label}
          </div>
          <table className="kv-table">
            <tbody>
              <tr>
                <td className="dim">Script</td>
                <td>
                  <code className="inline">PRB v1</code> · {c.chart} · {c.timeframe}
                </td>
              </tr>
              <tr>
                <td className="dim">Mode</td>
                <td>
                  {manualOn ? (
                    <span className="warn">Manual (boxes only — you click) · log F2 Journal</span>
                  ) : (
                    <span className="pos">Auto strategy · export CSV → F4 LAB</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="dim">Replay window</td>
                <td>
                  <code className="inline">{c.start}</code> → <code className="inline">{c.end}</code>
                </td>
              </tr>
              <tr>
                <td className="dim">F4 upload label</td>
                <td className="cyan">{activePreset.labLabel}</td>
              </tr>
            </tbody>
          </table>

          <div className="flow-diagram mt">
            <b>Walkthrough (4 steps)</b>
            <ol className="small" style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
              <li>
                <b>Pick preset</b> below (start with 12-month control, then RR / eval cap experiments).
              </li>
              <li>
                <b>Paste pine</b> if needed — see Pine refresh box. Confirm inputs exist in TV gear menu.
              </li>
              <li>
                <b>Change only</b> the inputs listed under &quot;Change in TradingView&quot; (ignore everything else).
              </li>
              <li>
                <b>Run</b> bar replay or Deep BT → export CSV → F4 LAB → check <b>Eval consistency</b> panel if TPT.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* ── Preset picker ── */}
      <div className="panel">
        <div className="panel-title">
          Pick experiment
          <span className="sub">one preset at a time</span>
        </div>
        <div className="panel-body">
          <div className="flex" style={{ gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {PROP_PASS_EXPERIMENTS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`chip ${activePresetId === p.id ? "locked" : ""}`}
                onClick={() => applyPreset(p)}
              >
                {p.tier === "control" ? "★ " : ""}
                {p.label}
                {status[p.id] === "in-lab" ? " · LAB" : status[p.id] === "exported" ? " ✓" : ""}
              </button>
            ))}
          </div>
          <p className="small dim" style={{ margin: 0, lineHeight: 1.55 }}>
            {activePreset.description}
          </p>
          <div className="flex" style={{ gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" className="chip" onClick={() => setStatus({ ...status, [activePreset.id]: "exported" })}>
              Mark CSV exported
            </button>
            <button type="button" className="chip" onClick={() => setStatus({ ...status, [activePreset.id]: "in-lab" })}>
              Mark in LAB
            </button>
          </div>
        </div>
      </div>

      {/* ── TV sync (the only inputs that matter) ── */}
      <div className="panel">
        <div className="panel-title">
          Change in TradingView
          <span className="sub">
            {syncLines.length === 0 ? "defaults — no changes" : `${syncLines.length} input(s)`}
          </span>
        </div>
        <div className="panel-body">
          {syncLines.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Pine input (gear menu)</th>
                  <th>Set to</th>
                </tr>
              </thead>
              <tbody>
                {syncLines.map((line) => {
                  const parts = line.split(": ");
                  const hint = parts[0] ?? line;
                  const val = parts.slice(1).join(": ") || "—";
                  return (
                    <tr key={line}>
                      <td className="dim small">{hint}</td>
                      <td>
                        <code className="inline">{val}</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="small pos" style={{ margin: 0 }}>
              12-month control uses locked PRB defaults — open chart, confirm settings match, run replay.
            </p>
          )}
          <p className="small dim mt">
            Also verify: <b>Manual levels only</b> = {manualOn ? "ON" : "OFF"} · <b>Eval max win cap</b> ={" "}
            {evalCap ? `$${evalCap}` : "0 (off)"} · <b>Target R</b> = {merged.rr ?? "5"}
          </p>
        </div>
      </div>

      <PineRefreshBox pineFile={PRB_PINE_FILE} rev={PRB_PINE_REV} features={PRB_PINE_FEATURES} />

      {/* ── Collapsed detail ── */}
      <details className="panel">
        <summary className="panel-title" style={{ cursor: "pointer", listStyle: "none" }}>
          Advanced inputs &amp; history
          <span className="sub">optional — tweak individual fields, graveyard, changelog</span>
        </summary>
        <div className="panel-body">
          <PrbAdvancedPanel variant={prb} exp={exp} setExp={setExp} />
        </div>
      </details>
    </>
  );
}

function PrbAdvancedPanel({
  variant,
  exp,
  setExp,
}: {
  variant: StrategyVariant;
  exp: Record<string, string>;
  setExp: (v: Record<string, string>) => void;
}) {
  const syncLines = buildTvSyncLines(variant, exp);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Input</th>
            <th>Default</th>
            <th>Your value</th>
          </tr>
        </thead>
        <tbody>
          {variant.experimentFields.map((f) => (
            <tr key={f.key}>
              <td className="dim small">{f.pineHint ?? f.label}</td>
              <td>{f.def}</td>
              <td>
                <FieldInput field={f} value={exp[f.key] ?? f.def} onChange={(v) => setExp({ ...exp, [f.key]: v })} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="chip mt" onClick={() => setExp({})}>
        Reset all to defaults
      </button>

      {variant.abGraveyard && variant.abGraveyard.length > 0 && (
        <>
          <hr className="hr" />
          <div className="small accent">A/B graveyard (settled)</div>
          <table className="mt">
            <tbody>
              {variant.abGraveyard.map((a) => (
                <tr key={a.test}>
                  <td className="dim">{a.test}</td>
                  <td className="small">{a.result}</td>
                  <td className={a.verdict === "kept" ? "pos" : "neg"}>{a.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {syncLines.length > 0 && (
        <p className="small dim mt">
          Custom overrides: {syncLines.join(" · ")}
        </p>
      )}
    </>
  );
}

function DataHlPanel({ variant }: { variant: StrategyVariant }) {
  const storageKey = experimentStorageKey(variant.id);
  const [exp, setExp] = useLocal<Record<string, string>>(storageKey, {});
  const syncLines = buildTvSyncLines(variant, exp);

  return (
    <>
      <div className="panel" style={{ borderColor: "var(--warn)" }}>
        <div className="panel-title">
          You are testing
          <span className="sub">manual replay only</span>
        </div>
        <div className="panel-body">
          <div className="warn" style={{ fontSize: 16, marginBottom: 8 }}>
            Data H/L v0 — NOT for live account
          </div>
          <div className="flow-diagram">
            <ol className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>F7 NEWS — confirm red-folder day worth studying</li>
              <li>TV bar replay that session · 1m MNQ · load DataHL script</li>
              <li>Change inputs below if experimenting</li>
              <li>Export CSV only if F7 shows PRB missed news-day edge</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Change in TradingView</div>
        <div className="panel-body">
          {syncLines.length > 0 ? (
            <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
              {syncLines.map((line) => (
                <li key={line}>
                  <code className="inline">{line}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small dim" style={{ margin: 0 }}>Defaults — no changes needed.</p>
          )}
        </div>
      </div>

      <PineRefreshBox
        pineFile={variant.pineFile}
        rev="DataHL v0"
        features={["8:30 data H/L formation", "CISD entry", "Manual day pick only"]}
      />

      <details className="panel">
        <summary className="panel-title" style={{ cursor: "pointer" }}>
          Advanced inputs
        </summary>
        <div className="panel-body">
          <PrbAdvancedPanel variant={variant} exp={exp} setExp={setExp} />
        </div>
      </details>
    </>
  );
}

export default function StrategiesPage() {
  const [activeId, setActiveId] = useLocal<StrategyVariantId>("vault.strategyVariant", DEFAULT_VARIANT_ID);
  const variant = variantById(activeId) ?? STRATEGY_VARIANTS[0];
  const isPrb = variant.id === "prb-v15";

  return (
    <>
      <div className="panel">
        <div className="panel-title">
          Strategy
          <span className="sub">two scripts — pick one</span>
        </div>
        <div className="panel-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
          <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
            {STRATEGY_VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`chip ${activeId === v.id ? "locked" : ""}`}
                onClick={() => setActiveId(v.id)}
              >
                {v.shorttitle}
                {v.id === "prb-v15" ? " · main" : " · news replay"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isPrb ? <PrbStrategiesPage /> : <DataHlPanel variant={variant} />}
    </>
  );
}
