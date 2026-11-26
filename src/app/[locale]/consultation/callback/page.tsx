import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ConsultationPaymentCallback } from '@/components/consultation/ConsultationPaymentCallback';
import { isPaymentsEnabled } from '@/server/payments/moyasar';

interface Props {
  params: { locale: string };
  searchParams: {
    id?: string;
    status?: string;
    message?: string;
    consultation?: string;
  };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isAr = locale === 'ar';
  return {
    title: isAr
      ? 'نتيجة سداد الاستشارة القانونية'
      : 'Consultation Payment Result',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function PaymentCallbackPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);

  // Moyasar sends status ('paid' | 'failed') and message ('APPROVED' or failure reason).
  // Only treat 'message' as an error when status is explicitly failed.
  const isFailed = searchParams.status === 'failed';
  const errorMessage = isFailed ? (searchParams.message || '') : undefined;

  return (
    <div className="min-h-[70vh] py-16 px-4 bg-canvas flex items-center justify-center">
      <Suspense
        fallback={
          <div className="p-8 bg-surface border border-border rounded text-center animate-pulse text-xs text-muted">
            جارٍ التحقق من نتيجة العملية...
          </div>
        }
      >
        <ConsultationPaymentCallback
          locale={locale}
          paymentId={searchParams.id || ''}
          paymentStatus={searchParams.status || ''}
          consultationId={searchParams.consultation || ''}
          errorMessage={errorMessage}
          paymentsEnabled={isPaymentsEnabled()}
        />
      </Suspense>
    </div>
  );
}
