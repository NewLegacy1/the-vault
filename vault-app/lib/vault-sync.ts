/**
 * Cross-origin vault transfer (localhost ↔ live).
 * Browser localStorage is per-origin — export a pack on one, import on the other.
 */

import type { Account, JournalEntry, LedgerEntry } from "./types";

export const VAULT_SYNC_KEYS = [
  "vault.journal",
  "vault.accounts",
  "vault.activeAccount",
  "vault.ledger",
] as const;

export type VaultSyncKey = (typeof VAULT_SYNC_KEYS)[number];

export type VaultSyncPack = {
  version: 1;
  exportedAt: string;
  origin?: string;
  data: {
    "vault.journal": JournalEntry[];
    "vault.accounts": Account[];
    "vault.activeAccount": string;
    "vault.ledger": LedgerEntry[];
  };
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function buildVaultSyncPack(): VaultSyncPack {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
    data: {
      "vault.journal": readJson<JournalEntry[]>("vault.journal", []),
      "vault.accounts": readJson<Account[]>("vault.accounts", []),
      "vault.activeAccount": readJson<string>("vault.activeAccount", ""),
      "vault.ledger": readJson<LedgerEntry[]>("vault.ledger", []),
    },
  };
}

export function downloadVaultSyncPack(pack: VaultSyncPack = buildVaultSyncPack()): void {
  const blob = new Blob([JSON.stringify(pack)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const day = pack.exportedAt.slice(0, 10);
  a.href = url;
  a.download = `vault-sync-${day}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseVaultSyncPack(raw: string): VaultSyncPack {
  const parsed = JSON.parse(raw) as VaultSyncPack;
  if (!parsed || parsed.version !== 1 || !parsed.data) {
    throw new Error("Not a Vault sync pack (expected version 1).");
  }
  if (!Array.isArray(parsed.data["vault.journal"])) {
    throw new Error("Pack missing vault.journal array.");
  }
  return parsed;
}

function newerLogged(a: JournalEntry, b: JournalEntry): JournalEntry {
  const ta = a.loggedAt ?? "";
  const tb = b.loggedAt ?? "";
  if (ta && tb) return ta >= tb ? a : b;
  if (ta) return a;
  if (tb) return b;
  return a; // keep local when both lack loggedAt
}

/** Merge by id — newer loggedAt wins for journal; accounts/ledger same. */
export function mergeJournal(local: JournalEntry[], incoming: JournalEntry[]): JournalEntry[] {
  const map = new Map<string, JournalEntry>();
  for (const j of local) map.set(j.id, j);
  for (const j of incoming) {
    const prev = map.get(j.id);
    map.set(j.id, prev ? newerLogged(prev, j) : j);
  }
  return [...map.values()];
}

export function mergeById<T extends { id: string }>(local: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const x of local) map.set(x.id, x);
  for (const x of incoming) {
    if (!map.has(x.id)) map.set(x.id, x);
    // Prefer incoming when same id (transfer is usually the fresher book)
    else map.set(x.id, x);
  }
  return [...map.values()];
}

export type ImportMode = "merge" | "replace";

export type ImportResult = {
  journalCount: number;
  accountCount: number;
  ledgerCount: number;
  mode: ImportMode;
};

/**
 * Apply pack to localStorage. Caller should reload or set React state after.
 * merge = union by id (journal prefers newer loggedAt).
 * replace = overwrite the four keys from the pack.
 */
export function applyVaultSyncPack(pack: VaultSyncPack, mode: ImportMode): ImportResult {
  const incoming = pack.data;
  if (mode === "replace") {
    localStorage.setItem("vault.journal", JSON.stringify(incoming["vault.journal"] ?? []));
    localStorage.setItem("vault.accounts", JSON.stringify(incoming["vault.accounts"] ?? []));
    localStorage.setItem("vault.activeAccount", JSON.stringify(incoming["vault.activeAccount"] ?? ""));
    localStorage.setItem("vault.ledger", JSON.stringify(incoming["vault.ledger"] ?? []));
    return {
      mode,
      journalCount: (incoming["vault.journal"] ?? []).length,
      accountCount: (incoming["vault.accounts"] ?? []).length,
      ledgerCount: (incoming["vault.ledger"] ?? []).length,
    };
  }

  const journal = mergeJournal(
    readJson<JournalEntry[]>("vault.journal", []),
    incoming["vault.journal"] ?? []
  );
  const accounts = mergeById(
    readJson<Account[]>("vault.accounts", []),
    incoming["vault.accounts"] ?? []
  );
  const ledger = mergeById(
    readJson<LedgerEntry[]>("vault.ledger", []),
    incoming["vault.ledger"] ?? []
  );
  const active =
    incoming["vault.activeAccount"] ||
    readJson<string>("vault.activeAccount", "") ||
    "";

  localStorage.setItem("vault.journal", JSON.stringify(journal));
  localStorage.setItem("vault.accounts", JSON.stringify(accounts));
  localStorage.setItem("vault.activeAccount", JSON.stringify(active));
  localStorage.setItem("vault.ledger", JSON.stringify(ledger));

  return {
    mode,
    journalCount: journal.length,
    accountCount: accounts.length,
    ledgerCount: ledger.length,
  };
}
