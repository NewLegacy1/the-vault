const GITHUB_API = "https://api.github.com";

export interface GitHubCohortCommit {
  repoPath: string;
  commitUrl: string;
  branch: string;
}

function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN?.trim() ?? "",
    owner: process.env.GITHUB_REPO_OWNER?.trim() || "NewLegacy1",
    repo: process.env.GITHUB_REPO_REPO?.trim() || process.env.GITHUB_REPO_NAME?.trim() || "the-vault",
    branch: process.env.GITHUB_REPO_BRANCH?.trim() || "master",
  };
}

export function githubCohortConfigured(): boolean {
  return Boolean(githubConfig().token);
}

export async function commitCohortToGitHub(
  filename: string,
  markdown: string
): Promise<GitHubCohortCommit> {
  const { token, owner, repo, branch } = githubConfig();
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const repoPath = `strategies/cohorts/${filename}`;
  const label = filename.replace(/\.md$/, "");
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${repoPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "the-vault-lab",
    },
    body: JSON.stringify({
      message: `F4 LAB cohort: ${label}`,
      content: Buffer.from(markdown, "utf-8").toString("base64"),
      branch,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    commit?: { html_url?: string };
  };

  if (!res.ok) {
    throw new Error(data.message || `GitHub API error (${res.status})`);
  }

  return {
    repoPath,
    commitUrl: data.commit?.html_url ?? `https://github.com/${owner}/${repo}/tree/${branch}/${repoPath}`,
    branch,
  };
}
