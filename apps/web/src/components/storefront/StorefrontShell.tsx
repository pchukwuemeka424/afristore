'use client';

import Link from 'next/link';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { AddToCartButton } from '@/components/storefront/AddToCartButton';
import { StorefrontCartLink } from '@/components/storefront/StorefrontCartLink';
import { BookingModal } from '@/components/storefront/BookingModal';

type Store = {
  name: string;
  slug: string;
  niche: string;
  currency: string;
  brandColor: string;
  logoUrl?: string | null;
  tagline?: string | null;
  siteDescription?: string | null;
  template: { demoTagline: string | null; slug: string };
  sectionTemplate?: string | null;
  templateMenu?: string[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  heroAlign?: 'left' | 'center' | 'right';
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: string | number;
  currency: string;
  images?: string[];
  stock?: number;
};

type LP = { store: Store; products: Product[]; tagline: string; accent: string };

function menuItems(store: Store, defaults: string[]) {
  const custom = (store.templateMenu ?? []).map((i) => i.trim()).filter(Boolean);
  return custom.length ? custom : defaults;
}

function heroText(store: Store, fallback: string) {
  return {
    title: store.heroTitle?.trim() || store.name,
    subtitle: store.heroSubtitle?.trim() || fallback,
  };
}

function getHeroAlign(store: Store): 'left' | 'center' | 'right' {
  return store.heroAlign === 'center' || store.heroAlign === 'right' ? store.heroAlign : 'left';
}

function heroAlignClass(align: 'left' | 'center' | 'right') {
  if (align === 'center') return { text: 'text-center', layout: 'mx-auto items-center' };
  if (align === 'right') return { text: 'text-right', layout: 'ml-auto items-end' };
  return { text: 'text-left', layout: 'items-start' };
}

function Img({ src, alt, cls }: { src?: string; alt: string; cls?: string }) {
  return src
    ? <img src={src} alt={alt} className={`object-cover ${cls ?? ''}`} />
    : <div className={`bg-gray-100 flex items-center justify-center text-xs text-gray-400 ${cls ?? ''}`}>No image</div>;
}

function FooterBar({ store }: { store: Store }) {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-400">
      {store.siteDescription?.trim() && (
        <p className="mx-auto mb-4 max-w-2xl text-gray-500">{store.siteDescription.trim()}</p>
      )}
      <p>Powered by AfriStore &middot; {store.slug}</p>
    </footer>
  );
}

/* ====================================================================
   1. ng-ecom-mega  —  Mega store (like reference image 1)
   Top utility bar, logo + search + account, category nav, hero slider, SALE product cards
   ==================================================================== */
