import type { StorefrontCartLine } from '@/lib/storefront-cart';
import { storeUrl } from '@/lib/store-url';

const MAX_MESSAGE_LEN = 3800;

export function whatsappDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildWhatsAppOrderMessage(params: {
  storeName: string;
  slug: string;
  lines: StorefrontCartLine[];
  subtotal: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  origin?: string;
}): string {
  const { storeName, slug, lines, subtotal, currency, customerEmail, customerName, origin } = params;
  const lineText = lines
    .map(
      (l) =>
        `• ${l.title} × ${l.quantity} — ${(l.price * l.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${l.currency}`,
    )
    .join('\n');
  const totalFmt = subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let msg = `Hi *${storeName}*, I'd like to place an order:\n\n${lineText}\n\n*Estimated total:* ${totalFmt} ${currency}\n`;
  if (customerName?.trim()) msg += `Name: ${customerName.trim()}\n`;
  if (customerEmail?.trim()) msg += `Email: ${customerEmail.trim()}\n`;
  msg += `\n${storeUrl(slug)}`;
  if (msg.length > MAX_MESSAGE_LEN) msg = msg.slice(0, MAX_MESSAGE_LEN - 1) + '…';
  return msg;
}

export function whatsappOrderUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export type PlacedOrderLineSnap = {
  title: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

/** Message sent to the seller after an online order is placed (payment / delivery on WhatsApp). */
export function buildPlacedOrderWhatsAppMessage(params: {
  storeName: string;
  slug: string;
  orderId: string;
  total: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  lines: PlacedOrderLineSnap[];
  origin?: string;
}): string {
  const lineText =
    params.lines.length > 0
      ? params.lines
          .map(
            (l) =>
              `• ${l.title} × ${l.quantity} — ${(l.unitPrice * l.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${l.currency}`,
          )
          .join('\n')
      : '• (line items in AfriStore dashboard / email)';

  const totalFmt = params.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let msg = `Hi *${params.storeName}*,\n\n*New order — AfriStore*\nOrder ID: ${params.orderId}\nEmail: ${params.customerEmail}\n`;
  if (params.customerName?.trim()) msg += `Name: ${params.customerName.trim()}\n`;
  msg += `\n${lineText}\n\n*Total (confirmed):* ${totalFmt} ${params.currency}\n\nPlease confirm payment and delivery here.`;
  msg += `\n\n${storeUrl(params.slug)}`;
  if (msg.length > MAX_MESSAGE_LEN) msg = msg.slice(0, MAX_MESSAGE_LEN - 1) + '…';
  return msg;
}
