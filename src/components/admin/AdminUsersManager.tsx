'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Mail,
  User,
} from 'lucide-react';
import { AdminUser, AdminRole } from '@/server/types';

const ROLE_LABELS: Record<AdminRole, { label: string; desc: string }> = {
  super_admin: { label: 'شريك مدير (Super Admin)', desc: 'كامل الصلاحيات، إدارة المسؤولين والنشر والإعدادات' },
  admin: { label: 'محامٍ شريك (Admin)', desc: 'إدارة ونشر المحتوى، والاطلاع على سجل التدقيق' },
  editor: { label: 'محرر قانوني (Editor)', desc: 'كتابة وتعديل مسودات الخدمات والمقالات بدون نشر حي' },
  inquiry_manager: { label: 'مسؤول استقبال القضايا (Intake Officer)', desc: 'إدارة طلبات التواصل وحجوزات الاستشارات والواتساب' },
};

export function AdminUsersManager({ currentUserId }: { currentUserId: string }) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('editor');
  const [isActive, setIsActive] = useState(true);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch admin users');
      setAdmins(data.admins || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const openAddModal = () => {
    setDisplayName('');
    setEmail('');
    setRole('editor');
    setIsActive(true);
    setIsAddOpen(true);
  };

  const openEditModal = (adm: AdminUser) => {
    setEditAdmin(adm);
    setDisplayName(adm.displayName);
    setEmail(adm.email);
    setRole(adm.role);
    setIsActive(adm.isActive);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add admin');
      setIsAddOpen(false);
      setSuccessMsg('تمت إضافة المسؤول وتخصيص الصلاحيات وفرض التحقق الثنائي (MFA).');
      await loadAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${editAdmin.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, role, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update admin');
      setEditAdmin(null);
      setSuccessMsg('تم تحديث صلاحيات وحالة حساب المسؤول بنجاح.');
      await loadAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin');
      setDeleteConfirmId(null);
      setSuccessMsg('تم حذف حساب المسؤول وإلغاء صلاحياته بنجاح.');
      await loadAdmins();
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
            إدارة حسابات المسؤولين والصلاحيات (Admin RBAC Governance)
          </h1>
          <p className="text-sm text-muted mt-1">
            إدارة مستخدمي النظام وتعيين الأدوار مع إلزامية المصادقة متعددة العوامل (MFA) وحماية حساب الشريك المؤسس.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAdmins}
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
            <span>إضافة مسؤول جديد</span>
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

      {/* Admins Table */}
      <div className="bg-surface rounded-sm border border-border overflow-hidden shadow-xs">
        <table className="w-full text-start text-sm">
          <thead className="bg-canvas border-b border-border text-xs text-muted uppercase font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-start">الاسم والبريد المهني</th>
              <th className="px-6 py-3.5 text-start">الدور المخصص (Role)</th>
              <th className="px-6 py-3.5 text-start">حالة الحساب</th>
              <th className="px-6 py-3.5 text-start">التحقق الثنائي (MFA)</th>
              <th className="px-6 py-3.5 text-start">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  جاري تحميل قائمة المسؤولين...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  لا يوجد مسؤولون مسجلون.
                </td>
              </tr>
            ) : (
              admins.map((adm) => {
                const isCurrent = adm.uid === currentUserId;
                return (
                  <tr key={adm.uid} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-ink flex items-center gap-2">
                        <span>{adm.displayName}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-signature text-gold rounded font-mono">
                            أنت (Current Session)
                          </span>
                        )}
                      </div>
                      <div className="text-muted font-mono" dir="ltr">
                        {adm.email}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-mono font-semibold px-2.5 py-1 bg-canvas rounded border border-border text-gold-ink inline-block">
                          {adm.role}
                        </span>
                        <p className="text-[11px] text-muted mt-1 max-w-xs">
                          {ROLE_LABELS[adm.role]?.desc}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {adm.isActive ? (
                        <span className="text-success font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> نشط (Active)
                        </span>
                      ) : (
                        <span className="text-danger font-semibold flex items-center gap-1">
                          <UserX className="w-3.5 h-3.5" /> معطل (Disabled)
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {adm.mfaEnrolled ? (
                        <span className="text-gold-ink font-semibold flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-gold" /> مفعل (Enforced)
                        </span>
                      ) : (
                        <span className="text-muted">غير مكتمل</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(adm)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-canvas hover:bg-canvas/80 text-ink rounded border border-border text-xs font-medium transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gold-ink" />
                          <span>تعديل</span>
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => setDeleteConfirmId(adm.uid)}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-sm max-w-md w-full p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-heading-ar font-bold text-xl text-ink">
                إضافة مسؤول جديد
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-muted hover:text-ink text-sm font-mono">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: أ. فيصل السبيعي"
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">البريد الإلكتروني المهني *</label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faisal@rma-law.sa"
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">الدور المخصص (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                >
                  <option value="super_admin">شريك مدير (Super Admin)</option>
                  <option value="admin">محامٍ شريك (Admin)</option>
                  <option value="editor">محرر قانوني (Editor)</option>
                  <option value="inquiry_manager">مسؤول استقبال القضايا (Intake Officer)</option>
                </select>
                <p className="text-[11px] text-muted mt-1">{ROLE_LABELS[role]?.desc}</p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-canvas border border-border text-ink rounded hover:bg-canvas/80 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'جارٍ الحفظ...' : 'إضافة المسؤول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-sm max-w-md w-full p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-heading-ar font-bold text-xl text-ink">
                تعديل صلاحيات: {editAdmin.displayName}
              </h2>
              <button onClick={() => setEditAdmin(null)} className="text-muted hover:text-ink text-sm font-mono">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">الدور المخصص (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                >
                  <option value="super_admin">شريك مدير (Super Admin)</option>
                  <option value="admin">محامٍ شريك (Admin)</option>
                  <option value="editor">محرر قانوني (Editor)</option>
                  <option value="inquiry_manager">مسؤول استقبال القضايا (Intake Officer)</option>
                </select>
                <p className="text-[11px] text-muted mt-1">{ROLE_LABELS[role]?.desc}</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="font-semibold text-ink">حساب نشط (Active) ويمتلك حق الدخول</span>
                </label>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditAdmin(null)}
                  className="px-4 py-2 bg-canvas border border-border text-ink rounded hover:bg-canvas/80 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'جارٍ الحفظ...' : 'تحديث البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-heading-ar font-bold text-lg">تأكيد حذف حساب المسؤول</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا المسؤول نهائياً؟ سيتم سحب كافة الصلاحيات وإلغاء جلسات الدخول.
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
