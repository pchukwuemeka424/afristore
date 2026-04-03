import { requireBearer } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { handleRouteError, json } from '@/lib/http';
import { oid } from '@/lib/ids';
import { MarketingCampaign, Store } from '@/models';

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    await dbConnect();
    const store = await Store.findOne({ _id: oid(storeId), userId: oid(user.userId) });
    if (!store) return json({ message: 'Not found' }, { status: 404 });
    const items = await MarketingCampaign.find({ storeId: store._id }).sort({ createdAt: -1 });
    return json(items.map((r) => r.toJSON()));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    await dbConnect();
    const store = await Store.findOne({ _id: oid(storeId), userId: oid(user.userId) });
    if (!store) return json({ message: 'Not found' }, { status: 404 });
    const body = (await request.json()) as {
      name?: string;
      channel?: string;
      body?: string;
      scheduledAt?: string;
    };
    const row = await MarketingCampaign.create({
      storeId: store._id,
      name: body.name ?? 'Campaign',
      channel: body.channel ?? 'email',
      body: body.body ?? '',
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    });
    return json(row.toJSON());
  } catch (e) {
    return handleRouteError(e);
  }
}
