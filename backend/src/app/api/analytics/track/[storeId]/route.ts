import * as analytics from '@/lib/analytics';
import { handleRouteError, json } from '@/lib/http';

export async function POST(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const { storeId } = await context.params;
    const body = (await request.json()) as { type?: string; payload?: Record<string, unknown> };
    if (!body.type) return json({ message: 'type required' }, { status: 400 });
    await analytics.trackEvent(storeId, body.type, body.payload ?? {});
    return json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
