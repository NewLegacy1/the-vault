/**
 * Backfill ~3y USD Forex Factory calendar for Lab / F7 / quiet-Macro filters.
 *
 * Prefers local Hugging Face forex_factory_cache.csv (dense through ~2025-04-07),
 * then gap-fills Apr 2025→today with FRED high-impact release calendars.
 * Supersedes older partial forexfactory_*.csv files (moved to _archive_pre_3y/).
 *
 * Usage:
 *   node scripts/backfill-calendar-3y.mjs
 *   node scripts/backfill-calendar-3y.mjs --cache "C:/Users/Admin/Downloads/forex_factory_cache.csv"
 *   node scripts/backfill-calendar-3y.mjs --start 2023-07-01 --end 2026-07-14
 */
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, "..");
const CAL_DIR = path.join(VAULT, "data", "calendar");
const ARCHIVE = path.join(CAL_DIR, "_archive_pre_3y");
const APP_CAL = path.join(VAULT, "vault-app", "data", "calendar");

const args = process.argv.slice(2);
function flag(name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}

const START = flag("--start", "2023-07-01");
const END = flag("--end", new Date().toISOString().slice(0, 10));
const CACHE_ARG = flag("--cache", null);

const HF_URL =
  "https://huggingface.co/datasets/Ehsanrs2/Forex_Factory_Calendar/resolve/main/forex_factory_cache.csv";

const FRED_RELEASES = [
  { rid: 50, title: "Employment Situation", impact: "high" },
  { rid: 10, title: "Consumer Price Index", impact: "high" },
  { rid: 46, title: "Producer Price Index", impact: "high" },
  { rid: 53, title: "Gross Domestic Product", impact: "high" },
  { rid: 9, title: "Advance Monthly Sales for Retail and Food Services", impact: "high" },
  { rid: 23, title: "FOMC Meeting Announcement", impact: "high" },
];

const MONTHS = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

function esc(s) {
  const t = String(s ?? "");
  return t.includes(",") || t.includes('"') ? `"${t.replace(/"/g, '""')}"` : t;
}

function findCache() {
  const candidates = [
    CACHE_ARG,
    path.join(process.env.USERPROFILE || "", "Downloads", "forex_factory_cache.csv"),
    path.join(VAULT, "data", "calendar", "forex_factory_cache.csv"),
    path.join(VAULT, "tmp", "forex_factory_cache.csv"),
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).size > 1_000_000) return p;
  }
  return null;
}

