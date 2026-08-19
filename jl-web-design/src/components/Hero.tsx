import { Logo } from "@/components/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0a1628]">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center md:py-28">
        <Logo
          variant="full"
          priority
          className="mb-10 h-auto w-full max-w-[280px] md:max-w-[320px]"
        />

        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-400">
          Web Design Studio
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
          Clean, modern websites built for{" "}
          <span className="text-sky-400">your business</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
          JL Web Design helps small businesses stand out online with thoughtful
          design, fast performance, and sites that are easy to manage.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#work"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-8 py-3.5 text-sm font-semibold text-[#0a1628] transition hover:bg-sky-400"
          >
            View Our Work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full border border-sky-400/40 px-8 py-3.5 text-sm font-semibold text-sky-300 transition hover:border-sky-300 hover:bg-sky-400/10"
          >
            Start a Project
          </a>
        </div>
      </div>
    </section>
  );
}
