#!/usr/bin/env python3
"""
Fetch 1–2 years of Forex Factory calendar into vault format.

Outputs: data/calendar/forexfactory_YYYY-MM-DD_YYYY-MM-DD.csv
Columns: Date,Time,Currency,Impact,Event,Actual,Forecast,Previous

Methods (pick one):
  A) forexfactory-go (recommended) — install from https://github.com/Nosvemos/forexfactory-go
     forexfactory-go download -s 2024-01-01 -e 2026-07-01 -f csv -o raw.csv --timezone "America/New_York"

  B) Python scraper — pip install then:
     python -m pip install git+https://github.com/ehsanrs2/forexfactory-scraper.git
     python -m src.forexfactory.main --start 2024-01-01 --end 2026-07-01 --csv raw.csv --tz America/New_York

  C) Manual — Forex Factory calendar → week view → export (limited to current week only; repeat per week)

This script normalizes any of the above into the vault canonical CSV.
"""
from __future__ import annotations

import argparse
import csv
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")

VAULT_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = VAULT_ROOT / "data" / "calendar"

CANONICAL = ["Date", "Time", "Currency", "Impact", "Event", "Actual", "Forecast", "Previous"]

IMPACT_MAP = {
    "high": "high",
    "medium": "medium",
    "low": "low",
    "holiday": "holiday",
    "red": "high",
    "orange": "medium",
    "yellow": "low",
}


def norm_date(raw: str) -> str:
    raw = raw.strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", raw):
        return raw
    for fmt in ("%m/%d/%Y", "%m-%d-%Y", "%d/%m/%Y", "%b %d, %Y"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return raw


def norm_impact(raw: str) -> str:
    s = (raw or "").strip().lower()
    if "non-economic" in s or "bank holiday" in s:
        return "holiday"
    if "high" in s:
        return "high"
    if "medium" in s:
        return "medium"
    if "low" in s:
        return "low"
    return IMPACT_MAP.get(s, s or "unknown")


def split_datetime(raw: str) -> tuple[str, str]:
    """ISO DateTime (Hugging Face) → NY calendar date + HH:MM."""
    raw = raw.strip()
    if not raw:
        return "", ""
    if "T" in raw:
        try:
            dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            ny = dt.astimezone(NY)
            return ny.strftime("%Y-%m-%d"), ny.strftime("%H:%M")
        except ValueError:
            return raw[:10], raw[11:16] if len(raw) > 16 else ""
    d = norm_date(raw)
    return d, ""


def find_col(header: list[str], names: list[str]) -> int | None:
    lower = [h.lower().strip() for h in header]
    for i, h in enumerate(lower):
        for n in names:
            if n in h:
                return i
    return None


def normalize_row(header: list[str], row: list[str]) -> dict[str, str] | None:
    if not row:
        return None
    i_date = find_col(header, ["datetime"])
    i_time = find_col(header, ["time", "timestamp"])
    if i_date is None:
        i_date = find_col(header, ["date"])
    i_cur = find_col(header, ["currency", "cur"])
    i_imp = find_col(header, ["impact", "importance"])
    i_evt = find_col(header, ["event", "title", "name"])
    i_act = find_col(header, ["actual"])
    i_fc = find_col(header, ["forecast", "consensus"])
    i_prev = find_col(header, ["previous", "prior"])
    if i_date is None or i_evt is None:
        return None
    title = row[i_evt].strip() if i_evt < len(row) else ""
    raw_dt = row[i_date] if i_date is not None and i_date < len(row) else ""
    d, t = split_datetime(raw_dt) if "T" in raw_dt else (norm_date(raw_dt), "")
    if not t and i_time is not None and i_time < len(row):
        t = (row[i_time] or "").strip()[:8]
    if not d or not title:
        return None
    return {
        "Date": d,
        "Time": t[:8],
        "Currency": (row[i_cur] if i_cur is not None and i_cur < len(row) else "USD").strip().upper(),
        "Impact": norm_impact(row[i_imp] if i_imp is not None and i_imp < len(row) else ""),
        "Event": title,
        "Actual": row[i_act].strip() if i_act is not None and i_act < len(row) else "",
        "Forecast": row[i_fc].strip() if i_fc is not None and i_fc < len(row) else "",
        "Previous": row[i_prev].strip() if i_prev is not None and i_prev < len(row) else "",
    }


def load_and_normalize(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if not header:
            return rows
        for row in reader:
            norm = normalize_row(header, row)
            if not norm:
                continue
            key = f"{norm['Date']}|{norm['Time']}|{norm['Event']}"
            if key in seen:
                continue
            seen.add(key)
            rows.append(norm)
    rows.sort(key=lambda r: (r["Date"], r["Time"], r["Event"]))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize FF calendar CSV for The Vault")
    parser.add_argument("input", type=Path, help="Raw calendar CSV from scraper or manual export")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output path (default: data/calendar/forexfactory_<span>.csv)",
    )
    parser.add_argument("--start", type=str, default=None, help="Keep events on/after YYYY-MM-DD")
    parser.add_argument("--end", type=str, default=None, help="Keep events on/before YYYY-MM-DD")
    parser.add_argument("--usd-only", action="store_true", help="Keep USD rows only (smaller F7 upload)")
    args = parser.parse_args()

    rows = load_and_normalize(args.input)
    if args.usd_only:
        rows = [r for r in rows if r["Currency"] in ("USD", "US")]
    if args.start:
        rows = [r for r in rows if r["Date"] >= args.start]
    if args.end:
        rows = [r for r in rows if r["Date"] <= args.end]
    if not rows:
        raise SystemExit("No rows parsed — check CSV headers (need Date + Event/title columns)")

    start = rows[0]["Date"]
    end = rows[-1]["Date"]
    out = args.out or OUT_DIR / f"forexfactory_{start}_{end}.csv"
    out.parent.mkdir(parents=True, exist_ok=True)

    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CANONICAL)
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {len(rows)} events ({start} → {end})")
    print(f"→ {out}")
    print("Upload this file in Vault F7 NEWS or drop into data/calendar/")


if __name__ == "__main__":
    main()
