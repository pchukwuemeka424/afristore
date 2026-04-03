'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

type Booking = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date: string;
  time: string;
  guests: number;
  notes: string;
  status: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700' },
  CONFIRMED: { bg: 'bg-green-50', text: 'text-green-700' },
  COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700' },
  NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;

export default function BookingsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  const fetchBookings = useCallback(async () => {
    if (!storeId || !user) return;
    setPageLoading(true);
    try {
      const data = await apiFetch<Booking[]>(`/api/bookings/store/${storeId}`);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setPageLoading(false);
    }
  }, [storeId, user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(bookingId: string, status: string) {
    setUpdating(bookingId);
    try {
      await apiFetch(`/api/bookings/store/${storeId}/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await fetchBookings();
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  }

  if (!user || loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const upcomingBookings = bookings.filter((b) => b.date > todayStr && b.status !== 'CANCELLED');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link href={`/dashboard/${storeId}`} className="text-sm text-jade-700 hover:underline">
          ← Back to store
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-gray-900">Reservations</h1>
        <p className="text-sm text-gray-500">Manage table bookings and reservations</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{bookings.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Today</p>
          <p className="mt-1 text-3xl font-semibold text-amber-600">{todayBookings.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="mt-1 text-3xl font-semibold text-green-600">{upcomingBookings.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="mt-1 text-3xl font-semibold text-orange-600">{counts.PENDING}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === s
                ? 'bg-jade-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s as keyof typeof counts] ?? 0})
          </button>
        ))}
      </div>

      {/* Bookings table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {pageLoading ? (
          <div className="px-6 py-12 text-center text-gray-400">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p className="text-gray-500">No reservations found.</p>
            <p className="mt-1 text-sm text-gray-400">Bookings from your storefront will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Party Size</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => {
                  const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.PENDING;
                  const isToday = b.date === todayStr;
                  return (
                    <tr key={b.id} className={`transition hover:bg-gray-50 ${isToday ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade-600 text-sm font-bold text-white">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{b.name}</p>
                            {b.notes && <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{b.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.date}</p>
                        <p className="text-xs text-gray-500">{b.time}</p>
                        {isToday && <span className="inline-block mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">TODAY</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                          {b.guests}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {b.email && <p className="text-xs">{b.email}</p>}
                        {b.phone && <p className="text-xs">{b.phone}</p>}
                        {!b.email && !b.phone && <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          disabled={updating === b.id}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-jade-500 disabled:opacity-50"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
