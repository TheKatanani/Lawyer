import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { hasCapability } from '@/server/permissions/rbac';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  if (!hasCapability(user.role, 'content.edit')) {
    return (
      <div className="p-8 bg-danger/10 border border-danger/30 rounded text-danger">
        عذراً، دورك الحالي لا يمتلك صلاحية تعديل إعدادات وهوية المنصة.
      </div>
    );
  }

  return <SiteSettingsManager />;
}
