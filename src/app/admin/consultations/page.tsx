import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { ConsultationsManager } from '@/components/admin/ConsultationsManager';

export const metadata = {
  title: 'إدارة طلبات الاستشارة | لوحة التحكم',
};

export default async function AdminConsultationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  assertCapability(user.role, 'inquiries.read');

  // Load consultations sorted newest first
  const consultations = Array.from(store.consultations.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Load active lawyers
  const lawyers = Array.from(store.teamMembers.values()).map((t) => {
    const revAr = store.teamMemberRevisions.get(t.locales.ar.publishedRevisionId || '');
    return {
      id: t.id,
      name: revAr?.fullName || t.id,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-heading-ar text-ink">
          طلبات الاستشارة القانونية (Consultation Requests)
        </h1>
        <p className="text-xs text-muted mt-1">
          متابعة وفرز طلبات الاستشارة، التواصل عبر واتساب، تعيين المحامي المسؤول، وجدولة المواعيد وفق الحالات الأربع المعتمدة.
        </p>
      </div>

      <ConsultationsManager
        initialConsultations={consultations}
        lawyers={lawyers}
      />
    </div>
  );
}
