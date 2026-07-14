import csv
from pathlib import Path


def load_trades(path: Path):
    rows = []
    pending = {}
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            n = int(row["Trade number"])
            if row["Type"].startswith("Entry"):
                pending[n] = {
                    "num": n,
                    "date": row["Date and time"].split()[0],
                    "dir": "L" if "long" in row["Type"].lower() else "S",
                    "entry": row["Date and time"],
                    "entry_price": float(row["Price USD"]),
                    "qty": int(row["Size (qty)"]),
                }
            elif row["Type"].startswith("Exit") and n in pending:
                t = pending.pop(n)
                t["pnl"] = float(row["Net PnL USD"])
                t["mfe"] = float(row["Favorable excursion USD"])
                t["mae"] = float(row["Adverse excursion USD"])
                t["bars"] = int(row["Duration (bars)"])
                t["exit"] = row["Date and time"]
                t["exit_price"] = float(row["Price USD"])
                rows.append(t)
    return rows


def summarize(name, trades):
    total = sum(t["pnl"] for t in trades)
    wins = sum(1 for t in trades if t["pnl"] > 50)
    losses = sum(1 for t in trades if t["pnl"] < -50)
    scr = len(trades) - wins - losses
    mfe_scratches = [t for t in trades if -50 <= t["pnl"] <= 50 and t["mfe"] > 300]
    print(f"{name}: n={len(trades)} total=${total:,.0f} W/L/Scr={wins}/{losses}/{scr}")
    if mfe_scratches:
        print(f"  high-MFE scratches (MFE>$300, PnL~0): {len(mfe_scratches)}")
    return total


def key(t):
    return t["date"] + t["dir"]


downloads = Path(r"C:\Users\Admin\Downloads")
files = {
    "17_BE_FebMar": downloads / "PRB_v1_CME_MINI_MNQ1!_2026-07-13 (17).csv",
    "18_Trail_FebMar": downloads / "PRB_v1_CME_MINI_MNQ1!_2026-07-13 (18).csv",
    "19_DecJan": downloads / "PRB_v1_CME_MINI_MNQ1!_2026-07-13 (19).csv",
    "06_control_full": downloads / "PRB_v1_CME_MINI_MNQ1!_2026-07-13 (6).csv",
    "16_DecJan": downloads / "PRB_v1_CME_MINI_MNQ1!_2026-07-13 (16).csv",
}

data = {k: load_trades(p) for k, p in files.items()}

print("=== SUMMARIES ===")
for k in files:
    summarize(k, data[k])

print("\n=== Feb-Mar: BE (17) vs Trail (18) ===")
be = {key(t): t for t in data["17_BE_FebMar"]}
tr = {key(t): t for t in data["18_Trail_FebMar"]}
trail_wins = 0
trail_losses = 0
for k in sorted(be):
    b, t = be[k], tr[k]
    dp = t["pnl"] - b["pnl"]
    if dp > 50:
        trail_wins += 1
    elif dp < -50:
        trail_losses += 1
    est_r_be = b["mfe"] / 400 if b["mfe"] else 0
    print(
        f"{k}: BE ${b['pnl']:+,.0f} (MFE ${b['mfe']:,.0f} ~{est_r_be:.1f}R, {b['bars']}b) "
        f"| Trail ${t['pnl']:+,.0f} ({t['bars']}b) | delta ${dp:+,.0f}"
    )
print(f"Trail better on {trail_wins} trades, worse on {trail_losses}")

# R-multiple estimate from MFE/risk
print("\n=== Give-back profile (BE only Feb-Mar) ===")
for t in data["17_BE_FebMar"]:
    r_mfe = t["mfe"] / 400
    r_pnl = t["pnl"] / 400
    if t["mfe"] > 500 and abs(t["pnl"]) < 50:
        print(f"  {t['date']} {t['dir']}: peaked ~{r_mfe:.1f}R, closed ~{r_pnl:.1f}R (give-back)")

print("\n=== Dec-Jan: file 19 vs 06 control (first 13) ===")
d19 = data["19_DecJan"]
d06 = data["06_control_full"][:13]
diffs = []
for a, b in zip(d19, d06):
    dp = a["pnl"] - b["pnl"]
    diffs.append(dp)
    same = "MATCH" if abs(dp) < 1 else f"delta ${dp:+,.0f}"
    print(f"{a['date']} {a['dir']}: 19=${a['pnl']:+,.0f} 06=${b['pnl']:+,.0f} {same}")
print(f"19 vs 06 Dec-Jan: identical={sum(1 for d in diffs if abs(d)<1)}/{len(diffs)}")

# Feb-Mar from control vs 17
print("\n=== Feb-Mar: file 17 vs 06 control trades 14-22 ===")
febmar06 = [t for t in data["06_control_full"] if t["date"] >= "2026-02-10" and t["date"] <= "2026-03-27"]
febmar17 = data["17_BE_FebMar"]
for a, b in zip(febmar17, febmar06):
    dp = a["pnl"] - b["pnl"]
    mfe_note = ""
    if abs(a["mfe"] - b["mfe"]) > 10:
        mfe_note = f" MFE diff ${a['mfe']-b['mfe']:+,.0f}"
    print(f"{a['date']} {a['dir']}: 17=${a['pnl']:+,.0f} 06=${b['pnl']:+,.0f}{mfe_note}")

# Mar-only trail opportunity in full control
print("\n=== Mar 2026 BE scratches in control (06) with MFE > $500 ===")
for t in data["06_control_full"]:
    if t["date"].startswith("2026-03") and -50 <= t["pnl"] <= 50 and t["mfe"] > 500:
        print(f"  {t['date']} {t['dir']}: PnL ${t['pnl']:+,.0f}, MFE ${t['mfe']:,.0f} (~{t['mfe']/400:.1f}R)")
