'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AlertCircle, Home } from 'lucide-react';

export default function PaymentTokenNotFound() {
  const locale = useLocale() || 'ar';
  const isAr = locale === 'ar';

  return (
    <div className="min-h-[60vh] py-16 px-4 bg-canvas flex items-center justify-center font-body-ar">
      <div className="max-w-md w-full bg-surface border border-border/80 rounded-2xl shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading-ar font-bold text-2xl text-ink">
            {isAr ? 'الرابط غير صالح أو منتهي' : 'Invalid or Expired Link'}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            {isAr
              ? 'عذراً، رابط طلب السداد المطلوب غير متوفر بالنظام أو انتهت صلاحيته المحددة. يرجى التواصل مع إدارة المكتب للتأكد من بيانات السداد.'
              : 'Sorry, the requested payment link is invalid or has expired. Please contact the office administration for assistance.'}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-ink text-on-dark text-sm font-semibold hover:bg-signature transition shadow-sm"
          >
            <Home className="w-4 h-4 text-gold" />
            <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
