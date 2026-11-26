import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, getSessionUser } from '@/server/auth/session';
import { store } from '@/server/db/store';

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (user) {
    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'ADMIN_SESSION_TERMINATED',
      targetType: 'adminUser',
      targetId: user.uid,
      details: {},
      createdAt: new Date().toISOString(),
    });
  }

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
