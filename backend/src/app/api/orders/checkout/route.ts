import * as orders from '@/lib/orders';
import { handleRouteError, json } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as orders.CheckoutBody;
    const order = await orders.checkout(body);
    return json(order);
  } catch (e) {
    return handleRouteError(e);
  }
}
