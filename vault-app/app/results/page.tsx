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
            Each row is a strategy branch from the premium 365d matrix. Use the <span className="accent">firm tabs</span>{" "}
            (TPT, Alpha Zero, Apex, etc.) to compare pass rates — new Lab runs save all firms at once.{" "}
            <span className="accent">★</span> marks the best pass % for the selected firm. Click a row for replay steps and speed-to-pass.
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
          . Upload each TV CSV once per preset in Lab (A0a, A0b, D1, B0, etc.). Macro B1/B3 need only B0 — select B1a/B3b in Lab and RUN with no second upload.
        </div>
      </div>
    </>
  );
}
