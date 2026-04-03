'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-earth-800/80">Sign in to manage your stores.</p>
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
          <label className="block text-sm font-medium">Password</label>
          <input
            className="mt-1 w-full rounded-xl border border-earth-800/15 bg-white px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-jade-600 py-3 font-medium text-white hover:bg-jade-500"
        >
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-earth-800/80">
        No account?{' '}
        <Link href="/register" className="font-medium text-jade-700 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
