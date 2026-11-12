'use client';

import React, { useState } from 'react';
import { ContactRequest, InquiryStatus } from '@/server/types';
import { Inbox, Eye, Download, CheckCircle, Clock, AlertTriangle, MessageSquare, Building2, User } from 'lucide-react';

interface InquiryTableProps {
  initialInquiries: ContactRequest[];
  canExport: boolean;
  actorUid: string;
}

const STATUS_BADGES: Record<InquiryStatus, { label: string; color: string }> = {
  new: { label: 'جديد (New)', color: 'bg-gold/15 text-gold-ink border-gold/40' },
  triaged: { label: 'تم الفرز (Triaged)', color: 'bg-canvas text-ink border-border' },
  inProgress: { label: 'قيد المتابعة (In Progress)', color: 'bg-ink text-on-dark border-ink' },
  closed: { label: 'مكتمل (Closed)', color: 'bg-success/15 text-success border-success/40' },
  spam: { label: 'مرفوض / سبام (Spam)', color: 'bg-danger/15 text-danger border-danger/40' },
};

export function InquiryTable({ initialInquiries, canExport, actorUid }: InquiryTableProps) {
  const [inquiries, setInquiries] = useState<ContactRequest[]>(initialInquiries);
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactRequest | null>(null);
  const [newStatus, setNewStatus] = useState<InquiryStatus>('new');
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  const filtered = inquiries.filter((i) => (filter === 'all' ? true : i.status === filter));

  const handleOpenDetail = (inquiry: ContactRequest) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status);
    setNoteText('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedInquiry) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: selectedInquiry.id,
          newStatus,
          noteText: noteText.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();

      setInquiries((prev) =>
        prev.map((item) => (item.id === updated.inquiry.id ? updated.inquiry : item))
      );
      setSelectedInquiry(updated.inquiry);
      setNoteText('');
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/admin/inquiries/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'triaged', 'inProgress', 'closed'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-all ${
                filter === s
                  ? 'bg-ink text-on-dark border-ink shadow-xs'
                  : 'bg-surface text-muted border-border hover:text-ink'
              }`}
            >
              {s === 'all' ? 'جميع الطلبات' : STATUS_BADGES[s].label}
            </button>
          ))}
        </div>

        {canExport && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-xs font-semibold text-ink rounded-sm hover:bg-canvas transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-gold-ink" />
            <span>تصدير تقرير CSV</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-sm border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-start text-sm">
          <thead className="bg-canvas border-b border-border text-xs text-muted uppercase font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-start">الرقم المرجعي</th>
              <th className="px-6 py-3.5 text-start">العميل والمنشأة</th>
              <th className="px-6 py-3.5 text-start">الهاتف والبريد</th>
              <th className="px-6 py-3.5 text-start">الخدمة المطلوبة</th>
              <th className="px-6 py-3.5 text-start">الحالة</th>
              <th className="px-6 py-3.5 text-start">تاريخ الإرسال</th>
              <th className="px-6 py-3.5 text-end">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((inq) => {
              const badge = STATUS_BADGES[inq.status];
              return (
                <tr key={inq.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-ink" dir="ltr">
                    {inq.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-ink">{inq.name}</div>
                    {inq.companyName && (
                      <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-gold-ink" />
                        <span>{inq.companyName}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono" dir="ltr">
                    <div>{inq.phoneE164}</div>
                    {inq.email && <div className="text-muted text-[11px]">{inq.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-ink">
                    {inq.serviceId ? inq.serviceId.replace('-', ' ') : 'استفسار عام'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-xs border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted" dir="ltr">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(inq)}
                      className="p-1.5 rounded bg-canvas border border-border text-ink hover:border-gold hover:text-gold-ink transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-surface rounded-sm border border-border shadow-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted block">طلب التواصل</span>
                <h3 className="font-heading-ar font-bold text-xl text-ink font-mono" dir="ltr">
                  {selectedInquiry.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="text-muted hover:text-ink text-sm font-semibold"
              >
                ✕ إغلاق
              </button>
            </div>

            {/* Inquiry Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-canvas rounded border border-border">
                <span className="text-muted block">الاسم:</span>
                <span className="font-bold text-sm text-ink">{selectedInquiry.name}</span>
              </div>
              <div className="p-3 bg-canvas rounded border border-border">
                <span className="text-muted block">رقم الهاتف:</span>
                <span className="font-bold text-sm text-ink font-mono" dir="ltr">{selectedInquiry.phoneE164}</span>
              </div>
              {selectedInquiry.companyName && (
                <div className="p-3 bg-canvas rounded border border-border col-span-2">
                  <span className="text-muted block">المنشأة:</span>
                  <span className="font-bold text-sm text-ink">{selectedInquiry.companyName}</span>
                </div>
              )}
            </div>

            {/* Client Message */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-ink">نص رسالة العميل:</span>
              <div className="p-4 bg-canvas rounded border border-border text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status Transition Control */}
            <div className="p-4 bg-canvas rounded border border-border space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink block">تحديث حالة الطلب:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as InquiryStatus)}
                  className="w-full p-2.5 bg-surface border border-border rounded text-sm text-ink font-semibold"
                >
                  <option value="new">جديد (New)</option>
                  <option value="triaged">تم الفرز والتعيين (Triaged)</option>
                  <option value="inProgress">قيد المتابعة القضائية/الاستشارية (In Progress)</option>
                  <option value="closed">مكتمل وتمت الإفادة (Closed)</option>
                  <option value="spam">مرفوض أو سبام (Spam)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink block">إضافة ملاحظة إجرائية سرية:</label>
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="سجل ملخص الإجراء المتخذ أو توجيه المحامي..."
                  className="w-full p-2.5 bg-surface border border-border rounded text-xs text-ink"
                />
              </div>

              <button
                type="button"
                disabled={updating}
                onClick={handleUpdateStatus}
                className="px-5 py-2.5 bg-ink text-on-dark rounded text-xs font-semibold hover:bg-signature transition-colors"
              >
                {updating ? 'جاري الحفظ...' : 'حفظ التحديث وتوثيق الملاحظة'}
              </button>
            </div>

            {/* Note History */}
            {selectedInquiry.notes && selectedInquiry.notes.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <span className="text-xs font-semibold text-ink block">سجل الملاحظات الإجرائية:</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedInquiry.notes.map((n) => (
                    <div key={n.id} className="p-3 bg-canvas rounded border border-border text-xs space-y-1">
                      <div className="flex items-center justify-between text-muted text-[11px]">
                        <span className="font-semibold text-ink">{n.authorName}</span>
                        <span dir="ltr">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-ink">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
