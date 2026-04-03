'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, uploadStoreLogo } from '@/lib/api';
import { StorefrontPreview } from '@/components/storefront/StorefrontPreview';

type Store = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  language: string;
  niche: string;
  brandColor: string;
  logoUrl?: string | null;
  tagline?: string | null;
  siteDescription?: string | null;
  whatsappPhone?: string | null;
  aiEnabled?: boolean;
  template: { slug: string; demoTagline: string | null };
};

type Product = { id: string; title: string; price: string | number; images?: string[] };

const CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'EUR', 'GBP'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ig', label: 'Igbo' },
];

export default function StoreSettingsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [language, setLanguage] = useState('en');
  const [brandColor, setBrandColor] = useState('#0d9488');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadStore = useCallback(() => {
    if (!storeId || !user) return;
    setStatus('loading');
    apiFetch<Store>(`/api/stores/${storeId}`)
      .then((s) => {
        setStore(s);
        setName(s.name);
        setTagline(s.tagline ?? '');
        setSiteDescription(s.siteDescription ?? '');
        setCurrency(s.currency || 'NGN');
        setLanguage(s.language || 'en');
        setBrandColor(s.brandColor || '#0d9488');
        setWhatsappPhone(s.whatsappPhone ?? '');
        setAiEnabled(s.aiEnabled !== false);
        setLogoUrl(s.logoUrl ?? null);
        setStatus('ready');
      })
      .catch(() => {
        setStore(null);
        setStatus('missing');
      });
  }, [storeId, user]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  useEffect(() => {
    if (!storeId || !user) return;
    apiFetch<Product[]>(`/api/products/store/${storeId}`)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [storeId, user]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const u = URL.createObjectURL(logoFile);
    setLogoPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [logoFile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSaving(true);
    setMsg(null);
    try {
      let nextLogo = logoUrl;
      if (logoFile) {
        nextLogo = await uploadStoreLogo(storeId, logoFile);
        setLogoFile(null);
        setLogoUrl(nextLogo);
      }
      const updated = await apiFetch<Store>(`/api/stores/${storeId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim() || null,
          siteDescription: siteDescription.trim() || null,
          currency,
          language,
          brandColor,
          whatsappPhone: whatsappPhone.trim() ? whatsappPhone.trim() : null,
          logoUrl: nextLogo ?? null,
          aiEnabled,
        }),
      });
      setStore(updated);
      setMsg('Settings saved.');
    } catch (err) {
      try {
        const j = JSON.parse((err as Error).message) as { message?: string };
        setMsg(j?.message ?? (err as Error).message);
      } catch {
        setMsg(err instanceof Error ? err.message : 'Could not save');
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeLogo() {
    if (!storeId) return;
    setSaving(true);
    setMsg(null);
    try {
      const updated = await apiFetch<Store>(`/api/stores/${storeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl: null }),
      });
      setStore(updated);
      setLogoUrl(null);
      setLogoFile(null);
      setMsg('Logo removed.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not remove logo');
    } finally {
      setSaving(false);
    }
  }

  if (!user || loading) return <div className="p-10 text-center">Loading…</div>;
  if (status === 'loading') return <div className="p-10 text-center text-earth-800/80">Loading store…</div>;
  if (status === 'missing' || !store) return <div className="p-10 text-center">Store not found.</div>;

  const base = `/dashboard/${storeId}`;
  const previewStore = {
    name: name || store.name,
    brandColor,
    niche: store.niche,
    template: store.template,
    logoUrl: logoPreview ?? logoUrl ?? undefined,
    tagline: tagline || undefined,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href={base} className="text-sm text-jade-700 hover:underline">
        ← {store.name}
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold">Site settings</h1>
      <p className="mt-1 text-sm text-earth-800/75">
        Logo, storefront copy, and contact. Slug: <span className="font-mono">{store.slug}</span> (fixed)
      </p>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-earth-800/10 pb-4">
        <Link
          href={base}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Overview
        </Link>
        <Link
          href={`${base}/products`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Products
        </Link>
        <span className="rounded-full px-4 py-1.5 text-sm bg-earth-950 text-white">Settings</span>
        <Link
          href={`${base}/template`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Template
        </Link>
        <Link
          href={`${base}#orders`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Orders
        </Link>
        <Link
          href={`${base}#ai`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          AI
        </Link>
      </nav>

      <form onSubmit={save} className="mt-10 space-y-8">
        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6">
          <h2 className="font-display text-lg font-semibold text-earth-950">Logo</h2>
          <p className="mt-1 text-sm text-earth-800/75">Shown on your live storefront header (JPEG, PNG, WebP, GIF — max 4MB).</p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            {(logoPreview || logoUrl) && (
              <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-earth-800/10 bg-earth-50">
                <img src={logoPreview ?? logoUrl!} alt="" className="h-full w-full object-contain p-1" />
              </div>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
              Upload
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="text-xs font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-jade-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {(logoUrl || logoPreview) && (
              <button
                type="button"
                onClick={removeLogo}
                disabled={saving}
                className="text-sm text-red-700 hover:underline disabled:opacity-50"
              >
                Remove logo
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-earth-950">Site information</h2>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Store name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Tagline
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short line under your store name on the storefront"
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            About / description
            <textarea
              rows={4}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Optional — shown in your storefront footer"
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
              Currency
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              >
                {!CURRENCIES.includes(currency) && (
                  <option value={currency}>{currency}</option>
                )}
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Brand color
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-earth-800/15 bg-white"
              />
              <input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 rounded-xl border border-earth-800/15 px-3 py-2 font-mono text-sm"
              />
            </div>
          </label>
        </section>

        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-earth-950">AI</h2>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-earth-900">
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
              className="rounded border-earth-800/30"
            />
            Enable AI drafts (product descriptions &amp; marketing in dashboard)
          </label>
        </section>

        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-earth-950">WhatsApp checkout</h2>
          <p className="text-sm text-earth-800/75">
            Country code + number (spaces ok). Used for cart, checkout, and after order placement.
          </p>
          <label className="flex max-w-md flex-col gap-1 text-sm font-medium text-earth-900">
            WhatsApp number
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 2348012345678"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
        </section>

        {msg && <p className="text-sm text-earth-800">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-jade-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-jade-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-earth-700">Preview</h2>
        <div className="mt-3 max-w-xl">
          <StorefrontPreview store={previewStore} products={products.slice(0, 3)} />
        </div>
      </div>
    </div>
  );
}
