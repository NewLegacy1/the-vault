import { NextRequest, NextResponse } from "next/server";
import {
  loadServerCalendar,
  writeStoredCalendar,
  slimEventsForUpload,
} from "@/lib/calendar-server";
import { parseCalendarCsv } from "@/lib/economic-calendar";

export async function GET() {
  try {
    const stored = loadServerCalendar();
    if (!stored) {
      return NextResponse.json({ events: [], meta: null });
    }
    return NextResponse.json({
      events: stored.events,
      meta: {
        source: stored.source,
        uploadedAt: stored.uploadedAt,
        eventCount: stored.eventCount,
        span: stored.span,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.csv as string | undefined;
    const source = (body.source as string) || "upload";
    const usdOnly = body.usdOnly !== false;

    if (!text?.trim()) {
      return NextResponse.json({ error: "Missing csv text" }, { status: 400 });
    }

    const parsed = parseCalendarCsv(text);
    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "No events parsed — need Date or DateTime + Event columns" },
        { status: 400 }
      );
    }

    const events = slimEventsForUpload(parsed, { usdOnly });
    const stored = writeStoredCalendar(source, events);

    return NextResponse.json({
      events: stored.events,
      meta: {
        source: stored.source,
        uploadedAt: stored.uploadedAt,
        eventCount: stored.eventCount,
        span: stored.span,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const active = path.join(process.cwd(), "..", "data", "calendar", "vault_calendar.json");
    if (fs.existsSync(active)) fs.unlinkSync(active);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
