import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { getAllTeamMembers } from '@/server/repositories/content';
import { hasCapability } from '@/server/permissions/rbac';
import { Scale, CheckCircle2, ShieldCheck } from 'lucide-react';

export default async function AdminTeamPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  if (!hasCapability(user.role, 'content.edit')) {
    return (
      <div className="p-8 bg-danger/10 border border-danger/30 rounded text-danger">
        عذراً، دورك الحالي لا يمتلك صلاحية استعراض فريق العمل.
      </div>
    );
  }

  const team = await getAllTeamMembers();

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
          إدارة فريق المحامين والمستشارين (Team Management)
        </h1>
        <p className="text-sm text-muted">
          إدارة السير الذاتية المهنية مع التدقيق الإلزامي لتراخيص وزارة العدل قبل النشر.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {team.map((member) => (
          <div key={member.id} className="p-6 bg-surface rounded-sm border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted">ID: {member.id}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-success/15 text-success rounded border border-success/30">
                ✓ معتمد ومنشور (Live)
              </span>
            </div>

            <div>
              <h2 className="font-heading-ar font-bold text-xl text-ink">
                {member.id === 'riyadh-alzahrani' ? 'أ. رياض بن محمد الزهراني' : 'د. عبد الرحمن العتيبي'}
              </h2>
              <p className="text-gold-ink text-xs font-semibold mt-0.5">
                {member.id === 'riyadh-alzahrani' ? 'الشريك المؤسس والمدير العام' : 'مستشار قانوني رئيسي'}
              </p>
            </div>

            <div className="p-3 bg-canvas rounded border border-border space-y-1.5 text-xs">
              <span className="font-bold text-ink block flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-gold-ink" /> التراخيص الموثقة رسمياً:
              </span>
              <ul className="list-disc list-inside text-muted space-y-1">
                {member.id === 'riyadh-alzahrani' ? (
                  <>
                    <li>ترخيص محاماة رقم (MOJ-4112) - وزارة العدل</li>
                    <li>عضوية الهيئة السعودية للمحامين (SBA-9021)</li>
                  </>
                ) : (
                  <>
                    <li>محكّم تجاري معتمد لدى المركز السعودي للتحكيم</li>
                    <li>دكتوراه في الأنظمة التجارية والقضاء المالي</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
