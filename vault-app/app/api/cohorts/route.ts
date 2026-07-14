import { NextResponse } from "next/server";
import { listCohorts, saveCohort } from "@/lib/cohort-server";
import { CohortSaveInput } from "@/lib/cohort";

export async function GET() {
  try {
    const cohorts = await listCohorts();
    return NextResponse.json({ cohorts, dir: "strategies/cohorts" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CohortSaveInput;
    if (!body.variant?.trim() || !body.mc) {
      return NextResponse.json({ error: "variant and mc results required" }, { status: 400 });
    }
    const result = await saveCohort(body);
    return NextResponse.json({
      ok: true,
      filename: result.filename,
      mode: result.mode,
      markdown: result.mode === "download" ? result.markdown : undefined,
      path: result.path,
      repoPath: result.repoPath,
      commitUrl: result.commitUrl,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
