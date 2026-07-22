"use client";

import { useLocal, todayStr } from "@/lib/store";

type Bias = "long" | "short" | "none";

type ChecklistState = {
  date: string;
  weekBias: Bias;
  dayBias: Bias;
  pathLean: "Cont" | "Judas" | "";
  /** Only the short gate list */
  newsOk: boolean;
  pathBOk: boolean;
  withBias: boolean;
  decision: "take" | "skip" | "";
};

const GATES: { key: keyof Pick<ChecklistState, "newsOk" | "pathBOk" | "withBias">; label: string }[] =
  [
    { key: "newsOk", label: "News / 10:00 print — clear to trade" },
    { key: "pathBOk", label: "Leave → 1m RB · OTE+KO (or graded) · RB stop" },
    { key: "withBias", label: "Trade agrees with week + day bias" },
  ];

function emptyChecklist(date = todayStr()): ChecklistState {
  return {
    date,
    weekBias: "none",
    dayBias: "none",
    pathLean: "",
    newsOk: false,
    pathBOk: false,
    withBias: false,
    decision: "",
  };
}

/** Short MSv46 pre-trade gate for Today — 3 taps + bias selects. */
export function MsPretradeChecklist() {
  const day = todayStr();
  const [raw, setRaw] = useLocal<ChecklistState>(
    `vault.msChecklist.v2.${day}`,
    emptyChecklist(day)
  );

  const state = raw.date === day ? raw : emptyChecklist(day);

  const write = (patch: Partial<ChecklistState>) => {
    setRaw({ ...state, ...patch, date: day });
  };

  const biasClash =
    state.weekBias !== "none" &&
    state.dayBias !== "none" &&
    state.weekBias !== state.dayBias;

  const gatesOn = GATES.filter((g) => state[g.key]).length;

  return (
    <div className="panel">
      <div className="panel-title">
        Pre-trade
        <span className="sub">
          {day} · {gatesOn}/3 · then Take or Skip
        </span>
      </div>
      <div className="panel-body">
        <div className="frm-row">
          <label className="fld">
            Week
            <select
              value={state.weekBias}
              onChange={(e) => write({ weekBias: e.target.value as Bias })}
            >
              <option value="none">none</option>
              <option value="long">long</option>
              <option value="short">short</option>
            </select>
          </label>
          <label className="fld">
            Day
            <select
              value={state.dayBias}
              onChange={(e) => write({ dayBias: e.target.value as Bias })}
            >
              <option value="none">none</option>
              <option value="long">long</option>
              <option value="short">short</option>
            </select>
          </label>
          <label className="fld">
            Path
            <select
              value={state.pathLean}
              onChange={(e) =>
                write({ pathLean: e.target.value as ChecklistState["pathLean"] })
              }
            >
              <option value="">—</option>
              <option value="Cont">Cont</option>
              <option value="Judas">Judas</option>
            </select>
          </label>
        </div>

        {biasClash && (
          <p className="small warn" style={{ marginTop: 0 }}>
            Week ≠ day → skip unless textbook A+ and small risk.
          </p>
        )}

        <div className="chk-list" style={{ marginTop: 8 }}>
          {GATES.map((g) => {
            const on = state[g.key];
            return (
              <div
                key={g.key}
                role="checkbox"
                aria-checked={on}
                tabIndex={0}
                className={`chk chk-lg${on ? " done" : ""}`}
                onClick={() => write({ [g.key]: !on })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    write({ [g.key]: !on });
                  }
                }}
              >
                <span className="chk-box" aria-hidden="true" />
                <span className="txt">{g.label}</span>
              </div>
            );
          })}
        </div>

        <div className="frm-row mt" style={{ gap: 8 }}>
          <button
            type="button"
            className={`chip${state.decision === "take" ? " locked" : ""}`}
            onClick={() => write({ decision: "take" })}
          >
            Take
          </button>
          <button
            type="button"
            className={`chip${state.decision === "skip" ? " locked" : ""}`}
            onClick={() => write({ decision: "skip" })}
          >
            Skip
          </button>
          {state.decision === "take" && gatesOn < 3 && (
            <span className="small warn" style={{ alignSelf: "center" }}>
              Gates incomplete
            </span>
          )}
          {state.decision === "take" && gatesOn === 3 && (
            <span className="small pos" style={{ alignSelf: "center" }}>
              Log on Journal → MSv46 live
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
