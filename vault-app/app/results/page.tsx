"use client";

import { useCallback, useEffect, useState } from "react";
import { MatrixResultsHub } from "@/components/matrix-results-hub";
import type { CohortRecord } from "@/lib/cohort";

export default function ResultsPage() {
  const [cohorts, setCohorts] = useState<CohortRecord[]>([]);
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePresetId, setActivePresetId] = useState("matrix-b1a");

  const loadCohorts = useCallback(() => {
    setLoading(true);
    fetch("/api/cohorts", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        return data as { cohorts?: CohortRecord[] };
      })
      .then((data) => {
        setCohorts(data.cohorts ?? []);
        setLoadErr("");
      })
      .catch((e) => setLoadErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCohorts();
    const id = window.setInterval(loadCohorts, 45000);
    return () => window.clearInterval(id);
  }, [loadCohorts]);

  return (
    <>
      <div className="panel" style={{ borderColor: "var(--accent)" }}>
        <div className="panel-title">
          Matrix results
          <span className="sub">F8 — cohorts · firm comparison · replay</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.65 }}>
            Click a matrix row to open the <span className="accent">firm comparison chart</span> (pass rate across TPT,
            Topstep, Alpha Zero $50K, and Apex on the <em>same trades</em>). Pick a firm in Matrix progress — the table,
            stats, and <span className="accent">Firm rules</span> panel below all follow that selection.
          </p>
          <MatrixResultsHub
            cohorts={cohorts}
            loading={loading}
            loadErr={loadErr}
            onRefresh={loadCohorts}
            activePresetId={activePresetId}
            onSelectPreset={setActivePresetId}
          />
        </div>
      </div>
    </>
  );
}
