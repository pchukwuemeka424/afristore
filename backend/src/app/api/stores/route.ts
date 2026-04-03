import { requireBearer } from '@/lib/auth';
import * as stores from '@/lib/stores';
import { handleRouteError, json } from '@/lib/http';

export async function GET(request: Request) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const list = await stores.listStores(user.userId);
    return json(list);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const body = (await request.json()) as stores.CreateStoreBody;
    const store = await stores.createStore(user.userId, body);
    return json(store);
  } catch (e) {
    return handleRouteError(e);
  }
}
