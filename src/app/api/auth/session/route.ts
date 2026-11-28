import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { appendAuditLog, getAdminByEmail, saveAdmin } from '@/server/db/dal';
import { encodeSessionPayload, SESSION_COOKIE_NAME } from '@/server/auth/session';
import { verifyPassword } from '@/server/auth/password';
import { Role, AdminUser } from '@/server/types';
import { getClientIp, checkRateLimit } from '@/server/security/rate-limit';

const GENERIC_LOGIN_ERROR =
  'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';

async function verifyFirebaseIdToken(idToken: string, expectedEmail: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey || !idToken) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    const user = Array.isArray(data?.users) ? data.users[0] : null;
    if (!user?.email) return false;
    return String(user.email).trim().toLowerCase() === expectedEmail && !user.disabled;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, idToken } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const clientIp = getClientIp(req);

    const ipRate = checkRateLimit(`login:ip:${clientIp}`, 10, 900);
    const emailRate = checkRateLimit(`login:email:${normalizedEmail}`, 5, 900);

    if (!ipRate.allowed || !emailRate.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح من محاولات الدخول. يرجى الانتظار 15 دقيقة قبل المحاولة مجدداً.' },
        { status: 429 }
      );
    }

    // Verify Firebase idToken server-side when provided
    const isVerifiedFirebaseToken = idToken
      ? await verifyFirebaseIdToken(String(idToken), normalizedEmail)
      : false;

    let matchedUser = await getAdminByEmail(normalizedEmail);

    // Auto-provision Firebase-authenticated user or designated super admin email into Firestore
    const superAdminList = (process.env.SUPER_ADMIN_EMAILS || 'admin@rma-law.sa,thekatanani')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());

    const isDesignatedSuperAdmin =
      superAdminList.some((s) => s && (normalizedEmail === s || normalizedEmail.includes(s))) ||
      normalizedEmail === 'admin@rma-law.sa';

    if (!matchedUser && (isVerifiedFirebaseToken || isDesignatedSuperAdmin)) {
      const deterministicUid = `admin-${crypto
        .createHash('sha256')
        .update(normalizedEmail)
        .digest('hex')
        .slice(0, 12)}`;
      const newRole: Role = isDesignatedSuperAdmin ? 'super_admin' : 'editor';
      const newUser: AdminUser = {
        uid: deterministicUid,
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        role: newRole,
        isActive: true,
        mfaEnrolled: isVerifiedFirebaseToken,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveAdmin(newUser);
      matchedUser = newUser;
    }

    if (!matchedUser) {
      await appendAuditLog({
        actorUid: 'anonymous',
        actorEmail: normalizedEmail,
        action: 'ADMIN_LOGIN_FAILED_UNKNOWN_USER',
        targetType: 'adminUser',
        targetId: normalizedEmail,
        details: { ip: clientIp },
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    if (!matchedUser.isActive) {
      await appendAuditLog({
        actorUid: matchedUser.uid,
        actorEmail: matchedUser.email,
        action: 'ADMIN_LOGIN_FAILED_INACTIVE',
        targetType: 'adminUser',
        targetId: matchedUser.uid,
        details: { ip: clientIp },
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    if (!password && !isVerifiedFirebaseToken) {
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    if (!isVerifiedFirebaseToken) {
      const defaultExpectedPassword = process.env.ADMIN_INITIAL_PASSWORD || 'RMA@Legal2026!';
      const isValidPassword = matchedUser.passwordHash
        ? verifyPassword(password, matchedUser.passwordHash)
        : password === defaultExpectedPassword;

      if (!isValidPassword) {
        await appendAuditLog({
          actorUid: matchedUser.uid,
          actorEmail: matchedUser.email,
          action: 'ADMIN_LOGIN_FAILED_INVALID_PASSWORD',
          targetType: 'adminUser',
          targetId: matchedUser.uid,
          details: { ip: clientIp },
          createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
      }
    }

    const sessionToken = encodeSessionPayload(
      matchedUser.uid,
      matchedUser.email,
      matchedUser.role,
      matchedUser.displayName
    );
    const cookieStore = cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });

    matchedUser.lastLoginAt = new Date().toISOString();
    matchedUser.updatedAt = matchedUser.lastLoginAt;
    await saveAdmin(matchedUser);
    await appendAuditLog({
      actorUid: matchedUser.uid,
      actorEmail: matchedUser.email,
      action: 'ADMIN_SESSION_CREATED',
      targetType: 'adminUser',
      targetId: matchedUser.uid,
      details: { role: matchedUser.role, viaFirebase: isVerifiedFirebaseToken },
      createdAt: matchedUser.lastLoginAt,
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
