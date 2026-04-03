import { NextRequest, NextResponse } from 'next/server';

const STORE_BASE = process.env.NEXT_PUBLIC_STORE_BASE ?? 'localhost:3000';
const BASE_HOST = STORE_BASE.split(':')[0];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];

  if (
    hostname === BASE_HOST ||
    hostname === `www.${BASE_HOST}` ||
    !hostname.endsWith(`.${BASE_HOST}`)
  ) {
    return NextResponse.next();
  }

  const subdomain = hostname.slice(0, -(`.${BASE_HOST}`.length));
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) return NextResponse.next();

  // Redirect /s/{subdomain}/* → /* so URLs stay clean on the subdomain
  if (pathname === `/s/${subdomain}` || pathname.startsWith(`/s/${subdomain}/`)) {
    const clean = pathname.slice(`/s/${subdomain}`.length) || '/';
    const url = request.nextUrl.clone();
    url.pathname = clean;
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/s/${subdomain}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
