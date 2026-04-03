import { requireBearer } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { handleRouteError, json } from '@/lib/http';
import { assertPlatformAdminEmail } from '@/lib/platform-admin';
import * as templatesCrud from '@/lib/templates-crud';
import { Template } from '@/models';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche') ?? undefined;
    const q = niche ? { niche } : {};
    const items = await Template.find(q).sort({ niche: 1, sortOrder: 1 });
    const out = items.map((t) => t.toJSON());
    return json({ items: out, total: out.length });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    assertPlatformAdminEmail(user.email);
    const body = (await request.json()) as templatesCrud.CreateTemplateBody;
    const created = await templatesCrud.createTemplate(body);
    return json(created);
  } catch (e) {
    return handleRouteError(e);
  }
}
