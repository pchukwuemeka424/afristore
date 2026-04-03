import Link from 'next/link';

export default function StoreNotFoundPage() {
  return (
    <main className="min-h-screen bg-earth-50 px-6 py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-2xl border border-earth-200 bg-white p-8 text-center shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">404</p>
        <h1 className="text-2xl font-semibold text-earth-900">Store not found</h1>
        <p className="mt-3 text-sm text-earth-700/80">
          We could not find a storefront for this link. Check the URL or go back home.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-full bg-earth-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-earth-800"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
