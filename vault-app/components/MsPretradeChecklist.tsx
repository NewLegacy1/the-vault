"use client";

import { useMemo } from "react";
import { useLocal, todayStr } from "@/lib/store";

type Bias = "long" | "short" | "none";

type ChecklistState = {
  date: string;
  weekBias: Bias;
  dayBias: Bias;
  weekWhy: string;
  dayWhy: string;
  /** Step checkboxes — keyed by id */
  checks: Record<string, boolean>;
  agree: "y" | "n" | "";
  pathLean: "Cont" | "Judas" | "";
  decision: "take" | "skip" | "";
};

const DAY_CHECKS: { id: string; label: string }[] = [
  { id: "news", label: "News / red folder checked (stand down if needed)" },
  { id: "news10", label: "No blind limit into a 10:00 print (T−2 → T+1)" },
  { id: "pdh_pdl", label: "PDH / PDL — closer / unfinished noted" },
  { id: "overnight", label: "Overnight draw already spent? (first signal suspect)" },
  { id: "consumed", label: "Not anchoring on filled NWOG / already-swept pool" },
  { id: "judas", label: "Open story (Judas) read — which way took liquidity" },
];

const PATH_CHECKS: { id: string; label: string }[] = [
  { id: "ko_wash", label: "10:00 wash on the open" },
  { id: "ko_wick", label: "Wick / manip one side of 10:00" },
  { id: "ko_leave", label: "Away-only leave from 10:00" },
  { id: "fib_eyes", label: "Fib LO/HI eyes only — stop is RB extreme, not 0.705" },
  { id: "a_plus", label: "Arm ≈ Powell · Cont|Judas · 1RB · OTE+KO (or grade it)" },
  { id: "geom", label: "Entry = RB wick-start · TP ≤ 100 · real R logged" },
  { id: "with_bias", label: "Trade WITH week/day bias (not against empty NWOG)" },
];

const SKIP_CHECKS: { id: string; label: string }[] = [
  { id: "nwog_fight", label: "Trade runs away from empty NWOG magnet" },
  { id: "bias_fight", label: "Week vs day bias fight" },
  { id: "path_fight", label: "Path B fights written bias" },
  { id: "chop", label: "Messy chop / no clean leave" },
  { id: "cant_say", label: "Can't explain in one sentence" },
  { id: "one_done", label: "Already took 1 trade today" },
];

function emptyChecklist(date = todayStr()): ChecklistState {
  return {
    date,
    weekBias: "none",
    dayBias: "none",
    weekWhy: "",
    dayWhy: "",
    checks: {},
    agree: "",
    pathLean: "",
    decision: "",
  };
}

function Toggle({
  id,
  label,
  on,
  set,
}: {
  id: string;
  label: string;
  on: boolean;
  set: (id: string, v: boolean) => void;
}) {
  return (
    <label className="chk" style={{ display: "flex", marginBottom: 6, maxWidth: "100%" }}>
      <input type="checkbox" checked={on} onChange={(e) => set(id, e.target.checked)} />
      <span className="chk-box" aria-hidden="true" />
      <span className="txt small">{label}</span>
    </label>
  );
}

