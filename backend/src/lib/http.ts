import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function handleRouteError(e: unknown) {
  if (e instanceof HttpError) {
    return NextResponse.json({ message: e.message }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
}
