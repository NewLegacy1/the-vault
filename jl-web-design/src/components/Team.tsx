const teamMembers = [
  {
    id: "landon",
    name: "Landon",
    role: "Founder",
  },
  {
    id: "jude",
    name: "Jude",
    role: "Business Partner",
  },
];

export function Team() {
  return (
    <section id="team" className="border-t border-blue-900/50 bg-[#0a1628] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Our Team
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Meet our Team
          </h2>
          <p className="mt-5 text-lg text-slate-300">
            JL Web Design is built by a small team focused on quality work and
            clear communication. Meet the people behind the studio.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {teamMembers.map((member) => (
            <article
              key={member.id}
              className="flex flex-col items-center rounded-2xl border border-blue-800/50 bg-[#0f2744]/60 p-8 text-center"
            >
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-sky-300/50 bg-sky-400/10">
                <svg
                  className="h-12 w-12 text-sky-300/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">
                {member.name}
              </h3>
              <p className="mt-1 text-sky-400">{member.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
