'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params?.locale === 'en' ? 'en' : 'ar';
  const isAr = locale === 'ar';

  useEffect(() => {
    console.error('Unhandled runtime error in localized route:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-canvas px-4 py-16">
      <div className="max-w-lg w-full bg-surface border border-border rounded-sm p-8 text-center space-y-6 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading-ar font-bold text-2xl text-ink">
            {isAr ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            {isAr
              ? 'نعتذر عن هذا الخلل المؤقت. يرجى إعادة المحاولة أو العودة للصفحة الرئيسية لشركة رياض محمد الزهراني للمحاماة.'
              : 'We apologize for the temporary issue. Please try again or return to the Riyadh Mohammed Alzahrani Law Firm homepage.'}
          </p>
          <p className="text-muted/70 text-xs" dir={isAr ? 'ltr' : 'rtl'}>
            {isAr
              ? 'An unexpected error occurred. Please try again or return to homepage.'
              : 'حدث خطأ غير متوقع. يرجى إعادة المحاولة أو العودة للرئيسية.'}
          </p>
        </div>

        {error.digest && (
          <div className="p-2 bg-canvas rounded border border-border/60 text-[11px] font-mono text-muted">
            Error Code: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-ink text-on-dark rounded-sm text-xs font-semibold hover:bg-signature transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة المحاولة' : 'Try Again'}</span>
          </button>
          <Link
            href={`/${locale}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-canvas border border-border text-ink rounded-sm text-xs font-semibold hover:bg-canvas/80 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-gold-ink" />
            <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
