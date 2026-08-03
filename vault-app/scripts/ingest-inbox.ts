/**
 * Hands-free ingest inbox (Phase 2 of pipeline build-out).
 *
 * Drop any TradingView "List of trades" export (or vault enriched ledger CSV)
 * into vault-app/data/inbox/ and run:
 *
 *   npm run ingest            — one pass over the inbox
 *   npm run ingest:watch      — keep watching while you trade / export
 *
 * Per file: fingerprint (sha256) → skip known → classify by parse → route to
 * data/tv-exports/matrix/ → data audit → Stage-0 event study (writes JSON +
 * analysis note) → append row to data/tv-exports/ingest-ledger.json → move the
 * original to inbox/processed/. Unrecognized files go to inbox/unrecognized/
 * — nothing is ever deleted.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { parseLabLedger } from "../lib/csv";
import { auditLabIngest } from "../lib/ingest-audit";
import { normalizeTradeDate } from "../lib/normalize-date";

const APP_ROOT = path.resolve(__dirname, "..");
const INBOX = path.join(APP_ROOT, "data", "inbox");
const PROCESSED = path.join(INBOX, "processed");
const UNRECOGNIZED = path.join(INBOX, "unrecognized");
const MATRIX = path.join(APP_ROOT, "data", "tv-exports", "matrix");
const TV_EXPORTS = path.join(APP_ROOT, "data", "tv-exports");
const LEDGER_FILE = path.join(TV_EXPORTS, "ingest-ledger.json");

type IngestKind = "tv_trades_csv" | "enriched_ledger_csv" | "json" | "unknown";

interface IngestRecord {
  hash: string;
  originalName: string;
  storedAs: string | null;
  kind: IngestKind;
  n: number;
  span: string;
  auditSeverity: "ok" | "warn" | "block" | null;
  auditFindings: string[];
  stage0Verdict: string | null;
  stage0EvFull: number | null;
  stage0CiFull: [number, number] | null;
  stage0OosN: number | null;
  ingestedAt: string;
}

function readLedger(): IngestRecord[] {
  try {
    if (!fs.existsSync(LEDGER_FILE)) return [];
    const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, "utf8"));
    return Array.isArray(parsed) ? (parsed as IngestRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLedger(rows: IngestRecord[]): void {
  fs.mkdirSync(TV_EXPORTS, { recursive: true });
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(rows, null, 2));
}

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

/** Destination path in matrix/ — never overwrite a different file. */
function matrixDest(name: string, hash: string): string {
  const base = sanitizeName(name);
  let dest = path.join(MATRIX, base);
  if (fs.existsSync(dest) && sha256(fs.readFileSync(dest)) !== hash) {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "");
    const ext = path.extname(base);
    dest = path.join(MATRIX, `${path.basename(base, ext)}-${stamp}${ext}`);
  }
  return dest;
}

function moveTo(dir: string, file: string): void {
  fs.mkdirSync(dir, { recursive: true });
  let dest = path.join(dir, path.basename(file));
  if (fs.existsSync(dest)) {
    const stamp = Date.now();
    const ext = path.extname(dest);
    dest = path.join(dir, `${path.basename(dest, ext)}-${stamp}${ext}`);
  }
  fs.renameSync(file, dest);
}

function classify(name: string, text: string): { kind: IngestKind; trades: ReturnType<typeof parseLabLedger> } {
  if (name.toLowerCase().endsWith(".json")) return { kind: "json", trades: [] };
  const trades = parseLabLedger(text);
  if (trades.length === 0) return { kind: "unknown", trades };
  const kind: IngestKind = text.startsWith("date,pnl_usd")
    ? "enriched_ledger_csv"
    : "tv_trades_csv";
  return { kind, trades };
}

interface Stage0Summary {
  verdict: string | null;
  evFull: number | null;
  ciFull: [number, number] | null;
  oosN: number | null;
}

/** Run the existing Stage-0 analyzer (single implementation) and read its JSON. */
function runStage0(storedName: string): Stage0Summary {
  try {
    execSync(`npx tsx scripts/analyze-event-study.ts "${storedName}"`, {
      cwd: APP_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120_000,
    });
  } catch (e) {
    console.error(`  stage-0 failed for ${storedName}: ${String(e)}`);
    return { verdict: null, evFull: null, ciFull: null, oosN: null };
  }
  const stem = path.basename(storedName, path.extname(storedName));
  const jsonPath = path.join(TV_EXPORTS, `event-study-${stem}.json`);
  try {
    const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const full = report?.windows?.full;
    const oos = report?.windows?.oos;
    return {
      verdict: report?.scorecard?.verdict ?? null,
      evFull: full?.evCi?.mean ?? null,
      ciFull:
        full?.evCi != null ? [full.evCi.ciLow, full.evCi.ciHigh] : null,
      oosN: oos?.geometry?.n ?? null,
    };
  } catch {
    return { verdict: null, evFull: null, ciFull: null, oosN: null };
  }
}

