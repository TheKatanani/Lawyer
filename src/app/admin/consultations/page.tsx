import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { listConsultations, listTeamMemberDocs } from '@/server/db/dal';
import { ConsultationsManager } from '@/components/admin/ConsultationsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'إدارة طلبات الاستشارة | لوحة التحكم',
};

export default async function AdminConsultationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  assertCapability(user.role, 'inquiries.read');

  // Load consultations sorted newest first and team members from Firestore
  const [consultations, teamDocs] = await Promise.all([
    listConsultations(),
    listTeamMemberDocs(),
  ]);

  const lawyers = teamDocs.map((t) => {
    const revArId = t.locales.ar.publishedRevisionId || t.locales.ar.draftRevisionId || '';
    const revAr = revArId ? t.revisions?.[revArId] : undefined;
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
