'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FileQuestion, Home, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LocalizedNotFound() {
  const locale = useLocale() || 'ar';
  const isAr = locale === 'ar';

  return (
    <div className="min-h-[65vh] py-20 px-4 bg-canvas flex items-center justify-center font-body-ar">
      <div className="max-w-lg w-full bg-surface border border-border/80 rounded-2xl shadow-sm p-8 sm:p-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-signature/5 border border-gold/20 text-gold-ink flex items-center justify-center mx-auto">
          <FileQuestion className="w-10 h-10 text-gold-ink" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold tracking-widest text-gold-ink uppercase block font-mono">
            404 • Not Found
          </span>
          <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
            {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            {isAr
              ? 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد يكون الرابط قد تغيّر أو تمت إزالة الصفحة.'
              : 'Sorry, the page you are looking for cannot be found. The link may have changed or the page was moved.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${locale}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-ink text-on-dark text-sm font-semibold hover:bg-signature transition shadow-sm"
          >
            <Home className="w-4 h-4 text-gold" />
            <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}</span>
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-canvas text-ink text-sm font-semibold hover:bg-surface transition"
          >
            <span>{isAr ? 'تواصل معنا' : 'Contact Support'}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      </div>
    </div>
  );
}
