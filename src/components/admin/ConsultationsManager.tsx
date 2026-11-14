'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  MessageCircle,
  User,
  Briefcase,
  Calendar,
  Link as LinkIcon,
  MapPin,
  FileText,
  History,
  X,
  ChevronRight,
  Loader2,
  Save,
} from 'lucide-react';
import { ConsultationRequest, ConsultationStatus } from '@/server/types';

interface LawyerOption {
  id: string;
  name: string;
}

interface ConsultationsManagerProps {
  initialConsultations: ConsultationRequest[];
  lawyers: LawyerOption[];
}

const STATUS_BADGES: Record<
  ConsultationStatus,
  { labelAr: string; labelEn: string; bg: string; text: string; border: string }
> = {
  pending: {
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  confirmed: {
    labelAr: 'مؤكّد',
    labelEn: 'Confirmed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  completed: {
    labelAr: 'مكتمل',
    labelEn: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  cancelled: {
    labelAr: 'ملغى',
    labelEn: 'Cancelled',
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
    border: 'border-zinc-200',
  },
};

export function ConsultationsManager({
  initialConsultations,
  lawyers,
}: ConsultationsManagerProps) {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>(initialConsultations);
  const [activeTab, setActiveTab] = useState<ConsultationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lawyerFilter, setLawyerFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ConsultationRequest | null>(null);

  // Edit fields for selected item
  const [editStatus, setEditStatus] = useState<ConsultationStatus>('pending');
  const [editAssignedLawyer, setEditAssignedLawyer] = useState('');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [editMeetingType, setEditMeetingType] = useState<'online' | 'office' | 'unassigned'>('unassigned');
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editMeetingAddress, setEditMeetingAddress] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // Processing state
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync edit states when selecting an item
  useEffect(() => {
    if (selectedItem) {
      setEditStatus(selectedItem.status);
      setEditAssignedLawyer(selectedItem.assignedLawyerId || '');
      setEditScheduledAt(selectedItem.scheduledAt ? selectedItem.scheduledAt.slice(0, 16) : '');
      setEditMeetingType(selectedItem.meetingType || 'unassigned');
      setEditMeetingLink(selectedItem.meetingLink || '');
      setEditMeetingAddress(selectedItem.meetingAddress || '');
      setNewNoteText('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [selectedItem]);

  const refreshList = async () => {
    try {
      const res = await fetch('/api/admin/consultations');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations || []);
        // Update selectedItem if open
        if (selectedItem) {
          const updated = (data.consultations || []).find(
            (c: ConsultationRequest) => c.id === selectedItem.id
          );
          if (updated) setSelectedItem(updated);
        }
      }
    } catch (err) {
      console.error('Failed to reload consultations', err);
    }
  };

  const handleSave = async (targetStatus?: ConsultationStatus) => {
    if (!selectedItem) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const statusToApply = targetStatus || editStatus;

    // Requirement:
    // "Require assigned lawyer and a valid agreed appointment date/time before confirming."
    if (statusToApply === 'confirmed') {
      if (!editAssignedLawyer) {
        setErrorMsg('يجب تعيين المحامي المسؤول قبل تأكيد الموعد.');
        return;
      }
      if (!editScheduledAt) {
        setErrorMsg('يجب تحديد تاريخ وتوقيت الموعد المتفق عليه قبل التأكيد.');
        return;
      }
    }

    setSaving(true);

    try {
      const scheduledIso = editScheduledAt ? new Date(editScheduledAt).toISOString() : null;

      const res = await fetch(`/api/admin/consultations/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusToApply,
          assignedLawyerId: editAssignedLawyer || null,
          scheduledAt: scheduledIso,
          meetingType: editMeetingType,
          meetingLink: editMeetingType === 'online' ? editMeetingLink.trim() : null,
          meetingAddress: editMeetingType === 'office' ? editMeetingAddress.trim() : null,
          noteText: newNoteText.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ التعديلات');
      }

      setSelectedItem(data.consultation);
      setSuccessMsg('تم حفظ التعديلات وتحديث حالة الاستشارة بنجاح!');
      setNewNoteText('');
      await refreshList();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // Filtered consultations
  const filteredList = consultations.filter((item) => {
    if (activeTab !== 'all' && item.status !== activeTab) {
      return false;
    }
    if (lawyerFilter !== 'all' && item.assignedLawyerId !== lawyerFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = item.reference.toLowerCase().includes(q);
      const matchName = item.fullName.toLowerCase().includes(q);
      const matchPhone = item.phone.includes(q);
      return matchRef || matchName || matchPhone;
    }
    return true;
  });

  // Status counts
  const counts = {
    all: consultations.length,
    pending: consultations.filter((c) => c.status === 'pending').length,
    confirmed: consultations.filter((c) => c.status === 'confirmed').length,
    completed: consultations.filter((c) => c.status === 'completed').length,
    cancelled: consultations.filter((c) => c.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-gold text-ink font-bold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          الكل ({counts.all})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'pending'
              ? 'border-amber-500 text-amber-800'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>قيد الانتظار ({counts.pending})</span>
        </button>

        <button
          onClick={() => setActiveTab('confirmed')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'confirmed'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>مؤكّد ({counts.confirmed})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-800'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <span>مكتمل ({counts.completed})</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'cancelled'
              ? 'border-zinc-500 text-zinc-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <span>ملغى ({counts.cancelled})</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="بحث برقم الطلب (CR-...)، اسم العميل، أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 ps-10 bg-surface border border-border rounded-sm text-xs text-ink placeholder-muted/60 focus:outline-none focus:border-gold"
          />
          <Search className="w-4 h-4 text-muted absolute start-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted flex-shrink-0" />
          <select
            value={lawyerFilter}
            onChange={(e) => setLawyerFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-sm text-xs text-ink focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="all">جميع المحامين المسؤولين</option>
            {lawyers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Consultations List */}
      <div className="bg-surface border border-border rounded-sm shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-muted text-xs space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-muted/60" />
            <p className="font-semibold text-ink">لا توجد طلبات استشارة مطابقة</p>
            <p>جرّب تغيير فلاتر الحالة أو مسح عبارة البحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs divide-y divide-border/60">
              <thead className="bg-canvas text-muted font-semibold">
                <tr>
                  <th className="px-4 py-3 text-start">الرقم المرجعي</th>
                  <th className="px-4 py-3 text-start">العميل</th>
                  <th className="px-4 py-3 text-start">الخدمة المطلوبة</th>
                  <th className="px-4 py-3 text-start">المحامي المفضّل / المعيّن</th>
                  <th className="px-4 py-3 text-start">الحالة</th>
                  <th className="px-4 py-3 text-start">تاريخ الموعد</th>
                  <th className="px-4 py-3 text-start">تاريخ الطلب</th>
                  <th className="px-4 py-3 text-end">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredList.map((item) => {
                  const badge = STATUS_BADGES[item.status];
                  const assignedLawyerObj = lawyers.find((l) => l.id === item.assignedLawyerId);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-canvas/60 transition-colors cursor-pointer ${
                        selectedItem?.id === item.id ? 'bg-gold/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-ink" dir="ltr">
                        {item.reference}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-ink">{item.fullName}</div>
                        <div className="text-[11px] text-muted font-mono" dir="ltr">
                          {item.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px] truncate" title={item.serviceLabelSnapshot.ar}>
                        {item.serviceLabelSnapshot.ar}
                      </td>
                      <td className="px-4 py-3.5">
                        {assignedLawyerObj ? (
                          <span className="font-semibold text-ink flex items-center gap-1">
                            <User className="w-3 h-3 text-gold" />
                            {assignedLawyerObj.name}
                          </span>
                        ) : item.preferredLawyerLabelSnapshot?.ar ? (
                          <span className="text-muted">
                            تفضيل: {item.preferredLawyerLabelSnapshot.ar}
                          </span>
                        ) : (
                          <span className="text-muted/60">لم يُعيّن بعد</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.labelAr}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {item.scheduledAt ? (
                          <span className="font-bold text-emerald-800" dir="ltr">
                            {new Date(item.scheduledAt).toLocaleDateString('ar-SA', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        ) : item.preferredDate ? (
                          <span className="text-muted" dir="ltr">
                            تفضيل: {item.preferredDate}
                          </span>
                        ) : (
                          <span className="text-muted/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted" dir="ltr">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="px-2.5 py-1 bg-canvas border border-border rounded text-[11px] font-semibold text-ink hover:border-gold transition-colors"
                        >
                          معاينة
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Triage Drawer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-xl bg-surface h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-s border-border animate-slide-left">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border bg-canvas/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted uppercase font-semibold block">
                  طلب استشارة قانونية
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="font-mono font-bold text-xl text-ink" dir="ltr">
                    {selectedItem.reference}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGES[selectedItem.status].bg} ${STATUS_BADGES[selectedItem.status].text} ${STATUS_BADGES[selectedItem.status].border}`}
                  >
                    {STATUS_BADGES[selectedItem.status].labelAr}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 text-muted hover:text-ink rounded-full hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-danger/10 border border-danger/30 rounded-sm flex items-center gap-2 text-xs text-danger">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Client Profile & Direct Actions */}
              <div className="p-4 bg-canvas rounded-sm border border-border space-y-3">
                <span className="text-xs font-bold text-ink block">بيانات العميل وقنوات التواصل المباشر</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">الاسم الكامل:</span>
                    <span className="font-semibold text-ink text-sm">{selectedItem.fullName}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">رقم الواتساب / الهاتف:</span>
                    <span className="font-mono font-semibold text-ink text-sm" dir="ltr">
                      {selectedItem.phone}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={`https://wa.me/${selectedItem.phone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded hover:bg-[#20BA5A] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>مراسلة عبر واتساب</span>
                  </a>

                  <a
                    href={`tel:${selectedItem.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white text-xs font-bold rounded hover:bg-signature transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال هاتفي</span>
                  </a>
                </div>
              </div>

              {/* Consultation Requested Preferences */}
              <div className="p-4 bg-surface rounded-sm border border-border space-y-2 text-xs">
                <span className="font-bold text-ink block">تفاصيل الطلب الأصلية للعميل:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">الخدمة:</span>
                    <span className="font-semibold text-ink">{selectedItem.serviceLabelSnapshot.ar}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">تفضيل المحامي:</span>
                    <span className="font-semibold text-ink">
                      {selectedItem.preferredLawyerLabelSnapshot?.ar || 'لا يوجد تفضيل'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">اليوم المفضّل:</span>
                    <span className="font-semibold text-ink font-mono" dir="ltr">
                      {selectedItem.preferredDate || 'لم يحدد'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">لغة الطلب:</span>
                    <span className="font-semibold text-ink uppercase">{selectedItem.locale}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Scheduling & Assignment */}
              <div className="p-4 bg-surface border border-gold/40 rounded-sm space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-gold" />
                  <span className="text-xs font-bold text-ink">
                    تعيين المحامي وتثبيت الموعد المتفق عليه (Staff Assignment & Scheduling)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Lawyer assignment */}
                  <div className="space-y-1">
                    <label className="font-semibold text-ink block">
                      المحامي المسؤول المعيّن <span className="text-danger">*</span>
                    </label>
                    <select
                      value={editAssignedLawyer}
                      onChange={(e) => setEditAssignedLawyer(e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                    >
                      <option value="">-- اختر المحامي المسؤول --</option>
                      {lawyers.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scheduled date & time */}
                  <div className="space-y-1">
                    <label className="font-semibold text-ink block">
                      تاريخ ووقت الموعد المؤكّد (بتوقيت المملكة Asia/Riyadh) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={editScheduledAt}
                      onChange={(e) => setEditScheduledAt(e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs font-mono text-ink focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Meeting type */}
                  <div className="space-y-1">
                    <label className="font-semibold text-ink block">نوع الجلسة</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="meetingType"
                          value="online"
                          checked={editMeetingType === 'online'}
                          onChange={() => setEditMeetingType('online')}
                        />
                        <span>عن بُعد (Online Video)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="meetingType"
                          value="office"
                          checked={editMeetingType === 'office'}
                          onChange={() => setEditMeetingType('office')}
                        />
                        <span>حضوري في مقر الشركة (In-Office)</span>
                      </label>
                    </div>
                  </div>

                  {editMeetingType === 'online' && (
                    <div className="space-y-1">
                      <label className="font-semibold text-ink block">رابط الاجتماع (Google Meet / Zoom)</label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={editMeetingLink}
                        onChange={(e) => setEditMeetingLink(e.target.value)}
                        className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs font-mono text-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                  )}

                  {editMeetingType === 'office' && (
                    <div className="space-y-1">
                      <label className="font-semibold text-ink block">عنوان المقر أو القاعة</label>
                      <input
                        type="text"
                        placeholder="الرياض، طريق الملك فهد - برج الشركة، الطابق 14"
                        value={editMeetingAddress}
                        onChange={(e) => setEditMeetingAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Transition Actions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-ink block">تحديث حالة الطلب:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave('confirmed')}
                    className="p-2.5 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الموعد (Confirm)</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave('completed')}
                    className="p-2.5 rounded bg-blue-700 text-white font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اكتملت الجلسة (Complete)</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave('pending')}
                    className="p-2.5 rounded bg-canvas border border-border text-ink font-semibold hover:border-gold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>إرجاع لقيد الانتظار</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave('cancelled')}
                    className="p-2.5 rounded bg-canvas border border-danger/30 text-danger font-semibold hover:bg-danger/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>إلغاء الطلب (Cancel)</span>
                  </button>
                </div>
              </div>

              {/* Internal Notes Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  <span className="text-xs font-bold text-ink">
                    الملاحظات الإجرائية الداخلية ({selectedItem.notes.length})
                  </span>
                </div>

                {selectedItem.notes.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedItem.notes.map((n) => (
                      <div key={n.id} className="p-2.5 bg-canvas rounded border border-border/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span className="font-semibold text-ink">{n.authorName}</span>
                          <span dir="ltr">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-ink">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="إضافة ملاحظة إجرائية خاصة بالفريق (لا يراها العميل)..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink placeholder-muted/60 focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    disabled={saving || !newNoteText.trim()}
                    onClick={() => handleSave()}
                    className="px-3 py-1.5 bg-signature text-on-dark text-xs font-bold rounded hover:bg-signature/90 transition-colors disabled:opacity-50"
                  >
                    حفظ الملاحظة
                  </button>
                </div>
              </div>

              {/* History Audit Trail */}
              {selectedItem.history.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border text-[11px] text-muted">
                  <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
                    <History className="w-3.5 h-3.5 text-gold" />
                    <span>سجل الإجراءات على هذا الطلب:</span>
                  </div>
                  <div className="space-y-1 divide-y divide-border/40">
                    {selectedItem.history.map((h) => (
                      <div key={h.id} className="pt-1 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-ink font-semibold">{h.action}</span>
                          <span className="text-muted ms-1">({h.actorEmail})</span>
                        </div>
                        <span dir="ltr">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border bg-canvas flex items-center justify-between">
              <span className="text-[11px] text-muted">
                آخر تحديث: {new Date(selectedItem.updatedAt).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-surface border border-border rounded text-xs font-semibold text-ink hover:border-gold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
