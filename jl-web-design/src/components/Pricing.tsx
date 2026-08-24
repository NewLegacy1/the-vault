const packages = [
  {
    name: "Basic",
    price: 500,
    description:
      "A clean, professional one-page site — perfect for getting your business online fast.",
    features: [
      "Single-page website design",
      "Mobile-friendly layout",
      "Contact section or simple form",
      "Your logo and brand colors",
      "Basic SEO setup (titles & descriptions)",
      "Social media links",
      "1 round of revisions",
    ],
    highlighted: false,
  },
  {
    name: "Premium",
    price: 1000,
    description:
      "A fuller website with room to grow — ideal when you need multiple pages and more detail.",
    features: [
      "Up to 5 custom pages (Home, About, Services, etc.)",
      "Custom design tailored to your brand",
      "Mobile & tablet optimized",
      "Contact form with email notifications",
      "Photo gallery or portfolio section",
      "Enhanced SEO across all pages",
      "Google Maps integration",
      "2 rounds of revisions",
      "30 days of post-launch support",
    ],
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-blue-900/50 bg-[#0f2744] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Packages for every need
          </h2>
          <p className="mt-5 text-lg text-slate-300">
            Simple, transparent pricing. Pick the package that fits your business
            — we&apos;ll handle the rest.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {packages.map((pkg) => (
            <article
              key={pkg.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                pkg.highlighted
                  ? "border-sky-400/50 bg-[#0a1628] shadow-lg shadow-sky-900/20"
                  : "border-blue-800/50 bg-[#0a1628]/60"
              }`}
            >
              {pkg.highlighted && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-sky-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
              <p className="mt-2 text-slate-400">{pkg.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-sky-400">
                  ${pkg.price}
                </span>
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-slate-300">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-sky-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold transition ${
                  pkg.highlighted
                    ? "bg-sky-500 text-[#0a1628] hover:bg-sky-400"
                    : "border border-sky-400/40 text-sky-300 hover:border-sky-300 hover:bg-sky-400/10"
                }`}
              >
                Get Started
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
