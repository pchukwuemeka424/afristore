'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

type UserStore = {
  id: string;
  name: string;
  slug: string;
  sectionTemplate?: string | null;
};

const SECTION_CATEGORIES = [
  { id: 'ecommerce', label: 'Ecommerce' },
  { id: 'business', label: 'Business website' },
  { id: 'restaurant', label: 'Restaurant & food' },
  { id: 'religion', label: 'Religion & faith' },
  { id: 'fashion', label: 'Fashion & retail' },
  { id: 'agriculture', label: 'Agriculture & FMCG' },
  { id: 'education', label: 'Education & training' },
] as const;

type SectionCategoryId = (typeof SECTION_CATEGORIES)[number]['id'];

const NICHE_TO_CATEGORY: Record<string, SectionCategoryId> = {
  fashion: 'fashion',
  electronics: 'ecommerce',
  food: 'restaurant',
  crafts: 'ecommerce',
  beauty: 'fashion',
  home: 'ecommerce',
  kids: 'ecommerce',
  services: 'business',
  digital: 'ecommerce',
  general: 'ecommerce',
};

type SectionVariant = {
  id: string;
  name: string;
  description: string;
  accent: string;
  sections: string[];
};

const SECTION_VARIANTS: Record<SectionCategoryId, SectionVariant[]> = {
  ecommerce: [
    {
      id: 'ng-ecom-mega',
      name: 'Mega store',
      description:
        'Full-featured shop with top utility bar, logo + search + account, category navigation, hero slider with product showcase, and product cards with SALE badges.',
      accent: '#eab308',
      sections: ['Top bar', 'Header + search', 'Category nav', 'Hero slider', 'Product grid + SALE', 'Footer'],
    },
    {
      id: 'ng-ecom-flat',
      name: 'Flat commerce',
      description:
        'Modern flat design with utility bar, tabbed navigation, large hero banner with promotions, product filter tabs, and clean product grid with HOT/SALE labels.',
      accent: '#e74c3c',
      sections: ['Utility bar', 'Nav tabs', 'Hero banner', 'Filter tabs', 'Product grid + labels', 'Footer'],
    },
    {
      id: 'ng-ecom-classic',
      name: 'Classic shop',
      description:
        'Traditional two-column layout with sidebar for search and blog posts, product grid with star ratings, and clean header with social icons and cart.',
      accent: '#7c3aed',
      sections: ['Header + social', 'Color nav + cart', 'Sidebar + search', 'Product grid + ratings', 'Footer'],
    },
  ],
  business: [
    {
      id: 'ng-biz-corporate',
      name: 'Corporate presence',
      description:
        'Professional site with credentials, services, team showcase, and contact form — perfect for agencies, consultancies, and professional firms.',
      accent: '#1e3a8a',
      sections: ['Header', 'Hero + CTA', 'Services list', 'Team grid', 'Testimonials', 'Contact form', 'Footer'],
    },
    {
      id: 'ng-biz-startup',
      name: 'Startup landing',
      description:
        'Bold landing page with feature highlights, pricing table, FAQ, and signup — ideal for Nigerian tech startups and SaaS products.',
      accent: '#7c3aed',
      sections: ['Header', 'Hero + signup', 'Feature cards', 'Pricing table', 'FAQ accordion', 'Footer'],
    },
  ],
  restaurant: [
    {
      id: 'ng-rest-dine',
      name: 'Dine-in & delivery',
      description:
        'Full restaurant site with menu categories, dish cards with Naira prices, reservation form, and location map — fits restaurants, bukas, and lounges.',
      accent: '#dc2626',
      sections: ['Header', 'Hero image', 'Menu categories', 'Dish grid', 'Reservation form', 'Map + hours', 'Footer'],
    },
    {
      id: 'ng-rest-catering',
      name: 'Catering & events',
      description:
        'Showcase packages, past events gallery, order form, and WhatsApp booking — built for small chops, event catering, and party planners.',
      accent: '#ea580c',
      sections: ['Header', 'Hero + CTA', 'Packages grid', 'Photo gallery', 'Order form', 'Footer'],
    },
  ],
  religion: [
    {
      id: 'ng-faith-church',
      name: 'Church & ministry',
      description:
        'Welcome banner, service times, sermon archive, giving portal, and branch locator — designed for churches, parishes, and ministries.',
      accent: '#7c3aed',
      sections: ['Header', 'Welcome hero', 'Service times', 'Sermons list', 'Giving portal', 'Branches', 'Footer'],
    },
    {
      id: 'ng-faith-mosque',
      name: 'Mosque & community',
      description:
        'Prayer times, events calendar, Quran classes, zakat/sadaqah giving, and community announcements — suited for mosques and Islamic centres.',
      accent: '#0d9488',
      sections: ['Header', 'Welcome hero', 'Prayer times', 'Events calendar', 'Classes', 'Giving', 'Footer'],
    },
  ],
  fashion: [
    {
      id: 'ng-fashion-boutique',
      name: 'Boutique storefront',
      description:
        'Lookbook hero, new arrivals carousel, product grid with size/colour pickers, and WhatsApp order — fits clothing stores and aso-ebi sellers.',
      accent: '#be185d',
      sections: ['Header', 'Lookbook hero', 'New arrivals', 'Product grid', 'Size guide', 'Footer'],
    },
    {
      id: 'ng-fashion-brand',
      name: 'Brand showcase',
      description:
        'Story-led layout with brand manifesto, collection highlights, lookbook gallery, and press section — ideal for emerging Nigerian fashion brands.',
      accent: '#9333ea',
      sections: ['Header', 'Brand hero', 'Our story', 'Collections', 'Lookbook gallery', 'Press', 'Footer'],
    },
  ],
  agriculture: [
    {
      id: 'ng-agro-farm',
      name: 'Farm-to-door',
      description:
        'Origin story, produce catalog with kg/carton pricing, delivery zones, and bulk order form — works for fresh produce and farm-direct sellers.',
      accent: '#16a34a',
      sections: ['Header', 'Farm hero', 'Our story', 'Produce grid', 'Delivery zones', 'Bulk order form', 'Footer'],
    },
    {
      id: 'ng-agro-fmcg',
      name: 'FMCG distributor',
      description:
        'Product catalog, wholesale pricing tiers, dealer application, and order tracking — built for distributors and FMCG brands across Nigeria.',
      accent: '#65a30d',
      sections: ['Header', 'Hero + CTA', 'Product catalog', 'Pricing tiers', 'Dealer form', 'Footer'],
    },
  ],
  education: [
    {
      id: 'ng-edu-school',
      name: 'School portal',
      description:
        'Admissions hero, programmes list, fee structure, staff directory, and parent portal link — fits primary, secondary, and tertiary institutions.',
      accent: '#2563eb',
      sections: ['Header', 'Admissions hero', 'Programmes', 'Fee structure', 'Staff directory', 'Portal link', 'Footer'],
    },
    {
      id: 'ng-edu-bootcamp',
      name: 'Training & bootcamp',
      description:
        'Course cards, instructor profiles, schedule, pricing, and enrollment CTA — ideal for tech bootcamps, tutorial centres, and WAEC/JAMB prep.',
      accent: '#0891b2',
      sections: ['Header', 'Hero + enroll', 'Course cards', 'Instructors', 'Schedule', 'Pricing', 'Footer'],
    },
  ],
};

