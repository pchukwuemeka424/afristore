'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type StorefrontCartLine = {
  productId: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  maxStock: number;
  quantity: number;
};

type AddPayload = {
  productId: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  maxStock: number;
  quantity?: number;
};

type CartContextValue = {
  lines: StorefrontCartLine[];
  addToCart: (item: AddPayload) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  currency: string | null;
};

const StorefrontCartContext = createContext<CartContextValue | null>(null);

export function StorefrontCartProvider({ storeSlug, children }: { storeSlug: string; children: ReactNode }) {
  const [lines, setLines] = useState<StorefrontCartLine[]>([]);
  const storageKey = `afristore-cart:${storeSlug}`;

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as StorefrontCartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, storageKey]);

  const addToCart = useCallback((item: AddPayload) => {
    const addQty = Math.max(1, Math.floor(item.quantity ?? 1));
    if (item.maxStock <= 0) return;
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === item.productId);
      if (idx >= 0) {
        const next = [...prev];
        const merged = Math.min(next[idx].quantity + addQty, item.maxStock);
        next[idx] = {
          ...next[idx],
          title: item.title,
          price: item.price,
          currency: item.currency,
          image: item.image ?? next[idx].image,
          maxStock: item.maxStock,
          quantity: merged,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: item.productId,
          title: item.title,
          price: item.price,
          currency: item.currency,
          image: item.image,
          maxStock: item.maxStock,
          quantity: Math.min(addQty, item.maxStock),
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.floor(quantity);
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId);
      if (idx < 0) return prev;
      if (q <= 0) return prev.filter((l) => l.productId !== productId);
      const line = prev[idx];
      const capped = Math.min(q, line.maxStock);
      const next = [...prev];
      next[idx] = { ...line, quantity: capped };
      return next;
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
    const currency = lines[0]?.currency ?? null;
    return {
      lines,
      addToCart,
      setQuantity,
      removeLine,
      clearCart,
      itemCount,
      subtotal,
      currency,
    };
  }, [lines, addToCart, setQuantity, removeLine, clearCart]);

  return <StorefrontCartContext.Provider value={value}>{children}</StorefrontCartContext.Provider>;
}

export function useStorefrontCart() {
  const ctx = useContext(StorefrontCartContext);
  if (!ctx) throw new Error('useStorefrontCart must be used within StorefrontCartProvider');
  return ctx;
}

export function parseStorefrontPrice(price: number | string): number {
  if (typeof price === 'number' && Number.isFinite(price)) return price;
  const n = parseFloat(String(price).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