function EcomMega({ store, products, tagline, accent }: LP) {
  const nav = menuItems(store, ['HOME', 'ABOUT', 'MOBILE', 'HEADPHONE', 'CLOTHES', 'SHOES', 'WATCHES', 'BLOG', 'CONTACT US']);
  const hero = heroText(store, tagline);
  const align = heroAlignClass(getHeroAlign(store));
  return (
    <div className="min-h-screen bg-white">
      {/* Top utility bar */}
      <div className="text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>CALL NOW: 0123-444-5678</span>
          </div>
          <div className="hidden sm:flex gap-4">
            <span>Support</span><span>Store Locator</span><span>Free Shipping</span>
          </div>
        </div>
      </div>
      {/* Logo + Search + Account */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {store.logoUrl && <img src={store.logoUrl} alt="" className="h-10 w-auto" />}
            {!store.logoUrl && <span className="text-2xl font-extrabold" style={{ color: accent }}>{store.name}</span>}
          </div>
          <div className="hidden sm:flex items-center flex-1 max-w-lg mx-8">
            <select className="rounded-l-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              <option>All Categories</option>
            </select>
            <input className="flex-1 border-y border-gray-300 px-4 py-2.5 text-sm" placeholder="Search your product..." />
            <button className="rounded-r-lg px-4 py-2.5 text-white" style={{ backgroundColor: accent }}>
              <span>🔍</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">👤</div>
            <span className="hidden sm:inline text-sm text-gray-600">My Account</span>
          </div>
        </div>
      </div>
      {/* Category nav */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6">
          <nav className="flex gap-1 overflow-x-auto py-0">
            {nav.map((c) => (
              <span key={c} className="shrink-0 px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 hover:text-gray-900 cursor-pointer border-b-2 border-transparent hover:border-current">{c}</span>
            ))}
          </nav>
          <div className="shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>
            <span>Cart Item</span>
            <span>🛒</span>
          </div>
        </div>
      </div>
      {/* Hero slider */}
      <section
        className="relative"
        style={
          store.heroImageUrl
            ? {
                backgroundImage: `url(${store.heroImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor: accent + '08' }
        }
      >
        {store.heroImageUrl && <div className="absolute inset-0 bg-black/45" />}
        <div className="relative mx-auto max-w-6xl flex min-h-[520px] items-center px-6 py-16 sm:min-h-[620px] sm:py-20">
          <button className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-500 flex items-center justify-center text-xl hover:bg-gray-50">‹</button>
          <div className={`flex-1 max-w-lg flex flex-col ${align.layout} ${align.text}`}>
            <p className="text-sm italic text-gray-500">{store.tagline?.trim() ? 'Our store' : 'Welcome to'}</p>
            <h1 className={`mt-2 text-3xl font-extrabold uppercase leading-tight sm:text-4xl ${store.heroImageUrl ? 'text-white' : 'text-gray-900'}`}>
              {hero.title}
            </h1>
            <p className={`mt-3 ${store.heroImageUrl ? 'text-white/90' : 'text-gray-500'}`}>{hero.subtitle}</p>
            <button className="mt-6 rounded-lg border-2 px-8 py-3 text-sm font-bold uppercase tracking-wider" style={{ borderColor: accent, color: accent }}>
              Shop Now
            </button>
          </div>
          <div className="hidden sm:block flex-1">
            {!store.heroImageUrl && (products[0]?.images?.[0] ? (
              <img src={products[0].images?.[0]} alt="" className="mx-auto h-64 w-auto object-contain" />
            ) : (
              <div className="mx-auto h-64 w-64 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">🎧</div>
            ))}
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-500 flex items-center justify-center text-xl hover:bg-gray-50">›</button>
        </div>
      </section>
      {/* "SHOP NEW COLLECTION" heading */}
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="h-px w-16 bg-gray-300" />
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">Shop New Collection</h2>
        <div className="h-px w-16 bg-gray-300" />
      </div>
      {/* Product grid with SALE badges */}
      <main className="mx-auto max-w-6xl px-6 pb-12">
        {products.length === 0 ? (
          <p className="py-12 text-center text-gray-400">Products coming soon.</p>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <article key={p.id} className="group relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                <span className="absolute top-3 right-3 z-10 rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>SALE</span>
                <Link href={`/s/${store.slug}/products/${p.id}`} className="block">
                  <Img src={p.images?.[0]} alt={p.title} cls="aspect-[3/4] w-full" />
                </Link>
                <div className="p-4">
                  <Link href={`/s/${store.slug}/products/${p.id}`} className="hover:underline">
                    <h3 className="text-sm text-gray-700 line-clamp-1">{p.title}</h3>
                  </Link>
                  <p className="mt-1 text-base font-bold" style={{ color: accent }}>{p.price} {p.currency}</p>
                  <AddToCartButton product={p} className="mt-3 w-full text-xs rounded-none border-2 bg-transparent hover:text-white" label="ADD TO CART" />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      {/* Dark footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        {store.siteDescription?.trim() && <p className="mx-auto mb-4 max-w-2xl text-gray-500">{store.siteDescription.trim()}</p>}
        <p>Powered by AfriStore &middot; {store.slug}</p>
      </footer>
    </div>
  );
}

/* ====================================================================
   2. ng-ecom-flat  —  Flat commerce (like reference image 2)
   Utility bar, logo + cart, tabbed nav, hero banner, filter tabs, product grid
   ==================================================================== */
function EcomFlat({ store, products, tagline, accent }: LP) {
  const nav = menuItems(store, ['HOME', 'SLIDERS', 'SHOP', 'PORTFOLIO', 'PAGES', 'BLOG', 'FEATURES', 'CONTACT']);
  const hero = heroText(store, tagline);
  const align = heroAlignClass(getHeroAlign(store));
  return (
    <div className="min-h-screen bg-white">
      {/* Utility bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-1.5 text-xs text-gray-500">
          <span>Welcome visitor! <span className="underline cursor-pointer" style={{ color: accent }}>Log in</span> or <span className="underline cursor-pointer" style={{ color: accent }}>Create an Account</span></span>
          <div className="hidden sm:flex gap-4">
            <span>My Account</span><span>Orders List</span><span>Wishlist</span><span>Checkout</span>
          </div>
        </div>
      </div>
      {/* Logo + icons + cart */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="" className="h-10 w-auto max-w-[140px] object-contain" />
            ) : null}
            {!store.logoUrl && <span className="text-2xl font-extrabold text-gray-800">{store.name}</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">♡</div>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">🔄</div>
            <span className="text-sm text-gray-500">English</span>
            <span className="text-sm text-gray-500">{store.currency}</span>
            <div className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>
              <span>🛒</span>
              <span>Cart</span>
            </div>
          </div>
        </div>
      </div>
      {/* Tabbed nav */}
      <nav className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl flex">
          {nav.map((t, i) => (
            <span
              key={t}
              className="px-5 py-3 text-xs font-semibold tracking-wide cursor-pointer"
              style={i === 0 ? { backgroundColor: accent, color: 'white' } : { color: '#666' }}
            >{t}</span>
          ))}
          <span className="ml-auto px-4 py-3 text-gray-400 cursor-pointer">🔍</span>
        </div>
      </nav>
      {/* Hero banner */}
      <section
        className="relative"
        style={
          store.heroImageUrl
            ? {
                backgroundImage: `url(${store.heroImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor: '#f3f4f6' }
        }
      >
        {store.heroImageUrl && <div className="absolute inset-0 bg-black/45" />}
        <div className={`relative mx-auto max-w-6xl min-h-[500px] px-6 py-20 sm:min-h-[600px] sm:py-24 flex flex-col ${align.layout} ${align.text}`}>
          <h1 className={`text-5xl font-extrabold uppercase ${store.heroImageUrl ? 'text-white' : 'text-gray-800'}`}>{hero.title}</h1>
          <p className={`mt-2 text-2xl font-bold ${store.heroImageUrl ? 'text-white/90' : 'text-gray-600'}`}>{hero.subtitle}</p>
          <button className="mt-6 rounded-lg px-8 py-3 text-sm font-bold uppercase text-white" style={{ backgroundColor: accent }}>
            Shop Now
          </button>
        </div>
      </section>
      {/* Filter tabs */}
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 uppercase">All Products</h2>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {['ALL', 'FEATURED', 'NEW', 'SPECIALS', 'HIT', 'RANDOM', 'RATED'].map((f, i) => (
            <span
              key={f}
              className="shrink-0 rounded-full border px-5 py-2 text-xs font-semibold cursor-pointer"
              style={i === 0 ? { borderColor: accent, color: accent, backgroundColor: accent + '10' } : { borderColor: '#e5e7eb', color: '#666' }}
            >{f}</span>
          ))}
        </div>
      </div>
      {/* Product grid */}
      <main className="mx-auto max-w-6xl px-6 pb-12">
        {products.length === 0 ? (
          <p className="py-12 text-center text-gray-400">Products coming soon.</p>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <article key={p.id} className="group relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                {i < 2 && (
                  <span className="absolute top-3 left-3 z-10 rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: i === 0 ? accent : '#f59e0b' }}>
                    {i === 0 ? 'HOT' : 'SALE'}
                  </span>
                )}
                <Link href={`/s/${store.slug}/products/${p.id}`} className="block">
                  <Img src={p.images?.[0]} alt={p.title} cls="aspect-[3/4] w-full" />
                </Link>
                <div className="p-4">
                  <Link href={`/s/${store.slug}/products/${p.id}`} className="hover:underline">
                    <h3 className="text-sm text-gray-700 line-clamp-1">{p.title}</h3>
                  </Link>
                  <p className="mt-1 text-base font-bold" style={{ color: accent }}>{p.price} {p.currency}</p>
                  <AddToCartButton product={p} className="mt-3 w-full text-xs" />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   3. ng-ecom-classic  —  Classic shop (like reference image 3)
   Header + social, colored nav + cart, sidebar layout, product grid + ratings
   ==================================================================== */
function EcomClassic({ store, products, tagline, accent }: LP) {
  const nav = menuItems(store, ['Home', 'Gallery', 'Blog', 'Shop', 'Shortcodes', 'About']);
  const hero = heroText(store, tagline);
  const align = heroAlignClass(getHeroAlign(store));
  return (
    <div className="min-h-screen bg-white">
      {/* Header + social icons */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="" className="h-10 w-auto max-w-[140px] object-contain" />
            ) : null}
            <div className={align.text}>
              <h1 className="text-2xl font-extrabold text-gray-800">{hero.title}</h1>
              <p className="text-sm text-gray-400">{hero.subtitle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['f', 't', 'in', 'yt', 'rss'].map((s) => (
              <div key={s} className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">{s}</div>
            ))}
          </div>
        </div>
      </div>
      {/* Colored nav bar */}
      <nav className="text-white" style={{ backgroundColor: accent }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6">
          <div className="flex">
            {nav.map((n) => (
              <span key={n} className="px-4 py-3 text-sm font-medium hover:bg-white/10 cursor-pointer">{n}</span>
            ))}
          </div>
          <div className="flex items-center gap-1 px-4 py-3 text-sm">
            <span>🛒</span>
            <StorefrontCartLink storeSlug={store.slug} />
          </div>
        </div>
      </nav>
      {/* Hero background strip */}
      {store.heroImageUrl && (
        <section
          className="relative h-72 sm:h-96"
          style={{
            backgroundImage: `url(${store.heroImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/45" />
        </section>
      )}
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-6 py-3 text-xs text-gray-400">
        Home / Shop
      </div>
      {/* Two-column layout */}
      <div className="mx-auto max-w-6xl px-6 pb-12 flex gap-8">
        {/* Main product area */}
        <div className="flex-[3]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Shop</h2>
            <select className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-500">
              <option>Default sorting</option>
            </select>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-400">Products coming soon.</p>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
              {products.map((p, i) => (
                <article key={p.id} className="group relative hover:shadow-lg transition">
                  {i === 0 && (
                    <span className="absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>Sale!</span>
                  )}
                  <Link href={`/s/${store.slug}/products/${p.id}`} className="block">
                    <Img src={p.images?.[0]} alt={p.title} cls="aspect-square w-full rounded-t-lg" />
                  </Link>
                  <div className="p-3 border border-t-0 border-gray-200 rounded-b-lg">
                    <Link href={`/s/${store.slug}/products/${p.id}`} className="hover:underline" style={{ color: accent }}>
                      <h3 className="text-sm font-medium">{p.title}</h3>
                    </Link>
                    {/* Star ratings */}
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-xs" style={{ color: s <= 3 + (i % 3) ? '#fbbf24' : '#d1d5db' }}>★</span>
                      ))}
                    </div>
                    <p className="mt-1 text-base font-bold" style={{ color: accent }}>{p.price} {p.currency}</p>
                    <AddToCartButton product={p} className="mt-2 w-full text-xs" label="Add to cart" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        {/* Sidebar */}
        <aside className="hidden lg:block flex-1 space-y-6">
          {/* Search */}
          <div className="flex">
            <input className="flex-1 rounded-l border border-gray-300 px-3 py-2 text-sm" placeholder="Search..." />
            <button className="rounded-r px-3 py-2 text-white" style={{ backgroundColor: accent }}>🔍</button>
          </div>
          {/* Popular / Recent tabs */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <span className="flex-1 py-2 text-center text-xs font-semibold" style={{ color: accent, borderBottom: `2px solid ${accent}` }}>POPULAR</span>
              <span className="flex-1 py-2 text-center text-xs font-semibold text-gray-400">RECENT</span>
            </div>
            <div className="p-3 space-y-3">
              {products.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="flex gap-3 hover:bg-gray-50 rounded p-1 transition">
                  <Img src={p.images?.[0]} alt={p.title} cls="h-12 w-12 rounded shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-gray-800">{p.title}</h4>
                    <p className="text-[10px] text-gray-400">{p.price} {p.currency}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {/* Products list */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Products</h3>
            {products.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 text-sm hover:bg-gray-50">
                <span style={{ color: accent }}>{p.title}</span>
                <span className="text-gray-500">{p.price} {p.currency}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   4. ng-biz-corporate  —  Corporate presence
   Preview: colored logo nav | hero CTA | 3 service circles | 3 team avatars | footer
   ==================================================================== */
function BizCorporate({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <div className="hidden sm:flex gap-5 text-sm text-gray-500">
          <span>Home</span><span>Services</span><span>About</span>
        </div>
        <StorefrontCartLink storeSlug={store.slug} variant="dark" />
      </nav>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-xl px-8 py-14" style={{ backgroundColor: accent + '08' }}>
          <h1 className="text-3xl font-bold" style={{ color: accent }}>{store.name}</h1>
          <p className="mt-2 text-gray-500 max-w-lg">{tagline}</p>
          <button className="mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Get in touch</button>
        </div>
      </section>
      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Services</h2>
        {products.length === 0 ? (
          <p className="text-gray-400">Services coming soon.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 p-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: accent + '20' }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="text-lg" style={{ color: accent }}>★</span>}
                </div>
                <h3 className="mt-3 font-semibold text-gray-800">{p.title}</h3>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{p.description}</p>
                <AddToCartButton product={p} className="mt-3" label="Enquire" />
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Team */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Our team</h2>
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-gray-100" />
              <div className="mt-2 text-sm text-gray-400">Team member</div>
            </div>
          ))}
        </div>
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   4. ng-biz-startup  —  Startup landing
   Preview: logo + CTA button | centered hero + signup | 3 feature cards | 3 pricing cols | footer
   ==================================================================== */
function BizStartup({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <button className="rounded-full border px-5 py-1.5 text-sm font-medium" style={{ borderColor: accent, color: accent }}>Sign up</button>
      </nav>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-xl px-8 py-16 text-center" style={{ backgroundColor: accent + '06' }}>
          <h1 className="text-4xl font-extrabold" style={{ color: accent }}>{store.name}</h1>
          <p className="mx-auto mt-3 max-w-lg text-gray-500">{tagline}</p>
          <button className="mt-6 rounded-full px-8 py-3 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Get started free</button>
        </div>
      </section>
      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        {products.length === 0 ? (
          <p className="text-center text-gray-400">Features coming soon.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 p-5">
                <div className="h-8 w-8 rounded" style={{ backgroundColor: accent + '25' }} />
                <h3 className="mt-3 font-semibold text-gray-800">{p.title}</h3>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{p.description}</p>
                <AddToCartButton product={p} className="mt-3" />
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Pricing */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <div className="grid grid-cols-3 gap-3">
          {['Basic', 'Pro', 'Business'].map((t) => (
            <div key={t} className="rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-xs text-gray-400">{t}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: accent }}>—</p>
              <p className="mt-1 text-xs text-gray-400">Contact for pricing</p>
            </div>
          ))}
        </div>
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   5. ng-rest-dine  —  Full restaurant template
   Top contact bar, nav with Reserve CTA, dark hero with booking button,
   menu categories with food images & prices, About section, booking modal, footer
   ==================================================================== */
function RestDine({ store, products, tagline, accent }: LP) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const nav = menuItems(store, ['Home', 'Menu', 'Services', 'Gallery', 'Contact Us']);
  const hero = heroText(store, tagline);
  const categories = ['Starter', 'Soup', 'Main Course', 'Grills', 'Drinks', 'Dessert'];
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      <BookingModal storeSlug={store.slug} accent={accent} open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* Top contact bar */}
      <div className="text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Mon to Fri: 10:00-22:00 | Sat-Sun: 10:00-23:00
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {store.siteDescription?.trim()?.slice(0, 40) || 'Find us on the map'}
            </span>
            {store.whatsappPhone && (
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                +{store.whatsappPhone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="" className="h-10 w-auto" />
            ) : (
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: accent }}>
                {store.name}
              </h1>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <span key={n} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer rounded-lg hover:bg-gray-50 transition">{n}</span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <StorefrontCartLink storeSlug={store.slug} variant="dark" />
            <button
              onClick={() => setBookingOpen(true)}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 shadow-lg"
              style={{ backgroundColor: accent }}
            >
              Reserve Table
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section
        className="relative overflow-hidden"
        style={
          store.heroImageUrl
            ? { backgroundImage: `url(${store.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 50%, ${accent}99 100%)` }
        }
      >
        {store.heroImageUrl && <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />}
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-32 lg:py-40">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/70">Welcome to</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              {hero.title}
            </h2>
            <p className="mt-4 text-lg text-white/85 leading-relaxed">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setBookingOpen(true)}
                className="rounded-lg border-2 border-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-gray-900"
              >
                Reserve Your Table
              </button>
              <a
                href="#menu"
                className="rounded-lg px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-80"
                style={{ backgroundColor: accent }}
              >
                See Our Menu
              </a>
            </div>
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="h-3 w-3 rounded-full bg-white/40" />
          <span className="h-3 w-3 rounded-full bg-white/40" />
        </div>
      </section>

      {/* Menu section */}
      <section id="menu" className="scroll-mt-20 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Our Specialties</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Restaurant Menu</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full" style={{ backgroundColor: accent }} />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((c, i) => (
              <button
                key={c}
                onClick={() => setActiveCat(i)}
                className="rounded-full px-5 py-2 text-sm font-semibold transition"
                style={
                  activeCat === i
                    ? { backgroundColor: accent, color: 'white' }
                    : { backgroundColor: '#f3f4f6', color: '#4b5563' }
                }
              >
                {c}
              </button>
            ))}
          </div>

          {/* Menu grid — 3 columns */}
          {products.length === 0 ? (
            <p className="py-16 text-center text-gray-400">Menu coming soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/s/${store.slug}/products/${p.id}`}
                  className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:shadow-lg hover:border-gray-200"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Img src={p.images?.[0]} alt={p.title} cls="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{p.title}</h3>
                      <span className="shrink-0 text-lg font-extrabold" style={{ color: accent }}>
                        {store.currency === 'NGN' ? '₦' : '$'}{Number(p.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{p.description || 'Spicy with garlic'}</p>
                    <div className="mt-2">
                      <AddToCartButton product={p} label="Order" className="text-xs px-3 py-1.5 rounded-full" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About / CTA section */}
      <section className="py-16" style={{ backgroundColor: accent + '08' }}>
        <div className="mx-auto max-w-6xl px-6 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>About Our Restaurant</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">The Perfect Space To Enjoy Fantastic Food</h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              {store.siteDescription?.trim() || 'We believe in using the very best produce, sourced locally and prepared with passion. Our chefs create dishes that celebrate bold flavors and fresh ingredients.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => setBookingOpen(true)}
                className="rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                Book a Table
              </button>
              {store.whatsappPhone && (
                <a
                  href={`https://wa.me/${store.whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border-2 px-6 py-3 text-sm font-bold transition hover:bg-gray-50"
                  style={{ borderColor: accent, color: accent }}
                >
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(products.length > 0 ? products.slice(0, 4) : [null, null, null, null]).map((p, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                {p?.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly specials badge area */}
      {products.length > 0 && (
        <section className="py-12 bg-gray-900 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold">Today&apos;s Specials</h2>
              <p className="mt-1 text-gray-400">Chef&apos;s recommendations for today</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="group flex items-center gap-4 rounded-xl border border-gray-700 bg-gray-800/50 p-4 transition hover:border-gray-500">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Img src={p.images?.[0]} alt={p.title} cls="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white line-clamp-1">{p.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-400 line-clamp-1">{p.description}</p>
                  </div>
                  <div className="shrink-0 rounded-full px-3 py-1.5 text-sm font-extrabold text-white" style={{ backgroundColor: accent }}>
                    {store.currency === 'NGN' ? '₦' : '$'}{Number(p.price).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-bold text-white">{store.name}</h3>
              <p className="mt-3 text-sm leading-relaxed">{store.siteDescription?.trim()?.slice(0, 120) || 'Delicious food crafted with love.'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Opening Hours</h4>
              <p className="text-sm">Mon - Fri: 10:00 - 22:00</p>
              <p className="text-sm mt-1">Sat - Sun: 10:00 - 23:00</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                {nav.slice(0, 4).map((n) => (
                  <p key={n} className="hover:text-white cursor-pointer transition">{n}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              {store.whatsappPhone && <p className="text-sm">Phone: +{store.whatsappPhone}</p>}
              <button
                onClick={() => setBookingOpen(true)}
                className="mt-4 rounded-lg px-5 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: accent }}
              >
                Reserve Now
              </button>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            Powered by AfriStore &middot; {store.slug}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ====================================================================
   6. ng-rest-catering  —  Catering & food delivery (Foodie-style)
   Social bar, nav with login/register + Reserve CTA, hero with booking form,
   about section, food categories, packages, gallery, footer
   ==================================================================== */
function RestCatering({ store, products, tagline, accent }: LP) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const nav = menuItems(store, ['Home', 'Menus', 'Shop', 'News', 'Pages', 'Contact']);
  const hero = heroText(store, tagline);

  return (
    <div className="min-h-screen bg-white">
      <BookingModal storeSlug={store.slug} accent={accent} open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* Top social / utility bar */}
      <div className="bg-gray-900 text-gray-300 text-xs">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            {store.whatsappPhone && (
              <span className="flex items-center gap-1.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                +{store.whatsappPhone}
              </span>
            )}
            <span className="hidden sm:inline">info@{store.slug}.store</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>Facebook</span><span>Instagram</span><span>Youtube</span>
            <span className="border-l border-gray-600 pl-4 ml-2">Login / Register</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-30 bg-white shadow-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="" className="h-10 w-auto" />
            ) : (
              <h1 className="text-2xl font-extrabold" style={{ color: accent }}>{store.name}</h1>
            )}
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <span key={n} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer transition">{n}</span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <StorefrontCartLink storeSlug={store.slug} variant="dark" />
            <button
              onClick={() => setBookingOpen(true)}
              className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 shadow-lg"
              style={{ backgroundColor: accent }}
            >
              Reserve a Table
            </button>
          </div>
        </div>
      </header>

      {/* Hero with dark background + inline booking form */}
      <section
        className="relative"
        style={
          store.heroImageUrl
            ? { backgroundImage: `url(${store.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `linear-gradient(to right, ${accent}ee, ${accent}88)` }
        }
      >
        {store.heroImageUrl && <div className="absolute inset-0 bg-black/65" />}
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-36">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Left: text */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">Hello &amp; Welcome</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Welcome to<br />{hero.title}
              </h2>
              <p className="mt-4 max-w-md text-white/80 leading-relaxed">{hero.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#menu" className="rounded-lg px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90" style={{ backgroundColor: accent }}>
                  See Our Menus
                </a>
                <button onClick={() => setBookingOpen(true)} className="flex items-center gap-2 rounded-lg border-2 border-white/40 px-7 py-3.5 text-sm font-bold text-white transition hover:border-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Book a Table
                </button>
              </div>
            </div>
            {/* Right: quick booking form */}
            <div className="hidden lg:block rounded-2xl p-8 text-white" style={{ backgroundColor: accent }}>
              <h3 className="text-xl font-bold">Book a Table</h3>
              <p className="mt-1 text-sm text-white/80">Quick reservation</p>
              <div className="mt-5 space-y-3">
                <input placeholder="Your Name" className="w-full rounded-lg bg-white/20 px-4 py-2.5 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40" />
                <input placeholder="Email" className="w-full rounded-lg bg-white/20 px-4 py-2.5 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="rounded-lg bg-white/20 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-white/40" />
                  <select className="rounded-lg bg-white/20 px-4 py-2.5 text-sm text-white/80 focus:outline-none">
                    <option>2 People</option>
                    <option>4 People</option>
                    <option>6 People</option>
                    <option>8+ People</option>
                  </select>
                </div>
                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full rounded-lg bg-white py-3 text-sm font-bold transition hover:bg-gray-100"
                  style={{ color: accent }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-6 grid gap-10 lg:grid-cols-2 items-center">
          {/* Left: image collage */}
          <div className="grid grid-cols-2 gap-3">
            {(products.length > 0 ? products.slice(0, 4) : [null, null, null, null]).map((p, i) => (
              <div key={i} className={`overflow-hidden rounded-xl bg-gray-100 ${i === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'}`}>
                {p?.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
          {/* Right: text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>What We Offer</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">About Our Restaurant</h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              {store.siteDescription?.trim() || 'Our chefs bring years of experience and a passion for creating dishes that celebrate local flavors. Every meal is prepared fresh using the finest ingredients.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { icon: '🍽', label: 'Expert Chefs' },
                { icon: '🚚', label: 'Fast Delivery' },
                { icon: '🌿', label: 'Fresh Ingredients' },
                { icon: '⭐', label: 'Top Rated' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menu / packages */}
      <section id="menu" className="scroll-mt-20 py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Our Menu</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Catering Packages</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full" style={{ backgroundColor: accent }} />
          </div>

          {products.length === 0 ? (
            <p className="py-16 text-center text-gray-400">Packages coming soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <article key={p.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition">
                  <Link href={`/s/${store.slug}/products/${p.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Img src={p.images?.[0]} alt={p.title} cls="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-3 right-3 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg" style={{ backgroundColor: accent }}>
                        {store.currency === 'NGN' ? '₦' : '$'}{Number(p.price).toLocaleString()}
                      </div>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/s/${store.slug}/products/${p.id}`} className="hover:underline">
                      <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{p.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <AddToCartButton product={p} label="Add to Order" className="text-sm font-semibold" />
                      <button
                        onClick={() => setBookingOpen(true)}
                        className="text-sm font-semibold transition hover:underline"
                        style={{ color: accent }}
                      >
                        Book →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 text-white text-center" style={{ backgroundColor: accent }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-extrabold">Ready to Host Your Event?</h2>
          <p className="mt-3 text-white/80">Let us handle the food while you enjoy the moment. Custom menus available for any occasion.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setBookingOpen(true)}
              className="rounded-lg border-2 border-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-gray-900"
            >
              Book Now
            </button>
            {store.whatsappPhone && (
              <a
                href={`https://wa.me/${store.whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider transition hover:bg-gray-100"
                style={{ color: accent }}
              >
                WhatsApp Order
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-bold text-white">{store.name}</h3>
              <p className="mt-3 text-sm leading-relaxed">{store.siteDescription?.trim()?.slice(0, 120) || 'Premium catering for every occasion.'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                {nav.slice(0, 4).map((n) => (
                  <p key={n} className="hover:text-white cursor-pointer transition">{n}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Services</h4>
              <div className="space-y-2 text-sm">
                <p>Private Dining</p><p>Corporate Events</p><p>Weddings</p><p>Takeaway</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              {store.whatsappPhone && <p className="text-sm">+{store.whatsappPhone}</p>}
              <p className="text-sm mt-1">info@{store.slug}.store</p>
              <button
                onClick={() => setBookingOpen(true)}
                className="mt-4 rounded-lg px-5 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: accent }}
              >
                Reserve Now
              </button>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            Powered by AfriStore &middot; {store.slug}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ====================================================================
   7. ng-faith-church  —  Church & ministry
   Preview: logo + 3 nav | hero banner | service times (3 rows with dots) | sermons + giving side by side | footer
   ==================================================================== */
function FaithChurch({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <div className="hidden sm:flex gap-5 text-sm text-gray-500">
          <span>Home</span><span>Sermons</span><span>Give</span>
        </div>
        <StorefrontCartLink storeSlug={store.slug} variant="dark" />
      </nav>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-xl px-8 py-10" style={{ backgroundColor: accent + '08' }}>
          <h1 className="text-3xl font-bold" style={{ color: accent }}>{store.name}</h1>
          <p className="mt-2 text-gray-500 max-w-lg">{tagline}</p>
        </div>
      </section>
      {/* Service times */}
      <section className="mx-auto max-w-6xl px-6 py-4">
        <div className="rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: accent }}>Service times</h2>
          {[{ d: 'Sunday', t: '8:00 AM & 10:30 AM' }, { d: 'Wednesday', t: '6:00 PM' }, { d: 'Friday', t: '7:00 PM' }].map((s) => (
            <div key={s.d} className="flex items-center gap-3 py-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: accent + '40' }} />
              <span className="text-sm text-gray-600">{s.d} — {s.t}</span>
            </div>
          ))}
        </div>
      </section>
      {/* Sermons + Giving side by side */}
      <section className="mx-auto max-w-6xl px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Sermons &amp; resources</h2>
          {products.length === 0 ? (
            <p className="text-sm text-gray-400">Coming soon.</p>
          ) : (
            <div className="space-y-2">
              {products.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="block rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition">
                  <h3 className="text-sm font-medium text-gray-800">{p.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{p.price} {p.currency}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 p-5 text-center flex flex-col items-center justify-center">
          <h2 className="text-sm font-bold text-gray-700">Giving portal</h2>
          <div className="mt-4 rounded-lg px-10 py-6" style={{ backgroundColor: accent + '18' }}>
            <button className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Give now</button>
          </div>
        </div>
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   8. ng-faith-mosque  —  Mosque & community
   Preview: logo nav | hero | 5-col prayer times grid | events + classes side by side | footer
   ==================================================================== */
function FaithMosque({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <StorefrontCartLink storeSlug={store.slug} variant="dark" />
      </nav>
      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-xl px-8 py-10" style={{ backgroundColor: accent + '08' }}>
          <h1 className="text-3xl font-bold" style={{ color: accent }}>{store.name}</h1>
          <p className="mt-2 text-gray-500">{tagline}</p>
        </div>
      </section>
      {/* Prayer times — 5 columns */}
      <section className="mx-auto max-w-4xl px-6 py-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-lg font-bold mb-4" style={{ color: accent }}>Prayer times</h2>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[{ n: 'Fajr', t: '5:30 AM' }, { n: 'Dhuhr', t: '1:15 PM' }, { n: 'Asr', t: '4:30 PM' }, { n: 'Maghrib', t: '6:45 PM' }, { n: 'Isha', t: '8:15 PM' }].map((s) => (
              <div key={s.n} className="rounded-lg bg-gray-50 py-3">
                <p className="text-xs text-gray-400">{s.n}</p>
                <p className="mt-1 text-sm font-bold" style={{ color: accent }}>{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Events + Classes */}
      <section className="mx-auto max-w-4xl px-6 py-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Events</h2>
          {products.slice(0, 2).map((p) => (
            <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="block rounded-lg bg-gray-50 p-3 mb-2 hover:bg-gray-100 transition">
              <h3 className="text-sm font-medium text-gray-800">{p.title}</h3>
            </Link>
          ))}
          {products.length === 0 && <p className="text-sm text-gray-400">Coming soon.</p>}
        </div>
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Classes</h2>
          {products.slice(2, 4).map((p) => (
            <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="block rounded-lg bg-gray-50 p-3 mb-2 hover:bg-gray-100 transition">
              <h3 className="text-sm font-medium text-gray-800">{p.title}</h3>
            </Link>
          ))}
          {products.length <= 2 && <p className="text-sm text-gray-400">Coming soon.</p>}
        </div>
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   9. ng-fashion-boutique  —  Boutique storefront
   Preview: logo + 2 navs + cart | lookbook hero (img + text) | arrivals carousel | 2×2 product grid | footer
   ==================================================================== */
function FashionBoutique({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <div className="hidden sm:flex gap-5 text-sm text-gray-500">
          <span>New in</span><span>Shop all</span>
        </div>
        <StorefrontCartLink storeSlug={store.slug} variant="dark" />
      </nav>
      {/* Lookbook hero */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center gap-6 rounded-xl px-6 py-6" style={{ backgroundColor: accent + '06' }}>
          <div className="h-28 w-28 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
            {products[0]?.images?.[0] && <img src={products[0].images[0]} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: accent }}>{store.name}</h1>
            <p className="mt-1 text-gray-500">{tagline}</p>
            <button className="mt-3 rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Shop collection</button>
          </div>
        </div>
      </section>
      {/* New arrivals carousel */}
      <section className="mx-auto max-w-6xl px-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">New arrivals</h2>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {products.slice(0, 6).map((p) => (
            <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="w-36 shrink-0 block">
              <Img src={p.images?.[0]} alt={p.title} cls="aspect-[3/4] w-full rounded-lg" />
              <h3 className="mt-1 text-xs text-gray-600 line-clamp-1">{p.title}</h3>
            </Link>
          ))}
        </div>
      </section>
      {/* Product grid */}
      <main className="mx-auto max-w-6xl px-6 py-6">
        {products.length === 0 ? (
          <p className="py-12 text-center text-gray-400">Products coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="rounded-xl border border-gray-100 bg-gray-50 p-2 block hover:shadow-md transition">
                <Img src={p.images?.[0]} alt={p.title} cls="aspect-square w-full rounded-lg" />
                <h3 className="mt-2 text-sm font-medium text-gray-800 line-clamp-1">{p.title}</h3>
                <p className="mt-0.5 text-sm font-bold" style={{ color: accent }}>{p.price} {p.currency}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   10. ng-fashion-brand  —  Brand showcase
   Preview: logo + 3 navs | centered brand hero | story (img + text) | 3-col collections | footer
   ==================================================================== */
function FashionBrand({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <div className="hidden sm:flex gap-5 text-sm text-gray-500">
          <span>Story</span><span>Collections</span><span>Press</span>
        </div>
        <StorefrontCartLink storeSlug={store.slug} variant="dark" />
      </nav>
      {/* Brand hero */}
      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-xl px-8 py-14 text-center" style={{ backgroundColor: accent + '06' }}>
          <h1 className="text-4xl font-extrabold" style={{ color: accent }}>{store.name}</h1>
          <p className="mx-auto mt-3 max-w-md text-gray-500">{tagline}</p>
        </div>
      </section>
      {/* Story — image + text */}
      <section className="mx-auto max-w-6xl px-6 py-6 flex gap-6">
        <div className="h-28 w-40 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
          {products[0]?.images?.[0] && <img src={products[0].images[0]} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="text-sm text-gray-500 leading-relaxed space-y-1">
          <p>{store.siteDescription?.trim() || 'Born from a passion for African craftsmanship and modern design.'}</p>
        </div>
      </section>
      {/* Collections */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Collections</h2>
        {products.length === 0 ? (
          <p className="text-gray-400">Coming soon.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {products.slice(0, 6).map((p) => (
              <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="block">
                <Img src={p.images?.[0]} alt={p.title} cls="aspect-[3/4] w-full rounded-lg" />
                <h3 className="mt-2 text-sm text-center font-medium text-gray-800">{p.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   11. ng-agro-farm  —  Farm-to-door
   Preview: logo + 2 navs | hero (img + text) | 3×2 produce grid (with names + price) | footer
   ==================================================================== */
function AgroFarm({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <div className="hidden sm:flex gap-5 text-sm text-gray-500">
          <span>Produce</span><span>Our farm</span>
        </div>
        <StorefrontCartLink storeSlug={store.slug} variant="dark" />
      </nav>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex gap-6 rounded-xl px-6 py-6" style={{ backgroundColor: accent + '06' }}>
          <div className="h-28 w-40 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
            {products[0]?.images?.[0] && <img src={products[0].images[0]} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: accent }}>{store.name}</h1>
            <p className="mt-1 text-gray-500 text-sm max-w-md">{tagline}</p>
          </div>
        </div>
      </section>
      {/* Produce grid */}
      <main className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Fresh stock</h2>
        {products.length === 0 ? (
          <p className="text-gray-400">Produce coming soon.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {products.map((p) => (
              <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="rounded-xl border border-gray-100 p-3 block hover:shadow-md transition">
                <Img src={p.images?.[0]} alt={p.title} cls="aspect-square w-full rounded-lg" />
                <h3 className="mt-2 text-xs text-gray-600">{p.title}</h3>
                <p className="text-sm font-bold" style={{ color: accent }}>{p.price} {p.currency}</p>
                <AddToCartButton product={p} className="mt-2 w-full text-xs" />
              </Link>
            ))}
          </div>
        )}
      </main>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   12. ng-agro-fmcg  —  FMCG distributor
   Preview: logo + CTA btn | centered hero | list rows (img + name + price) | 3 pricing tier cols | footer
   ==================================================================== */
function AgroFmcg({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <button className="rounded border px-4 py-1.5 text-sm font-medium" style={{ borderColor: accent, color: accent }}>Become a dealer</button>
      </nav>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-xl px-8 py-12 text-center" style={{ backgroundColor: accent + '06' }}>
          <h1 className="text-3xl font-bold" style={{ color: accent }}>{store.name}</h1>
          <p className="mx-auto mt-2 max-w-md text-gray-500">{tagline}</p>
        </div>
      </section>
      {/* Catalog list rows */}
      <section className="mx-auto max-w-4xl px-6 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Product catalog</h2>
        {products.length === 0 ? (
          <p className="text-gray-400">Products coming soon.</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 hover:shadow-md transition">
                <Img src={p.images?.[0]} alt={p.title} cls="h-14 w-14 shrink-0 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                </div>
                <span className="shrink-0 text-sm font-bold" style={{ color: accent }}>{p.price} {p.currency}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
      {/* Pricing tiers */}
      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          {['Retail', 'Wholesale', 'Bulk'].map((t) => (
            <div key={t} className="rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-xs text-gray-400">{t}</p>
              <p className="mt-2 text-lg font-bold" style={{ color: accent }}>—</p>
            </div>
          ))}
        </div>
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   13. ng-edu-school  —  School portal
   Preview: logo + 3 navs | hero + CTA btn | 3 programme cards | fee table + staff avatars side by side | footer
   ==================================================================== */
function EduSchool({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <div className="hidden sm:flex gap-5 text-sm text-gray-500">
          <span>Admissions</span><span>Programmes</span><span>Staff</span>
        </div>
        <StorefrontCartLink storeSlug={store.slug} variant="dark" />
      </nav>
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-xl px-8 py-10" style={{ backgroundColor: accent + '08' }}>
          <h1 className="text-3xl font-bold" style={{ color: accent }}>{store.name}</h1>
          <p className="mt-2 text-gray-500 max-w-lg">{tagline}</p>
          <button className="mt-5 rounded-lg px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Apply now</button>
        </div>
      </section>
      {/* Programmes */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Programmes</h2>
        {products.length === 0 ? (
          <p className="text-gray-400">Coming soon.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 p-5 text-center">
                <div className="mx-auto h-10 w-10 rounded flex items-center justify-center" style={{ backgroundColor: accent + '15' }}>
                  <span style={{ color: accent }}>📚</span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-800">{p.title}</h3>
                <AddToCartButton product={p} className="mt-3" label="Learn more" />
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Fee structure + staff */}
      <section className="mx-auto max-w-6xl px-6 pb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Fee structure</h2>
          {products.slice(0, 3).map((p) => (
            <div key={p.id} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{p.title}</span>
              <span className="text-sm font-bold" style={{ color: accent }}>{p.price} {p.currency}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Staff</h2>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-12 rounded-full bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   14. ng-edu-bootcamp  —  Training & bootcamp
   Preview: logo + enroll CTA | centered hero + enroll btn | 2×2 course cards (icon + name) | instructors + pricing side by side | footer
   ==================================================================== */
function EduBootcamp({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {store.logoUrl && <img src={store.logoUrl} alt="" className="h-8 w-auto" />}
          {!store.logoUrl && <span className="text-lg font-bold" style={{ color: accent }}>{store.name}</span>}
        </div>
        <button className="rounded-full px-5 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: accent }}>Enroll</button>
      </nav>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-xl px-8 py-14 text-center" style={{ backgroundColor: accent + '06' }}>
          <h1 className="text-4xl font-extrabold" style={{ color: accent }}>{store.name}</h1>
          <p className="mx-auto mt-3 max-w-lg text-gray-500">{tagline}</p>
          <button className="mt-6 rounded-full px-8 py-3 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Browse courses</button>
        </div>
      </section>
      {/* Course cards */}
      <section className="mx-auto max-w-4xl px-6 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Courses</h2>
        {products.length === 0 ? (
          <p className="text-gray-400">Courses coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/s/${store.slug}/products/${p.id}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                <div className="h-10 w-10 shrink-0 rounded" style={{ backgroundColor: accent + '18' }} />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{p.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      {/* Instructors + pricing */}
      <section className="mx-auto max-w-4xl px-6 pb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Instructors</h2>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-12 rounded-full bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Pricing</h2>
          {products.slice(0, 2).map((p) => (
            <div key={p.id} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-500">{p.title}</span>
              <span className="text-xs font-bold" style={{ color: accent }}>{p.price} {p.currency}</span>
            </div>
          ))}
        </div>
      </section>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   Default fallback
   ==================================================================== */
function DefaultLayout({ store, products, tagline, accent }: LP) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="text-white" style={{ backgroundColor: accent }}>
        <div className="mx-auto max-w-5xl px-6 py-14 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {store.logoUrl && (
              <div className="shrink-0 rounded-xl bg-white/15 p-2">
                <img src={store.logoUrl} alt="" className="h-12 w-auto" />
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">{store.niche}</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{store.name}</h1>
              <p className="mt-3 max-w-2xl opacity-90">{tagline}</p>
            </div>
          </div>
          <StorefrontCartLink storeSlug={store.slug} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
        {products.length === 0 ? (
          <p className="mt-4 text-gray-400">Products coming soon.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Link href={`/s/${store.slug}/products/${p.id}`} className="block">
                  <Img src={p.images?.[0]} alt={p.title} cls="aspect-[4/3] w-full" />
                </Link>
                <div className="p-5">
                  <Link href={`/s/${store.slug}/products/${p.id}`} className="hover:underline">
                    <h3 className="font-medium text-gray-900">{p.title}</h3>
                  </Link>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{p.description}</p>
                  <p className="mt-3 text-lg font-bold" style={{ color: accent }}>{p.price} {p.currency}</p>
                  <AddToCartButton product={p} className="mt-3 w-full" />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <FooterBar store={store} />
    </div>
  );
}

/* ====================================================================
   Template ID → Layout map
   ==================================================================== */
const LAYOUT_MAP: Record<string, (p: LP) => ReactNode> = {
  'ng-ecom-mega': EcomMega,
  'ng-ecom-flat': EcomFlat,
  'ng-ecom-classic': EcomClassic,
  'ng-biz-corporate': BizCorporate,
  'ng-biz-startup': BizStartup,
  'ng-rest-dine': RestDine,
  'ng-rest-catering': RestCatering,
  'ng-faith-church': FaithChurch,
  'ng-faith-mosque': FaithMosque,
  'ng-fashion-boutique': FashionBoutique,
  'ng-fashion-brand': FashionBrand,
  'ng-agro-farm': AgroFarm,
  'ng-agro-fmcg': AgroFmcg,
  'ng-edu-school': EduSchool,
  'ng-edu-bootcamp': EduBootcamp,
};

const NICHE_COPY: Record<string, string> = {
  fashion: 'Statement pieces with everyday comfort.',
  electronics: 'Reliable devices, fair pricing, fast delivery.',
  food: 'Fresh ingredients and pantry staples.',
  crafts: 'Artisan goods with transparent sourcing.',
  beauty: 'Products curated for melanin-rich skin.',
  home: 'Decor and essentials for modern African homes.',
  kids: 'Thoughtful toys and essentials for little ones.',
  services: 'Trusted professionals at your fingertips.',
  digital: 'Templates, courses, and downloads — instant delivery.',
  general: 'Quality products from independent sellers.',
};

const TEMPLATE_ACCENT: Record<string, string> = {
  'ng-ecom-mega': '#eab308',
  'ng-ecom-flat': '#e74c3c',
  'ng-ecom-classic': '#7c3aed',
  'ng-biz-corporate': '#1e3a8a',
  'ng-biz-startup': '#7c3aed',
  'ng-rest-dine': '#dc2626',
  'ng-rest-catering': '#ea580c',
  'ng-faith-church': '#7c3aed',
  'ng-faith-mosque': '#0d9488',
  'ng-fashion-boutique': '#be185d',
  'ng-fashion-brand': '#9333ea',
  'ng-agro-farm': '#16a34a',
  'ng-agro-fmcg': '#65a30d',
  'ng-edu-school': '#2563eb',
  'ng-edu-bootcamp': '#0891b2',
};

export function StorefrontShell({ store, products }: { store: Store; products: Product[] }) {
  const tagline = store.tagline?.trim() || store.template.demoTagline || NICHE_COPY[store.niche] || NICHE_COPY.general;
  const accent = TEMPLATE_ACCENT[store.sectionTemplate ?? ''] ?? store.brandColor;
  const style = { '--accent': accent } as CSSProperties;
  const Layout = LAYOUT_MAP[store.sectionTemplate ?? ''] ?? DefaultLayout;

  return (
    <div style={style}>
      <Layout store={store} products={products} tagline={tagline} accent={accent} />
    </div>
  );
}
