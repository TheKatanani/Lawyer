'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  X,
  CreditCard,
  Building2,
  Calendar,
} from 'lucide-react';

interface PaymentRequestItem {
  id: string;
  token: string;
  clientName: string;
  clientPhone: string;
  serviceCategory: string;
  amountSar: number;
  amountMinor: number;
  description: string;
  status: 'unpaid' | 'paid' | 'cancelled';
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  notes?: string;
  moyasarPaymentId?: string | null;
}

interface InvoicesManagerProps {
  initialItems: PaymentRequestItem[];
}

export function InvoicesManager({ initialItems }: InvoicesManagerProps) {
  const [items, setItems] = useState<PaymentRequestItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentRequestItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [amountSar, setAmountSar] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('14');

  // Stats calculation
  const totalSettled = items
    .filter((i) => i.status === 'paid')
    .reduce((acc, curr) => acc + curr.amountSar, 0);

  const totalPending = items
    .filter((i) => i.status === 'unpaid')
    .reduce((acc, curr) => acc + curr.amountSar, 0);

  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.clientName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.serviceCategory.toLowerCase().includes(q) ||
        item.clientPhone.includes(q)
      );
    }
    return true;
  });

  const getPublicPayUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/ar/pay/${token}`;
    }
    return `/ar/pay/${token}`;
  };

  const formatWhatsAppText = (item: PaymentRequestItem) => {
    const payUrl = getPublicPayUrl(item.token);
    return `السلام عليكم ورحمة الله وبركاته،\nالأستاذ/ة: ${item.clientName} المحترم/ة،\n\nنرفق لكم رابط السداد الإلكتروني المعتمد الخاص بشركة رياض محمد الزهراني للمحاماة والاستشارات القانونية:\n\n• بيان الخدمة: ${item.serviceCategory}\n• المبلغ المطلوب: ${item.amountSar.toLocaleString('en-US')} ريال سعودي\n• رقم الطلب المرجعي: ${item.id}\n\nيرجى إتمام عملية السداد الآمن عبر بطاقات (مدى / فيزا / ماستركارد / Apple Pay) من خلال الرابط التالي:\n${payUrl}\n\nشاكرين ومقدرين ثقتكم بنا.`;
  };

  const handleCopyWhatsApp = (item: PaymentRequestItem) => {
    const text = formatWhatsAppText(item);
    navigator.clipboard.writeText(text);
    setCopiedId(`wa-${item.id}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyLink = (token: string, id: string) => {
    const url = getPublicPayUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedId(`link-${id}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          serviceCategory,
          amountSar: parseFloat(amountSar),
          description,
          notes,
          expiresInDays: parseInt(expiresInDays, 10),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'فشل إنشاء طلب السداد');
      }

      setItems((prev) => [json.data, ...prev]);
      setSuccessMsg(`تم إنشاء طلب السداد ${json.data.id} بنجاح`);
      setTimeout(() => setSuccessMsg(null), 4000);

      // Reset form
      setClientName('');
      setClientPhone('');
      setServiceCategory('');
      setAmountSar('');
      setDescription('');
      setNotes('');
      setIsCreateOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الإنشاء');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'unpaid' | 'paid' | 'cancelled') => {
    if (!confirm(`هل أنت متأكد من تغيير حالة الطلب ${id} إلى (${newStatus === 'paid' ? 'مسدد' : newStatus === 'cancelled' ? 'ملغي' : 'غير مسدد'})؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setItems((prev) => prev.map((item) => (item.id === id ? json.data : item)));
        if (selectedItem?.id === id) {
          setSelectedItem(json.data);
        }
      } else {
        alert(json.error || 'فشل تحديث الحالة');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    }
  };

  return (
    <div className="space-y-8 font-body-ar" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink flex items-center gap-3">
            <Receipt className="w-7 h-7 text-gold-ink" />
            <span>طلبات السداد والإيصالات الإلكترونية</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            إصدار روابط سداد رسمية موثقة للعملاء، التحقق الآلي عبر ميسّر، وتوليد نصوص الواتساب بضغطة زر.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-signature text-on-dark hover:bg-signature/90 transition shadow-sm font-semibold text-sm"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>إنشاء طلب سداد جديد</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">إجمالي المبالغ المحصلة</span>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-body-ar tabular-nums text-ink">
              {totalSettled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-gold-ink">ر.س</span>
          </div>
          <span className="text-[11px] text-muted block">عبر ميسّر والتحصيل المكتبي</span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">بانتظار السداد</span>
            <Clock className="w-5 h-5 text-gold-ink" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-body-ar tabular-nums text-ink">
              {totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-gold-ink">ر.س</span>
          </div>
          <span className="text-[11px] text-muted block">روابط نشطة لم تُسدد بعد</span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">إجمالي الطلبات</span>
            <Receipt className="w-5 h-5 text-signature" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading-ar text-ink">{items.length}</span>
            <span className="text-xs text-muted">طلب مسجل</span>
          </div>
          <span className="text-[11px] text-muted block">معتمد وفق المعايير النظامية</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-surface rounded-xl border border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-lg w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'unpaid', label: 'غير مسدد' },
            { id: 'paid', label: 'مسدد' },
            { id: 'cancelled', label: 'ملغي' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الرقم، أو الجوال..."
            className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink transition"
          />
        </div>
      </div>

      {/* Table of Invoices */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-canvas border-b border-border text-xs text-muted font-semibold">
              <tr>
                <th className="py-3.5 px-4">رقم الطلب</th>
                <th className="py-3.5 px-4">العميل / المنشأة</th>
                <th className="py-3.5 px-4">بيان الخدمة</th>
                <th className="py-3.5 px-4">المبلغ</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4 text-center">الإجراءات والواتساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted text-sm">
                    لا توجد طلبات سداد مطابقة للبحث أو الفلتر
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/50 transition">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-ink text-xs">
                      {item.id}
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-ink block">{item.clientName}</span>
                      <span className="text-xs text-muted font-mono">{item.clientPhone}</span>
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-ink block max-w-xs truncate">
                        {item.serviceCategory}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <span className="font-body-ar font-bold text-ink tabular-nums">
                        {item.amountSar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-gold-ink mr-1 font-semibold">ر.س</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {item.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مسدد</span>
                        </span>
                      ) : item.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted/10 text-muted">
                          <XCircle className="w-3 h-3" />
                          <span>ملغي</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/15 text-gold-ink">
                          <Clock className="w-3 h-3" />
                          <span>غير مسدد</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1-Click WhatsApp Copy */}
                        <button
                          type="button"
                          onClick={() => handleCopyWhatsApp(item)}
                          title="نسخ رسالة الواتساب الجاهزة"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-success/10 hover:bg-success/20 text-success text-xs font-semibold transition"
                        >
                          {copiedId === `wa-${item.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-success" />
                              <span>تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>واتساب</span>
                            </>
                          )}
                        </button>

                        {/* Copy Link */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item.token, item.id)}
                          title="نسخ رابط الدفع"
                          className="p-1.5 rounded-md border border-border hover:bg-canvas text-muted hover:text-ink transition"
                        >
                          {copiedId === `link-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open in new tab */}
                        <a
                          href={getPublicPayUrl(item.token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="معاينة شاشة العميل"
                          className="p-1.5 rounded-md border border-border hover:bg-canvas text-muted hover:text-ink transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* View Drawer */}
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          title="تفاصيل الطلب"
                          className="p-1.5 rounded-md border border-border hover:bg-canvas text-muted hover:text-ink transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-heading-ar font-bold text-xl text-ink flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gold-ink" />
                <span>إنشاء طلب سداد جديد</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-muted hover:text-ink rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  اسم العميل أو الجهة <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="مثال: شركة التطوير الحديثة / عبد الله الأحمد"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    رقم الجوال (مع المفتاح الدولي) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+9665XXXXXXXX"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    المبلغ المطلوب (بالريال السعودي) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amountSar}
                    onChange={(e) => setAmountSar(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  بيان الخدمة القانونية <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  placeholder="مثال: أتعاب دراسة ملف النزاع وإعداد مذكرة الرد"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  تفاصيل عامة للعميل (غير سرية)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملاحظات تظهر للعميل في شاشة السداد والإيصال..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    ملاحظات إدارية داخلية (سرية للمكتب)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="رقم الملف الداخلي أو المرجع..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    صلاحية الرابط (بالأيام)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-canvas focus:outline-none focus:border-gold-ink font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-signature text-on-dark rounded-lg text-sm font-semibold hover:bg-signature/90 transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'جاري الإنشاء...' : 'إصدار طلب السداد والرابط'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted font-mono">{selectedItem.id}</span>
                <h3 className="font-heading-ar font-bold text-xl text-ink">
                  {selectedItem.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-muted hover:text-ink rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted">بيان الخدمة</span>
                <span className="font-semibold text-ink">{selectedItem.serviceCategory}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted">المبلغ المطلوب</span>
                <span className="font-bold font-body-ar tabular-nums text-ink">
                  {selectedItem.amountSar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted">الحالة</span>
                <span className="font-semibold uppercase text-gold-ink">
                  {selectedItem.status === 'paid' ? 'مسدد' : selectedItem.status === 'cancelled' ? 'ملغي' : 'غير مسدد'}
                </span>
              </div>

              {selectedItem.moyasarPaymentId && (
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted">معرف ميسّر</span>
                  <span className="font-mono text-xs text-ink">{selectedItem.moyasarPaymentId}</span>
                </div>
              )}

              {selectedItem.notes && (
                <div className="py-2 bg-canvas/60 p-3 rounded-lg border border-border/60">
                  <span className="text-xs text-muted block mb-1">ملاحظة سرية للمكتب:</span>
                  <p className="text-xs text-ink">{selectedItem.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Status Modifiers */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-semibold text-muted block">تعديل الحالة اليدوي:</span>
              <div className="flex items-center gap-2">
                {selectedItem.status !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'paid')}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-success text-white hover:bg-success/90 transition"
                  >
                    تحديد كمسدد (سداد مكتبي)
                  </button>
                )}
                {selectedItem.status !== 'unpaid' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'unpaid')}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg border border-border text-ink hover:bg-canvas transition"
                  >
                    إعادة كغير مسدد
                  </button>
                )}
                {selectedItem.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'cancelled')}
                    className="py-2 px-3 text-xs font-semibold rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition"
                  >
                    إلغاء الطلب
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-canvas text-ink text-xs font-semibold rounded-lg hover:bg-border/60"
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
