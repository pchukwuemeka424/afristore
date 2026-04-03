import * as bookings from '@/lib/bookings';
import { handleRouteError, json } from '@/lib/http';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const booking = await bookings.createPublicBooking(slug, body);
    return json(booking, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
