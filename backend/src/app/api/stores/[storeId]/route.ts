import { requireBearer } from '@/lib/auth';
import * as stores from '@/lib/stores';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const store = await stores.getStore(user.userId, storeId);
    return json(store);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const body = (await request.json()) as stores.UpdateStoreBody;
    const store = await stores.updateStore(user.userId, storeId, body);
    return json(store);
  } catch (e) {
    return handleRouteError(e);
  }
}
