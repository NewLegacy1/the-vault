/**
 * Smoke-test knowledge hub wikilinks / archive stubs (CYCLE 4 item 79).
 * Usage: npx tsx scripts/smoke-knowledge-hubs.ts
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "../../strategies/knowledge");
const HUB_DIR = path.join(ROOT, "hubs");

function extractWikiTargets(md: string): string[] {
  const out: string[] = [];
  const re = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    out.push(m[1]!.trim().replace(/\\/g, "/"));
  }
  return out;
}

function resolveTarget(fromFile: string, target: string): string | null {
  const candidates = [
    path.join(ROOT, `${target}.md`),
    path.join(ROOT, target, ".md"),
    path.join(path.dirname(fromFile), `${target}.md`),
    path.join(ROOT, "hubs", `${path.basename(target)}.md`),
  ];
  // Obsidian-style: quant/foo → knowledge/quant/foo.md
  if (!target.includes("/")) {
    candidates.push(path.join(ROOT, "quant", `${target}.md`));
    candidates.push(path.join(ROOT, "ict", `${target}.md`));
    candidates.push(path.join(ROOT, "powell", `${target}.md`));
    candidates.push(path.join(ROOT, "archive", `${target}.md`));
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // basename search under knowledge
  const base = path.basename(target) + ".md";
  const stack = [ROOT];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      if (fs.statSync(abs).isDirectory()) stack.push(abs);
      else if (name === base) return abs;
    }
  }
  return null;
}

function main() {
  const hubFiles = fs
    .readdirSync(HUB_DIR)
    .filter((n) => n.endsWith(".md"))
    .map((n) => path.join(HUB_DIR, n));
  hubFiles.push(path.join(ROOT, "_index.md"));
  hubFiles.push(path.join(ROOT, "ORGANIZATION.md"));

  let broken = 0;
  let ok = 0;
  for (const file of hubFiles) {
    if (!fs.existsSync(file)) {
      console.log(`MISSING hub file: ${file}`);
      broken++;
      continue;
    }
    const md = fs.readFileSync(file, "utf8");
    for (const t of extractWikiTargets(md)) {
      if (t.startsWith("http")) continue;
      // strategy-dev paths are outside knowledge — skip soft
      if (t.includes("strategy-dev") || t.startsWith("`")) continue;
      // prose examples, not real targets
      if (t === "wikilinks" || t.toLowerCase() === "link") continue;
      const hit = resolveTarget(file, t);
      if (!hit) {
        console.log(`BROKEN [[${t}]] in ${path.relative(ROOT, file)}`);
        broken++;
      } else {
        ok++;
      }
    }
  }
  console.log(`Hub smoke: ${ok} ok, ${broken} broken`);
  if (broken > 0) process.exitCode = 1;
}

main();
