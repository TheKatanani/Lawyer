import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { hasCapability } from '@/server/permissions/rbac';
import { AdminUsersManager } from '@/components/admin/AdminUsersManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  if (!hasCapability(user.role, 'admins.manage')) {
    return (
      <div className="p-8 bg-danger/10 border border-danger/30 rounded text-danger">
        عذراً، إدارة حسابات المسؤولين محصورة حصراً على دور الشريك المدير (Super Admin).
      </div>
    );
  }

  return <AdminUsersManager currentUserId={user.uid} />;
}
