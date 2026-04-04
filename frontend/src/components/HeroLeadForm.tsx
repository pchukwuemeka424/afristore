'use client';

import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Niche = { id: string; label: string; icon: string };

export function HeroLeadForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [niches, setNiches] = useState<Niche[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ items: Niche[] }>('/api/categories/niches', { auth: false })
      .then((r) => setNiches(r.items))
      .catch(() => setNiches([]));
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }
    if (!category) {
      setError('Please choose a category.');
      return;
    }
    const params = new URLSearchParams();
    params.set('business', businessName.trim());
    params.set('category', category);
    router.push(`/register?${params.toString()}`);
  }

  return (
    <div className="relative border-2 border-earth-950 bg-earth-50 p-6 shadow-[12px_12px_0_0_rgba(28,20,16,0.85)] sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-earth-800/15 pb-4">
        <div>
          <p className="font-display text-lg font-semibold text-earth-950">Start in minutes</p>
          <p className="mt-0.5 text-xs text-earth-800/70">No card required to open your account.</p>
        </div>
        <span
          className="hidden shrink-0 border border-earth-800/20 bg-white px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-earth-800 sm:block"
          aria-hidden
        >
          Step 1
        </span>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="hero-business-name" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-earth-800">
            Business name
          </label>
          <input
            id="hero-business-name"
            type="text"
            autoComplete="organization"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border-2 border-earth-800/20 bg-white px-3.5 py-3 text-sm text-earth-950 outline-none transition placeholder:text-earth-800/35 focus:border-jade-600 focus:ring-0"
            placeholder="e.g. Kente & Co"
          />
        </div>
        <div>
          <label htmlFor="hero-category" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-earth-800">
            Category
          </label>
          <select
            id="hero-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full cursor-pointer border-2 border-earth-800/20 bg-white px-3.5 py-3 text-sm text-earth-950 outline-none transition focus:border-jade-600 focus:ring-0"
          >
            <option value="">Select a category</option>
            {niches.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="border-l-4 border-jade-600 bg-jade-600/10 px-3 py-2 text-sm font-medium text-earth-950">{error}</p>
        )}
        <button
          type="submit"
          className="w-full border-2 border-earth-950 bg-jade-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-jade-500 sm:w-auto"
        >
          Get started
        </button>
      </form>
    </div>
  );
}
