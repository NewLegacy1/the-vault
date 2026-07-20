import { YoutubeTranscript } from "youtube-transcript";
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const videos: Array<{ id: string; slug: string; title: string }> = [
  {
    id: "3L8xdh3oPm4",
    slug: "exact-strategy-1-2m-12-months",
    title: "The EXACT Trading Strategy That Made Me $1,200,000 in the Last 12 Months",
  },
  {
    id: "UVKVSWKFlvo",
    slug: "strategy-explained-10-min",
    title: "My $1,300,000 Trading Strategy (Explained in 10 Minutes)",
  },
  {
    id: "7UXiI2arAlQ",
    slug: "one-candle-100k-per-month",
    title: "This ONE Candle Makes me $100,000+ PER MONTH",
  },
  {
    id: "8lbkj0PF1uM",
    slug: "news-trading-strategy",
    title: "I Made $1,300,000 in 12 Months — Copy My News Trading Strategy",
  },
  {
    id: "GMDUiamqgig",
    slug: "6pm-8pm-asia-session",
    title: "How I Trade the 6PM & 8PM Session (Fair Price Theory on Funded Accounts)",
  },
  {
    id: "MVP7X-3v8xk",
    slug: "watch-me-backtest-strategy",
    title: "Watch Me Backtest My $1,500,000 Trading Strategy",
  },
];

const outDir = join(__dirname, "..", "data", "jj-simon-transcripts");
mkdirSync(outDir, { recursive: true });

/** Strip YouTube VTT (auto-subs) down to timestamped plain text. */
function vttToPlain(vtt: string): string {
  const lines = vtt.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let lastText = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^(\d{2}):(\d{2}):(\d{2})\.\d+\s+-->/);
    if (!m) continue;
    const min = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const sec = parseInt(m[3], 10);
    const stamp = `[${min}:${String(sec).padStart(2, "0")}]`;
    const chunks: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (!t || /^\d{2}:\d{2}:\d{2}/.test(t) || t === "WEBVTT" || t.startsWith("Kind:") || t.startsWith("Language:")) break;
      chunks.push(t.replace(/<[^>]+>/g, ""));
    }
    const text = chunks.join(" ").replace(/\s+/g, " ").trim();
    if (!text || text === lastText) continue;
    // Drop overlapping auto-sub repeats (common in YouTube VTT)
    if (lastText && text.startsWith(lastText.slice(-40))) {
      const novel = text.slice(lastText.length).trim();
      if (novel) {
        out.push(`${stamp} ${novel}`);
        lastText = text;
      }
      continue;
    }
    out.push(`${stamp} ${text}`);
    lastText = text;
  }
  return out.join("\n");
}

function convertExistingVtts() {
  for (const name of readdirSync(outDir)) {
    if (!name.endsWith(".vtt") && !name.endsWith(".en.vtt")) continue;
    const slug = name.replace(/\.en\.vtt$/, "").replace(/\.vtt$/, "");
    const txtPath = join(outDir, `${slug}.txt`);
    if (existsSync(txtPath)) continue;
    const meta = videos.find((v) => v.slug === slug);
    const body = vttToPlain(readFileSync(join(outDir, name), "utf8"));
    const header = meta
      ? `# ${meta.title}\n# https://www.youtube.com/watch?v=${meta.id}\n# source: yt-dlp auto-sub\n\n`
      : `# ${slug}\n# source: yt-dlp auto-sub\n\n`;
    writeFileSync(txtPath, header + body + "\n");
    console.log(`VTT→TXT ${slug} (${body.split("\n").length} lines)`);
  }
}

async function main() {
  convertExistingVtts();
  for (const v of videos) {
    const file = join(outDir, `${v.slug}.txt`);
    if (existsSync(file)) {
      console.log(`SKIP ${v.slug} (exists)`);
      continue;
    }
    try {
      const parts = await YoutubeTranscript.fetchTranscript(v.id);
      const text = parts
        .map((p) => {
          const sec = p.offset / 1000;
          return `[${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}] ${p.text}`;
        })
        .join("\n");
      writeFileSync(
        file,
        `# ${v.title}\n# https://www.youtube.com/watch?v=${v.id}\n# source: youtube-transcript\n\n${text}\n`,
      );
      console.log(`OK ${v.slug} (${parts.length} segments)`);
    } catch (err) {
      console.log(`FAIL ${v.slug}: ${(err as Error).message.slice(0, 250)}`);
    }
  }
}

main();
