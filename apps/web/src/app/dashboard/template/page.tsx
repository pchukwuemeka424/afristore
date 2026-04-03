'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

type Store = {
  id: string;
  name: string;
  slug: string;
  sectionTemplate?: string | null;
};

export default function TemplateManagerIndexPage() {
  const { user, loading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    if (!user) return;
    apiFetch<Store[]>('/api/stores')
      .then(setStores)
      .catch(() => setStores([]));
  }, [user]);

  if (loading || !user) return <div className="p-10 text-center">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Template manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pick a store to edit template menu, logo, hero section, and storefront write-up.
        </p>

        {stores.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">No stores yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {stores.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.slug}
                    {s.sectionTemplate ? ` · ${s.sectionTemplate}` : ''}
                  </p>
                </div>
                <Link
                  href={`/dashboard/${s.id}/template`}
                  className="rounded-lg bg-jade-600 px-4 py-2 text-sm font-medium text-white hover:bg-jade-500"
                >
                  Manage template
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

