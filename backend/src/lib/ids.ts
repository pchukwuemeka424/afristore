import mongoose from 'mongoose';
import { HttpError } from './http';

export function oid(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'Invalid id');
  }
  return new mongoose.Types.ObjectId(id);
}
