import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import {
  buildCohortMarkdown,
  cohortRelativePath,
  CohortSaveInput,
  parseCohortMeta,
  CohortRecord,
} from "@/lib/cohort";
import { commitCohortToGitHub, githubCohortConfigured } from "@/lib/github-cohort";

/** Canonical Obsidian path — always prefer strategies/cohorts when repo layout exists. */
function cohortsRoot(): string {
  const inRepo = path.join(process.cwd(), "..", "strategies", "cohorts");
  const inApp = path.join(process.cwd(), "data", "cohorts");
  if (fs.existsSync(path.join(process.cwd(), "..", "strategies"))) return inRepo;
  return fs.existsSync(inApp) ? inApp : inRepo;
}

async function walkMdFiles(dir: string, base: string): Promise<{ rel: string; abs: string }[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const out: { rel: string; abs: string }[] = [];
  for (const name of names) {
    const abs = path.join(dir, name);
    let stat: fs.Stats;
    try {
      stat = await fs.promises.stat(abs);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      out.push(...(await walkMdFiles(abs, path.join(base, name))));
    } else if (name.endsWith(".md") && !name.startsWith("_")) {
      out.push({ rel: path.join(base, name).replace(/\\/g, "/"), abs });
    }
  }
  return out;
}

export async function ensureCohortsDir(): Promise<string> {
  const dir = cohortsRoot();
  await mkdir(dir, { recursive: true });
  for (const sub of ["eval", "funded", "combined", "research"]) {
    await mkdir(path.join(dir, sub), { recursive: true });
  }
  return dir;
}

function bundledCohortIndexPath(): string {
  return path.join(process.cwd(), "data", "cohorts-index.json");
}

function loadBundledCohorts(): CohortRecord[] {
  const fp = bundledCohortIndexPath();
  if (!fs.existsSync(fp)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(fp, "utf8")) as { cohorts?: CohortRecord[] };
    return raw.cohorts ?? [];
  } catch {
    return [];
  }
}

export async function listCohorts(): Promise<CohortRecord[]> {
  const dir = await ensureCohortsDir();
  const files = await walkMdFiles(dir, "");
  const records: CohortRecord[] = [];
  for (const { rel, abs } of files) {
    const content = await readFile(abs, "utf-8");
    const meta = parseCohortMeta(content, path.basename(rel), rel);
    if (meta) records.push(meta);
  }
  // Legacy flat files at cohorts root
  try {
    const rootEntries = await readdir(dir);
    for (const f of rootEntries.filter((x) => x.endsWith(".md") && !x.startsWith("_"))) {
      const abs = path.join(dir, f);
      if ((await fs.promises.stat(abs)).isFile()) {
        const content = await readFile(abs, "utf-8");
        const meta = parseCohortMeta(content, f, f);
        if (meta && !records.some((r) => r.filename === f)) records.push(meta);
      }
    }
  } catch {
    /* ignore */
  }
  if (records.length > 0) {
    return records.sort((a, b) => b.created.localeCompare(a.created));
  }
  return loadBundledCohorts().sort((a, b) => b.created.localeCompare(a.created));
}

export type CohortSaveResult = {
  filename: string;
  relativePath: string;
  markdown: string;
  mode: "written" | "github" | "download";
  path?: string;
  repoPath?: string;
  commitUrl?: string;
  githubError?: string;
};

function isReadOnlyFsError(e: unknown): boolean {
  const code = (e as NodeJS.ErrnoException)?.code;
  return code === "EROFS" || code === "EACCES";
}

async function saveCohortToGitHub(relativePath: string, markdown: string): Promise<CohortSaveResult> {
  const gh = await commitCohortToGitHub(relativePath, markdown);
  return {
    filename: path.basename(relativePath),
    relativePath,
    markdown,
    mode: "github",
    repoPath: gh.repoPath,
    commitUrl: gh.commitUrl,
  };
}

export async function saveCohort(input: CohortSaveInput): Promise<CohortSaveResult> {
  const relativePath = cohortRelativePath(input);
  const markdown = buildCohortMarkdown(input);
  const filename = path.basename(relativePath);

  if (process.env.VERCEL === "1") {
    if (githubCohortConfigured()) {
      try {
        return await saveCohortToGitHub(relativePath, markdown);
      } catch (e) {
        const githubError = e instanceof Error ? e.message : String(e);
        console.error("GitHub cohort commit failed:", githubError);
        return { filename, relativePath, markdown, mode: "download", githubError };
      }
    }
    return { filename, relativePath, markdown, mode: "download" };
  }

  try {
    const dir = await ensureCohortsDir();
    const filepath = path.join(dir, relativePath);
    await mkdir(path.dirname(filepath), { recursive: true });
    await writeFile(filepath, markdown, "utf-8");
    return { filename, relativePath, markdown, path: filepath, mode: "written" };
  } catch (e) {
    if (isReadOnlyFsError(e) && githubCohortConfigured()) {
      try {
        return await saveCohortToGitHub(relativePath, markdown);
      } catch (ghErr) {
        const githubError = ghErr instanceof Error ? ghErr.message : String(ghErr);
        console.error("GitHub cohort commit failed:", githubError);
        return { filename, relativePath, markdown, mode: "download", githubError };
      }
    }
    if (isReadOnlyFsError(e)) {
      return { filename, relativePath, markdown, mode: "download", githubError: "read-only filesystem" };
    }
    throw e;
  }
}
