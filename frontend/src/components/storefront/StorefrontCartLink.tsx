'use client';

import Link from 'next/link';
import { useStorefrontCart } from '@/lib/storefront-cart';

export function StorefrontCartLink({
  storeSlug,
  variant = 'light',
}: {
  storeSlug: string;
  variant?: 'light' | 'dark';
}) {
  const { itemCount } = useStorefrontCart();
  const cls =
    variant === 'dark'
      ? 'rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
      : 'rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25';
  return (
    <Link href={`/s/${storeSlug}/cart`} className={cls}>
      Cart{itemCount > 0 ? ` (${itemCount})` : ''}
    </Link>
  );
}
