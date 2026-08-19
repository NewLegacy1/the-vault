import { Logo } from "@/components/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-900/50 bg-[#0f2744] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 md:flex-row">
        <div className="flex items-center gap-3">
          <Logo variant="icon" className="h-10 w-10" />
          <span className="font-medium text-slate-200">JL Web Design</span>
        </div>
        <p>&copy; {year} JL Web Design. All rights reserved.</p>
      </div>
    </footer>
  );
}
