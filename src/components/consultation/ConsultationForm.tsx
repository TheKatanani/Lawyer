'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  MessageCircle,
  Calendar,
  User,
  Phone,
  Briefcase,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Clock,
  ShieldCheck,
  Loader2,
  CreditCard,
  Building,
  Lock,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

declare global {
  interface Window {
    Moyasar?: {
      init(options: Record<string, unknown>): void;
    };
  }
}

interface ServiceOption {
  id: string;
  slug: string;
  title: string;
}

interface LawyerOption {
  id: string;
  slug: string;
  name: string;
  title: string;
}

interface ConsultationFormProps {
  locale: string;
  services: ServiceOption[];
  lawyers: LawyerOption[];
  paymentsEnabled?: boolean;
  messages: {
    title: string;
    explanation: string;
    fullName: string;
    fullNamePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    service: string;
    generalService: string;
    optionalSection: string;
    lawyer: string;
    defaultLawyer: string;
    preferredDay: string;
    submit: string;
    saving: string;
    belowButton: string;
    savedHeading: string;
    savedMessage: string;
    fallbackAction: string;
    failure: string;
    referenceLabel: string;
    privacyNotice: string;
  };
}

const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', nameAr: 'الإمارات', nameEn: 'UAE' },
  { code: '+965', flag: '🇰🇼', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { code: '+974', flag: '🇶🇦', nameAr: 'قطر', nameEn: 'Qatar' },
  { code: '+973', flag: '🇧🇭', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', nameAr: 'عُمان', nameEn: 'Oman' },
  { code: '+20', flag: '🇪🇬', nameAr: 'مصر', nameEn: 'Egypt' },
  { code: '+962', flag: '🇯🇴', nameAr: 'الأردن', nameEn: 'Jordan' },
  { code: '+44', flag: '🇬🇧', nameAr: 'المملكة المتحدة', nameEn: 'UK' },
  { code: '+1', flag: '🇺🇸', nameAr: 'الولايات المتحدة', nameEn: 'USA' },
];

export function ConsultationForm({
  locale,
  services,
  lawyers,
  messages,
}: ConsultationFormProps) {
  const searchParams = useSearchParams();
  const isAr = locale === 'ar';

  // Form states
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [selectedService, setSelectedService] = useState('general');
  const [selectedLawyer, setSelectedLawyer] = useState('no_preference');
  const [preferredDate, setPreferredDate] = useState('');
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [botField, setBotField] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<{
    reference: string;
    whatsappUrl: string;
    paid?: boolean;
    payAtOffice?: boolean;
    paymentId?: string;
    amountSar?: number;
    method?: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Moyasar Payment Step State
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [consultationResult, setConsultationResult] = useState<any>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'online' | 'office'>('online');
  const [moyasarScriptReady, setMoyasarScriptReady] = useState(false);
  const [moyasarMounted, setMoyasarMounted] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const paymentElementRef = useRef<HTMLDivElement>(null);

  // Custom Country Code dropdown state & date input ref
  const [countryOpen, setCountryOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Close country dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCountryOpen(false);
      }
    }

    if (countryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [countryOpen]);

  const activeCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  // Today in YYYY-MM-DD for date-picker min constraint
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    // Generate an idempotency key on mount
    setIdempotencyKey(`IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

    // Determine current date in KSA
    const now = new Date();
    const ksaToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    setMinDate(ksaToday);

    // Parse preselection from URL parameters
    const paramService = searchParams.get('service');
    if (paramService) {
      const matched = services.find(
        (s) => s.id === paramService || s.slug === paramService
      );
      if (matched) {
        setSelectedService(matched.id);
      }
    }

    const paramLawyer = searchParams.get('lawyer');
    if (paramLawyer) {
      const matched = lawyers.find(
        (l) => l.id === paramLawyer || l.slug === paramLawyer
      );
      if (matched) {
        setSelectedLawyer(matched.id);
        setIsOptionalOpen(true); // Automatically expand optional section if preselected
      }
    }
  }, [searchParams, services, lawyers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(isAr ? 'يرجى إدخال الاسم الكامل بشكل صحيح' : 'Please enter your full name');
      return;
    }

    const cleanDigits = phoneDigits.replace(/[^\d]/g, '');
    if (!cleanDigits || cleanDigits.length < 7) {
      setError(isAr ? 'يرجى إدخال رقم هاتف واتساب صالح' : 'Please enter a valid WhatsApp phone number');
      return;
    }

    const fullPhone = `${countryCode}${cleanDigits}`;

    setLoading(true);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: fullPhone,
          serviceId: selectedService,
          preferredLawyerId: selectedLawyer === 'no_preference' ? null : selectedLawyer,
          preferredDate: preferredDate || null,
          locale,
          sourcePage: typeof window !== 'undefined' ? window.location.pathname + window.location.search : null,
          idempotencyKey,
          botHoneypot: botField,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || messages.failure);
      }

      if (
        data.payment &&
        data.payment.enabled &&
        data.payment.requirement !== 'disabled' &&
        Boolean(data.payment.publishableKey)
      ) {
        setConsultationResult(data);
        setPaymentData(data.payment);
        setPaymentStep(true);
      } else {
        // Save persistent success state
        setSavedData({
          reference: data.reference,
          whatsappUrl: data.whatsappUrl,
        });

        // Open WhatsApp in a new tab so user sees the on-site confirmation receipt
        try {
          if (!window.location.search.includes('no_wa_redirect')) {
            window.open(data.whatsappUrl, '_blank');
          }
        } catch (navErr) {
          // Handled gracefully by persistent fallback state
        }
      }
    } catch (err: any) {
      setError(err.message || messages.failure);
    } finally {
      setLoading(false);
    }
  };

  // Mount Moyasar Form when in Payment Step
  useEffect(() => {
    if (
      !paymentData?.enabled ||
      !paymentData?.publishableKey ||
      !paymentStep ||
      !moyasarScriptReady ||
      !window.Moyasar ||
      !paymentElementRef.current ||
      moyasarMounted ||
      selectedPaymentMode !== 'online' ||
      !consultationResult
    ) {
      return;
    }

    setMoyasarMounted(true);
    setPaymentError(null);

    try {
      window.Moyasar.init({
        element: paymentElementRef.current,
        amount: paymentData.amountMinor,
        currency: paymentData.currency || 'SAR',
        language: locale,
        fixed_width: false,
        description: `RMA Legal Consultation ${consultationResult.reference}`,
        publishable_api_key: paymentData.publishableKey,
        callback_url: `${window.location.origin}/${locale}/consultation/callback?consultation=${consultationResult.consultationId}`,
        metadata: {
          consultationId: consultationResult.consultationId,
          reference: consultationResult.reference,
        },
        methods: paymentData.applePayEnabled ? ['creditcard', 'applepay'] : ['creditcard'],
        supported_networks: ['mada', 'visa', 'mastercard'],
        apple_pay: {
          country: 'SA',
          label: 'Riyadh Alzahrani Law Firm',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        on_completed: async (payment: { id: string }) => {
          setPaymentProcessing(true);
          try {
            const verifyRes = await fetch(
              `/api/consultations/${consultationResult.consultationId}/verify-payment`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: payment.id }),
              }
            );
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || (isAr ? 'فشل تأكيد السداد لدى ميسر' : 'Verification failed'));
            }

            setSavedData({
              reference: consultationResult.reference,
              whatsappUrl: consultationResult.whatsappUrl,
              paid: true,
              paymentId: payment.id,
              amountSar: paymentData.amountSar,
              method: verifyData.receipt?.method || 'Mada/Card',
            });
            setPaymentStep(false);
          } catch (err: any) {
            setPaymentError(err.message || (isAr ? 'فشل تأكيد العملية.' : 'Verification error.'));
          } finally {
            setPaymentProcessing(false);
          }
        },
      });
    } catch (err: any) {
      setPaymentError(err.message || (isAr ? 'تعذر تحميل نموذج ميسّر للدفع.' : 'Failed to mount Moyasar.'));
    }
  }, [
    paymentStep,
    moyasarScriptReady,
    moyasarMounted,
    selectedPaymentMode,
    paymentData,
    consultationResult,
    locale,
    isAr,
  ]);

  const handleChooseOffice = async () => {
    if (!consultationResult) return;
    setPaymentProcessing(true);
    setPaymentError(null);
    try {
      const res = await fetch(
        `/api/consultations/${consultationResult.consultationId}/verify-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chosenMethod: 'office' }),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to select office payment');
      }

      setSavedData({
        reference: consultationResult.reference,
        whatsappUrl: consultationResult.whatsappUrl,
        paid: false,
        payAtOffice: true,
        amountSar: paymentData.amountSar,
      });
      setPaymentStep(false);
    } catch (err: any) {
      setPaymentError(err.message || (isAr ? 'تعذر تسجيل خيار الدفع بالمكتب.' : 'Error recording preference.'));
    } finally {
      setPaymentProcessing(false);
    }
  };

  const copyReference = () => {
    if (savedData?.reference) {
      navigator.clipboard.writeText(savedData.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  // Render Saved Success State
  if (savedData) {
    return (
      <div className="bg-surface border border-gold/40 rounded-sm p-6 sm:p-10 shadow-md space-y-6 text-center max-w-xl mx-auto animate-fade-in">
        <div className="w-16 h-16 bg-signature text-gold rounded-full flex items-center justify-center mx-auto border border-gold/40 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading-ar font-bold text-2xl text-ink">
            {messages.savedHeading}
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {messages.savedMessage}
          </p>
        </div>

        {/* Reference Number Card */}
        <div className="bg-canvas border border-border rounded-sm p-4 flex items-center justify-between gap-3 text-start">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted block font-semibold">
              {messages.referenceLabel}
            </span>
            <span className="text-lg font-mono font-bold text-ink" dir="ltr">
              {savedData.reference}
            </span>
          </div>
          <button
            type="button"
            onClick={copyReference}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded text-xs font-semibold text-ink hover:border-gold transition-colors"
          >
            {copiedRef ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">
                  {isAr ? 'تم النسخ!' : 'Copied!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span>{isAr ? 'نسخ الرقم' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>

        {/* Payment Confirmation Badge if paid */}
        {savedData.paid && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-start space-y-1.5 text-xs text-emerald-950">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? 'تم سداد رسوم الاستشارة إلكترونياً' : 'Consultation Fee Paid Online'}</span>
              </span>
              <span className="font-mono text-sm">{savedData.amountSar} ر.س</span>
            </div>
            {savedData.paymentId && (
              <div className="text-[11px] text-emerald-800/80 font-mono" dir="ltr">
                Moyasar ID: {savedData.paymentId} ({savedData.method || 'Mada/Card'})
              </div>
            )}
          </div>
        )}

        {/* Pay at office badge */}
        {savedData.payAtOffice && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm text-start space-y-1 text-xs text-amber-950">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-700" />
                <span>{isAr ? 'طريقة السداد المحددة: في مقر الشركة' : 'Payment Method: At Firm Office'}</span>
              </span>
              <span className="font-mono text-sm">{savedData.amountSar} ر.س</span>
            </div>
            <p className="text-[11px] text-amber-800">
              {isAr
                ? 'يتم سداد رسوم الاستشارة عند حضورك لمقر الشركة نقداً أو عبر جهاز نقاط البيع (مدى).'
                : 'Consultation fee will be settled upon arrival at the office via Mada POS or cash.'}
            </p>
          </div>
        )}

        {/* Direct WhatsApp Call to Action Button */}
        <div className="pt-2 space-y-3">
          <a
            href={savedData.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-base rounded-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>{messages.fallbackAction}</span>
          </a>

          <p className="text-xs text-muted leading-relaxed">
            {messages.belowButton}
          </p>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-center gap-2 text-[11px] text-muted">
          <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
          <span>{messages.privacyNotice}</span>
        </div>
      </div>
    );
  }

  // Render Step 2: Moyasar Payment Screen
  if (paymentStep && paymentData?.enabled && consultationResult) {
    const isOptional = paymentData.requirement === 'optional';

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in text-start">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <span className="w-6 h-6 rounded-full bg-gold-ink text-surface flex items-center justify-center text-[11px]">
              2
            </span>
            <span>{isAr ? 'الخطوة 2: سداد رسوم الاستشارة وتأكيد الموعد' : 'Step 2: Settle Consultation Fee'}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPaymentStep(false);
              setMoyasarMounted(false);
            }}
            className="text-[11px] text-muted hover:text-ink underline"
          >
            {isAr ? 'تعديل البيانات' : 'Edit details'}
          </button>
        </div>

        {/* Consultation Summary Card */}
        <div className="bg-surface border border-border rounded-sm p-5 space-y-3 shadow-xs text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div>
              <span className="text-[11px] text-muted block">{isAr ? 'صاحب الطلب' : 'Client Name'}</span>
              <span className="font-bold text-ink text-sm">{fullName}</span>
            </div>
            <div className="text-end">
              <span className="text-[11px] text-muted block">{isAr ? 'رقم المرجع' : 'Reference'}</span>
              <span className="font-mono font-bold text-ink text-sm" dir="ltr">
                {consultationResult.reference}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-start pt-1">
            <div>
              <span className="text-[11px] text-muted block">{isAr ? 'الخدمة القانونية' : 'Legal Service'}</span>
              <span className="font-semibold text-ink">
                {services.find((s) => s.id === selectedService)?.title || (isAr ? 'استشارة عامة' : 'General')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted block">{isAr ? 'الموعد المفضل' : 'Preferred Date'}</span>
              <span className="font-semibold text-ink">
                {preferredDate || (isAr ? 'حسب التنسيق' : 'To be arranged')}
              </span>
            </div>
          </div>

          <div className="mt-2 p-3 bg-canvas border border-border rounded flex items-center justify-between">
            <span className="font-bold text-ink">{isAr ? 'رسوم الاستشارة القانونية' : 'Consultation Fee'}</span>
            <div className="text-end">
              <span className="font-mono font-extrabold text-base text-gold-ink">
                {paymentData.amountSar} {paymentData.currency || 'SAR'}
              </span>
            </div>
          </div>

          {paymentData.notice && (
            <p className="text-[11px] text-muted leading-relaxed pt-1">
              {paymentData.notice}
            </p>
          )}
        </div>

        {/* Payment Error if any */}
        {paymentError && (
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-sm flex items-start gap-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* Mode Selector if Optional */}
        {isOptional && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedPaymentMode('online');
                setMoyasarMounted(false);
              }}
              className={`p-3.5 rounded border text-start transition-all cursor-pointer ${
                selectedPaymentMode === 'online'
                  ? 'border-gold bg-signature text-gold-ink font-bold shadow-xs'
                  : 'border-border bg-surface text-muted hover:border-gold/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-gold-ink" />
                <span className="text-xs">{isAr ? 'سداد إلكتروني فوري' : 'Pay Online Now'}</span>
              </div>
              <span className="text-[11px] block font-normal text-muted">
                {isAr ? 'مدى، فيزا، ماستركارد، Apple Pay' : 'Mada, Cards, Apple Pay'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPaymentMode('office')}
              className={`p-3.5 rounded border text-start transition-all cursor-pointer ${
                selectedPaymentMode === 'office'
                  ? 'border-gold bg-signature text-gold-ink font-bold shadow-xs'
                  : 'border-border bg-surface text-muted hover:border-gold/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Building className="w-4 h-4 text-gold-ink" />
                <span className="text-xs">{isAr ? 'السداد بمقر الشركة' : 'Pay at Office'}</span>
              </div>
              <span className="text-[11px] block font-normal text-muted">
                {isAr ? 'نقداً أو عبر نقاط البيع (مدى)' : 'Cash or Mada POS at appointment'}
              </span>
            </button>
          </div>
        )}

        {/* Online Payment Container (Moyasar Form) */}
        {selectedPaymentMode === 'online' && (
          <div className="bg-surface border border-border rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-xs text-ink flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gold-ink" />
                <span>{isAr ? 'بوابة سداد ميسّر الآمنة (Moyasar)' : 'Secure Moyasar Payment'}</span>
              </span>
              <span className="text-[10px] text-muted">Mada / Visa / Mastercard / Apple Pay</span>
            </div>

            {/* Stylesheet & Script for Moyasar */}
            <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.15.0/moyasar.css" />
            <Script
              src="https://cdn.moyasar.com/mpf/1.15.0/moyasar.js"
              strategy="afterInteractive"
              onReady={() => setMoyasarScriptReady(true)}
              onError={() => setPaymentError('Failed to load Moyasar script from CDN')}
            />

            {!moyasarScriptReady && (
              <div className="p-8 text-center text-xs text-muted flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gold-ink" />
                <span>{isAr ? 'جارٍ تحميل بوابة الدفع الآمنة...' : 'Loading secure payment form...'}</span>
              </div>
            )}

            {paymentProcessing && (
              <div className="p-4 bg-signature border border-gold/30 rounded text-center text-xs text-gold-ink flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAr ? 'جارٍ تأكيد السداد وإصدار الإيصال...' : 'Settling payment & generating receipt...'}</span>
              </div>
            )}

            {/* Mount element */}
            <div ref={paymentElementRef} className="mysr-form-container min-h-[140px]" />

            <div className="pt-3 border-t border-border flex items-center justify-center gap-2 text-[10px] text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isAr
                  ? 'سداد مشفر وآمن 256-bit متوافق مع معايير البنك المركزي السعودي SAMA'
                  : '256-bit encrypted secure transaction conforming to SAMA & PCI-DSS'}
              </span>
            </div>
          </div>
        )}

        {/* Office Payment Confirmation */}
        {selectedPaymentMode === 'office' && (
          <div className="bg-surface border border-border rounded-sm p-6 shadow-xs space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <Building className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-ink">
                {isAr ? 'تأكيد الحجز والدفع عند الحضور' : 'Confirm Booking & Pay at Office'}
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                {isAr
                  ? `سيتم تسجيل طلبك وحجز موعد الاستشارة فوراً، على أن يتم سداد الرسوم (${paymentData.amountSar} ر.س) عند الحضور لمقر الشركة.`
                  : `Your consultation request will be confirmed immediately. The fee (${paymentData.amountSar} SAR) will be settled at the office.`}
              </p>
            </div>

            <button
              type="button"
              disabled={paymentProcessing}
              onClick={handleChooseOffice}
              className="w-full py-3 bg-gold-ink text-surface rounded text-xs font-bold hover:bg-gold-ink/90 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {paymentProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جارٍ تسجيل الطلب...' : 'Recording booking...'}</span>
                </span>
              ) : (
                <span>{isAr ? 'تأكيد حجز الاستشارة والسداد بالمكتب' : 'Confirm Booking & Pay Later'}</span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render Consultation Request Form
  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Title & Introduction (No large hero) */}
      <ScrollReveal direction="up">
        <div className="space-y-2 text-start">
          <h1 className="font-heading-ar font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            {messages.title}
          </h1>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {messages.explanation}
          </p>
        </div>
      </ScrollReveal>

      {/* Inline Error Notice */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-sm flex items-start gap-3 text-xs text-danger">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">{messages.failure}</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form Container */}
      <ScrollReveal direction="up" delay={150}>
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 sm:p-8 shadow-xs hover:border-gold/50 transition-colors space-y-6">
          {/* Anti-spam honeypot (hidden from human visitors) */}
          <div className="hidden" aria-hidden="true">
            <input
              id="consultation-honeypot"
              aria-label="Leave this field empty"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
            />
          </div>

        {/* 1. Full Name (Required) */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-xs font-semibold text-ink">
            {messages.fullName} <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              maxLength={100}
              placeholder={messages.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/50 focus:outline-none focus:border-gold transition-colors"
            />
            <User className="w-4 h-4 text-muted absolute end-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* 2. WhatsApp Number (Required, with country code selector) */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-xs font-semibold text-ink">
            {messages.phone} <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2" dir="ltr">
            {/* Custom Country Calling Code Selector */}
            <div className="relative flex-shrink-0" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                className="h-full px-3.5 py-3 bg-canvas border border-border rounded-sm text-xs font-mono text-ink flex items-center justify-between gap-2 hover:border-gold transition-colors focus:outline-none focus:border-gold min-w-[108px] sm:min-w-[120px]"
                aria-haspopup="listbox"
                aria-expanded={countryOpen}
                aria-label="Country Calling Code"
              >
                <span className="flex items-center gap-1.5" dir="ltr">
                  <span className="text-base leading-none select-none">{activeCountry.flag}</span>
                  <span className="font-semibold text-ink text-xs">{activeCountry.code}</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                    countryOpen ? 'rotate-180 text-gold' : ''
                  }`}
                />
              </button>

              <input type="hidden" name="countryCode" value={countryCode} />

              {countryOpen && (
                <div
                  className="absolute top-full start-0 mt-1.5 w-60 sm:w-64 max-h-60 overflow-y-auto bg-surface border border-border rounded-sm shadow-xl z-50 py-1 divide-y divide-border/40"
                  role="listbox"
                >
                  {COUNTRY_CODES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      role="option"
                      aria-selected={c.code === countryCode}
                      onClick={() => {
                        setCountryCode(c.code);
                        setCountryOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-canvas text-start transition-colors ${
                        c.code === countryCode
                          ? 'bg-gold/10 font-bold text-gold-ink'
                          : 'text-ink'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base select-none">{c.flag}</span>
                        <span className="truncate">{isAr ? c.nameAr : c.nameEn}</span>
                      </span>
                      <span
                        className="font-mono text-muted text-[11px] ps-2 flex-shrink-0"
                        dir="ltr"
                      >
                        {c.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* National Digits */}
            <div className="relative flex-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                required
                placeholder={messages.phonePlaceholder}
                value={phoneDigits}
                onChange={(e) => setPhoneDigits(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm font-mono text-ink placeholder-muted/50 focus:outline-none focus:border-gold transition-colors"
              />
              <Phone className="w-4 h-4 text-muted absolute end-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
          <span className="text-[11px] text-muted block">
            {isAr ? 'سيتم استخدام هذا الرقم لمتابعة ترتيب الموعد عبر واتساب.' : 'Used to arrange your consultation time directly on WhatsApp.'}
          </span>
        </div>

        {/* 3. Service Needed (Required) */}
        <div className="space-y-2">
          <label htmlFor="service" className="block text-xs font-semibold text-ink">
            {messages.service} <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <select
              id="service"
              name="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink focus:outline-none focus:border-gold appearance-none cursor-pointer"
            >
              <option value="general">
                • {messages.generalService}
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted absolute end-3.5 top-4 pointer-events-none" />
          </div>
        </div>

        {/* 4. Optional Details Accordion */}
        <div className="border border-border/70 rounded-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setIsOptionalOpen(!isOptionalOpen)}
            className="w-full px-4 py-3 bg-canvas hover:bg-canvas/80 flex items-center justify-between text-xs font-bold text-ink transition-colors"
            aria-expanded={isOptionalOpen}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gold" />
              <span>{messages.optionalSection}</span>
              {selectedLawyer !== 'no_preference' && (
                <span className="text-[10px] bg-signature text-gold px-1.5 py-0.5 rounded">
                  {isAr ? 'تم تحديد محامٍ' : 'Lawyer Selected'}
                </span>
              )}
            </div>
            {isOptionalOpen ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </button>

          {isOptionalOpen && (
            <div className="p-4 sm:p-5 bg-surface space-y-4 border-t border-border/70 animate-fade-in">
              {/* Preferred Lawyer */}
              <div className="space-y-2">
                <label htmlFor="lawyer" className="block text-xs font-semibold text-ink">
                  {messages.lawyer}
                </label>
                <div className="relative">
                  <select
                    id="lawyer"
                    name="lawyer"
                    value={selectedLawyer}
                    onChange={(e) => setSelectedLawyer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-canvas border border-border rounded-sm text-xs text-ink focus:outline-none focus:border-gold appearance-none cursor-pointer"
                  >
                    <option value="no_preference">
                      {messages.defaultLawyer}
                    </option>
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted absolute end-3 top-3.5 pointer-events-none" />
                </div>
                <span className="text-[11px] text-muted block">
                  {isAr ? 'تفضيل مبدئي يخضع لجدول التفرغ، ويتم اعتماده بعد التحقق من الفريق.' : 'Initial preference subject to lawyer availability.'}
                </span>
              </div>

              {/* Preferred Day */}
              <div className="space-y-2">
                <label htmlFor="preferredDay" className="block text-xs font-semibold text-ink">
                  {messages.preferredDay}
                </label>
                <div
                  className="relative flex items-center cursor-pointer"
                  dir="ltr"
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker();
                    } catch {
                      dateInputRef.current?.focus();
                    }
                  }}
                >
                  <input
                    ref={dateInputRef}
                    id="preferredDay"
                    name="preferredDay"
                    type="date"
                    min={minDate}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full ps-3.5 pe-10 py-2.5 bg-canvas border border-border rounded-sm text-xs font-mono text-ink focus:outline-none focus:border-gold cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-gold absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[11px] text-muted block">
                  {isAr ? 'تفضيل اليوم فقط، ولا يُعد حجزاً نهائياً حتى يتم الاتفاق مع فريق العمل.' : 'Date preference only; exact appointment time is agreed with staff.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 5. Submit Action Button */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-signature text-on-dark rounded-sm text-sm font-bold hover:bg-signature/95 transition-all shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-gold" />
                <span>{messages.saving}</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 text-gold" />
                <span>{messages.submit}</span>
              </>
            )}
          </button>

          <p className="text-xs text-muted text-center leading-relaxed">
            {messages.belowButton}
          </p>
        </div>

        {/* Privacy Note */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-center gap-2 text-[11px] text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />
          <span>{messages.privacyNotice}</span>
        </div>
      </form>
      </ScrollReveal>
    </div>
  );
}
