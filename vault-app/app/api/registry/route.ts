import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  lintRegistry,
  type RegistryFile,
  type StrategyEntry,
  type StrategyState,
} from "@/lib/registry";

/**
 * Strategy registry API — GET returns entries + machine-checked kill-lesson
 * lint; POST updates one entry's lifecycle state (board moves).
 * File: data/registry/strategies.json (shared with the research agent loop).
 */

const REGISTRY_FILE = path.resolve(process.cwd(), "data", "registry", "strategies.json");

const VALID_STATES: StrategyState[] = [
  "idea",
  "stage0_draft",
  "waiting_csv",
  "analyzed",
  "toward",
  "away",
  "killed",
  "live_sprint",
  "funded",
  "retired",
];

function readRegistry(): RegistryFile {
  const parsed = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8")) as RegistryFile;
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error("registry file malformed");
  }
  return parsed;
}

export async function GET() {
  try {
    const reg = readRegistry();
    return NextResponse.json({
      updated: reg.updated,
      entries: reg.entries,
      violations: lintRegistry(reg.entries),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: { id?: string; state?: string };
  try {
    body = (await req.json()) as { id?: string; state?: string };
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { id, state } = body;
  if (!id || !state || !VALID_STATES.includes(state as StrategyState)) {
    return NextResponse.json({ error: "need id + valid state" }, { status: 400 });
  }

  try {
    const reg = readRegistry();
    const entry: StrategyEntry | undefined = reg.entries.find((e) => e.id === id);
    if (!entry) {
      return NextResponse.json({ error: `unknown entry ${id}` }, { status: 404 });
    }
    if (entry.state === "killed") {
      return NextResponse.json(
        { error: "killed books never reopen via the board — new Stage-0 note required" },
        { status: 400 }
      );
    }
    entry.state = state as StrategyState;
    entry.updated = new Date().toISOString().slice(0, 10);
    reg.updated = entry.updated;
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(reg, null, 2));
    return NextResponse.json({
      ok: true,
      entry,
      violations: lintRegistry(reg.entries),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
