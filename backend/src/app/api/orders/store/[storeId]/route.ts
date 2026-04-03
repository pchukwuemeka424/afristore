import { requireBearer } from '@/lib/auth';
import * as orders from '@/lib/orders';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const list = await orders.listOrdersForStore(user.userId, storeId);
    return json(list);
  } catch (e) {
    return handleRouteError(e);
  }
}
