'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { StorefrontPreview } from '@/components/storefront/StorefrontPreview';

type Store = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  niche: string;
  brandColor: string;
  logoUrl?: string | null;
  tagline?: string | null;
  siteDescription?: string | null;
  template: { slug: string; demoTagline: string | null };
  sectionTemplate?: string | null;
};

type Product = {
  id: string;
  title: string;
  price: number | string;
  stock: number;
  published: boolean;
  images?: string[];
};

type Order = {
  id: string;
  status: string;
  total: string;
  customerEmail: string;
  createdAt: string;
};

export default function StoreDashboardPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<{ orders: number; revenue: string } | null>(null);
  const [tab, setTab] = useState<'overview' | 'orders' | 'ai'>('overview');
  const [aiText, setAiText] = useState('');
  const [aiPromptTitle, setAiPromptTitle] = useState('');
  const [storeStatus, setStoreStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.slice(1);
      if (h === 'orders') setTab('orders');
      else if (h === 'ai') setTab('ai');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!storeId || !user) return;
    setStoreStatus('loading');
    setStore(null);
    apiFetch<Store>(`/api/stores/${storeId}`)
      .then((s) => {
        setStore(s);
        setStoreStatus('ready');
      })
      .catch(() => {
        setStore(null);
        setStoreStatus('missing');
      });
    apiFetch<Product[]>(`/api/products/store/${storeId}`)
      .then(setProducts)
      .catch(() => setProducts([]));
    apiFetch<Order[]>(`/api/orders/store/${storeId}`)
      .then(setOrders)
      .catch(() => setOrders([]));
    apiFetch<{ orders: number; revenue: string }>(`/api/analytics/store/${storeId}/summary`)
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [storeId, user]);

  async function genAi() {
    if (!storeId || !store) return;
    const res = await apiFetch<{ text?: string; disabled?: boolean }>(
      `/api/ai/stores/${storeId}/product-description`,
      {
        method: 'POST',
        body: JSON.stringify({
          title: aiPromptTitle.trim() || store.name,
          niche: store.niche,
          language: 'en',
        }),
      },
    );
    setAiText(res.text ?? (res.disabled ? 'AI disabled for this store.' : ''));
  }

  if (!user || loading) return <div className="p-10 text-center">Loading…</div>;
  if (storeStatus === 'loading') return <div className="p-10 text-center text-earth-800/80">Loading store…</div>;
  if (storeStatus === 'missing' || !store) return <div className="p-10 text-center">Store not found.</div>;

  const base = `/dashboard/${storeId}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-sm text-jade-700 hover:underline">
            ← All stores
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold">{store.name}</h1>
          <p className="text-sm text-earth-800/75">
            {store.slug} · {store.niche} · template {store.template.slug}
            {store.sectionTemplate && <> · layout {store.sectionTemplate}</>}
          </p>
        </div>
        <a
          href={`/s/${store.slug}`}
          className="rounded-xl border border-earth-800/15 px-4 py-2 text-sm font-medium hover:bg-white"
        >
          View live storefront
        </a>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-earth-800/10 pb-4">
        <button
          type="button"
          onClick={() => {
            setTab('overview');
            if (window.location.hash) window.history.replaceState(null, '', base);
          }}
          className={`rounded-full px-4 py-1.5 text-sm ${
            tab === 'overview' ? 'bg-earth-950 text-white' : 'bg-earth-100 text-earth-900 hover:bg-earth-200/80'
          }`}
        >
          Overview
        </button>
        <Link
          href={`${base}/products`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Products
        </Link>
        <Link
          href={`${base}/settings`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Settings
        </Link>
        <Link
          href={`${base}/template`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Template
        </Link>
        <Link
          href={`${base}/bookings`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Bookings
        </Link>
        <button
          type="button"
          onClick={() => {
            setTab('orders');
            window.history.replaceState(null, '', `${base}#orders`);
          }}
          className={`rounded-full px-4 py-1.5 text-sm ${
            tab === 'orders' ? 'bg-earth-950 text-white' : 'bg-earth-100 text-earth-900 hover:bg-earth-200/80'
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('ai');
            window.history.replaceState(null, '', `${base}#ai`);
          }}
          className={`rounded-full px-4 py-1.5 text-sm ${
            tab === 'ai' ? 'bg-earth-950 text-white' : 'bg-earth-100 text-earth-900 hover:bg-earth-200/80'
          }`}
        >
          AI
        </button>
      </nav>

      {tab === 'overview' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-earth-800/10 bg-white/80 p-6">
            <h2 className="font-display text-lg font-semibold">Pulse</h2>
            <p className="mt-4 text-3xl font-semibold">{summary?.orders ?? 0} orders</p>
            <p className="text-earth-800/80">Lifetime revenue: {summary?.revenue ?? '0'}</p>
            <Link
              href={`${base}/settings`}
              className="mt-6 inline-block text-sm font-medium text-jade-700 hover:underline"
            >
              Site settings &amp; logo →
            </Link>
          </div>
          <div className="rounded-2xl border border-earth-800/10 bg-white/80 p-2">
            <StorefrontPreview store={store} products={products.slice(0, 3)} />
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <ul id="orders" className="mt-8 scroll-mt-24 divide-y divide-earth-800/10 rounded-2xl border border-earth-800/10 bg-white/80">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>{o.customerEmail}</span>
              <span className="font-medium">{o.total}</span>
              <span className="rounded-full bg-earth-100 px-2 py-0.5 text-xs uppercase">{o.status}</span>
            </li>
          ))}
          {orders.length === 0 && <li className="px-4 py-6 text-earth-800/70">No orders yet.</li>}
        </ul>
      )}

      {tab === 'ai' && (
        <div id="ai" className="mt-8 scroll-mt-24 rounded-2xl border border-earth-800/10 bg-white/80 p-6 space-y-4">
          <p className="text-sm text-earth-800/80">
            Generate product descriptions and campaign copy. Turn AI off under{' '}
            <Link href={`${base}/settings`} className="font-medium text-jade-700 hover:underline">
              Settings
            </Link>
            .
          </p>
          <label className="flex max-w-md flex-col gap-1 text-sm font-medium text-earth-900">
            Product or topic (optional)
            <input
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              placeholder={store.name}
              value={aiPromptTitle}
              onChange={(e) => setAiPromptTitle(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={genAi}
            className="rounded-xl bg-earth-950 px-4 py-2 text-sm font-medium text-white"
          >
            Generate description draft
          </button>
          {aiText && <pre className="whitespace-pre-wrap rounded-xl bg-earth-50 p-4 text-sm">{aiText}</pre>}
        </div>
      )}
    </div>
  );
}
