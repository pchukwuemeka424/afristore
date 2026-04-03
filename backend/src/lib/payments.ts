import { createHmac, timingSafeEqual } from 'crypto';
import { OrderStatus, PaymentProvider } from './enums';
import { dbConnect } from './db';
import { HttpError } from './http';
import { oid } from './ids';
import { Order } from '@/models';
import * as notifications from './notifications';

export function verifyPaystackSignature(rawBody: Buffer, signature: string | undefined) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) throw new HttpError(401, 'Missing Paystack configuration');
  const hash = createHmac('sha512', secret).update(rawBody).digest('hex');
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new HttpError(401, 'Invalid Paystack signature');
  }
}

export async function handlePaystackEvent(parsed: {
  event?: string;
  data?: {
    reference?: string;
    metadata?: { storeId?: string; orderId?: string };
  };
}) {
  const ref = parsed.data?.reference;
  const orderId = parsed.data?.metadata?.orderId;
  const storeId = parsed.data?.metadata?.storeId;
  if (parsed.event === 'charge.success' && orderId && storeId && ref) {
    await markOrderPaid(orderId, storeId, ref, PaymentProvider.PAYSTACK);
  }
}

async function markOrderPaid(
  orderId: string,
  storeId: string,
  paymentRef: string,
  provider: PaymentProvider,
) {
  await dbConnect();
  const order = await Order.findOne({ _id: oid(orderId), storeId: oid(storeId) });
  if (!order) {
    console.warn(`No order ${orderId} for store ${storeId}`);
    return { ok: false };
  }
  await Order.updateOne(
    { _id: order._id },
    { $set: { status: OrderStatus.PAID, provider, paymentRef } },
  );
  await notifications.notifyPaymentConfirmed(storeId, paymentRef);
  return { ok: true };
}
