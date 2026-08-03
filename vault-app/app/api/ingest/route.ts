import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/** Read-only view of the ingest ledger written by scripts/ingest-inbox.ts. */

const LEDGER_FILE = path.resolve(
  process.cwd(),
  "data",
  "tv-exports",
  "ingest-ledger.json"
);

export async function GET() {
  try {
    if (!fs.existsSync(LEDGER_FILE)) {
      return NextResponse.json({ rows: [] });
    }
    const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, "utf8"));
    const rows = Array.isArray(parsed) ? parsed : [];
    // newest first for the DATA page
    rows.sort((a, b) =>
      String(b?.ingestedAt ?? "").localeCompare(String(a?.ingestedAt ?? ""))
    );
    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json({ error: String(e), rows: [] }, { status: 500 });
  }
}
