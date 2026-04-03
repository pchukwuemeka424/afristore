'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

type Niche = { id: string; label: string; icon: string };

export default function CategoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [niches, setNiches] = useState<Niche[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    apiFetch<{ items: Niche[] }>('/api/categories/niches', { auth: false })
      .then((r) => setNiches(r.items))
      .catch(() => setNiches([]));
  }, []);

  function next() {
    if (!selected) return;
    const raw = sessionStorage.getItem('afristore_onboarding');
    const base = raw ? JSON.parse(raw) : {};
    sessionStorage.setItem('afristore_onboarding', JSON.stringify({ ...base, niche: selected }));
    router.push(`/dashboard/templates?niche=${encodeURIComponent(selected)}&onboarding=1`);
  }

  if (loading || !user) return <div className="p-10 text-center">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-jade-600">Step 2 of 4</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Choose your niche</h1>
      <p className="mt-3 text-earth-800/85">We&apos;ll filter templates and demo content to match your business.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {niches.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setSelected(n.id)}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              selected === n.id
                ? 'border-jade-600 bg-jade-500/10 ring-2 ring-jade-500/30'
                : 'border-earth-800/10 bg-white/80 hover:border-earth-800/25'
            }`}
          >
            <span className="font-medium text-earth-950">{n.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-10 flex gap-4">
        <Link href="/onboarding" className="rounded-xl border border-earth-800/15 px-5 py-3 text-sm font-medium">
          Back
        </Link>
        <button
          type="button"
          disabled={!selected}
          onClick={next}
          className="flex-1 rounded-xl bg-jade-600 py-3 font-medium text-white hover:bg-jade-500 disabled:opacity-50"
        >
          Pick a template
        </button>
      </div>
    </div>
  );
}
