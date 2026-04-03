'use client';

import { buildWhatsAppOrderMessage, whatsappDigits, whatsappOrderUrl } from '@/lib/whatsapp-order';
import { useStorefrontCart } from '@/lib/storefront-cart';

export function WhatsAppCheckoutButton({
  storeName,
  slug,
  whatsappPhone,
  variant = 'primary',
  customerEmail,
  customerName,
  className = '',
  label = 'Order on WhatsApp',
  size = 'md',
}: {
  storeName: string;
  slug: string;
  whatsappPhone: string | null | undefined;
  variant?: 'primary' | 'outline';
  customerEmail?: string;
  customerName?: string;
  className?: string;
  label?: string;
  size?: 'md' | 'sm';
}) {
  const { lines, subtotal, currency } = useStorefrontCart();
  const digits = whatsappPhone ? whatsappDigits(whatsappPhone) : '';
  if (!digits || lines.length === 0) return null;

  function open() {
    const cur = currency ?? 'NGN';
    const msg = buildWhatsAppOrderMessage({
      storeName,
      slug,
      lines,
      subtotal,
      currency: cur,
      customerEmail,
      customerName,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
    });
    window.open(whatsappOrderUrl(digits, msg), '_blank', 'noopener,noreferrer');
  }

  const pad = size === 'sm' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-sm';
  const baseStyles =
    variant === 'primary'
      ? `rounded-xl bg-[#25D366] ${pad} font-semibold text-white shadow-sm hover:bg-[#20bd5a]`
      : `rounded-xl border-2 border-[#25D366] bg-white ${pad} font-semibold text-[#075E54] hover:bg-[#25D366]/10`;

  return (
    <button type="button" onClick={open} className={[baseStyles, className].filter(Boolean).join(' ')}>
      {label}
    </button>
  );
}
