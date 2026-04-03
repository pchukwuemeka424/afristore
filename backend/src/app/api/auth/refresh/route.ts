import { refreshTokens } from '@/lib/auth';
import { handleRouteError, json } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { refreshToken?: string };
    if (!body.refreshToken) {
      return json({ message: 'refreshToken required' }, { status: 400 });
    }
    const tokens = await refreshTokens(body.refreshToken);
    return json(tokens);
  } catch (e) {
    return handleRouteError(e);
  }
}
