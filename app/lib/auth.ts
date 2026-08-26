import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'oppniva_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-super-secret-key-oppniva-2026';
const JWT_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Base64URL encoding/decoding helper
function base64urlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// JWT Session Management
export function signSession(userId: string): string {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64urlEncode(
    JSON.stringify({
      userId,
      exp: Date.now() + JWT_EXPIRATION_MS,
    })
  );

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifySession(token: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const decodedPayload = JSON.parse(base64urlDecode(payload));
    if (Date.now() > decodedPayload.exp) {
      return null; // expired
    }

    return { userId: decodedPayload.userId };
  } catch {
    return null;
  }
}

// Get the current logged-in user ID from cookies
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const session = verifySession(sessionCookie.value);
    return session ? session.userId : null;
  } catch {
    return null;
  }
}

// Set session cookie
export async function setSessionCookie(userId: string): Promise<void> {
  const token = signSession(userId);
  const cookieStore = await cookies();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const secureCookie = process.env.NODE_ENV === 'production' && siteUrl.startsWith('https');
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