/* ---------- Advanced wireframe previews per category ---------- */

function EcomMegaPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top utility bar */}
      <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: accent }}>
        <div className="flex items-center gap-1">
          <div className="h-1 w-1 rounded-full bg-white/80" />
          <div className="h-1 w-12 rounded-sm bg-white/60" />
        </div>
        <div className="flex gap-2">
          {['Support', 'Store', 'Free'].map((t) => <span key={t} className="text-[4px] text-white/70">{t}</span>)}
        </div>
      </div>
      {/* Logo + search + account */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: accent }} />
          <div className="h-2 w-14 rounded-sm" style={{ backgroundColor: accent + '80' }} />
        </div>
        <div className="flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-sm bg-gray-300" />
          <div className="h-1 w-14 rounded-sm bg-gray-100" />
          <div className="h-1.5 w-1.5 rounded-sm bg-gray-400" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-gray-200" />
          <div className="h-1.5 w-8 rounded-sm bg-gray-200" />
        </div>
      </div>
      {/* Category nav */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-1">
        <div className="flex gap-2">
          {['Home', 'Mobile', 'Clothes', 'Shoes', 'Watch'].map((c) => (
            <span key={c} className="text-[4px] text-gray-500">{c}</span>
          ))}
        </div>
        <div className="flex items-center gap-0.5 rounded px-1.5 py-0.5" style={{ backgroundColor: accent }}>
          <span className="text-[4px] text-white">Cart</span>
          <div className="h-2 w-2 rounded-sm bg-white/30" />
        </div>
      </div>
      {/* Hero slider */}
      <div className="mx-2 mt-1.5 flex items-center rounded" style={{ backgroundColor: accent + '10' }}>
        <div className="h-3 w-3 flex items-center justify-center text-[6px] text-gray-400">‹</div>
        <div className="flex-1 p-2">
          <div className="h-1 w-14 rounded-sm bg-gray-300" />
          <div className="mt-0.5 h-2.5 w-24 rounded-sm font-bold" style={{ backgroundColor: accent + '20' }} />
          <div className="mt-0.5 h-1 w-20 rounded-sm bg-gray-200" />
          <div className="mt-1 h-3 w-10 rounded" style={{ backgroundColor: accent + '15', border: `1px solid ${accent}40` }}>
            <div className="mx-auto mt-0.5 h-1 w-7 rounded-sm text-[4px] text-center" style={{ color: accent }}>SHOP</div>
          </div>
        </div>
        <div className="h-10 w-14 rounded bg-gray-100" />
        <div className="h-3 w-3 flex items-center justify-center text-[6px] text-gray-400">›</div>
      </div>
      {/* "SHOP NEW COLLECTION" heading */}
      <div className="mx-auto mt-1.5 flex items-center gap-1">
        <div className="h-px w-4 bg-gray-200" />
        <span className="text-[4px] font-bold text-gray-600 uppercase tracking-wider">Shop new collection</span>
        <div className="h-px w-4 bg-gray-200" />
      </div>
      {/* Product cards with SALE badges */}
      <div className="mx-2 mt-1 grid flex-1 grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative rounded border border-gray-100 p-0.5">
            <div className="absolute top-1 right-1 rounded px-0.5 text-[3px] font-bold text-white" style={{ backgroundColor: accent }}>SALE</div>
            <div className="aspect-[3/4] rounded-sm bg-gray-100" />
            <div className="mt-0.5 h-1 w-4/5 rounded-sm bg-gray-200" />
            <div className="mt-0.5 flex gap-1">
              <div className="h-1 w-4 rounded-sm" style={{ backgroundColor: accent + '80' }} />
              <div className="h-1 w-3 rounded-sm bg-gray-200 line-through" />
            </div>
            <div className="mt-0.5 h-2 w-full rounded border text-[3px] text-center" style={{ borderColor: accent + '40', color: accent }}>ADD TO CART</div>
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200 bg-gray-900 px-3 py-1">
        <div className="h-1 w-20 rounded-sm bg-gray-700" />
      </div>
    </div>
  );
}

function EcomFlatPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Utility bar */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-gray-50 border-b border-gray-100">
        <div className="h-1 w-20 rounded-sm bg-gray-200" />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-1 w-6 rounded-sm bg-gray-200" />)}
        </div>
      </div>
      {/* Logo + icons */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="h-3 w-14 rounded-sm bg-gray-800" />
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          <div className="h-1.5 w-6 rounded-sm bg-gray-200" />
          <div className="h-1.5 w-6 rounded-sm bg-gray-200" />
          <div className="flex items-center gap-0.5 rounded px-1 py-0.5" style={{ backgroundColor: accent }}>
            <div className="h-1.5 w-1.5 rounded-sm bg-white/50" />
            <span className="text-[4px] text-white">$355</span>
          </div>
        </div>
      </div>
      {/* Nav tabs */}
      <div className="flex border-b border-gray-200">
        {['Home', 'Shop', 'Portfolio', 'Pages', 'Blog', 'Contact'].map((t, i) => (
          <div key={t} className="flex-1 py-1 text-center text-[4px]" style={i === 0 ? { backgroundColor: accent, color: 'white' } : { color: '#666' }}>
            {t}
          </div>
        ))}
        <div className="w-4 flex items-center justify-center text-[5px] text-gray-400">⌕</div>
      </div>
      {/* Hero banner */}
      <div className="mx-2 mt-1.5 rounded overflow-hidden bg-gray-100 p-2 text-center relative">
        <div className="h-2 w-10 mx-auto rounded-sm bg-gray-300" />
        <div className="mt-0.5 mx-auto h-1.5 w-16 rounded-sm bg-gray-400 font-bold" />
        <div className="mt-1 mx-auto h-3 w-12 rounded" style={{ backgroundColor: accent }}>
          <span className="text-[4px] text-white leading-none flex items-center justify-center h-full">SHOP NOW</span>
        </div>
      </div>
      {/* Filter tabs */}
      <div className="mx-2 mt-2">
        <div className="mb-1 h-1.5 w-16 rounded-sm bg-gray-800" />
        <div className="flex gap-1">
          {['ALL', 'FEATURED', 'NEW', 'SPECIALS', 'HIT'].map((f, i) => (
            <div key={f} className="rounded-sm px-1 py-0.5 text-[3px]" style={i === 0 ? { backgroundColor: accent + '20', color: accent, fontWeight: 'bold' } : { color: '#999' }}>
              {f}
            </div>
          ))}
        </div>
      </div>
      {/* Product grid with HOT label */}
      <div className="mx-2 mt-1 grid flex-1 grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative rounded border border-gray-100 p-0.5">
            {i < 2 && <div className="absolute top-0.5 left-0.5 rounded px-0.5 text-[3px] font-bold text-white" style={{ backgroundColor: i === 0 ? accent : '#f59e0b' }}>{i === 0 ? 'HOT' : 'SALE'}</div>}
            <div className="aspect-[3/4] rounded-sm bg-gray-100" />
            <div className="mt-0.5 h-1 w-full rounded-sm bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function EcomClassicPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header + social icons */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200">
        <div>
          <div className="h-2.5 w-16 rounded-sm bg-gray-800" />
          <div className="mt-0.5 h-1 w-20 rounded-sm bg-gray-200" />
        </div>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-2 w-2 rounded-full bg-gray-200" />)}
        </div>
      </div>
      {/* Color nav bar */}
      <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: accent }}>
        <div className="flex gap-2">
          {['Home', 'Gallery', 'Blog', 'Shop', 'About'].map((n) => (
            <span key={n} className="text-[4px] text-white/90">{n}</span>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <div className="h-1.5 w-1.5 rounded-sm bg-white/40" />
          <span className="text-[4px] text-white/80">0 items</span>
        </div>
      </div>
      {/* Two-column: products + sidebar */}
      <div className="mx-2 mt-1.5 flex flex-1 gap-1.5">
        {/* Main product area */}
        <div className="flex-[2]">
          <div className="mb-1 h-2 w-8 rounded-sm" style={{ backgroundColor: accent + '60' }} />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded border border-gray-100 p-0.5">
                {i === 0 && <div className="absolute -mt-0.5 ml-0.5 rounded px-0.5 text-[3px] font-bold text-white" style={{ backgroundColor: accent }}>Sale!</div>}
                <div className="aspect-square rounded-sm bg-gray-100" />
                <div className="mt-0.5 h-1 w-full rounded-sm" style={{ color: accent }}>
                  <div className="h-0.5 w-3/4 rounded-sm bg-gray-300" />
                </div>
                {/* Star rating */}
                <div className="flex gap-px mt-0.5">
                  {[0, 1, 2, 3, 4].map((s) => <div key={s} className="h-1 w-1 rounded-sm" style={{ backgroundColor: s < 3 + i % 3 ? accent + '60' : '#e5e7eb' }} />)}
                </div>
                <div className="mt-0.5 h-1 w-6 rounded-sm" style={{ backgroundColor: accent + '40' }} />
              </div>
            ))}
          </div>
        </div>
        {/* Sidebar */}
        <div className="flex-1 space-y-1.5">
          <div className="rounded border border-gray-100 p-1">
            <div className="flex gap-0.5">
              <div className="flex-1 h-2 rounded-sm bg-gray-100" />
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: accent }} />
            </div>
          </div>
          <div className="rounded border border-gray-100 p-1">
            <div className="flex gap-2 mb-1">
              <div className="h-1 w-6 rounded-sm" style={{ backgroundColor: accent + '50' }} />
              <div className="h-1 w-6 rounded-sm bg-gray-200" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-1 mt-0.5">
                <div className="h-3 w-3 rounded-sm bg-gray-100 shrink-0" />
                <div className="space-y-0.5 flex-1">
                  <div className="h-1 w-full rounded-sm bg-gray-200" />
                  <div className="h-0.5 w-8 rounded-sm bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function BizCorporatePreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-8 rounded-sm bg-gray-200" />)}</div>
      </div>
      {/* Hero */}
      <div className="mx-2 mt-2 rounded border border-gray-100 p-3" style={{ backgroundColor: accent + '08' }}>
        <div className="h-2.5 w-28 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mt-1 h-1.5 w-36 rounded-sm bg-gray-200" />
        <div className="mt-2 h-4 w-16 rounded" style={{ backgroundColor: accent + '25' }} />
      </div>
      {/* Services */}
      <div className="mx-2 mt-2">
        <div className="mb-1 h-1.5 w-14 rounded-sm bg-gray-300" />
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded border border-gray-100 p-1.5 text-center">
              <div className="mx-auto h-3 w-3 rounded-full" style={{ backgroundColor: accent + '20' }} />
              <div className="mx-auto mt-1 h-1 w-8 rounded-sm bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      {/* Team */}
      <div className="mx-2 mt-2 flex-1">
        <div className="mb-1 h-1.5 w-10 rounded-sm bg-gray-300" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-gray-100" />
              <div className="mt-0.5 h-1 w-6 rounded-sm bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-20 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function BizStartupPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-10 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="h-4 w-14 rounded-full border" style={{ borderColor: accent, color: accent }}>
          <div className="mx-auto mt-0.5 h-1.5 w-8 rounded-sm" style={{ backgroundColor: accent + '40' }} />
        </div>
      </div>
      <div className="mx-2 mt-2 rounded border border-gray-100 p-3 text-center" style={{ backgroundColor: accent + '06' }}>
        <div className="mx-auto h-3 w-32 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mx-auto mt-1 h-1.5 w-24 rounded-sm bg-gray-200" />
        <div className="mx-auto mt-2 h-5 w-20 rounded-full" style={{ backgroundColor: accent + '20' }} />
      </div>
      {/* Feature cards */}
      <div className="mx-2 mt-2 grid grid-cols-3 gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded border border-gray-100 p-1.5">
            <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: accent + '25' }} />
            <div className="mt-1 h-1 w-full rounded-sm bg-gray-200" />
            <div className="mt-0.5 h-1 w-3/4 rounded-sm bg-gray-100" />
          </div>
        ))}
      </div>
      {/* Pricing */}
      <div className="mx-2 mt-2 flex flex-1 gap-1">
        {['Basic', 'Pro', 'Biz'].map((t) => (
          <div key={t} className="flex-1 rounded border border-gray-100 p-1 text-center">
            <div className="text-[5px] text-gray-400">{t}</div>
            <div className="mx-auto mt-0.5 h-2 w-6 rounded-sm" style={{ backgroundColor: accent + '40' }} />
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function RestDinePreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top contact bar */}
      <div className="px-2 py-0.5 text-white" style={{ backgroundColor: accent }}>
        <div className="flex justify-between">
          <div className="h-1 w-16 rounded-sm bg-white/50" />
          <div className="h-1 w-10 rounded-sm bg-white/50" />
        </div>
      </div>
      {/* Nav */}
      <div className="flex items-center justify-between border-b border-gray-200 px-2 py-1">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-1">{[0, 1, 2].map((i) => <div key={i} className="h-1 w-5 rounded-sm bg-gray-200" />)}</div>
        <div className="h-3 w-10 rounded text-white text-[4px] flex items-center justify-center" style={{ backgroundColor: accent }}>Reserve</div>
      </div>
      {/* Dark hero */}
      <div className="mx-1.5 mt-1.5 rounded-lg p-3" style={{ background: `linear-gradient(135deg, ${accent}ee, ${accent}88)` }}>
        <div className="h-1 w-8 rounded-sm bg-white/40" />
        <div className="mt-1 h-2.5 w-20 rounded-sm bg-white/90" />
        <div className="mt-1 h-1 w-16 rounded-sm bg-white/50" />
        <div className="mt-1.5 flex gap-1">
          <div className="h-2.5 w-10 rounded border border-white/50" />
          <div className="h-2.5 w-8 rounded" style={{ backgroundColor: accent }} />
        </div>
      </div>
      {/* Menu grid */}
      <div className="mx-1.5 mt-2 flex gap-1 justify-center">
        {['Starter', 'Soup', 'Main'].map((c, i) => (
          <div key={c} className="rounded-full px-1.5 py-0.5 text-[4px]" style={i === 0 ? { backgroundColor: accent, color: 'white' } : { backgroundColor: '#f3f4f6', color: '#666' }}>{c}</div>
        ))}
      </div>
      <div className="mx-1.5 mt-1 flex-1 grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-1 rounded border border-gray-100 p-0.5">
            <div className="h-4 w-4 flex-shrink-0 rounded bg-gray-100" />
            <div className="flex-1">
              <div className="h-1 w-8 rounded-sm bg-gray-300" />
              <div className="mt-0.5 h-1 w-5 rounded-sm" style={{ backgroundColor: accent + '60' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto bg-gray-900 px-2 py-1">
        <div className="h-1 w-12 rounded-sm bg-gray-600" />
      </div>
    </div>
  );
}

function RestCateringPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Dark top bar */}
      <div className="bg-gray-900 px-2 py-0.5">
        <div className="flex justify-between">
          <div className="h-1 w-12 rounded-sm bg-gray-600" />
          <div className="h-1 w-14 rounded-sm bg-gray-600" />
        </div>
      </div>
      {/* Nav */}
      <div className="flex items-center justify-between border-b border-gray-200 px-2 py-1 shadow-sm">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-1">{[0, 1, 2].map((i) => <div key={i} className="h-1 w-5 rounded-sm bg-gray-200" />)}</div>
        <div className="h-3 w-10 rounded-full text-white text-[4px] flex items-center justify-center" style={{ backgroundColor: accent }}>Book</div>
      </div>
      {/* Hero with booking form */}
      <div className="mx-1.5 mt-1.5 grid grid-cols-2 gap-1.5 rounded-lg p-2" style={{ background: `linear-gradient(to right, ${accent}dd, ${accent}88)` }}>
        <div>
          <div className="h-1 w-8 rounded-sm bg-white/40" />
          <div className="mt-0.5 h-2 w-16 rounded-sm bg-white/90" />
          <div className="mt-0.5 h-1 w-12 rounded-sm bg-white/50" />
          <div className="mt-1 flex gap-0.5">
            <div className="h-2 w-7 rounded bg-white/90" />
            <div className="h-2 w-7 rounded border border-white/40" />
          </div>
        </div>
        <div className="rounded p-1" style={{ backgroundColor: accent }}>
          <div className="h-1 w-8 rounded-sm bg-white/70" />
          <div className="mt-0.5 space-y-0.5">
            <div className="h-1.5 w-full rounded bg-white/20" />
            <div className="h-1.5 w-full rounded bg-white/20" />
            <div className="h-2 w-full rounded bg-white/90" />
          </div>
        </div>
      </div>
      {/* Package cards */}
      <div className="mx-1.5 mt-2 flex-1">
        <div className="mb-1 text-center">
          <div className="mx-auto h-1 w-8 rounded-sm" style={{ backgroundColor: accent + '60' }} />
          <div className="mx-auto mt-0.5 h-1.5 w-14 rounded-sm bg-gray-300" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded border border-gray-100 overflow-hidden">
              <div className="h-5 bg-gray-100" />
              <div className="p-0.5">
                <div className="h-1 w-8 rounded-sm bg-gray-300" />
                <div className="mt-0.5 h-1 w-5 rounded-sm" style={{ backgroundColor: accent + '50' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div className="mx-1.5 mb-1 rounded py-1 text-center" style={{ backgroundColor: accent }}>
        <div className="mx-auto h-1 w-10 rounded-sm bg-white/70" />
      </div>
      <div className="mt-auto bg-gray-900 px-2 py-1">
        <div className="h-1 w-12 rounded-sm bg-gray-600" />
      </div>
    </div>
  );
}

function FaithChurchPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-7 rounded-sm bg-gray-200" />)}</div>
      </div>
      <div className="mx-2 mt-2 rounded border border-gray-100 p-2" style={{ backgroundColor: accent + '08' }}>
        <div className="h-2.5 w-28 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mt-1 h-1.5 w-20 rounded-sm bg-gray-200" />
      </div>
      {/* Service times */}
      <div className="mx-2 mt-2 rounded border border-gray-100 p-1.5">
        <div className="mb-1 h-1.5 w-16 rounded-sm" style={{ backgroundColor: accent + '60' }} />
        <div className="space-y-0.5">
          {['Sunday 8am & 10am', 'Wednesday 6pm', 'Friday 7pm'].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent + '40' }} />
              <span className="text-[5px] text-gray-400">{s}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Sermons + Giving */}
      <div className="mx-2 mt-1.5 flex flex-1 gap-1">
        <div className="flex-1 rounded border border-gray-100 p-1">
          <div className="h-1 w-8 rounded-sm bg-gray-300" />
          <div className="mt-1 space-y-0.5">
            {[0, 1].map((i) => <div key={i} className="h-3 rounded bg-gray-50" />)}
          </div>
        </div>
        <div className="flex-1 rounded border border-gray-100 p-1 text-center">
          <div className="h-1 w-6 mx-auto rounded-sm bg-gray-300" />
          <div className="mx-auto mt-1 h-5 w-12 rounded" style={{ backgroundColor: accent + '18' }} />
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function FaithMosquePreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="h-1.5 w-7 rounded-sm bg-gray-200" />
      </div>
      <div className="mx-2 mt-2 rounded border border-gray-100 p-2" style={{ backgroundColor: accent + '08' }}>
        <div className="h-2.5 w-24 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mt-1 h-1.5 w-28 rounded-sm bg-gray-200" />
      </div>
      {/* Prayer times */}
      <div className="mx-2 mt-2 rounded border border-gray-100 p-1.5">
        <div className="mb-1 h-1.5 w-14 rounded-sm" style={{ backgroundColor: accent + '60' }} />
        <div className="grid grid-cols-5 gap-0.5 text-center">
          {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
            <div key={p} className="rounded bg-gray-50 py-0.5">
              <div className="text-[4px] text-gray-400">{p}</div>
              <div className="mx-auto mt-0.5 h-1.5 w-4 rounded-sm" style={{ backgroundColor: accent + '30' }} />
            </div>
          ))}
        </div>
      </div>
      {/* Events + Classes */}
      <div className="mx-2 mt-1.5 flex flex-1 gap-1">
        <div className="flex-1 rounded border border-gray-100 p-1">
          <div className="h-1 w-8 rounded-sm bg-gray-300" />
          <div className="mt-1 space-y-0.5">
            {[0, 1].map((i) => <div key={i} className="h-2.5 rounded bg-gray-50" />)}
          </div>
        </div>
        <div className="flex-1 rounded border border-gray-100 p-1">
          <div className="h-1 w-8 rounded-sm bg-gray-300" />
          <div className="mt-1 space-y-0.5">
            {[0, 1].map((i) => <div key={i} className="h-2.5 rounded bg-gray-50" />)}
          </div>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function FashionBoutiquePreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-2">{[0, 1].map((i) => <div key={i} className="h-1.5 w-8 rounded-sm bg-gray-200" />)}</div>
        <div className="h-3 w-3 rounded-full border border-gray-300" />
      </div>
      {/* Lookbook hero */}
      <div className="mx-2 mt-2 flex items-center gap-2 rounded border border-gray-100 p-2" style={{ backgroundColor: accent + '06' }}>
        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100" />
        <div>
          <div className="h-2 w-20 rounded-sm" style={{ backgroundColor: accent }} />
          <div className="mt-1 h-1.5 w-16 rounded-sm bg-gray-200" />
          <div className="mt-1.5 h-3 w-14 rounded" style={{ backgroundColor: accent + '20' }} />
        </div>
      </div>
      {/* New arrivals */}
      <div className="mx-2 mt-2">
        <div className="mb-1 h-1.5 w-14 rounded-sm bg-gray-300" />
        <div className="flex gap-1 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-[28%] flex-shrink-0 rounded border border-gray-100 p-0.5">
              <div className="aspect-[3/4] rounded-sm bg-gray-100" />
              <div className="mt-0.5 h-1 w-4/5 rounded-sm bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      {/* Product grid */}
      <div className="mx-2 mt-1.5 grid flex-1 grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded border border-gray-100 bg-gray-50 p-0.5">
            <div className="aspect-square rounded-sm bg-gray-100" />
            <div className="mt-0.5 h-1 w-3/4 rounded-sm bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function FashionBrandPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-12 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-7 rounded-sm bg-gray-200" />)}</div>
      </div>
      {/* Brand hero */}
      <div className="mx-2 mt-2 rounded border border-gray-100 p-3 text-center" style={{ backgroundColor: accent + '06' }}>
        <div className="mx-auto h-3 w-28 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mx-auto mt-1 h-1.5 w-32 rounded-sm bg-gray-200" />
      </div>
      {/* Story */}
      <div className="mx-2 mt-2 flex gap-2">
        <div className="h-10 w-14 flex-shrink-0 rounded bg-gray-100" />
        <div className="flex-1 space-y-0.5 pt-1">
          <div className="h-1 w-full rounded-sm bg-gray-200" />
          <div className="h-1 w-4/5 rounded-sm bg-gray-200" />
          <div className="h-1 w-3/5 rounded-sm bg-gray-100" />
        </div>
      </div>
      {/* Collections */}
      <div className="mx-2 mt-2 flex-1">
        <div className="mb-1 h-1.5 w-14 rounded-sm bg-gray-300" />
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded border border-gray-100 p-0.5">
              <div className="aspect-[3/4] rounded-sm bg-gray-100" />
              <div className="mt-0.5 h-1 w-3/4 mx-auto rounded-sm bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function AgroFarmPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-2">{[0, 1].map((i) => <div key={i} className="h-1.5 w-8 rounded-sm bg-gray-200" />)}</div>
      </div>
      {/* Farm hero */}
      <div className="mx-2 mt-2 flex gap-2 rounded border border-gray-100 p-2" style={{ backgroundColor: accent + '06' }}>
        <div className="h-10 w-14 flex-shrink-0 rounded bg-gray-100" />
        <div>
          <div className="h-2 w-20 rounded-sm" style={{ backgroundColor: accent }} />
          <div className="mt-1 h-1 w-28 rounded-sm bg-gray-200" />
          <div className="mt-1 h-1 w-20 rounded-sm bg-gray-100" />
        </div>
      </div>
      {/* Produce grid */}
      <div className="mx-2 mt-2 flex-1">
        <div className="mb-1 h-1.5 w-14 rounded-sm bg-gray-300" />
        <div className="grid grid-cols-3 gap-1">
          {['Tomatoes', 'Rice 50kg', 'Palm oil', 'Peppers', 'Yam tubers', 'Beans'].map((p) => (
            <div key={p} className="rounded border border-gray-100 p-1">
              <div className="aspect-square rounded-sm bg-gray-100" />
              <div className="mt-0.5 text-[4px] text-gray-400">{p}</div>
              <div className="h-1.5 w-8 rounded-sm" style={{ backgroundColor: accent + '50' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function AgroFmcgPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-12 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="h-4 w-16 rounded border" style={{ borderColor: accent }}>
          <div className="mx-auto mt-0.5 h-1.5 w-10 rounded-sm" style={{ backgroundColor: accent + '40' }} />
        </div>
      </div>
      <div className="mx-2 mt-2 rounded border border-gray-100 p-2 text-center" style={{ backgroundColor: accent + '06' }}>
        <div className="mx-auto h-2.5 w-28 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mx-auto mt-1 h-1.5 w-32 rounded-sm bg-gray-200" />
      </div>
      {/* Catalog */}
      <div className="mx-2 mt-2 flex-1">
        <div className="mb-1 h-1.5 w-16 rounded-sm bg-gray-300" />
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5 rounded border border-gray-100 p-1">
              <div className="h-5 w-5 flex-shrink-0 rounded bg-gray-100" />
              <div className="flex-1">
                <div className="h-1 w-16 rounded-sm bg-gray-300" />
                <div className="mt-0.5 h-1 w-10 rounded-sm bg-gray-100" />
              </div>
              <div className="h-2 w-8 rounded-sm" style={{ backgroundColor: accent + '40' }} />
            </div>
          ))}
        </div>
      </div>
      {/* Pricing tiers */}
      <div className="mx-2 mt-1.5 flex gap-1">
        {['Retail', 'Wholesale', 'Bulk'].map((t) => (
          <div key={t} className="flex-1 rounded border border-gray-100 p-1 text-center">
            <div className="text-[5px] text-gray-400">{t}</div>
            <div className="mx-auto mt-0.5 h-1.5 w-6 rounded-sm" style={{ backgroundColor: accent + '40' }} />
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function EduSchoolPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-14 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-7 rounded-sm bg-gray-200" />)}</div>
      </div>
      <div className="mx-2 mt-2 rounded border border-gray-100 p-2" style={{ backgroundColor: accent + '08' }}>
        <div className="h-2.5 w-24 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mt-1 h-1.5 w-32 rounded-sm bg-gray-200" />
        <div className="mt-1.5 h-4 w-16 rounded" style={{ backgroundColor: accent + '20' }} />
      </div>
      {/* Programmes */}
      <div className="mx-2 mt-2">
        <div className="mb-1 h-1.5 w-16 rounded-sm bg-gray-300" />
        <div className="grid grid-cols-3 gap-1">
          {['Nursery', 'Primary', 'Secondary'].map((p) => (
            <div key={p} className="rounded border border-gray-100 p-1 text-center">
              <div className="mx-auto h-3 w-3 rounded" style={{ backgroundColor: accent + '15' }} />
              <div className="mt-0.5 text-[5px] text-gray-400">{p}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Fee structure + staff */}
      <div className="mx-2 mt-1.5 flex flex-1 gap-1">
        <div className="flex-1 rounded border border-gray-100 p-1">
          <div className="h-1 w-8 rounded-sm bg-gray-300" />
          <div className="mt-1 space-y-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1 w-8 rounded-sm bg-gray-200" />
                <div className="h-1 w-5 rounded-sm" style={{ backgroundColor: accent + '30' }} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded border border-gray-100 p-1">
          <div className="h-1 w-6 rounded-sm bg-gray-300" />
          <div className="mt-1 flex gap-0.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-4 w-4 rounded-full bg-gray-100" />)}
          </div>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

function EduBootcampPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <div className="h-2.5 w-12 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="h-4 w-14 rounded-full" style={{ backgroundColor: accent + '18' }}>
          <div className="mx-auto mt-0.5 h-1.5 w-8 rounded-sm" style={{ backgroundColor: accent + '50' }} />
        </div>
      </div>
      <div className="mx-2 mt-2 rounded border border-gray-100 p-2 text-center" style={{ backgroundColor: accent + '06' }}>
        <div className="mx-auto h-3 w-28 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="mx-auto mt-1 h-1.5 w-24 rounded-sm bg-gray-200" />
        <div className="mx-auto mt-1.5 h-4 w-20 rounded-full" style={{ backgroundColor: accent + '20' }} />
      </div>
      {/* Course cards */}
      <div className="mx-2 mt-2">
        <div className="mb-1 h-1.5 w-12 rounded-sm bg-gray-300" />
        <div className="grid grid-cols-2 gap-1">
          {['Web Dev', 'Data', 'Mobile', 'Design'].map((c) => (
            <div key={c} className="rounded border border-gray-100 p-1">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded" style={{ backgroundColor: accent + '18' }} />
                <span className="text-[5px] text-gray-500">{c}</span>
              </div>
              <div className="mt-0.5 h-1 w-full rounded-sm bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      {/* Instructors + pricing */}
      <div className="mx-2 mt-1.5 flex flex-1 gap-1">
        <div className="flex-1 rounded border border-gray-100 p-1">
          <div className="h-1 w-10 rounded-sm bg-gray-300" />
          <div className="mt-1 flex gap-0.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-4 w-4 rounded-full bg-gray-100" />)}
          </div>
        </div>
        <div className="flex-1 rounded border border-gray-100 p-1">
          <div className="h-1 w-6 rounded-sm bg-gray-300" />
          <div className="mt-1 space-y-0.5">
            {['₦150k', '₦250k'].map((p) => (
              <div key={p} className="flex justify-between">
                <div className="h-1 w-6 rounded-sm bg-gray-200" />
                <span className="text-[5px]" style={{ color: accent }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-200 px-3 py-1">
        <div className="h-1 w-16 rounded-sm bg-gray-200" />
      </div>
    </div>
  );
}

const PREVIEW_MAP: Record<string, React.FC<{ accent: string }>> = {
  'ng-ecom-mega': EcomMegaPreview,
  'ng-ecom-flat': EcomFlatPreview,
  'ng-ecom-classic': EcomClassicPreview,
  'ng-biz-corporate': BizCorporatePreview,
  'ng-biz-startup': BizStartupPreview,
  'ng-rest-dine': RestDinePreview,
  'ng-rest-catering': RestCateringPreview,
  'ng-faith-church': FaithChurchPreview,
  'ng-faith-mosque': FaithMosquePreview,
  'ng-fashion-boutique': FashionBoutiquePreview,
  'ng-fashion-brand': FashionBrandPreview,
  'ng-agro-farm': AgroFarmPreview,
  'ng-agro-fmcg': AgroFmcgPreview,
  'ng-edu-school': EduSchoolPreview,
  'ng-edu-bootcamp': EduBootcampPreview,
};

/** Find which category a variant id belongs to */
function categoryForVariant(variantId: string): SectionCategoryId | null {
  for (const cat of SECTION_CATEGORIES) {
    if (SECTION_VARIANTS[cat.id].some((v) => v.id === variantId)) return cat.id;
  }
  return null;
}

function TemplateManagementPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';
  const nicheParam = searchParams.get('niche');

  const [sectionCategory, setSectionCategory] = useState<SectionCategoryId>(() => {
    if (nicheParam && NICHE_TO_CATEGORY[nicheParam]) return NICHE_TO_CATEGORY[nicheParam];
    return 'ecommerce';
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [stores, setStores] = useState<UserStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [onboardingTemplateId, setOnboardingTemplateId] = useState<string | null>(null);
  const [onboardingTemplateLoading, setOnboardingTemplateLoading] = useState(false);
  const [onboardingTemplateError, setOnboardingTemplateError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnboarding) return;
    let cancelled = false;
    setOnboardingTemplateLoading(true);
    setOnboardingTemplateError(null);

    async function loadTemplateId(): Promise<string | null> {
      const parse = (data: { items?: { id: string }[] }) => data.items?.[0]?.id ?? null;
      const tryFetch = async (path: string) => {
        const r = await apiFetch<{ items: { id: string }[]; total: number }>(path);
        return parse(r);
      };
      if (nicheParam) {
        const id = await tryFetch(`/api/templates?niche=${encodeURIComponent(nicheParam)}`);
        if (id) return id;
      }
      return tryFetch('/api/templates');
    }

    void loadTemplateId()
      .then((id) => {
        if (cancelled) return;
        setOnboardingTemplateId(id);
        if (!id) setOnboardingTemplateError('No base template found.');
      })
      .catch(() => {
        if (!cancelled) {
          setOnboardingTemplateId(null);
          setOnboardingTemplateError('Could not load templates. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setOnboardingTemplateLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOnboarding, nicheParam]);

  const loadStores = useCallback(async () => {
    try {
      const list = await apiFetch<UserStore[]>('/api/stores');
      setStores(list);
      if (list.length > 0 && !selectedStoreId) {
        setSelectedStoreId(list[0].id);
        if (list[0].sectionTemplate) {
          setSelectedTemplate(list[0].sectionTemplate);
          const cat = categoryForVariant(list[0].sectionTemplate);
          if (cat) setSectionCategory(cat);
        }
      }
    } catch {
      setStores([]);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user && !isOnboarding) loadStores();
  }, [user, isOnboarding, loadStores]);

  function handleStoreChange(storeId: string) {
    setSelectedStoreId(storeId);
    setMsg(null);
    const store = stores.find((s) => s.id === storeId);
    if (store?.sectionTemplate) {
      setSelectedTemplate(store.sectionTemplate);
      const cat = categoryForVariant(store.sectionTemplate);
      if (cat) setSectionCategory(cat);
    } else {
      setSelectedTemplate(null);
    }
  }

  async function applyTemplate(templateId?: string) {
    const templateToApply = templateId ?? selectedTemplate;
    if (!selectedStoreId || !templateToApply) return;
    setApplying(true);
    setMsg(null);
    try {
      await apiFetch(`/api/stores/${selectedStoreId}`, {
        method: 'PATCH',
        body: JSON.stringify({ sectionTemplate: templateToApply }),
      });
      setStores((prev) =>
        prev.map((s) => (s.id === selectedStoreId ? { ...s, sectionTemplate: templateToApply } : s)),
      );
      const store = stores.find((s) => s.id === selectedStoreId);
      setMsg({ text: `Template applied to ${store?.name ?? 'store'}.`, ok: true });
    } catch {
      setMsg({ text: 'Failed to apply template. Please try again.', ok: false });
    } finally {
      setApplying(false);
    }
  }

  function continueOnboarding() {
    if (!selectedTemplate || !onboardingTemplateId) return;
    const raw = sessionStorage.getItem('afristore_onboarding');
    const base = raw ? JSON.parse(raw) : {};
    sessionStorage.setItem(
      'afristore_onboarding',
      JSON.stringify({ ...base, sectionTemplate: selectedTemplate, templateId: onboardingTemplateId }),
    );
    router.push('/onboarding/deploy');
  }

  if (!user || loading) return <div className="p-10 text-center">Loading…</div>;

  const activeStore = isOnboarding ? undefined : stores.find((s) => s.id === selectedStoreId);
  const matchedCategoryLabel = SECTION_CATEGORIES.find((c) => c.id === sectionCategory)?.label;

  return (
    <div className={isOnboarding ? 'mx-auto max-w-4xl px-6 py-16' : 'mx-auto max-w-6xl'}>
      {isOnboarding && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-jade-600">Step 3 of 4</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-gray-900">Pick a template</h1>
          <p className="mt-2 text-sm text-gray-500">
            Based on your niche we&apos;ve selected <span className="font-medium text-gray-700">{matchedCategoryLabel}</span> templates.
            You can switch categories below.
          </p>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        {!isOnboarding && (
          <>
            <h1 className="text-xl font-semibold text-gray-900">Choose a template</h1>
            <p className="mt-1 text-sm text-gray-500">
              Pick a store, browse categories, then select a template to apply to your storefront.
            </p>
          </>
        )}

        <div className={`flex flex-col gap-4 sm:flex-row sm:items-end ${isOnboarding ? '' : 'mt-5'}`}>
          {!isOnboarding && (
            <label className="flex flex-1 max-w-xs flex-col gap-1.5 text-sm font-medium text-gray-700">
              Store
              <select
                value={selectedStoreId ?? ''}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal text-gray-900 shadow-sm focus:border-jade-500 focus:outline-none focus:ring-2 focus:ring-jade-500/20"
              >
                {stores.length === 0 && <option value="">No stores yet</option>}
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-1 max-w-xs flex-col gap-1.5 text-sm font-medium text-gray-700">
            Category
            <select
              value={sectionCategory}
              onChange={(e) => {
                setSectionCategory(e.target.value as SectionCategoryId);
                setSelectedTemplate(null);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal text-gray-900 shadow-sm focus:border-jade-500 focus:outline-none focus:ring-2 focus:ring-jade-500/20"
            >
              {SECTION_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeStore?.sectionTemplate && (
          <p className="mt-3 text-xs text-gray-500">
            Current template:{' '}
            <span className="font-medium text-gray-700">{activeStore.sectionTemplate}</span>
          </p>
        )}

        {/* Template cards */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_VARIANTS[sectionCategory].map((v) => {
            const Preview = PREVIEW_MAP[v.id];
            const isSelected = selectedTemplate === v.id;
            const isActive = activeStore?.sectionTemplate === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedTemplate(v.id);
                  if (!isOnboarding && selectedStoreId) void applyTemplate(v.id);
                }}
                className={`group cursor-pointer overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition ${
                  isSelected
                    ? 'border-jade-600 ring-2 ring-jade-600/20'
                    : 'border-gray-200 hover:border-jade-600/30 hover:shadow-md'
                }`}
              >
                <div className="relative h-56 overflow-hidden border-b border-gray-200 p-1">
                  {Preview && <Preview accent={v.accent} />}
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-jade-600 text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {isActive && !isSelected && (
                    <div className="absolute top-2 right-2 rounded-full bg-earth-800 px-2 py-0.5 text-[10px] font-medium text-white">
                      Active
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900">{v.name}</h2>
                    {isActive && (
                      <span className="rounded-full bg-jade-50 px-2 py-0.5 text-[10px] font-medium text-jade-700">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{v.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {v.sections.map((s) => (
                      <span key={s} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isOnboarding ? (
            <>
              <a
                href="/onboarding/category"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Back
              </a>
              <button
                type="button"
                disabled={
                  !selectedTemplate || onboardingTemplateLoading || !onboardingTemplateId
                }
                onClick={continueOnboarding}
                className="flex-1 rounded-lg bg-jade-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-jade-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {onboardingTemplateLoading ? 'Loading…' : 'Continue to deploy'}
              </button>
              {selectedTemplate && (
                <p className="w-full text-sm text-gray-500">
                  Selected: <span className="font-medium text-gray-700">{SECTION_VARIANTS[sectionCategory].find((v) => v.id === selectedTemplate)?.name ?? selectedTemplate}</span>
                </p>
              )}
              {onboardingTemplateError && (
                <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                  <p className="font-medium">{onboardingTemplateError}</p>
                  <p className="mt-1">
                    Add a template in admin, then try again.{' '}
                    <a href="/dashboard/templates" className="underline decoration-red-400 underline-offset-2 hover:text-red-800">
                      /dashboard/templates
                    </a>
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!selectedTemplate || !selectedStoreId || applying}
                onClick={() => applyTemplate()}
                className="rounded-lg bg-jade-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-jade-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {applying ? 'Applying…' : 'Apply selected template'}
              </button>
              {selectedTemplate && activeStore?.sectionTemplate !== selectedTemplate && (
                <p className="text-sm text-gray-500">
                  Selected: <span className="font-medium text-gray-700">{selectedTemplate}</span>
                </p>
              )}
              {msg && (
                <p className={`text-sm font-medium ${msg.ok ? 'text-jade-700' : 'text-red-600'}`} role="status">
                  {msg.text}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function TemplateManagementPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <TemplateManagementPageContent />
    </Suspense>
  );
}
