'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { slugify } from '@/lib/slug';

const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
  { id: 'sw', label: 'Kiswahili' },
];

const CURRENCIES = [
  { id: 'NGN', label: 'Naira (NGN)' },
  { id: 'GHS', label: 'Cedi (GHS)' },
  { id: 'KES', label: 'Shilling (KES)' },
  { id: 'ZAR', label: 'Rand (ZAR)' },
  { id: 'XOF', label: 'CFA (XOF)' },
];

const STORE_BASE = process.env.NEXT_PUBLIC_STORE_BASE ?? 'localhost:3000';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('NGN');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!slugManual && name.trim()) {
      setSlug(slugify(name));
    }
  }, [name, slugManual]);

  function next() {
    const s = slugify(slug);
    if (!name.trim() || s.length < 2) return;
    sessionStorage.setItem(
      'afristore_onboarding',
      JSON.stringify({ name: name.trim(), slug: s, language, currency }),
    );
    router.push('/onboarding/category');
  }

  const previewSlug = slugify(slug) || 'your-store';
  const storeUrlHttp = `http://${STORE_BASE}/s/${previewSlug}`;
  const hostOnly = STORE_BASE.split(':')[0];

  if (loading || !user) return <div className="p-10 text-center">Loading…</div>;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-jade-600">Step 1 of 4</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Name your store &amp; subdomain</h1>
      <p className="mt-3 text-earth-800/85">
        Your <strong className="text-earth-950">store name</strong> appears on receipts and the dashboard. Your{' '}
        <strong className="text-earth-950">subdomain</strong> is the unique slug for your shop URL and for DNS (e.g.{' '}
        <span className="font-mono text-sm">
          {previewSlug}.{hostOnly}
        </span>
        ) when you connect a custom domain.
      </p>
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Store name</label>
          <input
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kente & Co"
            autoComplete="organization"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Subdomain (URL slug)</label>
          <p className="mt-0.5 text-xs text-earth-800/70">
            Letters, numbers, and hyphens. Must be unique — this becomes your public path{' '}
            <code className="rounded bg-earth-100 px-1">/s/…</code> and your subdomain on a mapped domain.
          </p>
          <input
            className="mt-2 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2 font-mono text-sm"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(slugify(e.target.value.replace(/\s+/g, '-')));
            }}
            placeholder="kente-co"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <div className="mt-3 rounded-xl border border-jade-600/20 bg-jade-500/5 px-3 py-2.5 text-sm text-earth-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-jade-800">Public storefront (dev)</p>
            <p className="mt-1 break-all font-mono text-xs text-earth-950">{storeUrlHttp}</p>
            <p className="mt-2 text-xs text-earth-700/85">
              Production example:{' '}
              <span className="font-mono text-earth-900">
                https://{previewSlug}.{hostOnly}
              </span>{' '}
              when your DNS points <span className="font-mono">{hostOnly}</span> to AfriStore.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Language</label>
          <select
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Currency</label>
          <select
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={next}
        disabled={!name.trim() || slugify(slug).length < 2}
        className="mt-10 w-full rounded-xl bg-jade-600 py-3 font-medium text-white hover:bg-jade-500 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
