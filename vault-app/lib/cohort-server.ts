import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { buildCohortMarkdown, cohortFilename, CohortSaveInput, parseCohortMeta, CohortRecord } from "@/lib/cohort";

function cohortsDir(): string {
  const inApp = path.join(process.cwd(), "data", "cohorts");
  const inRepo = path.join(process.cwd(), "..", "strategies", "cohorts");
  if (fs.existsSync(inApp)) return inApp;
  return inRepo;
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

export type CohortSaveResult = {
  filename: string;
  markdown: string;
  mode: "written" | "download";
  path?: string;
};

function isReadOnlyFsError(e: unknown): boolean {
  const code = (e as NodeJS.ErrnoException)?.code;
  return code === "EROFS" || code === "EACCES";
}

export async function saveCohort(input: CohortSaveInput): Promise<CohortSaveResult> {
  const filename = cohortFilename(input);
  const markdown = buildCohortMarkdown(input);

  // Vercel/Lambda filesystem is read-only — return markdown for client download.
  if (process.env.VERCEL === "1") {
    return { filename, markdown, mode: "download" };
  }

  try {
    const dir = await ensureCohortsDir();
    const filepath = path.join(dir, filename);
    await writeFile(filepath, markdown, "utf-8");
    return { filename, markdown, path: filepath, mode: "written" };
  } catch (e) {
    if (isReadOnlyFsError(e)) {
      return { filename, markdown, mode: "download" };
    }
    throw e;
  }
}
