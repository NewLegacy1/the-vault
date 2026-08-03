import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Server-backed vault store (Phase 1 of pipeline build-out).
 *
 * Source of truth for the four vault.* localStorage keys. Every write:
 *   1. snapshots the previous value when it shrank or the last snapshot is old,
 *   2. writes store.json atomically (tmp + rename).
 *
 * Data lives in vault-app/data/vault-store/ — git-visible, so journal history
 * survives stale-tab overwrites (the F3 audit finding). On hosts without a
 * writable filesystem (Vercel) POST fails and the client silently falls back
 * to localStorage-only behavior.
 */

const STORE_DIR = path.resolve(process.cwd(), "data", "vault-store");
const STORE_FILE = path.join(STORE_DIR, "store.json");
const SNAP_DIR = path.join(STORE_DIR, "snapshots");

const VAULT_KEYS = [
  "vault.journal",
  "vault.accounts",
  "vault.activeAccount",
  "vault.ledger",
] as const;

type VaultKey = (typeof VAULT_KEYS)[number];

const MAX_SNAPSHOTS_PER_KEY = 25;
const SNAPSHOT_MIN_INTERVAL_MS = 10 * 60 * 1000;

interface StoreFile {
  version: 1;
  updatedAt: string;
  data: Partial<Record<VaultKey, unknown>>;
}

function isVaultKey(k: string): k is VaultKey {
  return (VAULT_KEYS as readonly string[]).includes(k);
}

function emptyStore(): StoreFile {
  return { version: 1, updatedAt: new Date(0).toISOString(), data: {} };
}

function readStore(): StoreFile {
  try {
    if (!fs.existsSync(STORE_FILE)) return emptyStore();
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, "utf8")) as StoreFile;
    if (!parsed || parsed.version !== 1 || typeof parsed.data !== "object") {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStoreAtomic(store: StoreFile): void {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, STORE_FILE);
}

function snapshotFileKey(key: VaultKey): string {
  return key.replace(/\./g, "-");
}

function listSnapshots(key: VaultKey): string[] {
  if (!fs.existsSync(SNAP_DIR)) return [];
  const prefix = `${snapshotFileKey(key)}-`;
  return fs
    .readdirSync(SNAP_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort();
}

function lastSnapshotMs(key: VaultKey): number | null {
  const snaps = listSnapshots(key);
  if (snaps.length === 0) return null;
  const last = snaps[snaps.length - 1]!;
  try {
    return fs.statSync(path.join(SNAP_DIR, last)).mtimeMs;
  } catch {
    return null;
  }
}

/** Snapshot the OUTGOING value before an overwrite, then prune old snapshots. */
function maybeSnapshot(key: VaultKey, prev: unknown, next: unknown): boolean {
  if (prev === undefined) return false;

  const prevLen = Array.isArray(prev) ? prev.length : null;
  const nextLen = Array.isArray(next) ? next.length : null;
  const shrank = prevLen != null && nextLen != null && nextLen < prevLen;

  const lastMs = lastSnapshotMs(key);
  const stale = lastMs == null || Date.now() - lastMs > SNAPSHOT_MIN_INTERVAL_MS;
  if (!shrank && !stale) return false;

  fs.mkdirSync(SNAP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = shrank ? "-preshrink" : "";
  const file = path.join(SNAP_DIR, `${snapshotFileKey(key)}-${ts}${suffix}.json`);
  fs.writeFileSync(file, JSON.stringify({ key, snappedAt: ts, value: prev }));

  const snaps = listSnapshots(key);
  const excess = snaps.length - MAX_SNAPSHOTS_PER_KEY;
  for (let i = 0; i < excess; i++) {
    try {
      fs.unlinkSync(path.join(SNAP_DIR, snaps[i]!));
    } catch {
      // pruning is best-effort
    }
  }
  return true;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const store = readStore();

  if (key) {
    if (!isVaultKey(key)) {
      return NextResponse.json({ error: "unknown key" }, { status: 400 });
    }
    return NextResponse.json({
      key,
      value: store.data[key] ?? null,
      updatedAt: store.updatedAt,
    });
  }

  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  let body: { key?: string; value?: unknown };
  try {
    body = (await req.json()) as { key?: string; value?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { key, value } = body;
  if (!key || !isVaultKey(key)) {
    return NextResponse.json({ error: "unknown key" }, { status: 400 });
  }
  if (value === undefined) {
    return NextResponse.json({ error: "missing value" }, { status: 400 });
  }

  try {
    const store = readStore();
    const prev = store.data[key];
    const snapped = maybeSnapshot(key, prev, value);
    store.data[key] = value;
    store.updatedAt = new Date().toISOString();
    writeStoreAtomic(store);
    return NextResponse.json({
      ok: true,
      key,
      snapshot: snapped,
      n: Array.isArray(value) ? value.length : null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `store write failed: ${String(e)}` },
      { status: 500 }
    );
  }
}
