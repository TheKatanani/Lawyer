import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import {
  listArticleDocs,
  listAuditLogs,
  listConsultations,
  listInquiriesDocs,
  listServiceDocs,
  listTeamMemberDocs,
} from '@/server/db/dal';
import { pingFirestore } from '@/server/db/firestore';
import { Briefcase, Users, BookOpen, Inbox, History, Shield, ArrowUpRight, CheckCircle2, Clock, Cloud, Flame, Image as LucideImage, CalendarCheck, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOverviewPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  const firestorePing = await pingFirestore();

  const [servicesList, teamList, articleList, consultationList, inquiryList, recentAudits] =
    firestorePing.ok
      ? await Promise.all([
          listServiceDocs(),
          listTeamMemberDocs(),
          listArticleDocs(),
          listConsultations(),
          listInquiriesDocs(),
          listAuditLogs(5),
        ])
      : [[], [], [], [], [], []];

  const serviceCount = servicesList.length;
  const teamCount = teamList.length;
  const articleCount = articleList.length;
  const pendingConsultations = consultationList.filter((c) => c.status === 'pending').length;
  const newInquiries = inquiryList.filter((i) => i.status === 'new').length;

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-1 border-b border-border pb-6">
        <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
          نظرة عامة على المنصة (Platform Overview)
        </h1>
        <p className="text-sm text-muted">
          مرحباً بك، <span className="font-semibold text-ink">{user.displayName}</span>. إليك ملخص حي لحالة المحتوى والطلبات الواردة.
        </p>
      </div>

      {/* Integrations Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Firebase Firestore Live Ping Status */}
        <div
          className={`bg-surface rounded-sm p-4 flex items-center justify-between shadow-xs border ${
            firestorePing.ok
              ? firestorePing.seededSettings
                ? 'border-gold/30'
                : 'border-amber-400/60'
              : 'border-danger/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-signature rounded-sm text-gold">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-ink">Cloud Firestore (Server-Only)</span>
                {firestorePing.ok ? (
                  firestorePing.seededSettings ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      متصل ({firestorePing.mode === 'emulator' ? 'Emulator' : 'Live Cloud'}) · {firestorePing.latencyMs}ms
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      متصل — القاعدة فارغة (شغّل npm run seed) · {firestorePing.latencyMs}ms
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    غير متصل ({firestorePing.mode})
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                مشروع: <code className="bg-canvas px-1 py-0.5 rounded text-ink font-mono">{firestorePing.projectId}</code>
                {firestorePing.error ? (
                  <span className="text-danger ms-2">— {firestorePing.error}</span>
                ) : (
                  <span className="ms-1">(قواعد المتصفح مغلقة · firebase-admin)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Cloudinary Status */}
        <div className="bg-surface border border-gold/30 rounded-sm p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-signature rounded-sm text-gold">
              <Cloud className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">Cloudinary Media CDN</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> متصل ومشفّر
                </span>
              </div>
              <p className="text-xs text-muted">
                حساب: <code className="bg-canvas px-1 py-0.5 rounded text-ink font-mono">dhgk61npp</code> (Preset: <code className="bg-canvas px-1 py-0.5 rounded text-ink font-mono">ml_default</code>)
              </p>
            </div>
          </div>
          <Link
            href="/admin/media"
            className="text-xs font-semibold text-gold-ink hover:underline flex items-center gap-1"
          >
            <span>المكتبة</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-6 bg-surface rounded-sm border border-gold/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase">طلبات الاستشارة</span>
            <CalendarCheck className="w-5 h-5 text-gold" />
          </div>
          <span className="font-heading-ar font-bold text-3xl text-ink block">{consultationList.length}</span>
          <span className="text-xs text-amber-700 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> {pendingConsultations} بانتظار التنسيق
          </span>
        </div>

        <div className="p-6 bg-surface rounded-sm border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase">مجالات الاختصاص</span>
            <Briefcase className="w-5 h-5 text-gold-ink" />
          </div>
          <span className="font-heading-ar font-bold text-3xl text-ink block">{serviceCount}</span>
          <span className="text-xs text-success flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> زوج اللغتين معتمد
          </span>
        </div>

        <div className="p-6 bg-surface rounded-sm border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase">استفسارات التواصل</span>
            <Inbox className="w-5 h-5 text-gold-ink" />
          </div>
          <span className="font-heading-ar font-bold text-3xl text-ink block">{newInquiries}</span>
          <span className="text-xs text-muted">إجمالي الطلبات: {inquiryList.length}</span>
        </div>

        <div className="p-6 bg-surface rounded-sm border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase">فريق العمل المعتمد</span>
            <Users className="w-5 h-5 text-gold-ink" />
          </div>
          <span className="font-heading-ar font-bold text-3xl text-ink block">{teamCount}</span>
          <span className="text-xs text-muted">محامون ومستشارون</span>
        </div>

        <div className="p-6 bg-surface rounded-sm border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase">الرؤى والتحليلات</span>
            <BookOpen className="w-5 h-5 text-gold-ink" />
          </div>
          <span className="font-heading-ar font-bold text-3xl text-ink block">{articleCount}</span>
          <span className="text-xs text-muted">مقالات توعية قانونية</span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/consultations"
          className="p-6 bg-surface rounded-sm border border-gold/40 hover:border-gold transition-all shadow-xs flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-sm bg-signature text-gold flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading-ar font-bold text-lg text-ink group-hover:text-gold transition-colors">
              طلبات الاستشارة والمواعيد
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              متابعة وفرز طلبات الاستشارة، التواصل عبر واتساب، تعيين المحامي، وجدولة الجلسات.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold">
            <span>إدارة الاستشارات ({pendingConsultations} جديدة)</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/inquiries"
          className="p-6 bg-surface rounded-sm border border-border hover:border-gold/60 transition-all shadow-xs flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-sm bg-canvas border border-border flex items-center justify-center text-gold-ink">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="font-heading-ar font-bold text-lg text-ink group-hover:text-gold-ink transition-colors">
              فرز ومعالجة الاستفسارات
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              متابعة طلبات التواصل الجديدة، تعيين المحامي المسؤول، وتسجيل الملاحظات الإجرائية.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold-ink">
            <span>فتح قائمة الطلبات</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/services"
          className="p-6 bg-surface rounded-sm border border-border hover:border-gold/60 transition-all shadow-xs flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-sm bg-canvas border border-border flex items-center justify-center text-gold-ink">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-heading-ar font-bold text-lg text-ink group-hover:text-gold-ink transition-colors">
              إدارة خدمات وتراخيص المنشأة
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              تحديث مجالات الاختصاص، المخرجات القانونية، وضمان اكتمال نسختي العربية والإنجليزية قبل النشر.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold-ink">
            <span>إدارة الخدمات</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/audit"
          className="p-6 bg-surface rounded-sm border border-border hover:border-gold/60 transition-all shadow-xs flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-sm bg-canvas border border-border flex items-center justify-center text-gold-ink">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-heading-ar font-bold text-lg text-ink group-hover:text-gold-ink transition-colors">
              سجل التدقيق الأمني والنظامي
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              استعراض كافة عمليات النشر، التعديل، تغيير حالات الطلبات، وتسجيلات الدخول.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold-ink">
            <span>سجل العمليات</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Recent Audit Activities */}
      <div className="p-6 bg-surface rounded-sm border border-border shadow-xs space-y-4">
        <h2 className="font-heading-ar font-bold text-lg text-ink">
          آخر العمليات المسجلة (Recent Audit Logs)
        </h2>
        <div className="divide-y divide-border/60">
          {recentAudits.map((a) => (
            <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-canvas px-2 py-0.5 rounded text-gold-ink border border-border">
                  {a.action}
                </span>
                <span className="text-ink font-medium">{a.actorEmail}</span>
              </div>
              <span className="text-muted" dir="ltr">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
