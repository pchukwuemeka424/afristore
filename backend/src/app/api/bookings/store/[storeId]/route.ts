import { requireBearer } from '@/lib/auth';
import * as bookings from '@/lib/bookings';
import { handleRouteError, json } from '@/lib/http';

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId } = await context.params;
    const list = await bookings.listBookingsForStore(user.userId, storeId);
    return json(list);
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
    const body = await request.json();
    const booking = await bookings.createBooking(storeId, body);
    return json(booking, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
