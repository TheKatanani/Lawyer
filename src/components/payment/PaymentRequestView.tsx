'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import {
  CheckCircle2,
  Printer,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  Lock,
  Clock,
  FileText,
} from 'lucide-react';

declare global {
  interface Window {
    Moyasar?: {
      init(options: Record<string, unknown>): void;
    };
  }
}

interface PaymentRequestData {
  id: string;
  token: string;
  clientName: string;
  serviceCategory: string;
  amountSar: number;
  amountMinor: number;
  description: string;
  status: 'unpaid' | 'paid' | 'cancelled';
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  isExpired?: boolean;
  moyasarPaymentId?: string | null;
  maskedCard?: string;
}

interface PaymentRequestViewProps {
  initialData: PaymentRequestData;
  locale: string;
  publishableKey: string;
  applePayEnabled: boolean;
  officialPhone: string;
  officialWhatsApp: string;
}

export function PaymentRequestView({
  initialData,
  locale,
  publishableKey,
  applePayEnabled,
  officialPhone,
  officialWhatsApp,
}: PaymentRequestViewProps) {
  const isAr = locale === 'ar';
  const [data, setData] = useState<PaymentRequestData>(initialData);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [moyasarMounted, setMoyasarMounted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters for 3DS redirect return (e.g. ?id=xyz or ?status=paid or ?status=failed)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const paymentId = url.searchParams.get('id');
    const statusParam = url.searchParams.get('status');
    const messageParam = url.searchParams.get('message');

    // Case 1: Payment explicitly reported as failed by gateway
    if (statusParam === 'failed') {
      const reason = messageParam ? `: ${messageParam}` : '';
      setErrorMsg(isAr ? `تعذر إتمام الدفع${reason}` : `Payment could not be completed${reason}`);
      setVerifying(false);
      // Clean query parameters so customer can retry or reload cleanly
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Case 2: Payment reported as paid or has a paymentId to verify
    if (statusParam === 'paid' || (paymentId && data.status !== 'paid' && !verifying)) {
      if (paymentId) {
        setVerifying(true);
        setErrorMsg(null);

        fetch(`/api/invoices/${data.token}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        })
          .then(async (res) => {
            const json = await res.json();
            if (res.ok && json.success) {
              setData((prev) => ({
                ...prev,
                status: 'paid',
                paidAt: json.data.paidAt || new Date().toISOString(),
                paymentMethod: json.data.paymentMethod || 'online',
                moyasarPaymentId: json.data.moyasarPaymentId || paymentId,
                maskedCard: json.data.maskedCard,
              }));
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              setErrorMsg(json.error || (isAr ? 'تعذر إتمام الدفع: فشل التحقق من السداد' : 'Payment verification failed'));
            }
          })
          .catch((err) => {
            console.error('[PAYMENT_VERIFY_ERROR]', err);
            setErrorMsg(isAr ? 'تعذر إتمام الدفع: خطأ في الاتصال بالبوابة' : 'Network error during verification');
          })
          .finally(() => {
            setVerifying(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          });
      }
    }
  }, [data.token, data.status, verifying, isAr]);

  // Mount Moyasar MPF form when ready
  useEffect(() => {
    if (
      data.status !== 'unpaid' ||
      !scriptLoaded ||
      !window.Moyasar ||
      !formContainerRef.current ||
      verifying
    ) {
      return;
    }

    // If container already has form elements mounted, avoid redundant init
    if (formContainerRef.current.children.length > 0 && moyasarMounted) {
      return;
    }

    if (!publishableKey) {
      setErrorMsg(
        isAr
          ? 'بوابة الدفع الإلكتروني قيد الصيانة. يرجى التواصل مع إدارة المكتب للسداد.'
          : 'Payment gateway is currently under maintenance. Please contact office administration.'
      );
      return;
    }

    try {
      setMoyasarMounted(true);
      formContainerRef.current.innerHTML = '';

      const methods = ['creditcard'];
      if (applePayEnabled) {
        methods.push('applepay');
      }

      window.Moyasar.init({
        element: formContainerRef.current,
        amount: data.amountMinor,
        currency: 'SAR',
        description: `RMA Legal - ${data.id} - ${data.clientName}`,
        language: locale,
        fixed_width: false,
        publishable_api_key: publishableKey,
        callback_url: `${window.location.origin}/${locale}/pay/${data.token}`,
        methods,
        metadata: {
          requestId: data.id,
          token: data.token,
          clientName: data.clientName,
        },
        on_completed: function (_payment: any) {
          // Callback triggers page redirect or verification
        },
        on_failed: function (error: any) {
          console.warn('[MOYASAR_PAYMENT_FAILED]', error);
          const errorDetail = error?.message ? `: ${error.message}` : '';
          setErrorMsg(
            isAr
              ? `تعذر إتمام الدفع${errorDetail}`
              : `Payment could not be completed${errorDetail}`
          );
        },
      });
    } catch (e: any) {
      console.error('[MOYASAR_INIT_ERROR]', e);
      setErrorMsg(isAr ? 'تعذر إتمام الدفع: فشل تهيئة نموذج السداد' : 'Failed to initialize payment form');
    }
  }, [data, scriptLoaded, moyasarMounted, verifying, publishableKey, locale, isAr, applePayEnabled]);

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppLink = () => {
    const rawPhone = officialWhatsApp.replace(/[^0-9]/g, '');
    const msg = isAr
      ? `السلام عليكم ورحمة الله،\nأفيدكم بأنه تم سداد طلب السداد رقم (${data.id}) بمبلغ ${data.amountSar} ريال سعودي لصالح شركة رياض محمد الزهراني للمحاماة.\nاسم العميل: ${data.clientName}\nتاريخ السداد: ${data.paidAt ? new Date(data.paidAt).toLocaleDateString('ar-SA') : ''}`
      : `Dear RMA Legal Team,\nPayment of ${data.amountSar} SAR for Request Ref (${data.id}) has been completed successfully.\nClient: ${data.clientName}`;
    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-canvas py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-body-ar">
      {/* Moyasar MPF Stylesheet & Script */}
      <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.14.0/moyasar.css" />
      <Script
        src="https://cdn.moyasar.com/mpf/1.14.0/moyasar.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Top Branding Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative w-44 h-14 sm:w-56 sm:h-18">
              <Image
                src="/logo-gold-full.png"
                alt="شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold-ink text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {isAr
                ? 'بوابة السداد الإلكتروني المعتمدة | شركة مرخصة بالمملكة'
                : 'Official Certified Payment Gateway | Licensed Saudi Firm'}
            </span>
          </div>
        </div>

        {/* Verifying Loader State */}
        {verifying && (
          <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm text-center space-y-4">
            <div className="w-12 h-12 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="font-heading-ar font-bold text-ink text-lg">
              {isAr ? 'جاري التحقق من عملية السداد...' : 'Verifying your payment...'}
            </h3>
            <p className="text-sm text-muted">
              {isAr
                ? 'يرجى الانتظار ثوانٍ معدودة لتأكيد المعاملة وإصدار الإيصال'
                : 'Please wait a moment while we confirm the transaction with the bank'}
            </p>
          </div>
        )}

        {/* ERROR NOTICE */}
        {errorMsg && !verifying && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3 text-danger text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{isAr ? 'تعذر إتمام الدفع' : 'Payment Error'}</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* STATE A: PAID -> ELECTRONIC RECEIPT */}
        {data.status === 'paid' && !verifying && (
          <div
            id="printable-receipt"
            className="bg-surface rounded-2xl border border-border/80 shadow-md p-6 sm:p-10 space-y-8 relative overflow-hidden"
          >
            {/* Top receipt accent strip */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold to-gold-ink" />

            {/* Receipt Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-success uppercase tracking-wider">
                    {isAr ? 'عملية سداد معتمدة' : 'Confirmed Payment'}
                  </span>
                  <h1 className="font-heading-ar font-bold text-2xl text-ink">
                    {isAr ? 'إيصال سداد إلكتروني' : 'Electronic Payment Receipt'}
                  </h1>
                </div>
              </div>

              <div className="text-right sm:text-left rtl:sm:text-left ltr:sm:text-right">
                <span className="text-xs text-muted block">{isAr ? 'رقم الإيصال المرجعي' : 'Receipt Ref'}</span>
                <span className="font-mono font-bold text-ink text-base">{data.id}</span>
              </div>
            </div>

            {/* Receipt Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="p-3.5 rounded-xl bg-canvas/60 border border-border/40 space-y-1">
                <span className="text-xs text-muted block">{isAr ? 'اسم العميل / المنشأة' : 'Client / Entity'}</span>
                <span className="font-semibold text-ink text-base block">{data.clientName}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas/60 border border-border/40 space-y-1">
                <span className="text-xs text-muted block">{isAr ? 'بيان الخدمة القانونية' : 'Legal Service'}</span>
                <span className="font-semibold text-ink text-base block">{data.serviceCategory}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas/60 border border-border/40 space-y-1">
                <span className="text-xs text-muted block">{isAr ? 'تاريخ وتوقيت السداد' : 'Payment Timestamp'}</span>
                <span className="font-medium text-ink block">
                  {data.paidAt ? new Date(data.paidAt).toLocaleString(isAr ? 'ar-SA' : 'en-US') : '-'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas/60 border border-border/40 space-y-1">
                <span className="text-xs text-muted block">{isAr ? 'وسيلة الدفع والمعرّف' : 'Method & Transaction ID'}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink uppercase">
                    {data.paymentMethod === 'applepay'
                      ? 'Apple Pay'
                      : data.paymentMethod === 'mada'
                      ? 'Mada (مدى)'
                      : data.paymentMethod === 'office'
                      ? (isAr ? 'سداد مكتبي' : 'Office Cash')
                      : 'Card'}
                  </span>
                  {data.maskedCard && (
                    <span className="text-xs text-muted font-mono">{data.maskedCard}</span>
                  )}
                </div>
                {data.moyasarPaymentId && (
                  <span className="text-[11px] text-muted font-mono block truncate">
                    Ref: {data.moyasarPaymentId}
                  </span>
                )}
              </div>
            </div>

            {/* Amount Banner */}
            <div className="rounded-xl bg-signature text-on-dark p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-on-dark/70 block">
                  {isAr ? 'المبلغ الإجمالي المسدد' : 'Total Amount Paid'}
                </span>
                <span className="text-xs text-gold">
                  {isAr ? 'سداد نظامي معتمد' : 'Authorized Transaction'}
                </span>
              </div>
              <div className="text-right rtl:text-right ltr:text-left">
                <span className="text-3xl font-body-ar font-bold text-white tabular-nums">
                  {data.amountSar.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-sm font-semibold text-gold mr-1.5 ml-1.5">
                  {isAr ? 'ر.س' : 'SAR'}
                </span>
              </div>
            </div>

            {/* Legal / Regulatory Notice */}
            <div className="border-t border-border/60 pt-4 text-xs text-muted space-y-1 leading-relaxed">
              <p>
                {isAr
                  ? 'هذا المستند يمثل إيصال سداد إلكتروني معتمد صادر عن شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية (ترخيص معتمد بالمملكة العربية السعودية).'
                  : 'This document constitutes an official Electronic Payment Receipt issued by Riyadh Mohammed Alzahrani Law Firm & Legal Consultations.'}
              </p>
              <p className="text-[11px] text-muted/80">
                {isAr
                  ? 'يُحفظ هذا الإيصال لأغراض التوثيق الإجرائي والمالي لملف القضية أو الاستشارة.'
                  : 'Retain this electronic receipt for procedural and administrative engagement records.'}
              </p>
            </div>

            {/* Action Buttons (Hidden when printing) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-ink/20 text-ink font-semibold text-sm hover:bg-canvas transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-gold-ink" />
                <span>{isAr ? 'طباعة الإيصال الرسمي' : 'Print Receipt'}</span>
              </button>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-success text-white font-semibold text-sm hover:bg-success/90 transition shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? 'إرسال تأكيد للمكتب عبر واتساب' : 'WhatsApp Confirmation'}</span>
              </a>
            </div>
          </div>
        )}

        {/* STATE B: UNPAID -> MOYASAR CHECKOUT */}
        {data.status === 'unpaid' && !verifying && !data.isExpired && (
          <div className="space-y-6">
            {/* Request Summary Card */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider block">
                    {isAr ? 'طلب سداد إلكتروني' : 'Payment Request'}
                  </span>
                  <h1 className="font-heading-ar font-bold text-2xl text-ink">
                    {data.serviceCategory}
                  </h1>
                </div>
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-xs text-muted block">{isAr ? 'المرجع' : 'Reference'}</span>
                  <span className="font-mono font-semibold text-ink text-sm">{data.id}</span>
                </div>
              </div>

              {/* Client & Description Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted">{isAr ? 'اسم العميل / الطرف' : 'Client Name'}</span>
                  <span className="font-semibold text-ink">{data.clientName}</span>
                </div>

                {data.description && (
                  <div className="py-2 border-b border-border/30">
                    <span className="text-muted block text-xs mb-1">
                      {isAr ? 'تفاصيل السداد والملاحظات' : 'Payment Description'}
                    </span>
                    <p className="text-ink text-sm leading-relaxed">{data.description}</p>
                  </div>
                )}

                {data.expiresAt && (
                  <div className="flex items-center justify-between py-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-ink" />
                      <span>{isAr ? 'تاريخ انتهاء صلاحية الرابط' : 'Link Valid Until'}</span>
                    </span>
                    <span>{new Date(data.expiresAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
                  </div>
                )}
              </div>

              {/* Amount Display */}
              <div className="rounded-xl bg-canvas p-4 sm:p-5 flex items-center justify-between border border-border/80">
                <div>
                  <span className="text-xs text-muted block">{isAr ? 'المبلغ المستحق' : 'Amount Due'}</span>
                  <span className="text-xs font-medium text-gold-ink">
                    {isAr ? 'شامل الرسوم البنكية' : 'Bank Processing Included'}
                  </span>
                </div>
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-3xl font-body-ar font-bold text-ink tabular-nums">
                    {data.amountSar.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm font-semibold text-gold-ink mr-1 ml-1">
                    {isAr ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Moyasar Form Container Card */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-ar font-bold text-lg text-ink flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gold-ink" />
                    <span>{isAr ? 'خيارات الدفع الإلكتروني' : 'Payment Methods'}</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Lock className="w-3.5 h-3.5 text-success" />
                    <span>
                      {isAr ? (
                        <>
                          تشفير <span dir="ltr" className="inline-block font-mono">256-bit</span> آمن
                        </>
                      ) : (
                        <span dir="ltr">256-bit Encrypted</span>
                      )}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  {isAr
                    ? 'يتم السداد المباشر عبر بطاقات مدى السعودية، البطاقات الائتمانية (فيزا / ماستركارد)، أو Apple Pay'
                    : 'Pay securely via Mada, Credit Cards (Visa/Mastercard), or Apple Pay'}
                </p>
              </div>

              {/* The Moyasar MPF mounted container */}
              <div
                ref={formContainerRef}
                className="mysr-form-container w-full min-h-[220px]"
              >
                {!scriptLoaded && (
                  <div className="flex items-center justify-center py-12 gap-2 text-muted text-sm">
                    <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? 'جاري تحميل بوابة الدفع...' : 'Loading payment gateway...'}</span>
                  </div>
                )}
              </div>

              {/* Supported payment badges footer */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted">
                <span>{isAr ? 'المدفوعات الإلكترونية بواسطة ميسّر' : 'Powered by Moyasar Payments'}</span>
                <span className="font-mono text-[11px] text-muted/70">PCI-DSS Certified</span>
              </div>
            </div>
          </div>
        )}

        {/* STATE C: EXPIRED OR CANCELLED */}
        {(data.status === 'cancelled' || data.isExpired) && (
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted/10 text-muted flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {data.status === 'cancelled'
                ? (isAr ? 'تم إلغاء طلب السداد' : 'Payment Request Cancelled')
                : (isAr ? 'انتهت صلاحية رابط السداد' : 'Payment Link Expired')}
            </h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              {isAr
                ? 'طلب السداد الحالي غير متاح للمعاملة. يرجى التواصل مع إدارة شركة رياض الزهراني لتحديث الطلب أو إصدار رابط جديد.'
                : 'This payment request is no longer active. Please contact RMA Legal administration for assistance.'}
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <a
                href={`tel:${officialPhone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-ink hover:bg-canvas"
              >
                <span>{isAr ? 'اتصل بالإدارة' : 'Call Office'}</span>
              </a>
              <a
                href={`https://wa.me/${officialWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? 'مراسلة عبر واتساب' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>
        )}

        {/* Footer Office Contact Banner */}
        <div className="text-center text-xs text-muted/80 space-y-1 print:hidden">
          <p>
            {isAr
              ? 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية'
              : 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations'}
          </p>
          <p>
            {isAr
              ? 'للدعم المالي والاستفسارات: '
              : 'Financial inquiries: '}
            <bdi dir="ltr" className="font-mono text-ink font-semibold">{officialPhone}</bdi>
          </p>
        </div>
      </div>
    </div>
  );
}
