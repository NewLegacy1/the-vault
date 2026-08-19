"use client";

import { useEffect, useRef, useState } from "react";
import { LogoPlaceholder } from "@/components/LogoPlaceholder";

const menuLinks = [
  { label: "Meet our Team", href: "#team" },
  { label: "Some of our work", href: "#work" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-900/50 bg-[#0a1628]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="transition opacity-90 hover:opacity-100">
          <LogoPlaceholder size="sm" />
        </a>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center gap-1.5 rounded-lg p-2.5 text-sky-300 transition hover:bg-blue-900/50 hover:text-sky-200"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="block h-0.5 w-6 rounded-full bg-current" />
            <span className="block h-0.5 w-6 rounded-full bg-current" />
            <span className="block h-0.5 w-6 rounded-full bg-current" />
          </button>

          {menuOpen && (
            <nav
              className="absolute right-0 top-full mt-2 min-w-[220px] overflow-hidden rounded-xl border border-blue-800/60 bg-[#0f2744] py-2 shadow-xl shadow-black/30"
              aria-label="Main menu"
            >
              {menuLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-blue-900/60 hover:text-sky-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
