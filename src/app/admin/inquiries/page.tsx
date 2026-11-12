import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { listInquiries } from '@/server/repositories/inquiries';
import { hasCapability } from '@/server/permissions/rbac';
import { InquiryTable } from '@/components/admin/InquiryTable';

export default async function AdminInquiriesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  if (!hasCapability(user.role, 'inquiries.read')) {
    return (
      <div className="p-8 bg-danger/10 border border-danger/30 rounded text-danger">
        عذراً، دورك الحالي ({user.role}) لا يمتلك صلاحية استعراض طلبات التواصل.
      </div>
    );
  }

  const inquiries = await listInquiries(user.role);
  const canExport = hasCapability(user.role, 'inquiries.export');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
            إدارة طلبات التواصل (Client Consultation Inquiries)
          </h1>
          <p className="text-sm text-muted">
            فرز ومتابعة طلبات التواصل الواردة عبر الموقع الرسمي وفق ضوابط السرية والامتثال.
          </p>
        </div>
      </div>

      <InquiryTable initialInquiries={inquiries} canExport={canExport} actorUid={user.uid} />
    </div>
  );
}
