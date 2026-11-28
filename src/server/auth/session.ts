import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getAdminByUid, listAdmins, saveAdmin } from '../db/dal';
import { AdminUser, Role } from '../types';
import { getServerSigningSecret } from './secret';

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
  return getServerSigningSecret();
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

  if (req?.cookies?.get) {
    const c = req.cookies.get(SESSION_COOKIE_NAME);
    cookieValue = typeof c === 'string' ? c : c?.value;
  }

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

  if (!cookieValue) {
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      cookieValue = sessionCookie?.value;
    } catch {
      // Invariant outside Next.js server context
    }
  }

  if (!cookieValue) {
    return null;
  }

  const decoded = verifySessionToken(cookieValue);
  if (!decoded) {
    return null;
  }

  // Always check Firestore admins collection first for authoritative role & active state
  const existingUser = await getAdminByUid(decoded.uid);
  if (existingUser) {
    return existingUser.isActive ? existingUser : null;
  }

  if (!VALID_ROLES.has(decoded.role as Role)) {
    return null;
  }

  // If a super-admin signed in via verified Firebase Auth on an unseeded/newly bootstrapped user,
  // persist them to Firestore so RBAC stays authoritative across Lambdas.
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

  try {
    await saveAdmin(hydratedUser);
  } catch {
    // Allow read-only session verification during unit tests when DB write isn't needed
  }
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

/**
 * Super Admin Lockout Protection (A12)
 */
export async function protectLastSuperAdmin(targetUid: string): Promise<void> {
  const allAdmins = await listAdmins();
  const activeSuperAdmins = allAdmins.filter(
    (u) => u.role === 'super_admin' && u.isActive
  );

  if (activeSuperAdmins.length <= 1 && activeSuperAdmins[0]?.uid === targetUid) {
    throw new Error(
      'Cannot delete, demote, or deactivate the last remaining active Super Admin.'
    );
  }
}
