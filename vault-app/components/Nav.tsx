"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", fkey: "F1", label: "TODAY" },
  { href: "/accounts", fkey: "F2", label: "ACCOUNTS" },
  { href: "/strategies", fkey: "F3", label: "STRATEGY" },
  { href: "/lab", fkey: "F4", label: "LAB" },
  { href: "/journal", fkey: "F5", label: "JOURNAL" },
  { href: "/data", fkey: "F6", label: "DATA" },
  { href: "/news", fkey: "F7", label: "NEWS" },
];

export default function Nav() {
  const path = usePathname();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " NY"
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="term-header">
        <div className="term-logo">
          THE VAULT <span>/ FUTURES PROP TERMINAL</span>
        </div>
        <div className="term-clock">{clock}</div>
      </div>
      <nav className="term-nav">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={path === t.href ? "active" : ""}>
            <span className="fkey">{t.fkey}</span>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="ticker">
        <b>PRB v1</b> LOCKED · 5m MNQ · 10:00–13:00 · 1/day · skip Mon · BE@+1R · 1:5 · $400 risk ·{" "}
        <b>REPLAY</b> Dec–Mar +$6,005 (23) · Apr–Jul +$5,536 (14)
      </div>
    </>
  );
}
