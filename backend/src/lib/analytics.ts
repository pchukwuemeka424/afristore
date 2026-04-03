import { dbConnect } from './db';
import { oid } from './ids';
import { AnalyticsEvent, Order, Store } from '@/models';

export async function trackEvent(storeId: string, type: string, payload: Record<string, unknown> = {}) {
  await dbConnect();
  await AnalyticsEvent.create({
    storeId: oid(storeId),
    type,
    payload,
  });
}

export async function summary(storeId: string, userId: string) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId) });
  if (!store || store.userId.toString() !== userId) return null;

  const sid = oid(storeId);
  const [orders, revenueAgg, events] = await Promise.all([
    Order.countDocuments({ storeId: sid }),
    Order.aggregate<{ total: number }>([
      { $match: { storeId: sid } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { storeId: sid } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total ?? 0;

  return {
    orders,
    revenue: String(revenue),
    events: events.map((e) => ({ type: e._id, count: e.count })),
  };
}
