import { BookingStatus } from './enums';
import { dbConnect } from './db';
import { HttpError } from './http';
import { oid } from './ids';
import { Booking, Store } from '@/models';

export type CreateBookingBody = {
  name: string;
  email?: string;
  phone?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
};

export async function createBooking(storeId: string, dto: CreateBookingBody) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId) });
  if (!store) throw new HttpError(404, 'Store not found');

  if (!dto.name?.trim()) throw new HttpError(400, 'Name is required');
  if (!dto.date?.trim()) throw new HttpError(400, 'Date is required');
  if (!dto.time?.trim()) throw new HttpError(400, 'Time is required');
  if (!dto.guests || dto.guests < 1) throw new HttpError(400, 'At least 1 guest required');

  const booking = await Booking.create({
    storeId: store._id,
    name: dto.name.trim(),
    email: dto.email?.trim() || null,
    phone: dto.phone?.trim() || null,
    date: dto.date.trim(),
    time: dto.time.trim(),
    guests: dto.guests,
    notes: dto.notes?.trim() || '',
    status: BookingStatus.PENDING,
  });

  return booking.toJSON();
}

export async function createPublicBooking(storeSlug: string, dto: CreateBookingBody) {
  await dbConnect();
  const store = await Store.findOne({ slug: storeSlug });
  if (!store) throw new HttpError(404, 'Store not found');

  if (!dto.name?.trim()) throw new HttpError(400, 'Name is required');
  if (!dto.date?.trim()) throw new HttpError(400, 'Date is required');
  if (!dto.time?.trim()) throw new HttpError(400, 'Time is required');
  if (!dto.guests || dto.guests < 1) throw new HttpError(400, 'At least 1 guest required');

  const booking = await Booking.create({
    storeId: store._id,
    name: dto.name.trim(),
    email: dto.email?.trim() || null,
    phone: dto.phone?.trim() || null,
    date: dto.date.trim(),
    time: dto.time.trim(),
    guests: dto.guests,
    notes: dto.notes?.trim() || '',
    status: BookingStatus.PENDING,
  });

  return booking.toJSON();
}

export async function listBookingsForStore(userId: string, storeId: string) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId) });
  if (!store) throw new HttpError(404, 'Store not found');
  if (store.userId.toString() !== userId) throw new HttpError(403, 'Forbidden');

  const bookings = await Booking.find({ storeId: oid(storeId) }).sort({ createdAt: -1 });
  return bookings.map((b) => b.toJSON());
}

export async function updateBookingStatus(
  userId: string,
  storeId: string,
  bookingId: string,
  status: BookingStatus,
) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId) });
  if (!store) throw new HttpError(404, 'Store not found');
  if (store.userId.toString() !== userId) throw new HttpError(403, 'Forbidden');

  const booking = await Booking.findOne({ _id: oid(bookingId), storeId: oid(storeId) });
  if (!booking) throw new HttpError(404, 'Booking not found');

  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id },
    { $set: { status } },
    { new: true },
  );
  if (!updated) throw new HttpError(404, 'Booking not found');
  return updated.toJSON();
}
