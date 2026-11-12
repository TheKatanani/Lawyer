import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/server/db/store';
import { encodeSessionPayload, SESSION_COOKIE_NAME } from '@/server/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    // Lookup staff user in store
    let matchedUser = Array.from(store.admins.values()).find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    // Development auto-seeding for bootstrap user if matching admin@rma-law.sa
    if (!matchedUser && email.trim().toLowerCase() === 'admin@rma-law.sa') {
      matchedUser = store.admins.get('admin-rma-01');
    }

    if (!matchedUser) {
      return NextResponse.json({ error: 'Invalid administrative credentials or unapproved account.' }, { status: 401 });
    }

    if (!matchedUser.isActive) {
      return NextResponse.json({ error: 'This administrative account has been deactivated.' }, { status: 403 });
    }

    // Issue Session Cookie
    const sessionToken = encodeSessionPayload(matchedUser.uid, matchedUser.email, matchedUser.role);
    const cookieStore = cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours absolute
    });

    // Record login audit
    matchedUser.lastLoginAt = new Date().toISOString();
    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: matchedUser.uid,
      actorEmail: matchedUser.email,
      action: 'ADMIN_SESSION_CREATED',
      targetType: 'adminUser',
      targetId: matchedUser.uid,
      details: { role: matchedUser.role },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: matchedUser.uid,
        email: matchedUser.email,
        displayName: matchedUser.displayName,
        role: matchedUser.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Session exchange failed.' }, { status: 500 });
  }
}
