'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';

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
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

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

      // Save persistent success state
      setSavedData({
        reference: data.reference,
        whatsappUrl: data.whatsappUrl,
      });

      // Attempt immediate WhatsApp navigation (non-blocking fallback is visible)
      try {
        window.location.href = data.whatsappUrl;
      } catch (navErr) {
        // Handled gracefully by persistent fallback state
      }
    } catch (err: any) {
      setError(err.message || messages.failure);
    } finally {
      setLoading(false);
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

  // Render Consultation Request Form
  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Title & Introduction (No large hero) */}
      <div className="space-y-2 text-start">
        <h1 className="font-heading-ar font-bold text-3xl sm:text-4xl text-ink tracking-tight">
          {messages.title}
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          {messages.explanation}
        </p>
      </div>

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
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 sm:p-8 shadow-xs space-y-6">
        {/* Anti-spam honeypot (hidden from human visitors) */}
        <div className="hidden" aria-hidden="true">
          <input
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
            {/* Country Calling Code Selector */}
            <div className="relative w-36 flex-shrink-0">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full h-full px-3 py-3 bg-canvas border border-border rounded-sm text-xs font-mono text-ink focus:outline-none focus:border-gold appearance-none cursor-pointer"
                aria-label="Country Calling Code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({isAr ? c.nameAr : c.nameEn})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted absolute end-2 top-4 pointer-events-none" />
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
                <div className="relative">
                  <input
                    id="preferredDay"
                    name="preferredDay"
                    type="date"
                    min={minDate}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-canvas border border-border rounded-sm text-xs font-mono text-ink focus:outline-none focus:border-gold"
                  />
                  <Calendar className="w-4 h-4 text-muted absolute end-3 top-3 pointer-events-none" />
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
    </div>
  );
}
