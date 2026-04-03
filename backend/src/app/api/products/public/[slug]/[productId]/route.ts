import { handleRouteError, json } from '@/lib/http';
import { getPublishedProductBySlug } from '@/lib/products';

export async function GET(_request: Request, context: { params: Promise<{ slug: string; productId: string }> }) {
  try {
    const { slug, productId } = await context.params;
    const product = await getPublishedProductBySlug(slug, productId);
    return json(product);
  } catch (e) {
    return handleRouteError(e);
  }
}
