import { YoutubeTranscript } from "youtube-transcript";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const videos: Array<{ id: string; slug: string; title: string }> = [
  { id: "M3-0LfZMsz4", slug: "quant-process-01-how-trading-is-done", title: "How Trading Is Actually Done (The Quant Process 01)" },
  { id: "TEVRiSNxs50", slug: "quant-process-02-data-into-meaning", title: "Turning Data Into Meaning (The Quant Process 02)" },
  { id: "Zu4sL5u-WyU", slug: "quant-process-03-stop-sampling-every-candle", title: "STOP Sampling EVERY CANDLE (The Quant Process 03)" },
  { id: "jGhk-uSrtII", slug: "monte-carlo-simulation-howto", title: "How To: Monte Carlo Simulation" },
  { id: "MCnFrUxZARU", slug: "will-your-strategy-make-money", title: "Will Your Trading Strategy MAKE MONEY?" },
  { id: "BiTqwX-4rNw", slug: "stop-trading-like-an-idiot-1", title: "stop trading like an idiot." },
  { id: "TSmF8IU-rrM", slug: "stop-trading-like-an-idiot-2", title: "stop trading like an idiot pt. 2" },
  { id: "fIEwVmJJ06s", slug: "build-your-own-strategy", title: "Build Your Own Trading Strategy — Ivy League Quant" },
  { id: "vQ9n4SaFxHE", slug: "markov-chains-steady-states", title: "Quant Trading: Markov Chains & Steady States" },
  { id: "QhGoLgWyUrw", slug: "coded-daytrading-guru-strategy", title: "I Coded This Daytrading Guru's Strategy — Here's the Truth" },
  { id: "IHZLyff3FgE", slug: "orderflow-imbalance-tradable", title: "Is Orderflow Imbalance Tradable?" },
  { id: "AR1CQUCMgnE", slug: "one-idea-behind-options-pricing", title: "The One Idea Behind All Options Pricing" },
];

const outDir = join(__dirname, "..", "data", "deltatrend-transcripts");
mkdirSync(outDir, { recursive: true });

async function main() {
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
      writeFileSync(file, `# ${v.title}\n# https://www.youtube.com/watch?v=${v.id}\n\n${text}\n`);
      console.log(`OK ${v.slug} (${parts.length} segments)`);
    } catch (err) {
      console.log(`FAIL ${v.slug}: ${(err as Error).message.slice(0, 200)}`);
    }
  }
}

main();
