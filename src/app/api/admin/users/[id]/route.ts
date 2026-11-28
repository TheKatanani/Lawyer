import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, protectLastSuperAdmin } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  appendAuditLog,
  deleteAdmin,
  getAdminByUid,
  listAdmins,
  saveAdmin,
} from '@/server/db/dal';
import { AdminRole } from '@/server/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'admins.manage');

    const targetAdmin = await getAdminByUid(params.id);
    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin user not found.' }, { status: 404 });
    }

    const body = await req.json();
    const { displayName, role, isActive } = body;

    if (
      targetAdmin.role === 'super_admin' &&
      ((role && role !== 'super_admin') || isActive === false)
    ) {
      const superAdminCount = (await listAdmins()).filter(
        (a) => a.role === 'super_admin' && a.isActive
      ).length;
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot downgrade or deactivate the last remaining active Super Admin.' },
          { status: 400 }
        );
      }
    }

    if (displayName) targetAdmin.displayName = displayName.trim();
    if (role) {
      const validRoles: AdminRole[] = ['super_admin', 'admin', 'editor', 'inquiry_manager'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
      }
      targetAdmin.role = role;
    }
    if (typeof isActive === 'boolean') {
      targetAdmin.isActive = isActive;
    }
    targetAdmin.updatedAt = new Date().toISOString();

    await saveAdmin(targetAdmin);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'ADMIN_UPDATED',
      targetType: 'admin',
      targetId: params.id,
      details: { role: targetAdmin.role, isActive: targetAdmin.isActive },
      createdAt: targetAdmin.updatedAt,
    });

    return NextResponse.json({ success: true, admin: targetAdmin });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'admins.manage');

    if (user.uid === params.id) {
      return NextResponse.json(
        { error: 'Self-deletion is prohibited. You cannot delete your currently active session.' },
        { status: 400 }
      );
    }

    const targetAdmin = await getAdminByUid(params.id);
    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin user not found.' }, { status: 404 });
    }

    try {
      await protectLastSuperAdmin(params.id);
    } catch {
      return NextResponse.json(
        { error: 'Operation prohibited: The firm must maintain at least one active Super Admin.' },
        { status: 400 }
      );
    }

    await deleteAdmin(params.id);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'ADMIN_DELETED',
      targetType: 'admin',
      targetId: params.id,
      details: { email: targetAdmin.email, role: targetAdmin.role },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
