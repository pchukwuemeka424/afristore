import { requireBearer } from '@/lib/auth';
import * as products from '@/lib/products';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const list = await products.listForDashboard(user.userId, storeId);
    return json(list);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const body = (await request.json()) as products.CreateProductBody;
    const p = await products.createProduct(user.userId, storeId, body);
    return json(p);
  } catch (e) {
    return handleRouteError(e);
  }
}
