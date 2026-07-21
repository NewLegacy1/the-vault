"use client";

import { useRef, useState } from "react";
import {
  applyVaultSyncPack,
  buildVaultSyncPack,
  downloadVaultSyncPack,
  parseVaultSyncPack,
  type ImportMode,
} from "@/lib/vault-sync";

type Props = {
  /** After import, parent should refresh React state from localStorage. */
  onImported?: () => void;
};

export function VaultSyncPanel({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const exportPack = () => {
    setErr("");
    try {
      const pack = buildVaultSyncPack();
      downloadVaultSyncPack(pack);
      setMsg(
        `Exported ${pack.data["vault.journal"].length} journal rows · ${pack.data["vault.accounts"].length} accounts`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
    }
  };

  const importFile = async (file: File | null, mode: ImportMode) => {
    setErr("");
    setMsg("");
    if (!file) return;
    if (mode === "replace") {
      const ok = window.confirm(
        "REPLACE will overwrite journal, accounts, active account, and ledger on THIS site with the file. Continue?"
      );
      if (!ok) return;
    }
    try {
      const text = await file.text();
      const pack = parseVaultSyncPack(text);
      const result = applyVaultSyncPack(pack, mode);
      setMsg(
        `${mode === "merge" ? "Merged" : "Replaced"}: ${result.journalCount} journal · ${result.accountCount} accounts · ${result.ledgerCount} ledger`
      );
      onImported?.();
      // Force full reload so every useLocal hook re-hydrates (avoids stale-tab overwrite).
      window.setTimeout(() => window.location.reload(), 400);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">
        Transfer journal
        <span className="sub">
          localhost ↔ live — localStorage is per site; export here, import there
        </span>
      </div>
      <div className="panel-body">
        <p className="small dim" style={{ marginTop: 0, lineHeight: 1.5 }}>
          Dual46 / paper journaling lives in the browser, not git. To see May walk rows on the
          live app: <b>Export</b> on the machine/site that has them → open the live app →{" "}
          <b>Merge import</b> (or Replace if live is empty/junk).
        </p>
        <div className="frm-row">
          <button type="button" className="btn" onClick={exportPack}>
            Export vault sync JSON
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              fileRef.current?.setAttribute("data-mode", "merge");
              fileRef.current?.click();
            }}
          >
            Merge import…
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              fileRef.current?.setAttribute("data-mode", "replace");
              fileRef.current?.click();
            }}
          >
            Replace import…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={(e) => {
              const mode =
                (fileRef.current?.getAttribute("data-mode") as ImportMode) || "merge";
              void importFile(e.target.files?.[0] ?? null, mode);
            }}
          />
        </div>
        {msg && <p className="small pos mt">{msg}</p>}
        {err && <p className="small warn mt">{err}</p>}
      </div>
    </div>
  );
}
