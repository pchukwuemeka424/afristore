import { HttpError } from './http';

/** Comma-separated emails allowed to create/edit/delete templates. */
export function assertPlatformAdminEmail(email: string) {
  const raw = process.env.PLATFORM_ADMIN_EMAILS ?? '';
  const allowed = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) {
    throw new HttpError(403, 'Template management is disabled (set PLATFORM_ADMIN_EMAILS)');
  }
  if (!allowed.includes(email.toLowerCase())) {
    throw new HttpError(403, 'Not authorized for template management');
  }
}
