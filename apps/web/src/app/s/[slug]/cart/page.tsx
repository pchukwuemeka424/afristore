import Link from 'next/link';
import { StorefrontInnerHeader } from '@/components/storefront/StorefrontInnerHeader';
import { CartPageClient } from '@/components/storefront/CartPageClient';

type Store = {
  name: string;
  slug: string;
  brandColor: string;
  currency: string;
  whatsappPhone?: string | null;
};

async function loadStore(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${base}/api/stores/public/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json() as Promise<Store>;
}

export default async function StorefrontCartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await loadStore(slug);
  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-earth-800/80">
          Store not found. <Link href="/">Home</Link>
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-earth-50">
      <StorefrontInnerHeader store={store} />
      <CartPageClient
        storeCurrency={store.currency}
        storeName={store.name}
        whatsappPhone={store.whatsappPhone}
      />
    </div>
  );
}
