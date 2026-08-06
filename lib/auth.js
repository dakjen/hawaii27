import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'hawaii27_session';
const COOKIE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours max

function getSecret() {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
    return process.env.AUTH_SECRET;
  }
  // Fallback: derive from another already-secret env var so the app works
  // even before the user has explicitly set AUTH_SECRET in Vercel.
  const fallback = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.SENDER_PASSWORD;
  if (fallback && fallback.length >= 16) {
    return createHash('sha256').update('hawaii27-auth:' + fallback).digest('hex');
  }
  return null;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

function sign(payload, secret) {
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac('sha256', secret).update(body).digest());
  return body + '.' + sig;
}

function verify(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = b64url(createHmac('sha256', secret).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString('utf8'));
    if (!payload?.exp || Date.now() > payload.exp) return null;
    if (!payload?.mode) return null;
    return payload;
  } catch (_) { return null; }
}

export function makeSession(mode, extra = {}) {
  const secret = getSecret();
  if (!secret) return null;
  return sign({ mode, ...extra, exp: Date.now() + COOKIE_TTL_MS }, secret);
}

export function readSessionFromRequest(req) {
  const secret = getSecret();
  if (!secret) return null;
  const cookieHeader = req.headers.get('cookie') || '';
  const m = cookieHeader.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]+)'));
  if (!m) return null;
  return verify(decodeURIComponent(m[1]), secret);
}

export function sessionCookieHeader(token) {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

export function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function requireAuth(req, role) {
  const session = readSessionFromRequest(req);
  if (!session) return null;
  if (role && session.mode !== role) return null;
  return session;
}
