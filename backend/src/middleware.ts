import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function corsHeaders(request: NextRequest) {
  const allowed =
    process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? ['http://localhost:3000'];
  const origin = request.headers.get('origin') ?? '';
  const allow =
    allowed.includes('*') || allowed.includes(origin) ? origin || allowed[0] : allowed[0];
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', allow ?? '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  return headers;
}

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
  }
  const res = NextResponse.next();
  corsHeaders(request).forEach((value, key) => res.headers.set(key, value));
  return res;
}

export const config = {
  matcher: '/api/:path*',
};
