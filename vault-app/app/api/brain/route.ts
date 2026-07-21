import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Read-only brain docs from strategies/knowledge (and strategy-dev charter hubs).
 * Path traversal blocked — only allowlisted relative markdown under strategies/.
 */

const ROOT = path.resolve(process.cwd(), "..");

const ALLOWED_PREFIXES = [
  "strategies/knowledge/",
  "strategies/strategy-dev/00-charter/",
  "strategies/strategy-dev/50-analyses/",
];

const HUBS = [
  { id: "index", path: "strategies/knowledge/_index.md", label: "MOC" },
  { id: "math", path: "strategies/knowledge/hubs/hub-math.md", label: "MATH" },
  { id: "regimes", path: "strategies/knowledge/hubs/hub-regimes.md", label: "REGIMES" },
  { id: "ops", path: "strategies/knowledge/hubs/hub-ops.md", label: "OPS" },
  { id: "stage0", path: "strategies/knowledge/hubs/hub-stage0.md", label: "STAGE-0" },
  { id: "doctrine", path: "strategies/knowledge/hubs/hub-doctrine.md", label: "DOCTRINE" },
  { id: "auction", path: "strategies/knowledge/hubs/hub-auction.md", label: "AUCTION" },
  { id: "org", path: "strategies/knowledge/ORGANIZATION.md", label: "ORG RULES" },
  { id: "builder", path: "strategies/knowledge/quant/vault-model-builder-architecture.md", label: "BUILDER" },
  { id: "away-mc", path: "strategies/strategy-dev/50-analyses/away-session-2026-07-20-mc-synthesis.md", label: "AWAY MC" },
  { id: "away-d46", path: "strategies/strategy-dev/50-analyses/away-session-2026-07-20-dual46-conclusions.md", label: "AWAY D46" },
  { id: "weekly", path: "strategies/strategy-dev/50-analyses/weekly-review-latest.md", label: "WEEKLY" },
  { id: "s0check", path: "strategies/knowledge/quant/stage-0-scorecard-surface.md", label: "S0 CHECK" },
  { id: "es-mc", path: "strategies/knowledge/quant/event-study-to-path-mc-handoff.md", label: "ES→MC" },
  { id: "haircut", path: "strategies/knowledge/quant/fill-haircut-defaults-stage0-lab.md", label: "HAIRCUT" },
  { id: "addendum", path: "strategies/strategy-dev/50-analyses/away-session-2026-07-20-addendum.md", label: "ADDENDUM" },
  { id: "sierra", path: "strategies/knowledge/quant/sierra-chart-tpo-volume-diy-template.md", label: "SIERRA DIY" },
];

function safeResolve(rel: string): string | null {
  const norm = rel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (norm.includes("..") || norm.includes("\0")) return null;
  if (!norm.endsWith(".md")) return null;
  if (!ALLOWED_PREFIXES.some((p) => norm.startsWith(p))) return null;
  const abs = path.resolve(ROOT, norm);
  const knowledgeRoot = path.resolve(ROOT, "strategies");
  if (!abs.startsWith(knowledgeRoot + path.sep) && abs !== knowledgeRoot) return null;
  return abs;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const list = url.searchParams.get("list");
  if (list === "1") {
    return NextResponse.json({ hubs: HUBS });
  }

  const rel =
    url.searchParams.get("path") ??
    HUBS.find((h) => h.id === (url.searchParams.get("id") ?? "index"))?.path ??
    HUBS[0].path;

  const abs = safeResolve(rel);
  if (!abs) {
    return NextResponse.json({ error: "path not allowed" }, { status: 400 });
  }
  if (!fs.existsSync(abs)) {
    return NextResponse.json({ error: "not found", path: rel }, { status: 404 });
  }
  const markdown = fs.readFileSync(abs, "utf8");
  return NextResponse.json({ path: rel, markdown });
}
