'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

type Store = {
  id: string;
  name: string;
  slug: string;
  niche: string;
  currency: string;
  deploymentStatus: string;
  sectionTemplate?: string | null;
};

const CATEGORY_META: Record<string, { label: string; color: string; tip: string }> = {
  'ng-ecom-catalog': { label: 'Ecommerce', color: '#047857', tip: 'Add products and set up Paystack/Flutterwave checkout.' },
  'ng-ecom-flash': { label: 'Flash sales', color: '#b45309', tip: 'Create time-limited deals to drive urgency.' },
  'ng-biz-corporate': { label: 'Corporate', color: '#1e3a8a', tip: 'Showcase services, team, and credentials.' },
  'ng-biz-startup': { label: 'Startup', color: '#7c3aed', tip: 'Highlight features, pricing, and a signup CTA.' },
  'ng-rest-dine': { label: 'Restaurant', color: '#dc2626', tip: 'Set up your menu with Naira prices and delivery.' },
  'ng-rest-catering': { label: 'Catering', color: '#ea580c', tip: 'List packages and enable WhatsApp booking.' },
  'ng-faith-church': { label: 'Church', color: '#7c3aed', tip: 'Add service times, sermons, and online giving.' },
  'ng-faith-mosque': { label: 'Mosque', color: '#0d9488', tip: 'Display prayer times and community events.' },
  'ng-fashion-boutique': { label: 'Boutique', color: '#be185d', tip: 'Upload lookbook photos and enable WhatsApp orders.' },
  'ng-fashion-brand': { label: 'Fashion brand', color: '#9333ea', tip: 'Tell your brand story and showcase collections.' },
  'ng-agro-farm': { label: 'Farm-to-door', color: '#16a34a', tip: 'List produce with kg/carton pricing.' },
  'ng-agro-fmcg': { label: 'FMCG', color: '#65a30d', tip: 'Set wholesale pricing tiers for dealers.' },
  'ng-edu-school': { label: 'School', color: '#2563eb', tip: 'Publish programmes, fees, and admissions info.' },
  'ng-edu-bootcamp': { label: 'Bootcamp', color: '#0891b2', tip: 'Add courses, instructors, and enrollment CTAs.' },
};

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'LIVE' ? 'bg-green-500' : status === 'PROVISIONING' ? 'bg-amber-400' : 'bg-gray-300';
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export default function DashboardIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setStoresLoading(true);
    apiFetch<Store[]>('/api/stores')
      .then(setStores)
      .catch(() => setStores([]))
      .finally(() => setStoresLoading(false));
  }, [user]);

  if (loading || !user) return <div className="p-10 text-center text-gray-500">Loading…</div>;

  const totalStores = stores.length;
  const liveStores = stores.filter((s) => s.deploymentStatus === 'LIVE').length;
  const withTemplate = stores.filter((s) => s.sectionTemplate).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total stores</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{totalStores}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Live</p>
          <p className="mt-1 text-3xl font-semibold text-green-600">{liveStores}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">With template</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{withTemplate}</p>
        </div>
      </div>

      {/* Stores list */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Your stores</h2>
          <Link
            href="/onboarding"
            className="rounded-lg bg-jade-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-jade-500"
          >
            + New store
          </Link>
        </div>

        {storesLoading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">Loading stores…</div>
        ) : stores.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-gray-500">No stores yet.</p>
            <Link href="/onboarding" className="mt-2 inline-block text-sm font-medium text-jade-600 hover:underline">
              Create your first store
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {stores.map((s) => {
              const meta = s.sectionTemplate ? CATEGORY_META[s.sectionTemplate] : null;
              return (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/${s.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
                  >
                    {/* Icon/badge */}
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                      style={{ backgroundColor: meta?.color ?? '#6b7280' }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-gray-900">{s.name}</p>
                        <StatusDot status={s.deploymentStatus} />
                      </div>
                      <p className="mt-0.5 truncate text-sm text-gray-500">
                        {s.slug}.store · {s.currency} · {s.niche}
                      </p>
                    </div>

                    {/* Category badge */}
                    {meta && (
                      <span
                        className="hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-block"
                        style={{ backgroundColor: meta.color + '15', color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    )}

                    <svg className="h-5 w-5 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick actions per category */}
      {stores.filter((s) => s.sectionTemplate).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Quick tips for your stores</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores
              .filter((s) => s.sectionTemplate && CATEGORY_META[s.sectionTemplate])
              .map((s) => {
                const meta = CATEGORY_META[s.sectionTemplate!]!;
                return (
                  <div
                    key={s.id}
                    className="rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{meta.tip}</p>
                    <Link
                      href={`/dashboard/${s.id}`}
                      className="mt-3 inline-block text-xs font-medium hover:underline"
                      style={{ color: meta.color }}
                    >
                      Go to store →
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
