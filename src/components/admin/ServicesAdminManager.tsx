'use client';

import React, { useState } from 'react';
import { ServiceEntity } from '@/server/types';
import {
  CheckCircle2,
  AlertCircle,
  Globe,
  Shield,
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  Briefcase,
  Layers,
  Scale,
} from 'lucide-react';

interface ServicesAdminManagerProps {
  initialServices: ServiceEntity[];
  canPublish: boolean;
  actorUid: string;
}

export function ServicesAdminManager({ initialServices, canPublish, actorUid }: ServicesAdminManagerProps) {
  const [services, setServices] = useState<ServiceEntity[]>(initialServices);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form Fields
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [summaryAr, setSummaryAr] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [deliverablesAr, setDeliverablesAr] = useState('');
  const [deliverablesEn, setDeliverablesEn] = useState('');
  const [audiences, setAudiences] = useState<string[]>(['business']);
  const [iconName, setIconName] = useState('Scale');
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditingServiceId(null);
    setTitleAr('');
    setTitleEn('');
    setSummaryAr('');
    setSummaryEn('');
    setDeliverablesAr('');
    setDeliverablesEn('');
    setAudiences(['business']);
    setIconName('Scale');
    setIsModalOpen(true);
    setMessage(null);
  };

  const openEditModal = async (s: ServiceEntity) => {
    setEditingServiceId(s.id);
    setIsModalOpen(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/services/${s.id}`);
      if (res.ok) {
        const data = await res.json();
        setTitleAr(data.arRev?.title || s.id);
        setTitleEn(data.enRev?.title || s.id);
        setSummaryAr(data.arRev?.summary || '');
        setSummaryEn(data.enRev?.summary || '');
        setDeliverablesAr((data.arRev?.deliverables || []).join('\n'));
        setDeliverablesEn((data.enRev?.deliverables || []).join('\n'));
        setAudiences(s.audiences || ['business']);
        setIconName(s.iconName || 'Scale');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      summaryAr: summaryAr.trim(),
      summaryEn: summaryEn.trim(),
      deliverablesAr: deliverablesAr.split('\n').map((l) => l.trim()).filter(Boolean),
      deliverablesEn: deliverablesEn.split('\n').map((l) => l.trim()).filter(Boolean),
      audiences,
      iconName,
    };

    try {
      let res;
      if (editingServiceId) {
        res = await fetch(`/api/admin/services/${editingServiceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, publishImmediately: true }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ الخدمة');

      setMessage({
        text: editingServiceId ? 'تم تحديث بيانات الخدمة بنجاح!' : 'تمت إضافة ونشر الخدمة الجديدة بنجاح!',
        type: 'success',
      });
      setIsModalOpen(false);
      await fetchServices();
    } catch (err: any) {
      setMessage({ text: err.message || 'حدث خطأ أثناء الحفظ', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة بالكامل من الموقع وقاعدة البيانات؟')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: 'تم حذف الخدمة بنجاح.', type: 'success' });
        await fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishPaired = async (serviceId: string) => {
    setLoadingId(serviceId);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'service', entityId: serviceId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publication failed');

      setMessage({
        text: `تم نشر الخدمة بنجاح بزوج اللغتين (الإصدار ${data.version})! تم تحديث الكاش.`,
        type: 'success',
      });
      await fetchServices();
    } catch (err: any) {
      setMessage({ text: err.message || 'فشلت عملية النشر', type: 'danger' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnpublish = async (serviceId: string) => {
    setLoadingId(serviceId);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'service', entityId: serviceId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unpublish failed');

      setMessage({ text: 'تم سحب الخدمة من الموقع العام وأصبحت مسودة.', type: 'success' });
      await fetchServices();
    } catch (err: any) {
      setMessage({ text: err.message || 'فشلت عملية السحب', type: 'danger' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted">إجمالي مجالات الاختصاص: {services.length}</span>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-signature text-on-dark rounded-sm text-xs font-bold hover:bg-signature/90 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>إضافة مجال اختصاص / خدمة جديدة</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-sm border flex items-center gap-3 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-surface rounded-sm border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-canvas border-b border-border text-muted uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5 text-start">معرف الخدمة</th>
                <th className="px-6 py-3.5 text-start">الفئة المستهدفة</th>
                <th className="px-6 py-3.5 text-start">حالة النشر العام</th>
                <th className="px-6 py-3.5 text-end">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {services.map((s) => {
                const isPublished = Boolean(s.locales.ar.publishedRevisionId && s.locales.en.publishedRevisionId);
                const isLoading = loadingId === s.id;

                return (
                  <tr key={s.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-ink text-sm">{s.id}</div>
                      <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                        <span className="font-mono">Icon: {s.iconName}</span>
                        <span>•</span>
                        <span>v{s.version}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {s.audiences.map((aud) => (
                          <span
                            key={aud}
                            className="px-2 py-0.5 rounded-xs bg-canvas border border-border text-[10px] font-semibold text-ink"
                          >
                            {aud === 'business' ? 'المنشآت' : 'الأفراد'}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> منشور حي (Live)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          مسودة غير معلنة
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="px-2.5 py-1.5 bg-canvas border border-border rounded text-[11px] font-semibold text-ink hover:border-gold transition-colors flex items-center gap-1"
                          title="تعديل تفاصيل الخدمة"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gold-ink" />
                          <span>تعديل</span>
                        </button>

                        {/* Publish / Unpublish */}
                        {canPublish && (
                          <>
                            {isPublished ? (
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleUnpublish(s.id)}
                                className="px-2.5 py-1.5 bg-danger/10 border border-danger/30 text-danger rounded text-[11px] font-semibold hover:bg-danger/20 transition-colors disabled:opacity-50"
                              >
                                {isLoading ? 'جاري...' : 'سحب'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handlePublishPaired(s.id)}
                                className="px-2.5 py-1.5 bg-signature text-on-dark rounded text-[11px] font-semibold hover:bg-signature/90 transition-colors disabled:opacity-50"
                              >
                                {isLoading ? 'جاري...' : 'نشر متزامن'}
                              </button>
                            )}
                          </>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-muted hover:text-danger rounded transition-colors"
                          title="حذف الخدمة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-sm shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border bg-canvas/60 flex items-center justify-between">
              <h3 className="font-heading-ar font-bold text-lg text-ink">
                {editingServiceId ? 'تعديل مجال الاختصاص' : 'إضافة مجال اختصاص جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-full hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">اسم الخدمة (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    placeholder="مثال: التحكيم التجاري الدولي"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">Practice Title (English) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="e.g.: International Commercial Arbitration"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">ملخص نطاق الخدمة (عربي)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    placeholder="وصف موجز لنطاق المشورة والتمثيل القضائي..."
                    value={summaryAr}
                    onChange={(e) => setSummaryAr(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">Scope Summary (English)</label>
                  <textarea
                    rows={2}
                    dir="ltr"
                    placeholder="Concise overview of legal counsel scope..."
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">المخرجات الرئيسية (سطر لكل مخرج - عربي)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    placeholder="صياغة شروط التحكيم&#10;إدارة جلسات التحكيم المؤسسي&#10;تنفيذ ومصادقة أحكام المحكمين"
                    value={deliverablesAr}
                    onChange={(e) => setDeliverablesAr(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">Deliverables (one per line - English)</label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    placeholder="Arbitration Agreement Structuring&#10;Institutional Arbitration Representation&#10;Arbitral Award Enforcement"
                    value={deliverablesEn}
                    onChange={(e) => setDeliverablesEn(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">الفئة المستهدفة</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={audiences.includes('business')}
                        onChange={(e) => {
                          if (e.target.checked) setAudiences([...audiences, 'business']);
                          else setAudiences(audiences.filter((a) => a !== 'business'));
                        }}
                      />
                      <span>المنشآت والشركات</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={audiences.includes('individual')}
                        onChange={(e) => {
                          if (e.target.checked) setAudiences([...audiences, 'individual']);
                          else setAudiences(audiences.filter((a) => a !== 'individual'));
                        }}
                      />
                      <span>الأفراد</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink block">أيقونة الخدمة (Lucide Icon)</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                  >
                    <option value="Scale">Scale (ميزان العدالة)</option>
                    <option value="Building2">Building2 (الشركات والعقارات)</option>
                    <option value="ShieldCheck">ShieldCheck (الحماية والامتثال)</option>
                    <option value="Briefcase">Briefcase (الأعمال والتجارة)</option>
                    <option value="FileText">FileText (العقود والاتفاقيات)</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-canvas border border-border rounded text-xs font-semibold text-ink hover:border-gold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-signature text-on-dark rounded text-xs font-bold hover:bg-signature/90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingServiceId ? 'حفظ التعديلات' : 'إضافة ونشر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
