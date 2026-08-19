export function Contact() {
  return (
    <section id="contact" className="border-t border-slate-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl rounded-3xl bg-slate-900 px-8 py-14 text-center md:px-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">
            Contact
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to build something?
          </h2>
          <p className="mt-5 text-lg text-slate-300">
            Tell us about your project and we&apos;ll get back to you with next
            steps. No pressure — just a friendly conversation to see if we&apos;re
            a good fit.
          </p>
          <a
            href="mailto:hello@jlwebdesign.com"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-teal-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-400"
          >
            hello@jlwebdesign.com
          </a>
        </div>
      </div>
    </section>
  );
}
