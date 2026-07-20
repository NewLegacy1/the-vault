"use client";

import { useCallback, useEffect, useState } from "react";

type Hub = { id: string; path: string; label: string };

export default function BrainPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [active, setActive] = useState("index");
  const [md, setMd] = useState("");
  const [path, setPath] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async (id: string) => {
    setErr("");
    setActive(id);
    try {
      const r = await fetch(`/api/brain?id=${encodeURIComponent(id)}`);
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error ?? "load failed");
        setMd("");
        return;
      }
      setMd(data.markdown ?? "");
      setPath(data.path ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
    }
  }, []);

  useEffect(() => {
    fetch("/api/brain?list=1")
      .then((r) => r.json())
      .then((d) => setHubs(d.hubs ?? []))
      .catch(() => setHubs([]));
    load("index");
  }, [load]);

  return (
    <div>
      <div className="panel">
        <div className="panel-title">
          Brain
          <span className="sub">read-only · strategies/knowledge · Alt+9</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.5 }}>
            Obsidian is just this folder of Markdown. The app shows hubs here; it does{" "}
            <b>not</b> execute notes as rules. Promote = copy into <code className="inline">lib/</code>.
            Open the same folder in Obsidian for backlinks/graph.
          </p>
          <div className="brain-hubs">
            {hubs.map((h) => (
              <button
                key={h.id}
                type="button"
                className={active === h.id ? "active" : ""}
                onClick={() => load(h.id)}
              >
                {h.label}
              </button>
            ))}
          </div>
          {path && (
            <div className="small dim" style={{ marginBottom: 8 }}>
              {path}
            </div>
          )}
          {err && <p className="warn small">{err}</p>}
          {md && <pre className="brain-md">{md}</pre>}
        </div>
      </div>
    </div>
  );
}
