import { BookingStatus } from '@/lib/enums';
import { requireBearer } from '@/lib/auth';
import * as bookings from '@/lib/bookings';
import { handleRouteError, json } from '@/lib/http';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ storeId: string; bookingId: string }> },
) {
  try {
    const user = requireBearer(request.headers.get('authorization'));
    const { storeId, bookingId } = await context.params;
    const body = (await request.json()) as { status?: string };
    const allowed = Object.values(BookingStatus) as string[];
    if (!body.status || !allowed.includes(body.status)) {
      return json({ message: 'Invalid status' }, { status: 400 });
    }
    const booking = await bookings.updateBookingStatus(
      user.userId,
      storeId,
      bookingId,
      body.status as BookingStatus,
    );
    return json(booking);
  } catch (e) {
    return handleRouteError(e);
  }
}
