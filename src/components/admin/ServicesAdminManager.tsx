'use client';

import React, { useState } from 'react';
import { ServiceEntity } from '@/server/types';
import { CheckCircle2, AlertCircle, Globe, Shield, RefreshCw, Eye } from 'lucide-react';

interface ServicesAdminManagerProps {
  initialServices: ServiceEntity[];
  canPublish: boolean;
  actorUid: string;
}

export function ServicesAdminManager({ initialServices, canPublish, actorUid }: ServicesAdminManagerProps) {
  const [services, setServices] = useState<ServiceEntity[]>(initialServices);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

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

      setMessage({ text: `تم نشر الخدمة بنجاح بزوج اللغتين (الإصدار ${data.version})! تم تحديث الكاش.`, type: 'success' });
      // Update local state
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === serviceId) {
            return {
              ...s,
              version: data.version,
              locales: {
                ar: { ...s.locales.ar, publishedRevisionId: s.locales.ar.approvedRevisionId || s.locales.ar.draftRevisionId },
                en: { ...s.locales.en, publishedRevisionId: s.locales.en.approvedRevisionId || s.locales.en.draftRevisionId },
              },
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      setMessage({ text: err.message || 'فشلت عملية النشر', type: 'danger' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnpublish = async (serviceId: string) => {
    if (!confirm('هل أنت متأكد من سحب هذه الخدمة من النشر العام فوراً؟')) return;

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

      setMessage({ text: 'تم سحب الخدمة من النشر العام وإزالة الإسقاط فوراً.', type: 'success' });
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === serviceId) {
            return {
              ...s,
              locales: {
                ar: { ...s.locales.ar, publishedRevisionId: undefined },
                en: { ...s.locales.en, publishedRevisionId: undefined },
              },
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      setMessage({ text: err.message || 'فشلت عملية السحب', type: 'danger' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-sm text-sm border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-surface rounded-sm border border-border overflow-hidden shadow-xs">
        <table className="w-full text-start text-sm">
          <thead className="bg-canvas border-b border-border text-xs text-muted uppercase font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-start">معرف الخدمة</th>
              <th className="px-6 py-3.5 text-start">الفئة المستهدفة</th>
              <th className="px-6 py-3.5 text-start">مراجعة العربية (AR)</th>
              <th className="px-6 py-3.5 text-start">مراجعة الإنجليزية (EN)</th>
              <th className="px-6 py-3.5 text-start">حالة النشر العام</th>
              <th className="px-6 py-3.5 text-end">إجراءات الحوكمة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {services.map((s) => {
              const isPublished = Boolean(s.locales.ar.publishedRevisionId && s.locales.en.publishedRevisionId);
              const isLoading = loadingId === s.id;

              return (
                <tr key={s.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-xs font-mono text-ink">
                    {s.id}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex gap-1.5">
                      {s.audiences.map((aud) => (
                        <span key={aud} className="px-2 py-0.5 bg-canvas rounded border border-border text-muted">
                          {aud}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <span className="px-2 py-0.5 bg-canvas rounded border border-border text-success">
                      ✓ {s.locales.ar.workflow} ({s.locales.ar.slug})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <span className="px-2 py-0.5 bg-canvas rounded border border-border text-success">
                      ✓ {s.locales.en.workflow} ({s.locales.en.slug})
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-success/15 text-success rounded border border-success/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> منشور حي (Live v{s.version})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gold/15 text-gold-ink rounded border border-gold/30">
                        <AlertCircle className="w-3.5 h-3.5" /> مسودة غير منشورة
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="inline-flex items-center gap-2">
                      {canPublish && (
                        <>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handlePublishPaired(s.id)}
                            className="px-3 py-1.5 bg-ink text-on-dark rounded text-xs font-semibold hover:bg-signature transition-colors disabled:opacity-50"
                          >
                            {isLoading ? 'جاري النشر...' : 'نشر متزامن (Publish)'}
                          </button>
                          {isPublished && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleUnpublish(s.id)}
                              className="px-3 py-1.5 bg-danger/10 text-danger rounded text-xs font-semibold hover:bg-danger/20 transition-colors disabled:opacity-50"
                            >
                              سحب (Unpublish)
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
