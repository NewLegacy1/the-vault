import { portfolioProjects } from "@/data/portfolio";

export function Portfolio() {
  return (
    <section id="work" className="border-t border-slate-200 bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            Portfolio
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Some of our work
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            We&apos;re just getting started — new projects will appear here as we
            launch them. Check back soon to see what we&apos;ve been building.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioProjects.map((project) => (
            <article
              key={project.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                {project.comingSoon ? (
                  <div className="text-center">
                    <span className="inline-flex rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coming Soon
                    </span>
                  </div>
                ) : project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {project.title}
                </h3>
                <p className="mt-2 flex-1 text-slate-600">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {project.href && !project.comingSoon && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700"
                  >
                    View project
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
