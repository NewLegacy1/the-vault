"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MatrixResults } from "@/components/matrix-results";

export default function ResultsPage() {
  const router = useRouter();

  return (
    <>
      <div className="panel" style={{ borderColor: "var(--accent)" }}>
        <div className="panel-title">
          Matrix results
          <span className="sub">F8 — saved Monte Carlo cohorts</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.65 }}>
            Each row is a strategy branch from the premium 365d matrix.{" "}
            <span className="accent">Saved</span> means a cohort note exists in{" "}
            <code className="inline">strategies/cohorts/</code>. Click a row to open that study in{" "}
            <Link href="/lab" className="accent">
              F4 Lab
            </Link>
            .
          </p>
          <MatrixResults
            onSelectPreset={(id) => router.push(`/lab?preset=${encodeURIComponent(id)}`)}
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-title">
          Replay recipes
          <span className="sub">what to export from TradingView</span>
        </div>
        <div className="panel-body small dim" style={{ lineHeight: 1.65 }}>
          TV export steps live on{" "}
          <Link href="/strategies" className="accent">
            F3 Strategy
          </Link>
          . Macro B1/B3 rows do not need a second export — upload B0 once in Lab, then select B1a/B3b and RUN.
        </div>
      </div>
    </>
  );
}
