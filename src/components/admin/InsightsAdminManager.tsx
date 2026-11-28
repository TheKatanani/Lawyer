'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface ArticleItem {
  id: string;
  categoryIds: string[];
  authorName: string;
  authorTeamMemberId?: string;
  readingTimeMinutes?: number;
  publishedAt?: string;
  isPublished: boolean;
  revisions: {
    ar: {
      title: string;
      summary: string;
      readingTimeMinutes?: number;
      coverAssetId?: string;
      blocks: Array<{ id: string; type: string; data: { text: string } }>;
    } | null;
    en: {
      title: string;
      summary: string;
      readingTimeMinutes?: number;
      coverAssetId?: string;
      blocks: Array<{ id: string; type: string; data: { text: string } }>;
    } | null;
  };
}

export function InsightsAdminManager() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [teamOptions, setTeamOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<ArticleItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    titleAr: '',
    titleEn: '',
    summaryAr: '',
    summaryEn: '',
    contentAr: '',
    contentEn: '',
    categoryIds: 'corporate-law',
    authorTeamMemberId: 'riyadh-alzahrani',
    readingTimeMinutes: 5,
    coverAssetId: '',
    publishImmediately: true,
  });

  const loadArticles = async () => {
    try {
      setLoading(true);
      const [res, teamRes] = await Promise.all([
        fetch('/api/admin/insights'),
        fetch('/api/admin/team').catch(() => null),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch insights');
      setArticles(data.articles || []);

      if (teamRes && teamRes.ok) {
        const teamData = await teamRes.json().catch(() => ({}));
        const members = Array.isArray(teamData.team) ? teamData.team : [];
        setTeamOptions(
          members.map((m: any) => ({
            id: m.id,
            name: m.ar?.fullName || m.en?.fullName || m.id,
          }))
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openAddModal = () => {
    setForm({
      titleAr: '',
      titleEn: '',
      summaryAr: '',
      summaryEn: '',
      contentAr: '',
      contentEn: '',
      categoryIds: 'corporate-law',
      authorTeamMemberId: 'riyadh-alzahrani',
      readingTimeMinutes: 5,
      coverAssetId: '',
      publishImmediately: true,
    });
    setIsAddOpen(true);
  };

  const openEditModal = (a: ArticleItem) => {
    setEditArticle(a);
    const arContent = a.revisions.ar?.blocks?.[0]?.data?.text || '';
    const enContent = a.revisions.en?.blocks?.[0]?.data?.text || '';
    setForm({
      titleAr: a.revisions.ar?.title || '',
      titleEn: a.revisions.en?.title || '',
      summaryAr: a.revisions.ar?.summary || '',
      summaryEn: a.revisions.en?.summary || '',
      contentAr: arContent,
      contentEn: enContent,
      categoryIds: a.categoryIds?.join(', ') || 'corporate-law',
      authorTeamMemberId: a.authorTeamMemberId || 'riyadh-alzahrani',
      readingTimeMinutes: a.revisions.ar?.readingTimeMinutes || 5,
      coverAssetId: a.revisions.ar?.coverAssetId || a.revisions.en?.coverAssetId || '',
      publishImmediately: a.isPublished,
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr: form.titleAr,
          titleEn: form.titleEn,
          summaryAr: form.summaryAr,
          summaryEn: form.summaryEn,
          contentAr: form.contentAr,
          contentEn: form.contentEn,
          categoryIds: form.categoryIds.split(',').map((s) => s.trim()).filter(Boolean),
          authorTeamMemberId: form.authorTeamMemberId,
          readingTimeMinutes: form.readingTimeMinutes,
          coverAssetId: form.coverAssetId,
          publishImmediately: form.publishImmediately,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create article');
      setIsAddOpen(false);
      setSuccessMsg('تم إنشاء المقال القانوني بنجاح وتجهيزه للنشر المزدوج.');
      await loadArticles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editArticle) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/insights/${editArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr: form.titleAr,
          titleEn: form.titleEn,
          summaryAr: form.summaryAr,
          summaryEn: form.summaryEn,
          contentAr: form.contentAr,
          contentEn: form.contentEn,
          categoryIds: form.categoryIds.split(',').map((s) => s.trim()).filter(Boolean),
          authorTeamMemberId: form.authorTeamMemberId,
          readingTimeMinutes: form.readingTimeMinutes,
          coverAssetId: form.coverAssetId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update article');
      setEditArticle(null);
      setSuccessMsg('تم تحديث المقال والنسخ المنشورة بنجاح.');
      await loadArticles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (a: ArticleItem) => {
    setError(null);
    try {
      const action = a.isPublished ? 'unpublish' : 'publish';
      const res = await fetch(`/api/admin/insights/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      await loadArticles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/insights/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setDeleteConfirmId(null);
      setSuccessMsg('تم حذف المقال بنجاح وسحبه من العرض العام.');
      await loadArticles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
            إدارة المدونة والرؤى القانونية (Legal Insights CMS)
          </h1>
          <p className="text-sm text-muted mt-1">
            إدارة المقالات والأبحاث القانونية المتخصصة والنشر المزدوج المتزامن (Bilingual Paired Publishing).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadArticles}
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
            <span>كتابة مقال / رؤية جديدة</span>
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

      {/* Articles List */}
      {loading ? (
        <div className="p-12 text-center text-muted">جاري تحميل المقالات القانونية...</div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-dashed border-border rounded space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-muted" />
          <p className="text-sm text-muted">لا توجد مقالات مسجلة حالياً في المدونة.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-signature text-on-dark rounded text-xs font-semibold"
          >
            كتابة أول مقال
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => {
            const ar = art.revisions.ar;
            const en = art.revisions.en;
            return (
              <div
                key={art.id}
                className="p-6 bg-surface rounded-sm border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gold/30 transition-all"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted">ID: {art.id}</span>
                    {art.isPublished ? (
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-success/15 text-success rounded border border-success/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> منشور حي (Live)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-canvas text-muted rounded border border-border">
                        مسودة داخلية (Draft)
                      </span>
                    )}
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold-ink" /> {ar?.readingTimeMinutes || 5} دقائق قراءة
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <User className="w-3 h-3 text-gold-ink" /> {art.authorName}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-heading-ar font-bold text-xl text-ink">
                      {ar?.title || art.id}
                    </h2>
                    <p className="text-xs text-muted font-mono mt-0.5" dir="ltr">
                      {en?.title}
                    </p>
                  </div>

                  <p className="text-xs text-muted leading-relaxed line-clamp-2 max-w-3xl">
                    {ar?.summary}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/60">
                  <Link
                    href={`/ar/insights/${ar?.title ? art.id : ''}`}
                    target="_blank"
                    className="p-2 bg-canvas hover:bg-canvas/80 text-muted hover:text-gold-ink rounded border border-border text-xs transition-colors"
                    title="معاينة بالموقع"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => openEditModal(art)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-canvas hover:bg-canvas/80 text-ink rounded border border-border text-xs font-medium transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gold-ink" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => togglePublish(art)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      art.isPublished
                        ? 'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20'
                        : 'bg-success/15 text-success border-success/30 hover:bg-success/25'
                    }`}
                  >
                    {art.isPublished ? 'سحب النشر' : 'نشر متزامن'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(art.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded transition-colors"
                    title="حذف المقال"
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
      {(isAddOpen || editArticle) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-sm max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-heading-ar font-bold text-xl text-ink">
                {isAddOpen ? 'كتابة مقال قانوني جديد' : `تعديل المقال: ${editArticle?.revisions.ar?.title}`}
              </h2>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditArticle(null);
                }}
                className="text-muted hover:text-ink text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4 text-xs">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">عنوان المقال (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    placeholder="مثال: قراءة في تعديلات نظام المعاملات المدنية"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Article Title (English) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    placeholder="e.g. Overview of the Saudi Civil Transactions Law"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">الملخص التنفيذي (بالعربية)</label>
                  <textarea
                    rows={2}
                    value={form.summaryAr}
                    onChange={(e) => setForm({ ...form, summaryAr: e.target.value })}
                    placeholder="موجز يظهر في بطاقة المقال ومحركات البحث..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Executive Summary (English)</label>
                  <textarea
                    rows={2}
                    dir="ltr"
                    value={form.summaryEn}
                    onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
                    placeholder="Brief summary for social sharing and search cards..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Full Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">المحتوى التحليلي للمقال (بالعربية)</label>
                  <textarea
                    rows={6}
                    value={form.contentAr}
                    onChange={(e) => setForm({ ...form, contentAr: e.target.value })}
                    placeholder="اكتب نص المقال القانوني هنا بالتفصيل..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">Article Body (English)</label>
                  <textarea
                    rows={6}
                    dir="ltr"
                    value={form.contentEn}
                    onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                    placeholder="Enter full legal analysis in English..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">المحامي الكاتب</label>
                  <select
                    value={form.authorTeamMemberId}
                    onChange={(e) => setForm({ ...form, authorTeamMemberId: e.target.value })}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  >
                    {teamOptions.length === 0 ? (
                      <option value={form.authorTeamMemberId}>{form.authorTeamMemberId}</option>
                    ) : (
                      teamOptions.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink">مدة القراءة المتوقعة (دقائق)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.readingTimeMinutes}
                    onChange={(e) => setForm({ ...form, readingTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink">التصنيفات (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={form.categoryIds}
                    onChange={(e) => setForm({ ...form, categoryIds: e.target.value })}
                    placeholder="corporate-law, litigation"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink">رابط صورة الغلاف (Cloudinary Media URL)</label>
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
                  value={form.coverAssetId}
                  onChange={(e) => setForm({ ...form, coverAssetId: e.target.value })}
                  placeholder="https://res.cloudinary.com/dhgk61npp/image/upload/..."
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold font-mono"
                />
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
                      نشر فوري متزامن (Live Paired Publication) للمقال
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditArticle(null);
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
                  {submitting ? 'جارٍ الحفظ...' : isAddOpen ? 'حفظ ونشر المقال' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-heading-ar font-bold text-lg">تأكيد حذف المقال القانوني</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً؟ سيتم سحب المقال وإلغاء فهرسته فوراً بالعربية والإنجليزية.
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
