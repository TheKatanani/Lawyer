import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { getAllServices } from '@/server/repositories/content';
import { hasCapability } from '@/server/permissions/rbac';
import { ServicesAdminManager } from '@/components/admin/ServicesAdminManager';

export default async function AdminServicesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  if (!hasCapability(user.role, 'content.edit')) {
    return (
      <div className="p-8 bg-danger/10 border border-danger/30 rounded text-danger">
        عذراً، دورك الحالي لا يمتلك صلاحية تعديل الخدمات.
      </div>
    );
  }

  const services = await getAllServices();
  const canPublish = hasCapability(user.role, 'content.publish');

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
          إدارة مجالات الاختصاص والخدمات (Services Governance)
        </h1>
        <p className="text-sm text-muted">
          إدارة الخدمات القانونية المعتمدة والتأكد من مطابقة شروط النشر المزدوج المتزامن (Bilingual Paired Publication).
        </p>
      </div>

      <ServicesAdminManager initialServices={services} canPublish={canPublish} actorUid={user.uid} />
    </div>
  );
}
