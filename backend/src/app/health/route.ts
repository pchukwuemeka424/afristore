import { NextResponse } from 'next/server';

/** Plain `/health` for load balancers (middleware only targets `/api/*`). */
export function GET() {
  return NextResponse.json({ ok: true, service: 'afristore-backend' });
}
