import { requireBearer } from '@/lib/auth';
import * as ai from '@/lib/ai';
import { handleRouteError, json } from '@/lib/http';

export async function POST(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const body = (await request.json()) as { title?: string; niche?: string; language?: string };
    const result = await ai.productDescription({
      storeId,
      userId: user.userId,
      title: body.title ?? '',
      niche: body.niche ?? '',
      language: body.language ?? 'en',
    });
    return json(result);
  } catch (e) {
    return handleRouteError(e);
  }
}
