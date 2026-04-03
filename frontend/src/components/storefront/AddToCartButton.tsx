'use client';

import { parseStorefrontPrice, useStorefrontCart } from '@/lib/storefront-cart';

export type AddToCartProduct = {
  id: string;
  title: string;
  price: number | string;
  currency: string;
  images?: string[];
  stock?: number;
};

export function AddToCartButton({
  product,
  className = '',
  label = 'Add to cart',
}: {
  product: AddToCartProduct;
  className?: string;
  label?: string;
}) {
  const { addToCart } = useStorefrontCart();
  const maxStock = typeof product.stock === 'number' ? product.stock : 999;
  const disabled = maxStock <= 0;
  const price = parseStorefrontPrice(product.price);

  const base =
    'rounded-xl bg-jade-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-jade-500 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        addToCart({
          productId: product.id,
          title: product.title,
          price,
          currency: product.currency,
          image: product.images?.[0],
          maxStock,
          quantity: 1,
        })
      }
      className={[base, className].filter(Boolean).join(' ')}
    >
      {disabled ? 'Out of stock' : label}
    </button>
  );
}
