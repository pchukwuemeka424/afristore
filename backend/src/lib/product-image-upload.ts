import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { HttpError } from './http';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 4 * 1024 * 1024;

function extForMime(mime: string) {
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  return '.jpg';
}

/**
 * Persists a product image. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set;
 * otherwise writes under public/uploads (served by Next from the API origin).
 */
export async function saveProductImage(
  storeId: string,
  file: File,
  request: Request,
): Promise<string> {
  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED.has(mime)) {
    throw new HttpError(400, 'Use JPEG, PNG, WebP, or GIF');
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    throw new HttpError(400, 'Image too large (max 4MB)');
  }

  const ext = extForMime(mime);
  const name = `${randomUUID()}${ext}`;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`products/${storeId}/${name}`, buf, {
      access: 'public',
      token: blobToken,
      contentType: mime,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'products', storeId);
  await mkdir(dir, { recursive: true });
  const fp = path.join(dir, name);
  await writeFile(fp, buf);
  const origin = new URL(request.url).origin;
  return `${origin}/uploads/products/${storeId}/${name}`;
}

/** Store logo: same rules as product images; path stores/{storeId}/ */
export async function saveStoreLogo(storeId: string, file: File, request: Request): Promise<string> {
  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED.has(mime)) {
    throw new HttpError(400, 'Use JPEG, PNG, WebP, or GIF');
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    throw new HttpError(400, 'Image too large (max 4MB)');
  }

  const ext = extForMime(mime);
  const name = `logo-${randomUUID()}${ext}`;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`stores/${storeId}/${name}`, buf, {
      access: 'public',
      token: blobToken,
      contentType: mime,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'stores', storeId);
  await mkdir(dir, { recursive: true });
  const fp = path.join(dir, name);
  await writeFile(fp, buf);
  const origin = new URL(request.url).origin;
  return `${origin}/uploads/stores/${storeId}/${name}`;
}

/** Store hero image: same rules as product images; path stores/{storeId}/ */
export async function saveStoreHeroImage(storeId: string, file: File, request: Request): Promise<string> {
  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED.has(mime)) {
    throw new HttpError(400, 'Use JPEG, PNG, WebP, or GIF');
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    throw new HttpError(400, 'Image too large (max 4MB)');
  }

  const ext = extForMime(mime);
  const name = `hero-${randomUUID()}${ext}`;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`stores/${storeId}/${name}`, buf, {
      access: 'public',
      token: blobToken,
      contentType: mime,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'stores', storeId);
  await mkdir(dir, { recursive: true });
  const fp = path.join(dir, name);
  await writeFile(fp, buf);
  const origin = new URL(request.url).origin;
  return `${origin}/uploads/stores/${storeId}/${name}`;
}
