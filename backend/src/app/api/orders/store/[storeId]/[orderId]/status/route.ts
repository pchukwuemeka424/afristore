import { OrderStatus } from '@/lib/enums';
import { requireBearer } from '@/lib/auth';
import * as orders from '@/lib/orders';
import { handleRouteError, json } from '@/lib/http';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ storeId: string; orderId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId, orderId } = await context.params;
    const body = (await request.json()) as { status?: string };
    const allowed = Object.values(OrderStatus) as string[];
    if (!body.status || !allowed.includes(body.status)) {
      return json({ message: 'Invalid status' }, { status: 400 });
    }
    const order = await orders.updateOrderStatus(
      user.userId,
      storeId,
      orderId,
      body.status as OrderStatus,
    );
    return json(order);
  } catch (e) {
    return handleRouteError(e);
  }
}
