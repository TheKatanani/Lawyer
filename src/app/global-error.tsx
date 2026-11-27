'use client';

import React, { useEffect } from 'react';
import '@/app/globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical global error caught:', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4 antialiased">
        <div className="max-w-lg w-full bg-surface border border-border rounded-sm p-8 text-center space-y-6 shadow-md">
          <div className="w-12 h-12 mx-auto rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger font-bold text-xl">
            !
          </div>

          <div className="space-y-2">
            <h1 className="font-heading-ar font-bold text-2xl text-ink">
              تعذر تحميل الصفحة / Unable to Load Page
            </h1>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              حدث خلل مؤقت غير متوقع. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية لشركة رياض محمد الزهراني للمحاماة.
            </p>
            <p className="text-muted/80 text-xs leading-relaxed" dir="ltr">
              An unexpected system error occurred. Please retry or return to the homepage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-2.5 bg-ink text-on-dark rounded-sm text-xs font-semibold hover:bg-signature transition-colors"
            >
              إعادة المحاولة / Try Again
            </button>
            <a
              href="/ar"
              className="w-full sm:w-auto px-6 py-2.5 bg-canvas border border-border text-ink rounded-sm text-xs font-semibold hover:bg-canvas/80 transition-colors"
            >
              الرئيسية (عربي) / Home (AR)
            </a>
            <a
              href="/en"
              className="w-full sm:w-auto px-6 py-2.5 bg-canvas border border-border text-ink rounded-sm text-xs font-semibold hover:bg-canvas/80 transition-colors"
              dir="ltr"
            >
              English Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
