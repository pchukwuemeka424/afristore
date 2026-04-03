import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/storefront/AddToCartButton';
import { StorefrontInnerHeader } from '@/components/storefront/StorefrontInnerHeader';

type Store = {
  name: string;
  slug: string;
  brandColor: string;
  currency: string;
  niche: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  currency: string;
  sku?: string | null;
  stock: number;
  images?: string[];
};

async function load(slug: string, productId: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const [storeRes, productRes] = await Promise.all([
    fetch(`${base}/api/stores/public/${slug}`, { next: { revalidate: 30 } }),
    fetch(`${base}/api/products/public/${slug}/${productId}`, { next: { revalidate: 30 } }),
  ]);
  if (!storeRes.ok) return null;
  const store = (await storeRes.json()) as Store;
  if (!productRes.ok) return { store, product: null as Product | null };
  const product = (await productRes.json()) as Product;
  return { store, product };
}

export default async function StorefrontProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const data = await load(slug, productId);
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-earth-800/80">Store not found.</p>
      </div>
    );
  }
  if (!data.product) notFound();

  const p = data.product;

  return (
    <div className="min-h-screen bg-earth-50">
      <StorefrontInnerHeader store={data.store} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            {p.images && p.images.length > 0 ? (
              p.images.map((src, i) => (
                <div
                  key={src}
                  className="overflow-hidden rounded-2xl border border-earth-800/10 bg-white shadow-sm"
                >
                  <img src={src} alt={i === 0 ? p.title : ''} className="aspect-square w-full object-cover" />
                </div>
              ))
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-earth-800/10 bg-earth-100 text-earth-500">
                No image
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-earth-950">{p.title}</h1>
            <p className="mt-4 text-2xl font-semibold text-jade-800">
              {p.price} {p.currency}
            </p>
            <p className="mt-2 text-sm text-earth-800/75">
              {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
              {p.sku ? ` · SKU ${p.sku}` : ''}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AddToCartButton product={p} className="" />
              <Link
                href={`/s/${slug}`}
                className="inline-flex items-center rounded-xl border border-earth-800/20 px-4 py-2.5 text-sm font-medium hover:bg-white"
              >
                Back to shop
              </Link>
            </div>
            {p.description ? (
              <div className="mt-10 border-t border-earth-800/10 pt-8">
                <h2 className="font-display text-lg font-semibold text-earth-950">Details</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-earth-800/90">{p.description}</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <footer className="border-t border-earth-800/10 py-8 text-center text-sm text-earth-800/70">
        <Link href={`/s/${slug}`} className="hover:underline">
          {data.store.name}
        </Link>
      </footer>
    </div>
  );
}
