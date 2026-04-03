'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, uploadProductImage } from '@/lib/api';

type Store = {
  id: string;
  name: string;
  slug: string;
  currency: string;
};

export type DashboardProduct = {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  currency: string;
  sku?: string | null;
  stock: number;
  published: boolean;
  images?: string[];
};

const emptyCreate = {
  title: '',
  description: '',
  price: '',
  stock: '10',
  sku: '',
  published: true,
};

export default function StoreProductsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [storeStatus, setStoreStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const [create, setCreate] = useState(emptyCreate);
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [createBusy, setCreateBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editing, setEditing] = useState<DashboardProduct | null>(null);
  const [editDraft, setEditDraft] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    published: true,
  });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!storeId) return;
    setListLoading(true);
    try {
      const list = await apiFetch<DashboardProduct[]>(`/api/products/store/${storeId}`);
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setListLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!createImage) {
      setCreatePreview(null);
      return;
    }
    const u = URL.createObjectURL(createImage);
    setCreatePreview(u);
    return () => URL.revokeObjectURL(u);
  }, [createImage]);

  useEffect(() => {
    if (!editImage) {
      setEditPreview(null);
      return;
    }
    const u = URL.createObjectURL(editImage);
    setEditPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [editImage]);

  useEffect(() => {
    if (!storeId || !user) return;
    setStoreStatus('loading');
    setStore(null);
    apiFetch<Store>(`/api/stores/${storeId}`)
      .then((s) => {
        setStore(s);
        setStoreStatus('ready');
      })
      .catch(() => {
        setStore(null);
        setStoreStatus('missing');
      });
  }, [storeId, user]);

  useEffect(() => {
    if (!storeId || !user || storeStatus !== 'ready') return;
    loadProducts();
  }, [storeId, user, storeStatus, loadProducts]);

  function openEdit(p: DashboardProduct) {
    setEditing(p);
    setEditError(null);
    setEditImage(null);
    setEditDraft({
      title: p.title,
      description: p.description ?? '',
      price: String(p.price),
      stock: String(p.stock),
      sku: p.sku ?? '',
      published: p.published,
    });
  }

  function closeEdit() {
    setEditing(null);
    setEditImage(null);
    setEditPreview(null);
    setEditError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId || !store) return;
    const price = Number(create.price);
    const stock = Number(create.stock);
    if (!create.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError('Valid price required');
      return;
    }
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      setFormError('Valid whole-number stock required');
      return;
    }
    setFormError(null);
    setCreateBusy(true);
    try {
      let images: string[] = [];
      if (createImage) {
        images = [await uploadProductImage(storeId, createImage)];
      }
      await apiFetch(`/api/products/store/${storeId}`, {
        method: 'POST',
        body: JSON.stringify({
          title: create.title.trim(),
          description: create.description.trim() || undefined,
          price,
          currency: store.currency,
          stock,
          sku: create.sku.trim() || undefined,
          published: create.published,
          images,
        }),
      });
      setCreate({ ...emptyCreate, price: '', stock: '10' });
      setCreateImage(null);
      await loadProducts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create product');
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId || !editing) return;
    const price = Number(editDraft.price);
    const stock = Number(editDraft.stock);
    if (!editDraft.title.trim()) {
      setEditError('Title is required');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setEditError('Valid price required');
      return;
    }
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      setEditError('Valid whole-number stock required');
      return;
    }
    setEditError(null);
    setEditBusy(true);
    try {
      let images = [...(editing.images ?? [])];
      if (editImage) {
        const url = await uploadProductImage(storeId, editImage);
        images = [...images, url];
      }
      await apiFetch(`/api/products/store/${storeId}/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editDraft.title.trim(),
          description: editDraft.description.trim() || '',
          price,
          stock,
          sku: editDraft.sku.trim() || null,
          published: editDraft.published,
          images,
        }),
      });
      closeEdit();
      await loadProducts();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not update product');
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete() {
    if (!storeId || !deleteId) return;
    setDeleteBusy(true);
    try {
      await apiFetch(`/api/products/store/${storeId}/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      await loadProducts();
    } finally {
      setDeleteBusy(false);
    }
  }

  if (!user || loading) return <div className="p-10 text-center">Loading…</div>;
  if (storeStatus === 'loading') return <div className="p-10 text-center text-earth-800/80">Loading store…</div>;
  if (storeStatus === 'missing' || !store) return <div className="p-10 text-center">Store not found.</div>;

  const base = `/dashboard/${storeId}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={base} className="text-sm text-jade-700 hover:underline">
            ← {store.name}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold">Products</h1>
          <p className="text-sm text-earth-800/75">Add, edit, and remove catalog items. Currency: {store.currency}</p>
        </div>
        <a
          href={`/s/${store.slug}`}
          className="rounded-xl border border-earth-800/15 px-4 py-2 text-sm font-medium hover:bg-white"
        >
          View storefront
        </a>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-earth-800/10 pb-4">
        <Link
          href={base}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Overview
        </Link>
        <span className="rounded-full px-4 py-1.5 text-sm bg-earth-950 text-white">Products</span>
        <Link
          href={`${base}/settings`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Settings
        </Link>
        <Link
          href={`${base}#orders`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          Orders
        </Link>
        <Link
          href={`${base}#ai`}
          className="rounded-full px-4 py-1.5 text-sm bg-earth-100 text-earth-900 hover:bg-earth-200/80"
        >
          AI
        </Link>
      </nav>

      <section className="mt-8 rounded-2xl border border-earth-800/10 bg-white/80 p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-earth-950">New product</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900 sm:col-span-2">
            Title *
            <input
              required
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              value={create.title}
              onChange={(e) => setCreate((c) => ({ ...c, title: e.target.value }))}
              placeholder="Product name"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900 sm:col-span-2">
            Description
            <textarea
              rows={3}
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              value={create.description}
              onChange={(e) => setCreate((c) => ({ ...c, description: e.target.value }))}
              placeholder="Short description for the storefront"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Price ({store.currency}) *
            <input
              type="number"
              min={0}
              step="0.01"
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              value={create.price}
              onChange={(e) => setCreate((c) => ({ ...c, price: e.target.value }))}
              placeholder="0"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Stock *
            <input
              type="number"
              min={0}
              step={1}
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              value={create.stock}
              onChange={(e) => setCreate((c) => ({ ...c, stock: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            SKU
            <input
              className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
              value={create.sku}
              onChange={(e) => setCreate((c) => ({ ...c, sku: e.target.value }))}
              placeholder="Optional"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
            Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="text-xs font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-jade-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
              onChange={(e) => setCreateImage(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-earth-900 sm:col-span-2">
            <input
              type="checkbox"
              checked={create.published}
              onChange={(e) => setCreate((c) => ({ ...c, published: e.target.checked }))}
            />
            Published on storefront
          </label>
          {createPreview && (
            <div className="relative h-28 w-28 sm:col-span-2">
              <img src={createPreview} alt="" className="h-full w-full rounded-xl border border-earth-800/10 object-cover" />
              <button
                type="button"
                onClick={() => setCreateImage(null)}
                className="absolute right-1 top-1 rounded-full bg-earth-950/80 px-2 py-0.5 text-xs text-white"
              >
                Clear
              </button>
            </div>
          )}
          {formError && <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createBusy}
              className="rounded-xl bg-jade-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-jade-500 disabled:opacity-50"
            >
              {createBusy ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-earth-950">Catalog</h2>
        {listLoading ? (
          <p className="mt-4 text-sm text-earth-800/70">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="mt-4 rounded-xl border border-earth-800/10 bg-earth-50/50 px-4 py-8 text-center text-sm text-earth-800/75">
            No products yet. Create one above.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-earth-800/10 bg-white/80">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-earth-800/10 bg-earth-50/80 text-xs uppercase tracking-wide text-earth-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-800/10">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-earth-50/50">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-earth-800/10 bg-earth-100">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-earth-500">—</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-earth-950">{p.title}</p>
                      {p.sku && <p className="text-xs text-earth-600">SKU: {p.sku}</p>}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {p.price} {p.currency}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.published ? 'bg-jade-100 text-jade-900' : 'bg-earth-200 text-earth-800'
                        }`}
                      >
                        {p.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="mr-2 text-jade-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(p.id)}
                        className="text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-earth-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="edit-product-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-earth-800/10 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="edit-product-title" className="font-display text-xl font-semibold text-earth-950">
                Edit product
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-sm text-earth-600 hover:bg-earth-100"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleUpdate} className="mt-4 grid gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
                Title *
                <input
                  required
                  className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
                  value={editDraft.title}
                  onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
                Description
                <textarea
                  rows={3}
                  className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
                  value={editDraft.description}
                  onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
                  Price *
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
                    value={editDraft.price}
                    onChange={(e) => setEditDraft((d) => ({ ...d, price: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
                  Stock *
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
                    value={editDraft.stock}
                    onChange={(e) => setEditDraft((d) => ({ ...d, stock: e.target.value }))}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
                SKU
                <input
                  className="rounded-xl border border-earth-800/15 px-3 py-2 font-normal"
                  value={editDraft.sku}
                  onChange={(e) => setEditDraft((d) => ({ ...d, sku: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-earth-900">
                Add image (appends to gallery)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="text-xs font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-earth-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                  onChange={(e) => setEditImage(e.target.files?.[0] ?? null)}
                />
              </label>
              {(editing.images?.length || editPreview) ? (
                <div className="flex flex-wrap gap-2">
                  {editing.images?.map((src) => (
                    <div key={src} className="h-16 w-16 overflow-hidden rounded-lg border border-earth-800/10">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {editImage && editPreview && (
                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-earth-800/10 ring-2 ring-jade-500">
                      <img src={editPreview} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm font-medium text-earth-900">
                <input
                  type="checkbox"
                  checked={editDraft.published}
                  onChange={(e) => setEditDraft((d) => ({ ...d, published: e.target.checked }))}
                />
                Published
              </label>
              {editError && <p className="text-sm text-red-600">{editError}</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editBusy}
                  className="rounded-xl bg-jade-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-jade-500 disabled:opacity-50"
                >
                  {editBusy ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl border border-earth-800/20 px-5 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-earth-950/40 p-4"
          role="dialog"
          aria-modal
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-earth-800/10 bg-white p-6 shadow-xl">
            <h2 id="delete-title" className="font-display text-lg font-semibold text-earth-950">
              Delete product?
            </h2>
            <p className="mt-2 text-sm text-earth-800/85">This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-earth-800/20 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleteBusy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
