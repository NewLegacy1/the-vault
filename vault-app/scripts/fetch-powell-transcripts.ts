import { YoutubeTranscript } from "youtube-transcript";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const videos: Array<{ id: string; slug: string; title: string }> = [
  { id: "AGmRZ9Te9NY", slug: "rb-entry-structure", title: "How to structure a Rejection block entry (Trade breakdown)" },
  { id: "a3LzCUZU5ko", slug: "pd-array-6-figures", title: "The PD-array that makes me 6 figures per month" },
  { id: "ikIcAFTkVPQ", slug: "5-mistakes-unprofitable", title: "5 trading mistakes that kept me unprofitable" },
  { id: "tNyT7tHOmGI", slug: "60k-february-setup", title: "The setup that made me 60k in February" },
  { id: "4COROwkO3DI", slug: "live-trade-1-7rr", title: "Powell strategy live trade execution (1:7RR)" },
  { id: "Y-oqSZmNo4U", slug: "tick-precision-entries", title: "How to find tick precision entries everyday" },
  { id: "3KgvdWAmyaE", slug: "high-probability-conditions", title: "How to identify high probability trading conditions" },
  { id: "WEeXKMzaJjY", slug: "stop-getting-manipulated", title: "Stop getting manipulated" },
  { id: "PFi9qYFkjCg", slug: "top-5-mistakes", title: "Top 5 Mistakes Traders Make" },
];

const outDir = join(__dirname, "..", "data", "powell-transcripts");
mkdirSync(outDir, { recursive: true });

async function main() {
  for (const v of videos) {
    try {
      const parts = await YoutubeTranscript.fetchTranscript(v.id);
      const text = parts
        .map((p) => {
          const sec = p.offset / 1000;
          return `[${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}] ${p.text}`;
        })
        .join("\n");
      writeFileSync(join(outDir, `${v.slug}.txt`), `# ${v.title}\n# https://www.youtube.com/watch?v=${v.id}\n\n${text}\n`);
      console.log(`OK ${v.slug} (${parts.length} segments)`);
    } catch (err) {
      console.log(`FAIL ${v.slug}: ${(err as Error).message.slice(0, 200)}`);
    }
  }
}

main();
