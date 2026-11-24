'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Building,
} from 'lucide-react';

interface Props {
  locale: string;
  paymentId: string;
  paymentStatus: string;
  consultationId: string;
  errorMessage?: string;
}

export function ConsultationPaymentCallback({
  locale,
  paymentId,
  paymentStatus,
  consultationId,
  errorMessage,
}: Props) {
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(
    paymentStatus === 'failed' ? (errorMessage || null) : null
  );
  const [receiptData, setReceiptData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If Moyasar reported failure directly in query params
    if (paymentStatus === 'failed') {
      setLoading(false);
      setError(
        errorMessage ||
          (isAr
            ? 'تعذر إتمام عملية السداد من قِبل البنك المصدر للبطاقة. يرجى مراجعة بيانات البطاقة والمحاولة مجدداً.'
            : 'Payment was declined by the card issuer. Please check your card details and try again.')
      );
      return;
    }

    if (!paymentId || !consultationId) {
      setLoading(false);
      setError(
        isAr
          ? 'بيانات المعاملة غير مكتملة للتحقق من السداد.'
          : 'Transaction parameters are missing.'
      );
      return;
    }

    // Call server verification
    const verify = async () => {
      try {
        setError(null);
        const res = await fetch(`/api/consultations/${encodeURIComponent(consultationId)}/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || (isAr ? 'فشل التحقق من السداد لدى ميسر.' : 'Verification failed.'));
        }

        setError(null);
        setVerified(true);
        setReceiptData(data.receipt || data.consultation);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [paymentId, paymentStatus, consultationId, errorMessage, isAr]);

  const copyReference = () => {
    if (receiptData?.reference) {
      navigator.clipboard.writeText(receiptData.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md w-full mx-auto p-8 bg-surface border border-border rounded-sm text-center space-y-4 shadow-sm">
        <Loader2 className="w-10 h-10 text-gold-ink animate-spin mx-auto" />
        <h2 className="font-heading-ar font-bold text-base text-ink">
          {isAr ? 'جارٍ التحقق وتأكيد سداد الاستشارة...' : 'Verifying consultation payment...'}
        </h2>
        <p className="text-xs text-muted">
          {isAr
            ? 'لحظات ونؤكد استلام الرسوم وربطها بملف الاستشارة القانونية.'
            : 'Connecting with Moyasar payment gateway to settle transaction.'}
        </p>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="max-w-lg w-full mx-auto p-8 bg-surface border border-danger/30 rounded-sm text-center space-y-5 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading-ar font-bold text-lg text-ink">
            {isAr ? 'تعذر استكمال السداد الإلكتروني' : 'Payment Verification Unsuccessful'}
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            {error || (isAr ? 'حدث خطأ أثناء معالجة العملية.' : 'An error occurred during payment verification.')}
          </p>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-center gap-3">
          <Link
            href={`/${locale}/consultation`}
            className="px-5 py-2.5 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors"
          >
            {isAr ? 'العودة لصفحة الاستشارة' : 'Return to Consultation Form'}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="px-5 py-2.5 bg-canvas border border-border text-ink rounded text-xs font-semibold hover:bg-surface transition-colors"
          >
            {isAr ? 'التواصل المباشر' : 'Contact Support'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto p-6 sm:p-10 bg-surface border border-border rounded-sm space-y-6 shadow-sm">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/60 text-emerald-900 border border-emerald-300 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isAr ? 'تم سداد رسوم الاستشارة بنجاح' : 'Consultation Fee Paid Successfully'}</span>
        </span>
        <h1 className="font-heading-ar font-bold text-xl sm:text-2xl text-ink">
          {isAr ? 'تم تأكيد موعد وسداد الاستشارة القانونية' : 'Consultation Appointment & Payment Confirmed'}
        </h1>
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
          {isAr
            ? 'تم قيد عملية السداد بنجاح وربطها برقم طلب الاستشارة. سيتواصل معك المستشار القانوني لتأكيد تفاصيل الجلسة.'
            : 'Payment settled and linked to your consultation request. Our legal advisor will contact you shortly.'}
        </p>
      </div>

      {/* Official Electronic Receipt Card */}
      <div className="bg-canvas border border-border rounded p-5 space-y-3.5 text-xs font-sans">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-muted">{isAr ? 'رقم مرجع الاستشارة' : 'Reference Number'}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-ink text-sm">{receiptData?.reference}</span>
            <button
              onClick={copyReference}
              className="text-gold-ink hover:text-gold transition-colors p-1"
              title={isAr ? 'نسخ المرجع' : 'Copy'}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copied && <span className="text-[10px] text-emerald-700">{isAr ? 'تم النسخ!' : 'Copied!'}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-muted">{isAr ? 'المبلغ المسدد' : 'Paid Amount'}</span>
          <span className="font-bold font-mono text-ink text-sm">
            {receiptData?.amountSar ?? 500} {receiptData?.currency || 'SAR'}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-muted">{isAr ? 'وسيلة الدفع' : 'Payment Method'}</span>
          <span className="font-bold text-ink flex items-center gap-1.5 uppercase font-mono text-[11px]">
            <CreditCard className="w-3.5 h-3.5 text-gold-ink" />
            <span>{receiptData?.method || 'Moyasar Mada/Card'}</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted">{isAr ? 'رقم العملية في ميسّر' : 'Transaction ID'}</span>
          <span className="font-mono text-[11px] text-muted truncate max-w-[200px]" dir="ltr">
            {receiptData?.paymentId || paymentId}
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href={`/${locale}`}
          className="w-full sm:w-auto text-center px-6 py-2.5 bg-canvas border border-border text-ink rounded text-xs font-semibold hover:bg-surface transition-colors"
        >
          {isAr ? 'العودة للرئيسية' : 'Return to Home'}
        </Link>
        <Link
          href={`/${locale}/consultation`}
          className="w-full sm:w-auto text-center px-6 py-2.5 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors shadow-xs"
        >
          {isAr ? 'طلب استشارة جديدة' : 'New Consultation'}
        </Link>
      </div>
    </div>
  );
}
