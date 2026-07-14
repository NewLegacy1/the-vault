import path from "path";
import { parseCohortMeta, type CohortRecord } from "@/lib/cohort";
import { githubConfig, githubCohortConfigured } from "@/lib/github-cohort";

const GITHUB_API = "https://api.github.com";

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "the-vault-lab",
  };
}

function isCohortMarkdown(repoPath: string): boolean {
  if (!repoPath.startsWith("strategies/cohorts/") || !repoPath.endsWith(".md")) return false;
  const parts = repoPath.split("/");
  return !parts.some((seg) => seg.startsWith("_"));
}

/** Live cohort list from GitHub — updates without redeploy when Lab auto-saves. */
export async function listCohortsFromGitHub(): Promise<CohortRecord[]> {
  if (!githubCohortConfigured()) return [];

  const { token, owner, repo, branch } = githubConfig();
  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: githubHeaders(token), cache: "no-store" }
  );
  if (!treeRes.ok) {
    const err = (await treeRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || `GitHub tree error (${treeRes.status})`);
  }

  const treeData = (await treeRes.json()) as { tree?: { path: string; type: string }[] };
  const mdPaths = (treeData.tree ?? [])
    .filter((t) => t.type === "blob" && isCohortMarkdown(t.path))
    .map((t) => t.path);

  const records: CohortRecord[] = [];
  const batchSize = 6;
  for (let i = 0; i < mdPaths.length; i += batchSize) {
    const batch = mdPaths.slice(i, i + batchSize);
    const fetched = await Promise.all(
      batch.map(async (repoPath) => {
        const res = await fetch(
          `${GITHUB_API}/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`,
          { headers: githubHeaders(token), cache: "no-store" }
        );
        if (!res.ok) return null;
        const data = (await res.json()) as { content?: string; encoding?: string };
        if (data.encoding !== "base64" || !data.content) return null;
        const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
        const rel = repoPath.replace(/^strategies\/cohorts\//, "");
        return parseCohortMeta(content, path.basename(rel), rel);
      })
    );
    for (const meta of fetched) {
      if (meta) records.push(meta);
    }
  }

  return records.sort((a, b) => b.created.localeCompare(a.created));
}
