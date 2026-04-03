import * as payments from '@/lib/payments';
import { handleRouteError, json } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const raw = Buffer.from(await request.text());
    const sig = request.headers.get('x-paystack-signature') ?? undefined;
    payments.verifyPaystackSignature(raw, sig);
    const parsed = JSON.parse(raw.toString('utf8')) as Parameters<typeof payments.handlePaystackEvent>[0];
    await payments.handlePaystackEvent(parsed);
    return json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
