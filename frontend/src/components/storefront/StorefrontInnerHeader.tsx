'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { StorefrontCartLink } from '@/components/storefront/StorefrontCartLink';

type Store = {
  name: string;
  slug: string;
  brandColor: string;
};

export function StorefrontInnerHeader({ store }: { store: Store }) {
  const style = { '--accent': store.brandColor } as CSSProperties;
  return (
    <header style={style} className="border-b border-white/15 bg-[color:var(--accent)] text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href={`/s/${store.slug}`} className="text-sm font-medium hover:underline">
          ← {store.name}
        </Link>
        <StorefrontCartLink storeSlug={store.slug} />
      </div>
    </header>
  );
}
