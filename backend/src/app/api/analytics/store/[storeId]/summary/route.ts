import { requireBearer } from '@/lib/auth';
import * as analytics from '@/lib/analytics';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const data = await analytics.summary(storeId, user.userId);
    if (!data) return json({ message: 'Not found' }, { status: 404 });
    return json(data);
  } catch (e) {
    return handleRouteError(e);
  }
}
