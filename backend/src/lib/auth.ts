import { createHash, randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { dbConnect } from './db';
import { HttpError } from './http';
import { signAccess, verifyAccess, type JwtPayload } from './jwt';
import { oid } from './ids';
import { RefreshToken, User } from '@/models';

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

export async function registerUser(email: string, password: string, phone?: string) {
  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, 'Email already registered');
  const passwordHash = await argon2.hash(password);
  const user = await User.create({ email, phone: phone ?? null, passwordHash });
  const u = user.toJSON() as { id: string; email: string };
  return issueTokens(u.id, u.email);
}

export async function loginUser(email: string, password: string) {
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) throw new HttpError(401, 'Invalid credentials');
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) throw new HttpError(401, 'Invalid credentials');
  const u = user.toJSON() as { id: string; email: string };
  return issueTokens(u.id, u.email);
}

export async function refreshTokens(refreshToken: string) {
  await dbConnect();
  const hash = sha256(refreshToken);
  const row = await RefreshToken.findOne({ tokenHash: hash });
  if (!row || row.expiresAt < new Date()) {
    throw new HttpError(401, 'Invalid refresh token');
  }
  const user = await User.findById(row.userId);
  if (!user) throw new HttpError(401, 'Invalid refresh token');
  await RefreshToken.deleteOne({ _id: row._id });
  const u = user.toJSON() as { id: string; email: string };
  return issueTokens(u.id, u.email);
}

async function issueTokens(userId: string, email: string) {
  const payload: JwtPayload = { sub: userId, email };
  const accessToken = signAccess(payload);
  const refreshRaw = randomBytes(48).toString('hex');
  const refreshHash = sha256(refreshRaw);
  const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? '7');
  const expiresAt = new Date(Date.now() + days * 86400_000);
  await RefreshToken.create({
    userId: oid(userId),
    tokenHash: refreshHash,
    expiresAt,
  });
  return {
    accessToken,
    refreshToken: refreshRaw,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  };
}

export function parseBearerUser(authHeader: string | null): { userId: string; email: string } | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = verifyAccess(authHeader.slice(7));
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function requireBearer(authHeader: string | null) {
  const u = parseBearerUser(authHeader);
  if (!u) throw new HttpError(401, 'Unauthorized');
  return u;
}
