import { YoutubeTranscript } from "youtube-transcript";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const videos: Array<{ id: string; slug: string; title: string }> = [
  { id: "CZguhuUIx98", slug: "blowing-all-accounts", title: "Blowing all of my accounts." },
  { id: "IIcCoub6XRI", slug: "different-version-of-you", title: "There is a Different Version of You." },
  { id: "FGx_Cn5soq4", slug: "break-the-cycle", title: "Break The Cycle" },
  { id: "KYHeD1famlY", slug: "quit-my-job", title: "I Quit My Job 2 Years Ago (It Paid Off)" },
  { id: "9jEvZAPXPVs", slug: "40000-traders-struggle", title: "I asked 40,000 traders their BIGGEST struggle" },
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
