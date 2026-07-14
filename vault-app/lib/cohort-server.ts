import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { buildCohortMarkdown, cohortFilename, CohortSaveInput, parseCohortMeta, CohortRecord } from "@/lib/cohort";

function cohortsDir(): string {
  // vault-app/ → The Vault/strategies/cohorts (Obsidian-readable)
  return path.join(process.cwd(), "..", "strategies", "cohorts");
}

export async function ensureCohortsDir(): Promise<string> {
  const dir = cohortsDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function listCohorts(): Promise<CohortRecord[]> {
  const dir = await ensureCohortsDir();
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const records: CohortRecord[] = [];
  for (const f of files.filter((x) => x.endsWith(".md") && !x.startsWith("_"))) {
    const content = await readFile(path.join(dir, f), "utf-8");
    const meta = parseCohortMeta(content, f);
    if (meta) records.push(meta);
  }
  return records.sort((a, b) => b.created.localeCompare(a.created));
}

export async function saveCohort(input: CohortSaveInput): Promise<{ filename: string; path: string }> {
  const dir = await ensureCohortsDir();
  const filename = cohortFilename(input);
  const filepath = path.join(dir, filename);
  const md = buildCohortMarkdown(input);
  await writeFile(filepath, md, "utf-8");
  return { filename, path: filepath };
}