function processFile(file: string, ledger: IngestRecord[]): IngestRecord | null {
  const name = path.basename(file);
  const buf = fs.readFileSync(file);
  const hash = sha256(buf);

  const known = ledger.find((r) => r.hash === hash);
  if (known) {
    console.log(`= ${name} — already ingested as ${known.storedAs ?? "(unrouted)"} · skipping`);
    moveTo(PROCESSED, file);
    return null;
  }

  const text = buf.toString("utf8");
  const { kind, trades } = classify(name, text);

  if (kind === "unknown") {
    console.log(`? ${name} — not a recognizable trade ledger · moved to inbox/unrecognized/`);
    moveTo(UNRECOGNIZED, file);
    return {
      hash,
      originalName: name,
      storedAs: null,
      kind,
      n: 0,
      span: "—",
      auditSeverity: null,
      auditFindings: ["unrecognized format"],
      stage0Verdict: null,
      stage0EvFull: null,
      stage0CiFull: null,
      stage0OosN: null,
      ingestedAt: new Date().toISOString(),
    };
  }

  if (kind === "json") {
    const dest = path.join(TV_EXPORTS, sanitizeName(name));
    fs.mkdirSync(TV_EXPORTS, { recursive: true });
    fs.copyFileSync(file, dest);
    moveTo(PROCESSED, file);
    console.log(`+ ${name} — routed to tv-exports/`);
    return {
      hash,
      originalName: name,
      storedAs: path.relative(APP_ROOT, dest).replace(/\\/g, "/"),
      kind,
      n: 0,
      span: "—",
      auditSeverity: null,
      auditFindings: [],
      stage0Verdict: null,
      stage0EvFull: null,
      stage0CiFull: null,
      stage0OosN: null,
      ingestedAt: new Date().toISOString(),
    };
  }

  const dated = trades.map((t) => ({ ...t, date: normalizeTradeDate(t.date) }));
  const audit = auditLabIngest({
    trades: dated.map((t) => t.pnl),
    dates: dated.map((t) => t.date),
    parsed: dated,
  });

  const dest = matrixDest(name, hash);
  fs.mkdirSync(MATRIX, { recursive: true });
  fs.copyFileSync(file, dest);
  const storedName = path.basename(dest);

  console.log(`+ ${name} → matrix/${storedName} · n=${audit.n} · ${audit.span} · audit=${audit.severity}`);

  let stage0: Stage0Summary = { verdict: null, evFull: null, ciFull: null, oosN: null };
  if (audit.canRunMc) {
    stage0 = runStage0(storedName);
    if (stage0.verdict) {
      console.log(
        `  stage-0: ${stage0.verdict.toUpperCase()} · EV $${stage0.evFull} · CI [${stage0.ciFull?.[0]}, ${stage0.ciFull?.[1]}] · OOS n=${stage0.oosN}`
      );
    }
  } else {
    console.log("  audit BLOCK — stage-0 skipped; fix the export and re-drop");
  }

  moveTo(PROCESSED, file);
  return {
    hash,
    originalName: name,
    storedAs: `data/tv-exports/matrix/${storedName}`,
    kind,
    n: audit.n,
    span: audit.span,
    auditSeverity: audit.severity,
    auditFindings: audit.findings.map((f) => f.message),
    stage0Verdict: stage0.verdict,
    stage0EvFull: stage0.evFull,
    stage0CiFull: stage0.ciFull,
    stage0OosN: stage0.oosN,
    ingestedAt: new Date().toISOString(),
  };
}

function processInbox(): number {
  fs.mkdirSync(INBOX, { recursive: true });
  const entries = fs
    .readdirSync(INBOX, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith(".") && e.name.toLowerCase() !== "readme.md")
    .map((e) => path.join(INBOX, e.name));

  if (entries.length === 0) return 0;

  const ledger = readLedger();
  let added = 0;
  for (const file of entries) {
    try {
      const rec = processFile(file, ledger);
      if (rec) {
        ledger.push(rec);
        added++;
      }
    } catch (e) {
      console.error(`! ${path.basename(file)} — ingest error: ${String(e)} (left in inbox)`);
    }
  }
  if (added > 0) writeLedger(ledger);
  return added;
}

function main() {
  const watch = process.argv.includes("--watch");
  const n = processInbox();
  console.log(n > 0 ? `Ingested ${n} file(s).` : "Inbox empty — nothing to ingest.");

  if (!watch) return;

  console.log(`Watching ${INBOX} — drop TV exports and they auto-ingest (Ctrl+C to stop).`);
  let timer: ReturnType<typeof setTimeout> | null = null;
  fs.watch(INBOX, () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const added = processInbox();
      if (added > 0) console.log(`Ingested ${added} file(s).`);
    }, 2000);
  });
}

main();
