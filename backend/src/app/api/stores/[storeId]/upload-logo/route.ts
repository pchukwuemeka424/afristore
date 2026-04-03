import { requireBearer } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { handleRouteError, json } from '@/lib/http';
import { oid } from '@/lib/ids';
import { saveStoreLogo } from '@/lib/product-image-upload';
import { Store } from '@/models';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    await dbConnect();
    const store = await Store.findOne({ _id: oid(storeId), userId: oid(user.userId) });
    if (!store) {
      return json({ message: 'Store not found' }, { status: 404 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return json({ message: 'Missing file' }, { status: 400 });
    }

    const url = await saveStoreLogo(storeId, file, request);
    return json({ url });
  } catch (e) {
    return handleRouteError(e);
  }
}
