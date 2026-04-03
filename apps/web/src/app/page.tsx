import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-jade-500/15 via-transparent to-amber-200/30 pointer-events-none" />
      <div className="mx-auto max-w-6xl px-6 py-20 relative">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-jade-600">Africa-first commerce</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-semibold text-earth-950 leading-tight">
            Your storefront, live in minutes — not months.
          </h1>
          <p className="mt-6 text-lg text-earth-800/90">
            AfriStore helps entrepreneurs launch free online stores with responsive templates, automatic subdomains,
            Paystack payments, and AI-assisted product and marketing copy.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-jade-600 px-6 py-3 text-white font-medium shadow-lg shadow-jade-600/25 hover:bg-jade-500 transition"
            >
              Start free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-earth-800/15 bg-white/80 px-6 py-3 font-medium text-earth-900 hover:bg-white"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { t: '50+ templates', d: 'Fashion, food, electronics, crafts, and more — all mobile-first.' },
            { t: 'Payments built-in', d: 'Paystack webhooks and optional mobile money flows.' },
            { t: 'Deploy with Coolify', d: 'Dockerized services with SSL and subdomain automation.' },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-earth-800/10 bg-white/70 p-6 shadow-sm backdrop-blur">
              <h3 className="font-display text-lg font-semibold text-earth-950">{x.t}</h3>
              <p className="mt-2 text-sm text-earth-800/90">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
