import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/server/db/store';
import { encodeSessionPayload, SESSION_COOKIE_NAME } from '@/server/auth/session';
import { verifyPassword } from '@/server/auth/password';
import { Role, AdminUser } from '@/server/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password, idToken } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Lookup staff user in store
    let matchedUser = Array.from(store.admins.values()).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    // Bootstrap check or auto-provision for Firebase-authenticated users or super admin list
    const superAdminList = (process.env.SUPER_ADMIN_EMAILS || 'admin@rma-law.sa,thekatanani')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());

    const isDesignatedSuperAdmin =
      superAdminList.some((s) => s && (normalizedEmail === s || normalizedEmail.includes(s))) ||
      normalizedEmail === 'admin@rma-law.sa';

    if (!matchedUser) {
      if (idToken || isDesignatedSuperAdmin) {
        // Auto-provision user into the administrative store
        const newUid = `admin-${Date.now().toString().slice(-6)}`;
        const newRole: Role = isDesignatedSuperAdmin ? 'super_admin' : 'editor';
        const newUser: AdminUser = {
          uid: newUid,
          email: normalizedEmail,
          displayName: normalizedEmail.split('@')[0],
          role: newRole,
          isActive: true,
          mfaEnrolled: Boolean(idToken),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.admins.set(newUid, newUser);
        matchedUser = newUser;
      }
    }

    if (!matchedUser) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير مسجل ضمن مسؤولي النظام المصرح لهم.' }, { status: 401 });
    }

    if (!matchedUser.isActive) {
      return NextResponse.json({ error: 'هذا الحساب الإداري معطل حالياً من قِبل الإدارة.' }, { status: 403 });
    }

    if (!password && !idToken) {
      return NextResponse.json({ error: 'كلمة المرور مطلوبة لإتمام تسجيل الدخول.' }, { status: 400 });
    }

    // If idToken is present, Firebase client has already verified the password
    if (!idToken) {
      const defaultExpectedPassword = process.env.ADMIN_INITIAL_PASSWORD || 'RMA@Legal2026!';
      const isValidPassword = matchedUser.passwordHash
        ? verifyPassword(password, matchedUser.passwordHash)
        : password === defaultExpectedPassword;

      if (!isValidPassword) {
        store.auditLogs.unshift({
          id: `AUDIT-${Date.now()}`,
          actorUid: matchedUser.uid,
          actorEmail: matchedUser.email,
          action: 'ADMIN_LOGIN_FAILED_INVALID_PASSWORD',
          targetType: 'adminUser',
          targetId: matchedUser.uid,
          details: { reason: 'incorrect_password' },
          createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ error: 'كلمة المرور غير صحيحة. يرجى إدخال كلمة المرور المعتمدة.' }, { status: 401 });
      }
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
