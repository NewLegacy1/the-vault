"use client";

/**
 * Client half of the server-backed vault store (Phase 1).
 *
 * localStorage stays as a fast per-origin cache; /api/vault-store is the
 * durable source of truth. `useLocal` (lib/store.ts) calls into this module
 * for the four vault.* keys:
 *
 *   mount → pull server value → merge with local cache → adopt + push back
 *   write → localStorage immediately + debounced push to the server
 *
 * If the API is unreachable (live Vercel build, server down) everything
 * degrades to the old localStorage-only behavior without throwing.
 */

import { mergeJournal } from "./vault-sync";
import type { JournalEntry } from "./types";

export const VAULT_SERVER_KEYS = [
  "vault.journal",
  "vault.accounts",
  "vault.activeAccount",
  "vault.ledger",
] as const;

export type VaultServerKey = (typeof VAULT_SERVER_KEYS)[number];

export function isVaultServerKey(key: string): key is VaultServerKey {
  return (VAULT_SERVER_KEYS as readonly string[]).includes(key);
}

const PUSH_DEBOUNCE_MS = 1500;
const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Fetch the server copy of one key. `undefined` = server unreachable. */
export async function fetchServerValue(key: VaultServerKey): Promise<unknown> {
  try {
    const res = await fetch(`/api/vault-store?key=${encodeURIComponent(key)}`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { value?: unknown };
    return json.value ?? null;
  } catch {
    return undefined;
  }
}

/** Debounced fire-and-forget push. Safe to call on every state change. */
export function pushServerValue(key: VaultServerKey, value: unknown): void {
  const prev = pushTimers.get(key);
  if (prev) clearTimeout(prev);
  pushTimers.set(
    key,
    setTimeout(() => {
      pushTimers.delete(key);
      void fetch("/api/vault-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      }).catch(() => {
        // server offline — localStorage cache still holds the data
      });
    }, PUSH_DEBOUNCE_MS)
  );
}

function unionById<T extends { id: string }>(local: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  // incoming (server) first, then local — local wins on id conflicts because
  // the tab you are typing in is the freshest editor for accounts/ledger.
  for (const x of incoming) map.set(x.id, x);
  for (const x of local) map.set(x.id, x);
  return [...map.values()];
}

/**
 * Merge the local cache with the server copy on mount.
 * Journal: union by id, newer `loggedAt` wins (reuses vault-sync semantics).
 * Accounts / ledger: union by id, local wins on conflict.
 * Active account: local non-empty wins.
 */
export function mergeWithServer(key: VaultServerKey, local: unknown, server: unknown): unknown {
  if (server === undefined || server === null) return local;

  switch (key) {
    case "vault.journal": {
      const l = Array.isArray(local) ? (local as JournalEntry[]) : [];
      const s = Array.isArray(server) ? (server as JournalEntry[]) : [];
      return mergeJournal(l, s);
    }
    case "vault.accounts":
    case "vault.ledger": {
      const l = Array.isArray(local) ? (local as { id: string }[]) : [];
      const s = Array.isArray(server) ? (server as { id: string }[]) : [];
      return unionById(l, s);
    }
    case "vault.activeAccount": {
      const l = typeof local === "string" ? local : "";
      const s = typeof server === "string" ? server : "";
      return l || s;
    }
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}
