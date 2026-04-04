import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

/** Next rewrites need an absolute URL; allow `host:port` without scheme in .env. */
function normalizeApiOrigin(raw: string): string {
  const t = raw.trim().replace(/\/$/, '');
  if (/^https?:\/\//i.test(t)) return t;
  return `http://${t}`;
}

const apiOrigin = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isProd && { output: 'standalone' }),
  env: {
    NEXT_PUBLIC_API_URL: apiOrigin,
    NEXT_PUBLIC_STORE_BASE: process.env.NEXT_PUBLIC_STORE_BASE ?? 'localhost:3000',
  },
  /** Proxy /api → backend so the web app can call same-origin `/api/...` (avoids CORS / wrong port). */
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin.replace(/\/$/, '')}/api/:path*` }];
  },
};

export default nextConfig;
