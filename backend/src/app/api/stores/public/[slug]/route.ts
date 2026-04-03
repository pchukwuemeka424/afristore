import * as stores from '@/lib/stores';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const store = await stores.getStoreBySlugPublic(slug);
    return json(store);
  } catch (e) {
    return handleRouteError(e);
  }
}
