import { requireBearer } from '@/lib/auth';
import * as products from '@/lib/products';
import { handleRouteError, json } from '@/lib/http';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ storeId: string; productId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId, productId } = await context.params;
    const body = (await request.json()) as products.UpdateProductBody;
    const p = await products.updateProduct(user.userId, storeId, productId, body);
    return json(p);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ storeId: string; productId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId, productId } = await context.params;
    const result = await products.deleteProduct(user.userId, storeId, productId);
    return json(result);
  } catch (e) {
    return handleRouteError(e);
  }
}
