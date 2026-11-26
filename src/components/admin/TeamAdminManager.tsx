'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Scale,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface TeamMemberItem {
  id: string;
  sortOrder: number;
  isPublished: boolean;
  revisions: {
    ar: {
      fullName: string;
      positionTitle: string;
      summary: string;
      verifiedCredentials: string[];
      practiceAreas: string[];
      spokenLanguages: string[];
      portraitAssetId?: string;
    } | null;
    en: {
      fullName: string;
      positionTitle: string;
      summary: string;
      verifiedCredentials: string[];
      practiceAreas: string[];
      spokenLanguages: string[];
      portraitAssetId?: string;
    } | null;
  };
}

export function TeamAdminManager() {
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMemberItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    fullNameAr: '',
    fullNameEn: '',
    positionTitleAr: '',
    positionTitleEn: '',
    summaryAr: '',
    summaryEn: '',
    credentialsAr: '',
    credentialsEn: '',
    practiceAreasAr: '',
    practiceAreasEn: '',
    portraitAssetId: '',
    sortOrder: 1,
    publishImmediately: true,
  });

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch team');
      setTeam(data.team || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const openAddModal = () => {
    setForm({
      fullNameAr: '',
      fullNameEn: '',
      positionTitleAr: 'محامٍ ومستشار قانوني',
      positionTitleEn: 'Legal Counsel & Attorney',
      summaryAr: '',
      summaryEn: '',
      credentialsAr: 'ترخيص وزارة العدل, عضو الهيئة السعودية للمحامين',
      credentialsEn: 'Licensed Advocate - Saudi MOJ, Saudi Bar Association Member',
      practiceAreasAr: 'حوكمة الشركات, التقاضي التجاري',
      practiceAreasEn: 'Corporate Governance, Commercial Litigation',
      portraitAssetId: '',
      sortOrder: team.length + 1,
      publishImmediately: true,
    });
    setIsAddOpen(true);
  };

  const openEditModal = (m: TeamMemberItem) => {
    setEditMember(m);
    setForm({
      fullNameAr: m.revisions.ar?.fullName || '',
      fullNameEn: m.revisions.en?.fullName || '',
      positionTitleAr: m.revisions.ar?.positionTitle || '',
      positionTitleEn: m.revisions.en?.positionTitle || '',
      summaryAr: m.revisions.ar?.summary || '',
      summaryEn: m.revisions.en?.summary || '',
      credentialsAr: m.revisions.ar?.verifiedCredentials.join(', ') || '',
      credentialsEn: m.revisions.en?.verifiedCredentials.join(', ') || '',
      practiceAreasAr: m.revisions.ar?.practiceAreas.join(', ') || '',
      practiceAreasEn: m.revisions.en?.practiceAreas.join(', ') || '',
      portraitAssetId: m.revisions.ar?.portraitAssetId || m.revisions.en?.portraitAssetId || '',
      sortOrder: m.sortOrder,
      publishImmediately: m.isPublished,
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullNameAr: form.fullNameAr,
          fullNameEn: form.fullNameEn,
          positionTitleAr: form.positionTitleAr,
          positionTitleEn: form.positionTitleEn,
          summaryAr: form.summaryAr,
          summaryEn: form.summaryEn,
          verifiedCredentialsAr: form.credentialsAr.split(',').map((s) => s.trim()).filter(Boolean),
          verifiedCredentialsEn: form.credentialsEn.split(',').map((s) => s.trim()).filter(Boolean),
          practiceAreasAr: form.practiceAreasAr.split(',').map((s) => s.trim()).filter(Boolean),
          practiceAreasEn: form.practiceAreasEn.split(',').map((s) => s.trim()).filter(Boolean),
          portraitAssetId: form.portraitAssetId,
          sortOrder: form.sortOrder,
          publishImmediately: form.publishImmediately,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create member');
      setIsAddOpen(false);
      setSuccessMsg('تمت إضافة عضو الفريق بنجاح مع تدقيق التراخيص والنشر المزدوج.');
      await loadTeam();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team/${editMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullNameAr: form.fullNameAr,
          fullNameEn: form.fullNameEn,
          positionTitleAr: form.positionTitleAr,
          positionTitleEn: form.positionTitleEn,
          summaryAr: form.summaryAr,
          summaryEn: form.summaryEn,
          verifiedCredentialsAr: form.credentialsAr.split(',').map((s) => s.trim()).filter(Boolean),
          verifiedCredentialsEn: form.credentialsEn.split(',').map((s) => s.trim()).filter(Boolean),
          practiceAreasAr: form.practiceAreasAr.split(',').map((s) => s.trim()).filter(Boolean),
          practiceAreasEn: form.practiceAreasEn.split(',').map((s) => s.trim()).filter(Boolean),
          portraitAssetId: form.portraitAssetId,
          sortOrder: form.sortOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update member');
      setEditMember(null);
      setSuccessMsg('تم تحديث بيانات المحامي وتحديث النسخ المنشورة بنجاح.');
      await loadTeam();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (m: TeamMemberItem) => {
    setError(null);
    try {
      const action = m.isPublished ? 'unpublish' : 'publish';
      const res = await fetch(`/api/admin/team/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      await loadTeam();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setDeleteConfirmId(null);
      setSuccessMsg('تم حذف السجل بنجاح وسحبه من العرض العام.');
      await loadTeam();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
            إدارة فريق المحامين والمستشارين (Team Management)
          </h1>
          <p className="text-sm text-muted mt-1">
            إدارة وتوثيق السير الذاتية المهنية وتراخيص وزارة العدل مع النشر المزدوج المتزامن (Bilingual Paired Publishing).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTeam}
            className="p-2.5 bg-canvas border border-border rounded text-ink hover:text-gold transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-ink text-surface rounded text-sm font-semibold hover:bg-gold-ink/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة محامٍ / مستشار جديد</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded text-sm text-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline font-mono">إغلاق</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-success/15 border border-success/30 rounded text-sm text-success flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline font-mono">إغلاق</button>
        </div>
      )}

      {/* Team Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-muted">جاري تحميل بيانات فريق العمل...</div>
      ) : team.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-dashed border-border rounded space-y-3">
          <User className="w-8 h-8 mx-auto text-muted" />
          <p className="text-sm text-muted">لا يوجد أعضاء مسجلين حالياً في فريق العمل.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-signature text-on-dark rounded text-xs font-semibold"
          >
            إضافة أول محامٍ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map((member) => {
            const ar = member.revisions.ar;
            const en = member.revisions.en;
            return (
              <div
                key={member.id}
                className="p-6 bg-surface rounded-sm border border-border shadow-xs space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Status & ID */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted">ID: {member.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 bg-canvas rounded border border-border text-muted">
                        ترتيب: {member.sortOrder}
                      </span>
                      {member.isPublished ? (
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-success/15 text-success rounded border border-success/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> معتمد ومنشور (Live)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-canvas text-muted rounded border border-border">
                          مسودة داخلية (Draft)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-signature/10 border border-gold/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {ar?.portraitAssetId ? (
                        <Image
                          src={ar.portraitAssetId}
                          alt={ar.fullName}
                          width={64}
                          height={64}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gold-ink" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading-ar font-bold text-xl text-ink leading-tight">
                        {ar?.fullName || member.id}
                      </h2>
                      <p className="text-gold-ink text-xs font-semibold mt-0.5">
                        {ar?.positionTitle}
                      </p>
                      <p className="text-xs text-muted font-mono mt-0.5" dir="ltr">
                        {en?.fullName} — {en?.positionTitle}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {ar?.summary && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                      {ar.summary}
                    </p>
                  )}

                  {/* Credentials / Licenses */}
                  <div className="p-3 bg-canvas rounded border border-border space-y-1.5 text-xs">
                    <span className="font-bold text-ink flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-gold-ink" /> التراخيص والمؤهلات الموثقة:
                    </span>
                    <ul className="list-disc list-inside text-muted space-y-0.5">
                      {ar?.verifiedCredentials && ar.verifiedCredentials.length > 0 ? (
                        ar.verifiedCredentials.map((c, i) => <li key={i}>{c}</li>)
                      ) : (
                        <li className="italic text-muted/70">لم تسجل تراخيص إضافية</li>
                      )}
                    </ul>
                  </div>

                  {/* Practice areas */}
                  {ar?.practiceAreas && ar.practiceAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ar.practiceAreas.map((pa, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 bg-canvas text-ink/80 rounded border border-border/80"
                        >
                          {pa}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-canvas hover:bg-canvas/80 text-ink rounded border border-border text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gold-ink" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => togglePublish(member)}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                        member.isPublished
                          ? 'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20'
                          : 'bg-success/15 text-success border-success/30 hover:bg-success/25'
                      }`}
                    >
                      {member.isPublished ? 'سحب النشر' : 'نشر متزامن'}
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteConfirmId(member.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded transition-colors"
                    title="حذف السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(isAddOpen || editMember) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-sm max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-heading-ar font-bold text-xl text-ink">
                {isAddOpen ? 'إضافة محامٍ / مستشار جديد' : `تعديل بيانات: ${editMember?.revisions.ar?.fullName}`}
              </h2>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditMember(null);
                }}
                className="text-muted hover:text-ink text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4 text-xs">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">الاسم الكامل (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={form.fullNameAr}
                    onChange={(e) => setForm({ ...form, fullNameAr: e.target.value })}
                    placeholder="مثال: أ. محمد بن خالد الشمري"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Full Name (English) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={form.fullNameEn}
                    onChange={(e) => setForm({ ...form, fullNameEn: e.target.value })}
                    placeholder="e.g. Mohammed Al-Shammari"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">المسمى المهني (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={form.positionTitleAr}
                    onChange={(e) => setForm({ ...form, positionTitleAr: e.target.value })}
                    placeholder="مثال: شريك - رئيس قسم التحكيم التجاري"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Position Title (English) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={form.positionTitleEn}
                    onChange={(e) => setForm({ ...form, positionTitleEn: e.target.value })}
                    placeholder="e.g. Partner - Commercial Arbitration Head"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">نبذة السيرة المهنية (بالعربية)</label>
                  <textarea
                    rows={3}
                    value={form.summaryAr}
                    onChange={(e) => setForm({ ...form, summaryAr: e.target.value })}
                    placeholder="نبذة موجزة عن الخبرة ومجالات الاختصاص..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Professional Bio (English)</label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={form.summaryEn}
                    onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
                    placeholder="Brief background and legal specializations..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>
              </div>

              {/* Verified Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">التراخيص والاعتمادات (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={form.credentialsAr}
                    onChange={(e) => setForm({ ...form, credentialsAr: e.target.value })}
                    placeholder="ترخيص وزارة العدل رقم (1234), عضو الهيئة السعودية للمحامين"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Verified Credentials (English, comma-separated)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={form.credentialsEn}
                    onChange={(e) => setForm({ ...form, credentialsEn: e.target.value })}
                    placeholder="MOJ License #1234, Saudi Bar Association Member"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Practice Areas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">مجالات الممارسة (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={form.practiceAreasAr}
                    onChange={(e) => setForm({ ...form, practiceAreasAr: e.target.value })}
                    placeholder="التقاضي التجاري, حوكمة الشركات, الضرائب"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Practice Areas (English, comma-separated)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={form.practiceAreasEn}
                    onChange={(e) => setForm({ ...form, practiceAreasEn: e.target.value })}
                    placeholder="Commercial Litigation, Corporate Governance"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Image & Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-ink">رابط الصورة الشخصية (Cloudinary Media URL)</label>
                    <Link
                      href="/admin/media"
                      target="_blank"
                      className="text-[11px] text-gold-ink hover:underline flex items-center gap-1"
                    >
                      <span>مكتبة الوسائط</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <input
                    type="url"
                    dir="ltr"
                    value={form.portraitAssetId}
                    onChange={(e) => setForm({ ...form, portraitAssetId: e.target.value })}
                    placeholder="https://res.cloudinary.com/dhgk61npp/image/upload/..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">ترتيب العرض</label>
                  <input
                    type="number"
                    min={1}
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {isAddOpen && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.publishImmediately}
                      onChange={(e) => setForm({ ...form, publishImmediately: e.target.checked })}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="font-semibold text-ink">
                      نشر فوري متزامن (Live Paired Publication) بعد التدقيق
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditMember(null);
                  }}
                  className="px-4 py-2 bg-canvas border border-border text-ink rounded hover:bg-canvas/80 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'جارٍ الحفظ...' : isAddOpen ? 'حفظ وإضافة المحامي' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-heading-ar font-bold text-lg">تأكيد حذف عضو الفريق</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا المحامي نهائياً؟ سيتم سحب الصفحة الشخصية وإلغاء نشرها فوراً من الموقع العام بالعربية والإنجليزية.
            </p>
            <div className="pt-3 border-t border-border flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-canvas border border-border text-ink rounded hover:bg-canvas/80 font-semibold"
              >
                تراجع
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-danger text-white rounded hover:bg-danger/90 font-semibold"
              >
                تأكيد الحذف النهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
