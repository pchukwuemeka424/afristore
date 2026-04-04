import { HeroLeadForm } from '@/components/HeroLeadForm';
import Link from 'next/link';

const features = [
  {
    title: 'Your store, your brand',
    body: 'A polished site for ecommerce brands, tailors, boutiques, and makers. Show collections, lookbooks, or services under your own name. No coding required.',
  },
  {
    title: 'Get paid online',
    body: 'Accept cards online and grow toward mobile money and USSD—the ways many customers already prefer to pay.',
  },
  {
    title: 'Meet clients where they are',
    body: 'Phone friendly pages and WhatsApp friendly flows for how Africans discover and buy: comparing fabrics, sizing, or booking your next slot on everyday data.',
  },
  {
    title: 'Products, fittings, or bookings',
    body: 'Layouts for retail, custom tailoring, fashion drops, beauty, food, electronics, and appointment based work. One platform for catalogs, deposits, and service menus.',
  },
  {
    title: 'Look credible from day one',
    body: 'Hosting ready for SSL and clean URLs so new entrepreneurs and established studios alike look professional to every enquiry.',
  },
  {
    title: 'Words that sell',
    body: 'Product and service copy assisted by AI, in your tone, so solo tailors, designers, and small teams can refresh descriptions without a full marketing hire.',
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

      <section
        className="relative overflow-hidden border-b border-earth-800/15 bg-earth-100"
        aria-labelledby="hero-heading"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-jade-600" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath fill='%231c1410' d='M0 0h1v1H0V0zm16 16h1v1h-1v-1z'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-14">
            <div className="lg:col-span-6 xl:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-jade-600">Storefronts · Get paid · Mobile-first</p>
              <h1
                id="hero-heading"
                className="mt-4 font-display text-[2rem] font-semibold leading-[1.08] tracking-tight text-earth-950 sm:text-4xl xl:text-[2.75rem]"
              >
                Create your free ecommerce site with{' '}
                <span className="text-jade-600">AfriStore</span>
                <span className="text-earth-800/70">.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-earth-800/90 sm:text-lg">
                Sell products, services, or bookings from a real storefront—templates tuned for how African customers
                discover and pay. No code. No credit card to begin.
              </p>
              <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4" role="list">
                {[
                  { k: 'Templates', v: 'Retail & services' },
                  { k: 'Reach', v: 'WhatsApp-friendly flows' },
                ].map((item) => (
                  <li
                    key={item.k}
                    className="flex min-w-[10rem] flex-col gap-0.5 border-l-2 border-jade-600 pl-3"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-earth-800/55">{item.k}</span>
                    <span className="text-sm font-medium text-earth-950">{item.v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 xl:col-span-5 lg:pt-1">
              <HeroLeadForm />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-earth-800/10 bg-earth-50 py-20 sm:py-24" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jade-600">Shaped for African markets</p>
              <h2 id="features-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight text-earth-950 sm:text-4xl">
                One place for African ecommerce, tailoring, creative, and service brands to grow.
              </h2>
              <p className="mt-4 text-earth-800/95">
                African founders in retail, fashion, tailoring, digital products, and client services need a serious site,
                regional payments, and pages that load well on the phones people actually use. AfriStore keeps the tech
                simple so you can focus on clients, collections, and your next launch.
              </p>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-earth-800/80 lg:text-right">
              Less juggling spreadsheets and DMs for every sale. List offerings, take payments, and look professional in one
              flow.
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
              Storefronts for African entrepreneurs, ecommerce brands, tailors, and creative businesses.
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
