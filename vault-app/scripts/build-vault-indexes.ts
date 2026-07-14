/**
 * Bundles Obsidian cohort notes + FF calendar for Vercel (read-only FS).
 * Run: npx tsx scripts/build-vault-indexes.ts
 * Hooked into `npm run build` via prebuild.
 */
import fs from "fs";
import path from "path";
import { parseCohortMeta, type CohortRecord } from "../lib/cohort";
import { parseCalendarCsv, type CalendarEvent } from "../lib/economic-calendar";

const ROOT = process.cwd();
const OUT_COHORTS = path.join(ROOT, "data", "cohorts-index.json");
const OUT_CALENDAR = path.join(ROOT, "data", "calendar-bundle.json");

function repoRoot(): string {
  const parent = path.join(ROOT, "..");
  if (fs.existsSync(path.join(parent, "strategies"))) return parent;
  return ROOT;
}

async function walkMd(dir: string, base: string): Promise<{ rel: string; abs: string }[]> {
  let names: string[];
  try {
    names = await fs.promises.readdir(dir);
  } catch {
    return [];
  }
  const out: { rel: string; abs: string }[] = [];
  for (const name of names) {
    if (name.startsWith("_")) continue;
    const abs = path.join(dir, name);
    const stat = await fs.promises.stat(abs).catch(() => null);
    if (!stat) continue;
    if (stat.isDirectory()) {
      out.push(...(await walkMd(abs, path.join(base, name))));
    } else if (name.endsWith(".md")) {
      out.push({ rel: path.join(base, name).replace(/\\/g, "/"), abs });
    }
  }
  return out;
}

async function buildCohortIndex(): Promise<CohortRecord[]> {
  const cohortsDir = path.join(repoRoot(), "strategies", "cohorts");
  const files = await walkMd(cohortsDir, "");
  const records: CohortRecord[] = [];
  for (const { rel, abs } of files) {
    const content = await fs.promises.readFile(abs, "utf-8");
    const meta = parseCohortMeta(content, path.basename(rel), rel);
    if (meta) records.push(meta);
  }
  try {
    const rootNames = await fs.promises.readdir(cohortsDir);
    for (const name of rootNames.filter((f) => f.endsWith(".md") && !f.startsWith("_"))) {
      const abs = path.join(cohortsDir, name);
      const stat = await fs.promises.stat(abs).catch(() => null);
      if (!stat?.isFile()) continue;
      const content = await fs.promises.readFile(abs, "utf-8");
      const meta = parseCohortMeta(content, name, name);
      if (meta && !records.some((r) => r.filename === name)) records.push(meta);
    }
  } catch {
    /* ignore */
  }
  return records.sort((a, b) => b.created.localeCompare(a.created));
}

function calendarSources(): string[] {
  const dirs = [
    path.join(repoRoot(), "data", "calendar"),
    path.join(ROOT, "data", "calendar"),
  ];
  const out = new Set<string>();
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".csv") && f.startsWith("forexfactory_")) {
        out.add(path.join(dir, f));
      }
    }
  }
  return [...out];
}

function mergeCalendarEvents(lists: CalendarEvent[][]): CalendarEvent[] {
  const seen = new Set<string>();
  const out: CalendarEvent[] = [];
  for (const list of lists) {
    for (const e of list) {
      const k = `${e.date}|${e.time}|${e.title}|${e.currency}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(e);
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

function buildCalendarBundle() {
  const sources = calendarSources();
  const parsed: CalendarEvent[][] = [];
  for (const fp of sources) {
    const events = parseCalendarCsv(fs.readFileSync(fp, "utf8"));
    if (events.length) parsed.push(events);
  }
  const merged = mergeCalendarEvents(parsed);
  const dates = merged.map((e) => e.date).sort();
  return {
    source: sources.map((s) => path.basename(s)).join(" + ") || "none",
    uploadedAt: new Date().toISOString(),
    eventCount: merged.length,
    span: dates.length ? { start: dates[0], end: dates[dates.length - 1] } : { start: "", end: "" },
    events: merged,
  };
}

async function main() {
  fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });

  const cohorts = await buildCohortIndex();
  fs.writeFileSync(
    OUT_COHORTS,
    JSON.stringify({ builtAt: new Date().toISOString(), count: cohorts.length, cohorts }, null, 0),
    "utf8"
  );
  console.log(`cohorts-index: ${cohorts.length} notes → ${OUT_COHORTS}`);

  const calendar = buildCalendarBundle();
  fs.writeFileSync(OUT_CALENDAR, JSON.stringify(calendar, null, 0), "utf8");
  console.log(`calendar-bundle: ${calendar.eventCount} events → ${OUT_CALENDAR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
