import { loginUser } from '@/lib/auth';
import { handleRouteError, json } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return json({ message: 'email and password required' }, { status: 400 });
    }
    const tokens = await loginUser(body.email, body.password);
    return json(tokens);
  } catch (e) {
    return handleRouteError(e);
  }
}
