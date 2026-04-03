import { OrderStatus, PaymentProvider } from './enums';
import { dbConnect } from './db';
import { HttpError } from './http';
import { oid } from './ids';
import { Order, OrderItem, Product, Store } from '@/models';
import * as notifications from './notifications';
import * as analytics from './analytics';

export type CheckoutBody = {
  storeSlug: string;
  customerEmail: string;
  items: { productId: string; quantity: number }[];
};

function formatOrderItem(doc: { toJSON: () => Record<string, unknown> }) {
  const j = doc.toJSON() as Record<string, unknown>;
  const p = j.productId;
  if (p && typeof p === 'object' && p !== null && 'title' in p) {
    const prod = p as { id?: string };
    return { ...j, product: p, productId: prod.id ?? j.productId };
  }
  return j;
}

/** MongoDB standalone: sequential writes + rollback order on failure. */
export async function checkout(dto: CheckoutBody) {
  await dbConnect();
  const store = await Store.findOne({ slug: dto.storeSlug });
  if (!store) throw new HttpError(404, 'Store not found');

  const productIds = [...new Set(dto.items.map((i) => i.productId))];
  const products = await Product.find({
    _id: { $in: productIds.map((id) => oid(id)) },
    storeId: store._id,
    published: true,
  });
  if (products.length !== productIds.length) {
    throw new HttpError(400, 'One or more products are invalid');
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  let total = 0;
  for (const line of dto.items) {
    const p = byId.get(line.productId)!;
    if (line.quantity < 1) throw new HttpError(400, 'Invalid quantity');
    if (line.quantity > p.stock) {
      throw new HttpError(400, `Insufficient stock for ${p.title}`);
    }
    total += p.price * line.quantity;
  }

  const created = await Order.create({
    storeId: store._id,
    customerEmail: dto.customerEmail,
    status: OrderStatus.PENDING,
    total,
    currency: store.currency,
    provider: PaymentProvider.MANUAL,
  });

  try {
    for (const line of dto.items) {
      const p = byId.get(line.productId)!;
      await OrderItem.create({
        orderId: created._id,
        productId: p._id,
        quantity: line.quantity,
        unitPrice: p.price,
      });
      await Product.updateOne(
        { _id: p._id },
        { $inc: { stock: -line.quantity } },
      );
    }
  } catch (e) {
    await Order.deleteOne({ _id: created._id });
    throw e;
  }

  const orderId = created.id;
  await notifications.notifyNewOrder(store.id, orderId, dto.customerEmail);
  await analytics.trackEvent(store.id, 'order_created', { orderId, total: String(total) });

  return created.toJSON();
}

export async function listOrdersForStore(userId: string, storeId: string) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId) });
  if (!store) throw new HttpError(404, 'Store not found');
  if (store.userId.toString() !== userId) throw new HttpError(403, 'Forbidden');

  const orders = await Order.find({ storeId: oid(storeId) }).sort({ createdAt: -1 });
  const out = await Promise.all(
    orders.map(async (order) => {
      const items = await OrderItem.find({ orderId: order._id }).populate('productId');
      return {
        ...order.toJSON(),
        items: items.map((it) => formatOrderItem(it)),
      };
    }),
  );
  return out;
}

export async function updateOrderStatus(
  userId: string,
  storeId: string,
  orderId: string,
  status: OrderStatus,
) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId) });
  if (!store) throw new HttpError(404, 'Store not found');
  if (store.userId.toString() !== userId) throw new HttpError(403, 'Forbidden');

  const order = await Order.findOne({ _id: oid(orderId), storeId: oid(storeId) });
  if (!order) throw new HttpError(404, 'Order not found');

  const updated = await Order.findOneAndUpdate(
    { _id: order._id },
    { $set: { status } },
    { new: true },
  );
  if (!updated) throw new HttpError(404, 'Order not found');
  return updated.toJSON();
}
