import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { notFound } from 'next/navigation';

type Product = {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  images?: string[];
};

async function load(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const [storeRes, productsRes] = await Promise.all([
    fetch(`${base}/api/stores/public/${slug}`, { cache: 'no-store' }),
    fetch(`${base}/api/products/public/${slug}`, { cache: 'no-store' }),
  ]);
  if (!storeRes.ok) return null;
  const store = await storeRes.json();
  const products: Product[] = productsRes.ok ? await productsRes.json() : [];
  return { store, products };
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  return <StorefrontShell store={data.store} products={data.products} />;
}
