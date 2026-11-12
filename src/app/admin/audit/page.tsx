import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { store } from '@/server/db/store';
import { hasCapability } from '@/server/permissions/rbac';
import { History, Shield, Lock } from 'lucide-react';

export default async function AdminAuditPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  if (!hasCapability(user.role, 'audit.read')) {
    return (
      <div className="p-8 bg-danger/10 border border-danger/30 rounded text-danger">
        عذراً، دورك الحالي لا يمتلك صلاحية استعراض سجل التدقيق الأمني.
      </div>
    );
  }

  const logs = store.auditLogs;

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
          سجل العمليات والتدقيق الأمني (Audit & Compliance Log)
        </h1>
        <p className="text-sm text-muted">
          سجل غير قابل للتعديل يوثق جميع عمليات النشر، تعديل صلاحيات الموظفين، وتسجيل الدخول.
        </p>
      </div>

      <div className="bg-surface rounded-sm border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-start text-sm">
          <thead className="bg-canvas border-b border-border text-xs text-muted uppercase font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-start">العملية المنفذة (Action)</th>
              <th className="px-6 py-3.5 text-start">المستخدم المنفذ (Actor)</th>
              <th className="px-6 py-3.5 text-start">الكيان المستهدف (Target)</th>
              <th className="px-6 py-3.5 text-start">التفاصيل الفنية</th>
              <th className="px-6 py-3.5 text-start">التوقيت (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-canvas/50">
                <td className="px-6 py-4 font-mono font-bold text-gold-ink">
                  {log.action}
                </td>
                <td className="px-6 py-4 font-medium text-ink">
                  {log.actorEmail}
                </td>
                <td className="px-6 py-4 font-mono text-muted">
                  {log.targetType}:{log.targetId}
                </td>
                <td className="px-6 py-4 font-mono text-[11px] text-muted max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
                <td className="px-6 py-4 text-muted font-mono" dir="ltr">
                  {log.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
