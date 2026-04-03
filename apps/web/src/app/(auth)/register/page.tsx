'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, phone || undefined);
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-earth-800/80">Email or phone — your store URL comes next.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone (optional)</label>
          <input
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-jade-600 py-3 font-medium text-white hover:bg-jade-500"
        >
          Continue
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-earth-800/80">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-jade-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
