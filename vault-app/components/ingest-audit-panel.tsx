"use client";

import type { IngestAuditReport } from "@/lib/ingest-audit";

export function IngestAuditPanel({ audit }: { audit: IngestAuditReport }) {
  const tone =
    audit.severity === "block" ? "neg" : audit.severity === "warn" ? "warn" : "pos";
  const badge =
    audit.severity === "block"
      ? "BLOCK_INGEST"
      : audit.severity === "warn"
        ? "INGEST_WARN"
        : "INGEST_OK";

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div className="panel-title">
        Ingest audit
        <span className="sub">gaps · enrichment coverage · double-export hygiene</span>
        <span className={tone} style={{ marginLeft: 10, fontWeight: 600 }}>
          {badge}
        </span>
      </div>
      <div className="panel-body">
        <div className="small dim" style={{ marginBottom: 6 }}>
          n={audit.n} · {audit.span}
          {audit.maxGapDays != null && <> · max gap {audit.maxGapDays}d</>}
          {audit.enrichmentCoveragePct > 0 && (
            <> · enrich {audit.enrichmentCoveragePct}%</>
          )}
        </div>
        <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
          {audit.findings.map((f) => (
            <li
              key={f.id}
              className={
                f.severity === "block" ? "neg" : f.severity === "warn" ? "warn" : "dim"
              }
              style={{ marginBottom: 2 }}
            >
              {f.message}
            </li>
          ))}
        </ul>
        {!audit.canRunMc && (
          <p className="small neg" style={{ marginTop: 8, marginBottom: 0 }}>
            Fix ingest before trusting path MC promote language.
          </p>
        )}
      </div>
    </div>
  );
}
