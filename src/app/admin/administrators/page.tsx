import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { store } from '@/server/db/store';
import { hasCapability } from '@/server/permissions/rbac';
import { Shield, KeyRound, UserCheck, AlertTriangle } from 'lucide-react';

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

  const admins = Array.from(store.admins.values());

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
          إدارة حسابات المسؤولين والصلاحيات (Admin RBAC Governance)
        </h1>
        <p className="text-sm text-muted">
          إدارة مستخدمي النظام وصلاحيات الأدوار مع إلزامية المصادقة متعددة العوامل (MFA) وحماية المالك الأخير.
        </p>
      </div>

      <div className="bg-surface rounded-sm border border-border overflow-hidden shadow-xs">
        <table className="w-full text-start text-sm">
          <thead className="bg-canvas border-b border-border text-xs text-muted uppercase font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-start">الاسم والبريد المهني</th>
              <th className="px-6 py-3.5 text-start">الدور المخصص (Role)</th>
              <th className="px-6 py-3.5 text-start">حالة الحساب</th>
              <th className="px-6 py-3.5 text-start">التحقق الثنائي (MFA)</th>
              <th className="px-6 py-3.5 text-start">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {admins.map((adm) => (
              <tr key={adm.uid} className="hover:bg-canvas/50">
                <td className="px-6 py-4">
                  <div className="font-bold text-ink">{adm.displayName}</div>
                  <div className="text-muted font-mono" dir="ltr">{adm.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono font-semibold px-2.5 py-1 bg-canvas rounded border border-border text-gold-ink">
                    {adm.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {adm.isActive ? (
                    <span className="text-success font-semibold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> نشط (Active)
                    </span>
                  ) : (
                    <span className="text-danger font-semibold">معطل (Disabled)</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {adm.mfaEnrolled ? (
                    <span className="text-gold-ink font-semibold flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-gold" /> مفعل (Enforced)
                    </span>
                  ) : (
                    <span className="text-danger font-semibold">غير مفعل</span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted font-mono" dir="ltr">
                  {new Date(adm.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
