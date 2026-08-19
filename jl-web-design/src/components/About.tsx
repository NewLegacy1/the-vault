const highlights = [
  {
    title: "Custom Design",
    description:
      "Every site is tailored to your brand — no generic templates that look like everyone else.",
  },
  {
    title: "Mobile First",
    description:
      "Your site will look great on phones, tablets, and desktops from day one.",
  },
  {
    title: "Built to Grow",
    description:
      "Start simple and add pages, features, or a blog whenever you're ready.",
  },
];

export function About() {
  return (
    <section id="about" className="border-t border-slate-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            About Us
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            We make the web work for you
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            JL Web Design is a small studio focused on helping local businesses
            and entrepreneurs get online with confidence. We handle the design and
            build so you can focus on running your business.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Whether you need a simple landing page, a full business site, or a
            refresh of something outdated, we&apos;ll work with you to create
            something clear, professional, and easy for your customers to use.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-8"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