/** Interactive Morningstar / Dual46 pre-trade checklist for the Today page. */
export function MsPretradeChecklist() {
  const day = todayStr();
  const key = `vault.msChecklist.${day}`;
  const [c, setC] = useLocal<ChecklistState>(key, emptyChecklist(day));

  // Roll to today if stored date drifted
  const state = useMemo(() => {
    if (c.date !== day) return emptyChecklist(day);
    return c;
  }, [c, day]);

  const write = (patch: Partial<ChecklistState>) => {
    setC({ ...state, ...patch, date: day });
  };

  const setCheck = (id: string, v: boolean) => {
    write({ checks: { ...state.checks, [id]: v } });
  };

  const biasClash =
    state.weekBias !== "none" &&
    state.dayBias !== "none" &&
    state.weekBias !== state.dayBias;

  const doneCount = [...DAY_CHECKS, ...PATH_CHECKS].filter((x) => state.checks[x.id]).length;
  const totalGate = DAY_CHECKS.length + PATH_CHECKS.length;

  return (
    <div className="panel">
      <div className="panel-title">
        MSv46 pre-trade checklist
        <span className="sub">
          {day} · {doneCount}/{totalGate} gates · script proposes · you decide
        </span>
      </div>
      <div className="panel-body">
        <p className="small dim" style={{ marginTop: 0, lineHeight: 1.5 }}>
          Bias on <b>5m</b> · arm on <b>1m RB</b> · KO-retest · Fixed 1:5 ≤ 100 · fib eyes only.
          Saved for today in this browser.
        </p>

        <div className="accent small" style={{ letterSpacing: 1, marginBottom: 8 }}>
          STEP 1 — WEEK (NWOG)
        </div>
        <div className="frm-row">
          <label className="fld">
            Week bias
            <select
              value={state.weekBias}
              onChange={(e) => write({ weekBias: e.target.value as Bias })}
            >
              <option value="none">none</option>
              <option value="long">long</option>
              <option value="short">short</option>
            </select>
          </label>
          <label className="fld" style={{ flex: 1, minWidth: 180 }}>
            Why (one line)
            <input
              value={state.weekWhy}
              onChange={(e) => write({ weekWhy: e.target.value })}
              placeholder="empty NWOG above / below / filled…"
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div className="accent small mt" style={{ letterSpacing: 1, marginBottom: 8 }}>
          STEP 2 — DAY (before / at 10:00)
        </div>
        <div className="frm-row">
          <label className="fld">
            Day bias
            <select
              value={state.dayBias}
              onChange={(e) => write({ dayBias: e.target.value as Bias })}
            >
              <option value="none">none</option>
              <option value="long">long</option>
              <option value="short">short</option>
            </select>
          </label>
          <label className="fld" style={{ flex: 1, minWidth: 180 }}>
            Why
            <input
              value={state.dayWhy}
              onChange={(e) => write({ dayWhy: e.target.value })}
              placeholder="swept PDL / Judas / PDH…"
              style={{ width: "100%" }}
            />
          </label>
        </div>
        {biasClash && (
          <p className="small warn" style={{ marginTop: 0 }}>
            Week and day disagree → prefer <b>NONE</b> unless Path B is textbook and small risk.
          </p>
        )}
        {DAY_CHECKS.map((x) => (
          <Toggle
            key={x.id}
            id={x.id}
            label={x.label}
            on={!!state.checks[x.id]}
            set={setCheck}
          />
        ))}

        <div className="accent small mt" style={{ letterSpacing: 1, marginBottom: 8 }}>
          STEP 3 — PATH B (after 10:00)
        </div>
        <div className="frm-row">
          <label className="fld">
            Path lean
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
          <label className="fld">
            All three agree?
            <select
              value={state.agree}
              onChange={(e) => write({ agree: e.target.value as ChecklistState["agree"] })}
            >
              <option value="">—</option>
              <option value="y">Y — may take</option>
              <option value="n">N — skip</option>
            </select>
          </label>
          <label className="fld">
            Decision
            <select
              value={state.decision}
              onChange={(e) =>
                write({ decision: e.target.value as ChecklistState["decision"] })
              }
            >
              <option value="">—</option>
              <option value="take">Take</option>
              <option value="skip">Skip</option>
            </select>
          </label>
        </div>
        {PATH_CHECKS.map((x) => (
          <Toggle
            key={x.id}
            id={x.id}
            label={x.label}
            on={!!state.checks[x.id]}
            set={setCheck}
          />
        ))}

        <div className="accent small mt" style={{ letterSpacing: 1, marginBottom: 8 }}>
          STEP 4 — NO-TRADE FLAGS
        </div>
        {SKIP_CHECKS.map((x) => (
          <Toggle
            key={x.id}
            id={x.id}
            label={x.label}
            on={!!state.checks[x.id]}
            set={setCheck}
          />
        ))}

        {state.decision === "take" && state.agree === "n" && (
          <p className="small warn mt">You marked disagree but decision = Take — fix that.</p>
        )}
        {state.decision === "take" && state.agree === "y" && (
          <p className="small pos mt">Checklist green for a take — still your click. Log on Journal → MSv46 live.</p>
        )}
      </div>
    </div>
  );
}
