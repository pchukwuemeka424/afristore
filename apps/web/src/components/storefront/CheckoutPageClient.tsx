'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { WhatsAppCheckoutButton } from '@/components/storefront/WhatsAppCheckoutButton';
import { apiFetch } from '@/lib/api';
import { useStorefrontCart, type StorefrontCartLine } from '@/lib/storefront-cart';
import {
  buildPlacedOrderWhatsAppMessage,
  whatsappDigits,
  whatsappOrderUrl,
} from '@/lib/whatsapp-order';

type OrderResult = {
  id: string;
  total: number;
  currency: string;
  customerEmail: string;
  status: string;
};

function parseCheckoutError(message: string): string {
  try {
    const j = JSON.parse(message) as { message?: string };
    if (j?.message && typeof j.message === 'string') return j.message;
  } catch {
    /* plain text */
  }
  return message || 'Something went wrong';
}

export function CheckoutPageClient({
  storeCurrency,
  storeName,
  whatsappPhone,
}: {
  storeCurrency: string;
  storeName: string;
  whatsappPhone?: string | null;
}) {
  const { slug } = useParams<{ slug: string }>();
  const { lines, subtotal, currency, clearCart } = useStorefrontCart();
  const cur = currency ?? storeCurrency;
  const [email, setEmail] = useState('');
  const [waName, setWaName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<OrderResult | null>(null);
  const [placedLines, setPlacedLines] = useState<StorefrontCartLine[] | null>(null);

  const postOrderWaUrl = useMemo(() => {
    if (!done || !whatsappPhone) return null;
    const d = whatsappDigits(whatsappPhone);
    if (!d) return null;
    const lineSnaps =
      placedLines?.map((l) => ({
        title: l.title,
        quantity: l.quantity,
        unitPrice: l.price,
        currency: l.currency,
      })) ?? [];
    const msg = buildPlacedOrderWhatsAppMessage({
      storeName,
      slug,
      orderId: done.id,
      total: Number(done.total),
      currency: done.currency,
      customerEmail: done.customerEmail,
      customerName: waName.trim() || undefined,
      lines: lineSnaps,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
    });
    return whatsappOrderUrl(d, msg);
  }, [done, whatsappPhone, placedLines, storeName, slug, waName]);

  useEffect(() => {
    if (!postOrderWaUrl || !done) return;
    const key = `afristore-wa-order:${done.id}`;
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return;
      const w = window.open(postOrderWaUrl, '_blank', 'noopener,noreferrer');
      if (w && typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
  }, [postOrderWaUrl, done]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    const linesSnapshot = lines.map((l) => ({ ...l }));
    try {
      const order = await apiFetch<OrderResult>('/api/orders/checkout', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          storeSlug: slug,
          customerEmail: trimmed,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      setPlacedLines(linesSnapshot);
      clearCart();
      setDone(order);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setError(parseCheckoutError(raw));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <div className="rounded-2xl border border-jade-200 bg-jade-50/50 p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-earth-950">Order placed</h1>
          <p className="mt-3 text-sm text-earth-800/85">
            Thank you. We sent a confirmation to <strong>{done.customerEmail}</strong>.
          </p>
          <p className="mt-4 text-lg font-semibold text-jade-900">
            Total:{' '}
            {Number(done.total).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            {done.currency}
          </p>
          <p className="mt-2 text-xs text-earth-600">Order ID: {done.id}</p>
          {postOrderWaUrl && (
            <>
              <p className="mt-6 text-sm text-earth-800/85">
                Next: complete checkout with <strong>{storeName}</strong> on WhatsApp — payment and delivery are
                confirmed there. A chat window should open automatically; if it did not, use the button below.
              </p>
              <a
                href={postOrderWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a]"
              >
                Open WhatsApp
              </a>
            </>
          )}
          <div className={postOrderWaUrl ? 'mt-6' : 'mt-8'}>
            <Link
              href={`/s/${slug}`}
              className="inline-block rounded-xl border border-earth-800/20 bg-white px-6 py-2.5 text-sm font-medium hover:bg-earth-50"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-earth-950">Checkout</h1>
        <p className="mt-4 text-earth-800/85">
          Your cart is empty. Add items before checking out.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/s/${slug}/cart`}
            className="rounded-xl border border-earth-800/20 px-4 py-2 text-sm font-medium hover:bg-white"
          >
            View cart
          </Link>
          <Link
            href={`/s/${slug}`}
            className="rounded-xl bg-jade-600 px-4 py-2 text-sm font-medium text-white hover:bg-jade-500"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-earth-950">Checkout</h1>
      <p className="mt-2 text-sm text-earth-800/75">
        Totals are confirmed from the catalog when you place the order.
        {whatsappPhone
          ? ' After you place the order, WhatsApp opens so you can pay and arrange delivery with the seller.'
          : ''}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-6 lg:col-span-3">
          <div>
            <label htmlFor="checkout-email" className="text-sm font-medium text-earth-900">
              Email for order updates
            </label>
            <input
              id="checkout-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-earth-800/15 px-4 py-3 text-earth-950"
            />
          </div>
          {whatsappPhone && (
            <div>
              <label htmlFor="checkout-wa-name" className="text-sm font-medium text-earth-900">
                Your name <span className="font-normal text-earth-600">(optional, included in WhatsApp message)</span>
              </label>
              <input
                id="checkout-wa-name"
                type="text"
                autoComplete="name"
                value={waName}
                onChange={(e) => setWaName(e.target.value)}
                placeholder="e.g. Ada"
                className="mt-2 w-full rounded-xl border border-earth-800/15 px-4 py-3 text-earth-950"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-jade-600 px-6 py-3 text-sm font-medium text-white hover:bg-jade-500 disabled:opacity-50"
            >
              {busy ? 'Placing order…' : 'Place order'}
            </button>
            <WhatsAppCheckoutButton
              storeName={storeName}
              slug={slug}
              whatsappPhone={whatsappPhone}
              customerEmail={email}
              customerName={waName}
              label="Order on WhatsApp"
            />
            <Link
              href={`/s/${slug}/cart`}
              className="inline-flex items-center rounded-xl border border-earth-800/20 px-6 py-3 text-sm font-medium hover:bg-white"
            >
              Edit cart
            </Link>
          </div>
        </form>

        <aside className="lg:col-span-2">
          <div className="rounded-2xl border border-earth-800/10 bg-white/90 p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-earth-700">
              Order summary
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {lines.map((l) => (
                <li key={l.productId} className="flex justify-between gap-2 text-earth-800">
                  <span className="min-w-0 truncate">
                    {l.title} × {l.quantity}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {(l.price * l.quantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {l.currency}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-earth-800/10 pt-4 text-base font-semibold text-earth-950">
              Estimated:{' '}
              {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {cur}
            </p>
            {whatsappPhone && (
              <p className="mt-3 text-xs text-earth-700">
                After a successful order, WhatsApp opens with your order details so you can finish checkout with the
                seller.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
