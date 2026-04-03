'use client';

import { useState } from 'react';

type BookingModalProps = {
  storeSlug: string;
  accent: string;
  open: boolean;
  onClose: () => void;
};

export function BookingModal({ storeSlug, accent, open, onClose }: BookingModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`/api/bookings/public/${storeSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, date, time, guests, notes }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  function handleClose() {
    setStatus('idle');
    setName('');
    setEmail('');
    setPhone('');
    setDate('');
    setTime('');
    setGuests(2);
    setNotes('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="rounded-t-2xl px-6 py-5 text-white" style={{ backgroundColor: accent }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Reserve a Table</h2>
            <button onClick={handleClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          <p className="mt-1 text-sm text-white/80">Fill in the details below</p>
        </div>

        {status === 'done' ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Reservation Confirmed!</h3>
            <p className="mt-2 text-sm text-gray-500">We&apos;ll reach out to confirm your booking shortly.</p>
            <button onClick={handleClose} className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2" style={{ '--tw-ring-color': accent } as React.CSSProperties} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': accent } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': accent } as React.CSSProperties} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date *</label>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': accent } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time *</label>
                <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': accent } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Guests *</label>
                <input required type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': accent } as React.CSSProperties} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Requests</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none" style={{ '--tw-ring-color': accent } as React.CSSProperties} />
            </div>
            {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: accent }}
            >
              {status === 'sending' ? 'Submitting...' : 'Confirm Reservation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