async function downloadHfCache(dest) {
  console.log(`Downloading HF forex_factory_cache.csv → ${dest}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(HF_URL, {
    headers: { "User-Agent": "VaultCalendarBot/1.0", Accept: "*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HF download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1_000_000) throw new Error(`HF download too small (${buf.length} bytes)`);
  fs.writeFileSync(dest, buf);
  return dest;
}

function tryForexfactoryGo(outRaw) {
  const probe = spawnSync("forexfactory-go", ["--help"], { encoding: "utf8" });
  if (probe.error || probe.status !== 0) {
    console.log("forexfactory-go not on PATH — skipping live FF pull.");
    console.log(
      `  Manual: forexfactory-go download -s ${START} -e ${END} -f csv -o raw.csv --timezone "America/New_York"`
    );
    return null;
  }
  console.log(`Running forexfactory-go ${START} → ${END}…`);
  const r = spawnSync(
    "forexfactory-go",
    ["download", "-s", START, "-e", END, "-f", "csv", "-o", outRaw, "--timezone", "America/New_York"],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    console.warn("forexfactory-go failed:", r.stderr || r.stdout);
    return null;
  }
  return outRaw;
}

function normalizeViaExisting(inputCsv, start, end) {
  const script = path.join(VAULT, "scripts", "normalize-ff-calendar.mjs");
  execFileSync(
    process.execPath,
    [script, inputCsv, "--usd-only", "--start", start, "--end", end],
    { cwd: VAULT, stdio: "inherit" }
  );
  // normalize writes forexfactory_<first>_<last>.csv — find newest match
  const files = fs
    .readdirSync(CAL_DIR)
    .filter((f) => f.startsWith("forexfactory_") && f.endsWith(".csv") && !f.includes("merged"))
    .map((f) => ({ f, m: fs.statSync(path.join(CAL_DIR, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (!files.length) throw new Error("normalize-ff-calendar produced no CSV");
  return path.join(CAL_DIR, files[0].f);
}

function parseVaultCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    // simple split respecting quotes
    const cols = [];
    let cur = "";
    let inQ = false;
    for (const ch of lines[i]) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        cols.push(cur);
        cur = "";
      } else cur += ch;
    }
    cols.push(cur);
    if (!cols[0] || !cols[4]) continue;
    rows.push({
      Date: cols[0],
      Time: cols[1] || "",
      Currency: cols[2] || "USD",
      Impact: cols[3] || "",
      Event: cols[4] || "",
      Actual: cols[5] || "",
      Forecast: cols[6] || "",
      Previous: cols[7] || "",
    });
  }
  return rows;
}

function parseFredCalendarHtml(html, release) {
  const rows = [];
  const dayRe =
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\w+)\s+(\d{1,2}),\s+(\d{4})/gi;
  let m;
  while ((m = dayRe.exec(html)) !== null) {
    const mon = MONTHS[m[2].toLowerCase()];
    if (!mon) continue;
    const date = `${m[4]}-${mon}-${m[3].padStart(2, "0")}`;
    rows.push({
      Date: date,
      Time: "08:30",
      Currency: "USD",
      Impact: release.impact,
      Event: release.title,
      Actual: "",
      Forecast: "",
      Previous: "",
    });
  }
  return rows;
}

async function fredGapFill(gapStart, gapEnd) {
  const out = [];
  const years = [...new Set([gapStart.slice(0, 4), gapEnd.slice(0, 4)].map(Number))];
  for (const rel of FRED_RELEASES) {
    for (const year of years) {
      process.stderr.write(`FRED rid=${rel.rid} ${year}… `);
      try {
        const url = `https://fred.stlouisfed.org/releases/calendar?rid=${rel.rid}&y=${year}`;
        const res = await fetch(url, {
          headers: { "User-Agent": "VaultCalendarBot/1.0 (research)" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const html = await res.text();
        const parsed = parseFredCalendarHtml(html, rel).filter(
          (r) => r.Date >= gapStart && r.Date <= gapEnd
        );
        out.push(...parsed);
        process.stderr.write(`${parsed.length}\n`);
      } catch (e) {
        process.stderr.write(`FAIL ${e.message}\n`);
      }
      await new Promise((r) => setTimeout(r, 350));
    }
  }
  return out;
}

function mergeRows(lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const r of list) {
      const k = `${r.Date}|${r.Time}|${r.Event}|${r.Currency}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(r);
    }
  }
  return out.sort((a, b) => a.Date.localeCompare(b.Date) || a.Time.localeCompare(b.Time));
}

function writeCanonical(rows, outPath) {
  const hdr = "Date,Time,Currency,Impact,Event,Actual,Forecast,Previous";
  const body = rows.map((r) =>
    [r.Date, r.Time, r.Currency, r.Impact, r.Event, r.Actual, r.Forecast, r.Previous]
      .map(esc)
      .join(",")
  );
  fs.writeFileSync(outPath, [hdr, ...body].join("\n"), "utf8");
}

function archiveOldCsvs(keepBasename) {
  fs.mkdirSync(ARCHIVE, { recursive: true });
  for (const f of fs.readdirSync(CAL_DIR)) {
    if (!f.startsWith("forexfactory_") || !f.endsWith(".csv")) continue;
    if (f === keepBasename) continue;
    const from = path.join(CAL_DIR, f);
    const to = path.join(ARCHIVE, f);
    fs.renameSync(from, to);
    console.log(`Archived ${f} → _archive_pre_3y/`);
  }
}

function writeVaultJson(rows, source) {
  const high = rows.filter((r) => String(r.Impact).toLowerCase().includes("high")).length;
  const payload = {
    source,
    uploadedAt: new Date().toISOString(),
    eventCount: rows.length,
    span: { start: rows[0]?.Date ?? "", end: rows[rows.length - 1]?.Date ?? "" },
    events: rows.map((r) => ({
      date: r.Date,
      time: r.Time,
      currency: r.Currency,
      impact: String(r.Impact).toLowerCase().includes("high")
        ? "high"
        : String(r.Impact).toLowerCase().includes("medium")
          ? "medium"
          : String(r.Impact).toLowerCase().includes("holiday")
            ? "holiday"
            : "low",
      title: r.Event,
      actual: r.Actual || "",
      forecast: r.Forecast || "",
      previous: r.Previous || "",
    })),
  };
  for (const dir of [CAL_DIR, APP_CAL]) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "vault_calendar.json"), JSON.stringify(payload), "utf8");
  }
  console.log(`vault_calendar.json updated (${rows.length} events, ~${high} high-impact)`);
}

function validate(rows) {
  const byYear = {};
  let high = 0;
  let fomc = 0;
  let nfp = 0;
  let cpi = 0;
  for (const r of rows) {
    const y = r.Date.slice(0, 4);
    byYear[y] = (byYear[y] || 0) + 1;
    const imp = String(r.Impact).toLowerCase();
    const title = r.Event.toLowerCase();
    if (imp.includes("high")) high++;
    if (title.includes("fomc") || title.includes("federal funds")) fomc++;
    if (title.includes("employment situation") || title.includes("non-farm") || title.includes("nfp"))
      nfp++;
    if (title.includes("consumer price") || title.includes("cpi")) cpi++;
  }
  console.log("\n=== Validation ===");
  console.log(`Span: ${rows[0]?.Date} → ${rows[rows.length - 1]?.Date}`);
  console.log(`Total: ${rows.length} · high≈${high} · FOMC≈${fomc} · NFP≈${nfp} · CPI≈${cpi}`);
  console.log("By year:", byYear);
  const y2023 = byYear["2023"] || 0;
  const y2025 = byYear["2025"] || 0;
  if (y2023 < 50) console.warn("WARNING: thin 2023 coverage");
  if (y2025 < 50) console.warn("WARNING: thin 2025 coverage");
}

async function main() {
  fs.mkdirSync(CAL_DIR, { recursive: true });

  let cache = findCache();
  if (!cache) {
    const dest = path.join(CAL_DIR, "forex_factory_cache.csv");
    try {
      cache = await downloadHfCache(dest);
    } catch (e) {
      console.error(e.message);
      console.error("Place forex_factory_cache.csv in Downloads or pass --cache <path>");
      process.exit(1);
    }
  } else {
    console.log(`Using cache: ${cache}`);
  }

  const goRaw = path.join(CAL_DIR, `_ff_go_${START}_${END}.csv`);
  const goPath = tryForexfactoryGo(goRaw);
  const primarySrc = goPath && fs.existsSync(goPath) ? goPath : cache;

  // Normalize dense primary into vault columns (writes a temp forexfactory_*.csv)
  const normalizedPath = normalizeViaExisting(primarySrc, START, END);
  let dense = parseVaultCsv(fs.readFileSync(normalizedPath, "utf8"));
  console.log(`Dense USD rows from primary: ${dense.length}`);

  const denseEnd = dense.length ? dense[dense.length - 1].Date : START;
  const gapStart =
    denseEnd < END
      ? (() => {
          const d = new Date(denseEnd + "T12:00:00Z");
          d.setUTCDate(d.getUTCDate() + 1);
          return d.toISOString().slice(0, 10);
        })()
      : null;

  let gap = [];
  if (gapStart && gapStart <= END) {
    console.log(`Gap-fill FRED high-impact ${gapStart} → ${END}`);
    gap = await fredGapFill(gapStart, END);
    // Also keep any prior merged rows in archive for same gap (prints if present)
    const oldMerged = path.join(ARCHIVE, "forexfactory_merged_2024-01-01_2026-07-30.csv");
    const liveMerged = path.join(CAL_DIR, "forexfactory_merged_2024-01-01_2026-07-30.csv");
    for (const mp of [liveMerged, oldMerged]) {
      if (!fs.existsSync(mp)) continue;
      const old = parseVaultCsv(fs.readFileSync(mp, "utf8")).filter(
        (r) => r.Date >= gapStart && r.Date <= END
      );
      console.log(`  + ${old.length} rows from ${path.basename(mp)}`);
      gap = mergeRows([gap, old]);
    }
  }

  const merged = mergeRows([dense, gap]).filter((r) => r.Date >= START && r.Date <= END);
  const outName = `forexfactory_${START}_${END}.csv`;
  const outPath = path.join(CAL_DIR, outName);

  // Remove the intermediate normalize output before archive/keep
  if (path.basename(normalizedPath) !== outName && fs.existsSync(normalizedPath)) {
    fs.unlinkSync(normalizedPath);
  }

  archiveOldCsvs(outName);
  writeCanonical(merged, outPath);
  console.log(`Wrote ${merged.length} events → ${outPath}`);

  writeVaultJson(merged, outName);
  validate(merged);

  console.log("\nRebuilding vault-app indexes…");
  const idx = spawnSync("npx", ["tsx", "scripts/build-vault-indexes.ts"], {
    cwd: path.join(VAULT, "vault-app"),
    stdio: "inherit",
    shell: true,
  });
  if (idx.status !== 0) {
    console.warn("Index rebuild failed — run: cd vault-app && npm run index");
  }

  console.log("\nDone. Hard-refresh F7 NEWS / Lab so the new calendar loads.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
