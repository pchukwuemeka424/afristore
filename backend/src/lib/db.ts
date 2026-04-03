import mongoose from 'mongoose';

function databaseUrl(): string {
  const u = process.env.DATABASE_URL;
  if (!u) throw new Error('DATABASE_URL is not set');
  return u;
}

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as typeof globalThis & { _mongoose?: MongooseCache };

if (!g._mongoose) {
  g._mongoose = { conn: null, promise: null };
}

/** Call before any Mongoose query (safe to call repeatedly). */
export async function dbConnect(): Promise<typeof mongoose> {
  if (g._mongoose!.conn) return g._mongoose!.conn;
  if (!g._mongoose!.promise) {
    g._mongoose!.promise = mongoose.connect(databaseUrl(), { bufferCommands: false });
  }
  g._mongoose!.conn = await g._mongoose!.promise;
  return g._mongoose!.conn;
}
