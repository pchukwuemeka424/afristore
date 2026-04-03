'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, uploadStoreHeroImage, uploadStoreLogo } from '@/lib/api';

type Store = {
  id: string;
  name: string;
  slug: string;
  sectionTemplate?: string | null;
  logoUrl?: string | null;
  tagline?: string | null;
  siteDescription?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  heroAlign?: 'left' | 'center' | 'right';
  templateMenu?: string[];
};

export default function TemplateEditorPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroAlign, setHeroAlign] = useState<'left' | 'center' | 'right'>('left');
  const [tagline, setTagline] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [menuItems, setMenuItems] = useState<string[]>([]);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadStore = useCallback(async () => {
    if (!storeId || !user) return;
    setStatus('loading');
    try {
      const s = await apiFetch<Store>(`/api/stores/${storeId}`);
      setStore(s);
      setHeroTitle(s.heroTitle ?? '');
      setHeroSubtitle(s.heroSubtitle ?? '');
      setHeroAlign((s.heroAlign as 'left' | 'center' | 'right') ?? 'left');
      setTagline(s.tagline ?? '');
      setSiteDescription(s.siteDescription ?? '');
      setMenuItems(s.templateMenu?.length ? s.templateMenu : ['Home', 'Shop', 'Contact']);
      setLogoUrl(s.logoUrl ?? null);
      setHeroImageUrl(s.heroImageUrl ?? null);
      setStatus('ready');
    } catch {
      setStore(null);
      setStatus('missing');
    }
  }, [storeId, user]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    void loadStore();
  }, [loadStore]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const u = URL.createObjectURL(logoFile);
    setLogoPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [logoFile]);

  useEffect(() => {
    if (!heroImageFile) {
      setHeroImagePreview(null);
      return;
    }
    const u = URL.createObjectURL(heroImageFile);
    setHeroImagePreview(u);
    return () => URL.revokeObjectURL(u);
  }, [heroImageFile]);

  function updateMenuItem(idx: number, value: string) {
    setMenuItems((prev) => prev.map((item, i) => (i === idx ? value : item)));
  }

  function removeMenuItem(idx: number) {
    setMenuItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function addMenuItem() {
    setMenuItems((prev) => (prev.length >= 12 ? prev : [...prev, '']));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSaving(true);
    setMsg(null);
    try {
      let nextLogo = logoUrl;
      if (logoFile) {
        nextLogo = await uploadStoreLogo(storeId, logoFile);
        setLogoFile(null);
        setLogoUrl(nextLogo);
      }
      let nextHeroImage = heroImageUrl;
      if (heroImageFile) {
        nextHeroImage = await uploadStoreHeroImage(storeId, heroImageFile);
        setHeroImageFile(null);
        setHeroImageUrl(nextHeroImage);
      }
      const payload = {
        logoUrl: nextLogo ?? null,
        heroImageUrl: nextHeroImage ?? null,
        heroTitle: heroTitle.trim() || null,
        heroSubtitle: heroSubtitle.trim() || null,
        heroAlign,
        tagline: tagline.trim() || null,
        siteDescription: siteDescription.trim() || null,
        templateMenu: menuItems.map((i) => i.trim()).filter(Boolean),
      };
      const updated = await apiFetch<Store>(`/api/stores/${storeId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setStore(updated);
      setMenuItems(updated.templateMenu?.length ? updated.templateMenu : ['Home', 'Shop', 'Contact']);
      setMsg('Template content saved.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not save template content');
    } finally {
      setSaving(false);
    }
  }

  if (!user || loading) return <div className="p-10 text-center">Loading…</div>;
  if (status === 'loading') return <div className="p-10 text-center text-earth-800/80">Loading store…</div>;
  if (status === 'missing' || !store) return <div className="p-10 text-center">Store not found.</div>;

  const base = `/dashboard/${storeId}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href={base} className="text-sm text-jade-700 hover:underline">
        ← {store.name}
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold">Template manager</h1>
      <p className="mt-1 text-sm text-earth-800/75">
        Edit template menu, logo, hero section, and storefront write-up. Active layout:{' '}
        <span className="font-mono">{store.sectionTemplate ?? 'default'}</span>
      </p>

      <form onSubmit={save} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6">
          <h2 className="font-display text-lg font-semibold text-earth-950">Logo</h2>
          <p className="mt-1 text-sm text-earth-800/75">Upload logo used in template headers.</p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            {(logoPreview || logoUrl) && (
              <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-earth-800/10 bg-earth-50">
                <img src={logoPreview ?? logoUrl!} alt="" className="h-full w-full object-contain p-1" />
              </div>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
              Upload
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="text-xs font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-jade-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-earth-950">Hero section</h2>
          <p className="text-sm text-earth-800/75">Upload hero background/product image and update hero copy.</p>
          <div className="flex flex-wrap items-end gap-4">
            {(heroImagePreview || heroImageUrl) && (
              <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-earth-800/10 bg-earth-50">
                <img src={heroImagePreview ?? heroImageUrl!} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
              Upload hero image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="text-xs font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-jade-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {(heroImageUrl || heroImagePreview) && (
              <button
                type="button"
                onClick={() => {
                  setHeroImageUrl(null);
                  setHeroImageFile(null);
                  setHeroImagePreview(null);
                }}
                className="text-sm text-red-700 hover:underline"
              >
                Remove hero image
              </button>
            )}
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Hero heading
            <input
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Main hero title"
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Hero subheading
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Hero supporting write-up"
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
          <div>
            <p className="mb-2 text-sm font-medium text-earth-900">Hero text alignment</p>
            <div className="flex flex-wrap gap-2">
              {(['left', 'center', 'right'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setHeroAlign(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    heroAlign === v
                      ? 'bg-jade-600 text-white'
                      : 'border border-earth-800/15 bg-white text-earth-900 hover:bg-earth-50'
                  }`}
                >
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-earth-950">Menu items</h2>
          <p className="text-sm text-earth-800/75">Add, remove, and rename template menu links (max 12).</p>
          <div className="space-y-2">
            {menuItems.map((item, idx) => (
              <div key={`${idx}-${item}`} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(e) => updateMenuItem(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-earth-800/15 px-3 py-2 text-sm"
                  placeholder={`Menu ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeMenuItem(idx)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMenuItem}
            disabled={menuItems.length >= 12}
            className="rounded-lg border border-earth-800/15 px-3 py-2 text-xs font-medium text-earth-900 hover:bg-earth-50 disabled:opacity-50"
          >
            + Add menu item
          </button>
        </section>

        <section className="rounded-2xl border border-earth-800/10 bg-white/80 p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-earth-950">Write-up</h2>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Tagline
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short line under brand name"
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Footer / about text
            <textarea
              rows={4}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Longer storefront write-up"
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
            />
          </label>
        </section>

        {msg && <p className="text-sm text-earth-800">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-jade-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-jade-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save template content'}
        </button>
      </form>
    </div>
  );
}

