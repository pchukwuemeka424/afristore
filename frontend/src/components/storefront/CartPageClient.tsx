'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WhatsAppCheckoutButton } from '@/components/storefront/WhatsAppCheckoutButton';
import { useStorefrontCart } from '@/lib/storefront-cart';

export function CartPageClient({
  storeCurrency,
  storeName,
  whatsappPhone,
}: {
  storeCurrency: string;
  storeName: string;
  whatsappPhone?: string | null;
}) {
  const { slug } = useParams<{ slug: string }>();
  const { lines, setQuantity, removeLine, subtotal, currency } = useStorefrontCart();
  const cur = currency ?? storeCurrency;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-earth-950">Your cart</h1>
      {lines.length === 0 ? (
        <p className="mt-6 text-earth-800/80">
          Your cart is empty.{' '}
          <Link href={`/s/${slug}`} className="font-medium text-jade-700 hover:underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-earth-800/10 rounded-2xl border border-earth-800/10 bg-white/90">
          {lines.map((line) => (
            <li key={line.productId} className="flex flex-wrap gap-4 p-4 sm:flex-nowrap sm:items-center">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-earth-800/10 bg-earth-100">
                {line.image ? (
                  <img src={line.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-earth-500">—</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-earth-950">{line.title}</p>
                <p className="mt-1 text-sm text-earth-800/80">
                  {line.price} {line.currency} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`qty-${line.productId}`}>
                  Quantity
                </label>
                <input
                  id={`qty-${line.productId}`}
                  type="number"
                  min={1}
                  max={line.maxStock}
                  value={line.quantity}
                  onChange={(e) => setQuantity(line.productId, Number(e.target.value))}
                  className="w-16 rounded-lg border border-earth-800/15 px-2 py-1 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeLine(line.productId)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {lines.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 border-t border-earth-800/10 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-earth-950">
            Subtotal: {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            {cur}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/s/${slug}`}
              className="rounded-xl border border-earth-800/20 px-4 py-2 text-sm font-medium hover:bg-white"
            >
              Continue shopping
            </Link>
            <WhatsAppCheckoutButton
              storeName={storeName}
              slug={slug}
              whatsappPhone={whatsappPhone}
              variant="outline"
              size="sm"
              label="WhatsApp"
            />
            <Link
              href={`/s/${slug}/checkout`}
              className="rounded-xl bg-jade-600 px-4 py-2 text-sm font-medium text-white hover:bg-jade-500"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
