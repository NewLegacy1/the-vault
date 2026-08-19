export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
            JL
          </span>
          <span className="font-medium text-slate-700">JL Web Design</span>
        </div>
        <p>&copy; {year} JL Web Design. All rights reserved.</p>
      </div>
    </footer>
  );
}
