import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    title: 'Your store, your brand',
    body: 'Create a proper ecommerce storefront with your name and look, from side projects and market stalls to growing labels. No coding required.',
  },
  {
    title: 'Get paid online',
    body: 'Paystack is built in so you can accept cards today and extend toward mobile money and USSD as your customers prefer.',
  },
  {
    title: 'Meet buyers where they are',
    body: 'Fast, phone friendly product pages and WhatsApp friendly checkout habits, ideal for busy shoppers and tight data.',
  },
  {
    title: 'Sell products or services',
    body: 'Templates for physical goods, food, electronics, crafts, and service bookings. One platform whether you ship boxes or take appointments.',
  },
  {
    title: 'Look credible from day one',
    body: 'Hosting ready for SSL and clean URLs so first time entrepreneurs and established sellers alike look trustworthy to new customers.',
  },
  {
    title: 'Words that sell',
    body: 'Product descriptions and promos assisted by AI, in your tone, so solo founders and small teams can refresh copy without hiring a studio.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-earth-50 text-earth-950">
      <header className="sticky top-0 z-50 border-b border-earth-800/10 bg-earth-50/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center border-2 border-earth-950 bg-earth-950 text-[11px] font-bold uppercase tracking-tighter text-earth-50"
              aria-hidden
            >
              AS
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-earth-950">AfriStore</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Account">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-earth-800 transition hover:bg-earth-100 hover:text-earth-950"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-earth-950 bg-earth-950 px-4 py-2 text-sm font-semibold text-earth-50 shadow-sm transition hover:bg-earth-800"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate flex min-h-[min(58vh,520px)] items-center">
        <Image
          src="/images/man.jpg"
          alt="Entrepreneur building an online store with AfriStore"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Background overlays (solid tones only, no gradients) */}
        <div className="absolute inset-0 bg-earth-950/78" aria-hidden />
        <div className="absolute inset-0 bg-black/35" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-jade-600/12" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2240%22%20height=%2240%22%20viewBox=%220%200%2040%2040%22%3E%3Cpath%20d=%22M0%2040h40V0H0v40zm1-1h38V1H1v38z%22%20fill=%22%23ffffff%22%20fill-opacity=%22.04%22/%3E%3C/svg%3E')] opacity-90"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14">
          <div className="max-w-2xl border-l-4 border-jade-500 pl-6 sm:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-earth-100/90">
              Ecommerce start for every kind of entrepreneur
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Create your own online store and start selling, from first idea to real orders.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-earth-100/95">
              AfriStore helps you launch ecommerce without a dev team: open your store, list products or services, and get
              paid, whether you are testing a side hustle, taking your stall online, or growing an existing brand.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-jade-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-jade-500"
              >
                Start your store free
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Sign in to your store
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-earth-800/10 bg-earth-50 py-20 sm:py-24" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jade-600">Built for sellers like you</p>
              <h2 id="features-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight text-earth-950 sm:text-4xl">
                One ecommerce home for new founders and owners who are ready to grow.
              </h2>
              <p className="mt-4 text-earth-800/95">
                Side hustlers, shop owners, creators, and service providers all start somewhere. AfriStore gives you the
                same core tools: a real online store, regional payments, and layouts that work on real phones, so you can
                focus on products and customers, not infrastructure.
              </p>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-earth-800/80 lg:text-right">
              Skip the generic brochure site. Put ecommerce first: list, sell, and get paid in one place.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <li
                key={f.title}
                className="group relative overflow-hidden border border-earth-800/12 bg-white p-6 shadow-[0_1px_0_0_rgba(28,20,16,0.06)] transition hover:border-earth-800/20"
              >
                <span className="font-display text-4xl font-semibold tabular-nums text-earth-100 transition group-hover:text-jade-600/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-earth-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-earth-800/90">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-earth-800/10 bg-earth-100/80 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-display text-lg font-semibold text-earth-950">AfriStore</p>
            <p className="mt-1 text-sm text-earth-800/80">
              Helping entrepreneurs create online stores and run ecommerce that fits how Africa buys.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-earth-950 px-5 py-2.5 text-sm font-semibold text-earth-50 transition hover:bg-earth-800"
            >
              Create your store
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-earth-800/20 bg-white px-5 py-2.5 text-sm font-medium text-earth-950 transition hover:border-earth-800/35"
            >
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
