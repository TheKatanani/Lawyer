import { cookies } from 'next/headers';
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

export async function getSessionUser(): Promise<AdminUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    // Decode base64 session payload
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8')) as SessionData;

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
