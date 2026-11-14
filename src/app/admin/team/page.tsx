import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { hasCapability } from '@/server/permissions/rbac';
import { TeamAdminManager } from '@/components/admin/TeamAdminManager';

export default async function AdminTeamPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  if (!hasCapability(user.role, 'content.edit')) {
    return (
      <div className="p-8 bg-danger/10 border border-danger/30 rounded text-danger">
        عذراً، دورك الحالي لا يمتلك صلاحية إدارة فريق العمل.
      </div>
    );
  }

  return <TeamAdminManager />;
}
