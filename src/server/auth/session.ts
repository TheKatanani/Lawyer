import { cookies } from 'next/headers';
import crypto from 'crypto';
import { store } from '../db/store';
import { AdminUser, Role } from '../types';

const IS_PROD = process.env.NODE_ENV === 'production';
export const SESSION_COOKIE_NAME = IS_PROD ? '__Host-rma_session' : 'rma_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours absolute
const VALID_ROLES = new Set<Role>(['super_admin', 'admin', 'editor', 'inquiry_manager']);

export interface SessionData {
  sub?: string;
  uid: string;
  email: string;
  role: string;
  displayName?: string;
  iat?: number;
  exp?: number;
  createdAt: number;
}

function getSessionSecret(): string {
  const configured =
    process.env.SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim();

  if (configured && configured.length >= 16) {
    return configured;
  }

  // Deterministic fallback from stable server env vars so separate serverless
  // instances on Vercel share the exact same signing key even when SESSION_SECRET
  // is not explicitly set in staging env configuration.
  const seedMaterial = [
    process.env.ADMIN_INITIAL_PASSWORD || 'RMA@Legal2026!',
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lawyer-ad052',
    process.env.CLOUDINARY_API_SECRET || 'rma-legal-jwt-hmac-v1',
  ].join('|');

  return crypto.createHash('sha256').update(seedMaterial).digest('hex');
}

function toBase64Url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf-8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(segment: string): Buffer {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((segment.length + 3) % 4);
  return Buffer.from(padded, 'base64');
}

function signJwtHs256(payload: SessionData): string {
  const headerB64 = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(signingInput)
    .digest();
  return `${signingInput}.${toBase64Url(signature)}`;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    if (!headerB64 || !payloadB64 || !sigB64) return null;

    const header = JSON.parse(fromBase64Url(headerB64).toString('utf-8')) as {
      alg?: string;
      typ?: string;
    };
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return null;
    }

    const signingInput = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(signingInput)
      .digest();
    const providedSig = fromBase64Url(sigB64);

    if (expectedSig.length !== providedSig.length) {
      return null;
    }
    if (!crypto.timingSafeEqual(expectedSig, providedSig)) {
      return null;
    }

    const payload = JSON.parse(fromBase64Url(payloadB64).toString('utf-8')) as SessionData;
    const nowSec = Math.floor(Date.now() / 1000);
    const nowMs = Date.now();

    if (typeof payload.exp === 'number' && payload.exp <= nowSec) {
      return null;
    }
    if (!payload.uid || !payload.email || !payload.role) {
      return null;
    }
    if (typeof payload.createdAt === 'number' && nowMs - payload.createdAt > SESSION_TTL_SECONDS * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: any): Promise<AdminUser | null> {
  let cookieValue: string | undefined;

  // 1. Check passed request cookies if provided
  if (req?.cookies?.get) {
    const c = req.cookies.get(SESSION_COOKIE_NAME);
    cookieValue = typeof c === 'string' ? c : c?.value;
  }

  // 2. Fallback to raw Cookie header parsing if NextRequest wasn't parsed
  if (!cookieValue && req?.headers?.get) {
    const rawCookie = req.headers.get('cookie') || '';
    const match = rawCookie
      .split(';')
      .map((part: string) => part.trim())
      .find((part: string) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (match) {
      cookieValue = decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
    }
  }

  // 3. Check next/headers cookies() store
  if (!cookieValue) {
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      cookieValue = sessionCookie?.value;
    } catch {
      // Invariant error outside Next.js server context
    }
  }

  if (!cookieValue) {
    return null;
  }

  const decoded = verifySessionToken(cookieValue);
  if (!decoded) {
    return null;
  }

  // Check store first: if the user is present in this instance, honor live isActive/role state
  const existingUser = store.admins.get(decoded.uid);
  if (existingUser) {
    if (!existingUser.isActive) {
      return null;
    }
    return existingUser;
  }

  // In serverless deployments (Vercel), users auto-provisioned on /api/auth/session
  // (e.g. Firebase or SUPER_ADMIN_EMAILS accounts) do not exist in another lambda's
  // in-memory store.admins map. Reconstruct and cache from the verified signed JWT.
  if (!VALID_ROLES.has(decoded.role as Role)) {
    return null;
  }

  const hydratedUser: AdminUser = {
    uid: decoded.uid,
    email: decoded.email,
    displayName: decoded.displayName || decoded.email.split('@')[0],
    role: decoded.role as Role,
    isActive: true,
    mfaEnrolled: true,
    createdAt: new Date(decoded.createdAt || Date.now()).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.admins.set(hydratedUser.uid, hydratedUser);
  return hydratedUser;
}

export function encodeSessionPayload(
  uid: string,
  email: string,
  role: string,
  displayName?: string
): string {
  const nowMs = Date.now();
  const iat = Math.floor(nowMs / 1000);
  const payload: SessionData = {
    sub: uid,
    uid,
    email,
    role,
    ...(displayName ? { displayName } : {}),
    iat,
    exp: iat + SESSION_TTL_SECONDS,
    createdAt: nowMs,
  };
  return signJwtHs256(payload);
}

export function protectLastSuperAdmin(targetUid: string): void {
  const targetUser = store.admins.get(targetUid);
  if (!targetUser || targetUser.role !== 'super_admin') return;

  const activeSuperAdmins = Array.from(store.admins.values()).filter(
    (u) => u.role === 'super_admin' && u.isActive
  );

  if (activeSuperAdmins.length <= 1 && activeSuperAdmins[0].uid === targetUid) {
    throw new Error('Operation blocked: Cannot delete, demote, or deactivate the last remaining active Super Admin.');
  }
}

export { hashPassword, verifyPassword } from './password';
