const STORE_BASE = process.env.NEXT_PUBLIC_STORE_BASE ?? 'localhost:3000';
const BASE_HOST = STORE_BASE.split(':')[0];

/** Full public URL for a storefront (subdomain in prod, /s/ path in dev). */
export function storeUrl(slug: string): string {
  if (BASE_HOST === 'localhost' || BASE_HOST === '127.0.0.1') {
    return `http://${STORE_BASE}/s/${slug}`;
  }
  return `https://${slug}.${BASE_HOST}`;
}
