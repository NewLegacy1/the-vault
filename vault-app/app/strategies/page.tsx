"use client";

import { useLocal } from "@/lib/store";
import { MatrixReplayPanel } from "@/components/matrix-replay-panel";
import { DEFAULT_STUDY, presetById } from "@/lib/lab-profile";
import Link from "next/link";

const PRB_PINE_REV = "v1.10 (Jul 14 2026)";
const MACRO_PINE_REV = "v1.4 (Jul 14 2026)";

export default function StrategiesPage() {
  const [study, setStudy] = useLocal("vault.f3.matrixPreset", DEFAULT_STUDY.presetId);
  const activePresetId = typeof study === "string" ? study : DEFAULT_STUDY.presetId;
  const activePreset = presetById(activePresetId);

  const setPreset = (id: string) => setStudy(id);

  return (
    <>
      <div className="panel" style={{ borderColor: "var(--accent)" }}>
        <div className="panel-title">
          Matrix replay
          <span className="sub">F3 — what to run in TradingView · same rows as F4 Lab</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.65 }}>
            Pick a matrix branch, follow the replay recipe, export CSV, then{" "}
            <Link href="/lab" className="accent">
              RUN in F4 Lab
            </Link>
            . Each preset keeps its own CSV in Lab — no re-upload when switching rows. Macro B1/B3 rows filter from B0 automatically. Saved MC results:{" "}
            <Link href="/results" className="accent">
              F8 Results
            </Link>
            .
          </p>
          <MatrixReplayPanel activePresetId={activePresetId} onSelectPreset={setPreset} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-title">
          Pine scripts
          <span className="sub">paste into TradingView after vault edits</span>
        </div>
        <div className="panel-body">
          <div className="frm-row" style={{ gap: 24 }}>
            <div className="flow-diagram" style={{ flex: 1 }}>
              <b>PRB {PRB_PINE_REV}</b>
              <div className="small dim" style={{ marginTop: 6 }}>
                <code className="inline">pine/Powell_Rejection_Block_v1.pine</code>
              </div>
              <p className="small" style={{ lineHeight: 1.6 }}>
                Eval matrix A0a–A1c, funded D1. Locked live file — experiments use overrides in recipe above only.
              </p>
            </div>
            <div className="flow-diagram" style={{ flex: 1 }}>
              <b>Macro {MACRO_PINE_REV}</b>
              <div className="small dim" style={{ marginTop: 6 }}>
                <code className="inline">pine/Macro_Model_v1.pine</code>
              </div>
              <p className="small" style={{ lineHeight: 1.6 }}>
                B0 full book only in TV. Tier tags (A+/A/H) export in Signal column — Lab derives B1/B3 filters.
              </p>
            </div>
          </div>
          {activePreset?.family === "datahl" && (
            <p className="small warn mt">
              Data H/L: manual bar replay on F7-tagged news days — see recipe above. Not a deep-backtest strategy.
            </p>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-title">
          Agent knowledge
          <span className="sub">Obsidian — not UI</span>
        </div>
        <div className="panel-body small dim" style={{ lineHeight: 1.65 }}>
          Strategy development charter and playbooks live in{" "}
          <code className="inline">strategies/strategy-dev/STRATEGY_DEV_AGENT.md</code>. Cohorts auto-save to{" "}
          <code className="inline">strategies/cohorts/</code> when GitHub token is set on Vercel.
        </div>
      </div>
    </>
  );
}
