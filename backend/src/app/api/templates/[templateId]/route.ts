import { requireBearer } from '@/lib/auth';
import { handleRouteError, json } from '@/lib/http';
import { assertPlatformAdminEmail } from '@/lib/platform-admin';
import * as templatesCrud from '@/lib/templates-crud';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ templateId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    assertPlatformAdminEmail(user.email);
    const { templateId } = await context.params;
    const body = (await request.json()) as templatesCrud.UpdateTemplateBody;
    const updated = await templatesCrud.updateTemplate(templateId, body);
    return json(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ templateId: string }> },
) {
  try {
    const user = requireBearer(_request.headers.get('authorization'));
    assertPlatformAdminEmail(user.email);
    const { templateId } = await context.params;
    const result = await templatesCrud.deleteTemplate(templateId);
    return json(result);
  } catch (e) {
    return handleRouteError(e);
  }
}
