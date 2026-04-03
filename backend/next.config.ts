import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Native / Node-first deps: bundling them breaks the server runtime (e.g. __webpack_modules__[id] is not a function). */
  serverExternalPackages: ['mongoose', 'argon2', '@vercel/blob'],
};

export default nextConfig;
