import jwt, { type SignOptions } from 'jsonwebtoken';

export type JwtPayload = { sub: string; email: string };

function secret() {
  return process.env.JWT_SECRET ?? 'dev-secret-change-me';
}

export function signAccess(payload: JwtPayload) {
  const opts: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret(), opts);
}

export function verifyAccess(token: string): JwtPayload {
  return jwt.verify(token, secret()) as JwtPayload;
}
