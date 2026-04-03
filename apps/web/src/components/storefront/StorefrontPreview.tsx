import type { CSSProperties } from 'react';

type Store = {
  name: string;
  brandColor: string;
  niche: string;
  logoUrl?: string | null;
  tagline?: string | null;
  template: { demoTagline: string | null };
};

type Product = { id: string; title: string; price: string | number; images?: string[] };

export function StorefrontPreview({
  store,
  products,
}: {
  store: Store;
  products: Product[];
}) {
  const style = { '--accent': store.brandColor } as CSSProperties;
  return (
    <div style={style} className="rounded-xl overflow-hidden border border-earth-800/10">
      <header className="bg-[color:var(--accent)] px-4 py-6 text-white">
        <div className="flex items-start gap-3">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt="" className="h-10 w-auto max-w-[100px] shrink-0 object-contain" />
          ) : null}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest opacity-90">{store.niche}</p>
            <h2 className="font-display text-2xl font-semibold">{store.name}</h2>
            {(store.tagline?.trim() || store.template.demoTagline) && (
              <p className="mt-2 max-w-prose text-sm opacity-95">
                {store.tagline?.trim() || store.template.demoTagline}
              </p>
            )}
          </div>
        </div>
      </header>
      <div className="grid gap-3 p-4 sm:grid-cols-3 bg-earth-50">
        {products.map((p) => (
          <div key={p.id} className="rounded-lg bg-white p-3 shadow-sm border border-earth-800/5">
            {p.images?.[0] && (
              <div className="-mx-1 -mt-1 mb-2 aspect-[4/3] overflow-hidden rounded-md bg-earth-100">
                <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
              </div>
            )}
            <p className="font-medium text-earth-950 line-clamp-2">{p.title}</p>
            <p className="mt-2 text-sm text-jade-800">{p.price}</p>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-earth-800/70 col-span-full">Add products to see them here.</p>
        )}
      </div>
    </div>
  );
}
