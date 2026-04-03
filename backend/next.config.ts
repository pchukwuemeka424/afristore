import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  serverExternalPackages: ['mongoose', 'argon2', '@vercel/blob'],
};

export default nextConfig;
