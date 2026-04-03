'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { slugify } from '@/lib/slug';

const STORE_BASE = process.env.NEXT_PUBLIC_STORE_BASE ?? 'localhost:3000';

export default function DeployPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('afristore_onboarding');
    setDraft(raw ? (JSON.parse(raw) as Record<string, string>) : null);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!draft) return;
    if (draft.slug) setSlug(slugify(draft.slug));
    else if (draft.name) setSlug(slugify(draft.name));
  }, [draft]);

  async function deploy() {
    if (!draft?.name || !draft.niche || !draft.templateId || !draft.language || !draft.currency || !draft.sectionTemplate) {
      setError('Missing onboarding data. Start over from step 1.');
      return;
    }
    const finalSlug = slugify(slug);
    if (finalSlug.length < 2) {
      setError('Subdomain must be at least 2 characters.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const store = await apiFetch<{
        id: string;
        slug: string;
        deploymentStatus: string;
      }>('/api/stores', {
        method: 'POST',
        body: JSON.stringify({
          name: draft.name,
          slug: finalSlug,
          language: draft.language,
          currency: draft.currency,
          niche: draft.niche,
          templateId: draft.templateId,
          sectionTemplate: draft.sectionTemplate,
          brandColor: color,
        }),
      });
      sessionStorage.removeItem('afristore_onboarding');
      router.push(`/dashboard/${store.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create store');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return <div className="p-10 text-center">Loading…</div>;

  const previewSlug = slugify(slug) || 'your-store';
  const storeUrl = `http://${STORE_BASE}/s/${previewSlug}`;
  const hostOnly = STORE_BASE.split(':')[0];

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-jade-600">Step 4 of 4</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Review subdomain &amp; brand</h1>
      {draft?.name && (
        <p className="mt-2 text-sm text-earth-800/90">
          Store: <span className="font-medium text-earth-950">{draft.name}</span>
        </p>
      )}
      <p className="mt-3 text-earth-800/85">
        Your public shop URL (local):{' '}
        <span className="font-mono text-xs break-all rounded bg-earth-100 px-2 py-0.5 text-earth-950">{storeUrl}</span>
      </p>
      <p className="mt-2 text-xs text-earth-700/80">
        Subdomain for custom DNS:{' '}
        <span className="font-mono text-earth-900">
          {previewSlug}.{hostOnly}
        </span>
      </p>
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Subdomain (URL slug)</label>
          <input
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2 font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value.replace(/\s+/g, '-')))}
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Accent color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full" />
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-10 flex gap-4">
        <Link href="/dashboard/templates" className="rounded-xl border border-earth-800/15 px-5 py-3 text-sm font-medium">
          Back
        </Link>
        <button
          type="button"
          disabled={busy || slugify(slug).length < 2}
          onClick={deploy}
          className="flex-1 rounded-xl bg-jade-600 py-3 font-medium text-white hover:bg-jade-500 disabled:opacity-50"
        >
          {busy ? 'Provisioning…' : 'Deploy store'}
        </button>
      </div>
    </div>
  );
}
