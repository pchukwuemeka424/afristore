import { registerUser } from '@/lib/auth';
import { handleRouteError, json } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; phone?: string };
    if (!body.email || !body.password) {
      return json({ message: 'email and password required' }, { status: 400 });
    }
    const tokens = await registerUser(body.email, body.password, body.phone);
    return json(tokens);
  } catch (e) {
    return handleRouteError(e);
  }
}
