import { requireBearer } from '@/lib/auth';
import * as ai from '@/lib/ai';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const result = await ai.insights(storeId, user.userId);
    return json(result);
  } catch (e) {
    return handleRouteError(e);
  }
}
