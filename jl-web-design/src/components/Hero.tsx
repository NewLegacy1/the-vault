export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-slate-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-teal-600">
          Web Design Studio
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Clean, modern websites built for{" "}
          <span className="text-teal-600">your business</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
          JL Web Design helps small businesses stand out online with thoughtful
          design, fast performance, and sites that are easy to manage.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#work"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-600"
          >
            View Our Work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-teal-400 hover:text-teal-700"
          >
            Start a Project
          </a>
        </div>
      </div>
    </section>
  );
}
