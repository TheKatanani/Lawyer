import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  appendAuditLog,
  getAdminByEmail,
  listAdmins,
  saveAdmin,
} from '@/server/db/dal';
import { AdminUser, AdminRole } from '@/server/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'admins.manage');

    const admins = await listAdmins();
    return NextResponse.json({ admins });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'admins.manage');

    const body = await req.json();
    const { email, displayName, role = 'editor' } = body;

    if (!email || !displayName) {
      return NextResponse.json(
        { error: 'Email and display name are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await getAdminByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An administrator with this email already exists.' },
        { status: 400 }
      );
    }

    const validRoles: AdminRole[] = ['super_admin', 'admin', 'editor', 'inquiry_manager'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role assignment.' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const newUid = `admin-rma-${Date.now().toString().slice(-4)}`;

    const newAdmin: AdminUser = {
      uid: newUid,
      email: normalizedEmail,
      displayName: displayName.trim(),
      role: role as AdminRole,
      isActive: true,
      mfaEnrolled: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await saveAdmin(newAdmin);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'ADMIN_INVITED',
      targetType: 'admin',
      targetId: newUid,
      details: { email: normalizedEmail, role, displayName: displayName.trim() },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true, admin: newAdmin }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
