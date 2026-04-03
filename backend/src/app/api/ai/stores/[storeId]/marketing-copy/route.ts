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
    const body = (await request.json()) as { campaignName?: string; channel?: string };
    const result = await ai.marketingCopy({
      storeId,
      userId: user.userId,
      campaignName: body.campaignName ?? '',
      channel: body.channel ?? 'email',
    });
    return json(result);
  } catch (e) {
    return handleRouteError(e);
  }
}
