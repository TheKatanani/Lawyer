import { cookies } from 'next/headers';
import crypto from 'crypto';
import { store } from '../db/store';
import { AdminUser } from '../types';

const IS_PROD = process.env.NODE_ENV === 'production';
export const SESSION_COOKIE_NAME = IS_PROD ? '__Host-rma_session' : 'rma_session';

export interface SessionData {
  uid: string;
  email: string;
  role: string;
  createdAt: number;
}

export async function getSessionUser(req?: any): Promise<AdminUser | null> {
  let cookieValue: string | undefined;

  // 1. Check passed request cookies if provided
  if (req?.cookies?.get) {
    const c = req.cookies.get(SESSION_COOKIE_NAME);
    cookieValue = typeof c === 'string' ? c : c?.value;
  }

  // 2. Check next/headers cookies() store
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

  try {
    // Decode base64 session payload
    const decoded = JSON.parse(Buffer.from(cookieValue, 'base64').toString('utf-8')) as SessionData;

    // Verify 8-hour absolute maximum lifespan
    const now = Date.now();
    const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
    if (now - decoded.createdAt > EIGHT_HOURS_MS) {
      return null;
    }

    // Live Authoritative Database Check in adminUsers
    const user = store.admins.get(decoded.uid);
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (err) {
    return null;
  }
}

export function encodeSessionPayload(uid: string, email: string, role: string): string {
  const payload: SessionData = {
    uid,
    email,
    role,
    createdAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
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
