import * as products from '@/lib/products';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const list = await products.listPublicBySlug(slug);
    return json(list);
  } catch (e) {
    return handleRouteError(e);
  }
}
