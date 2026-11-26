'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, AlertCircle, Building2, User } from 'lucide-react';
import { AudienceTag } from '@/server/types';

interface ServiceOption {
  id: string;
  title: string;
}

interface ContactFormProps {
  locale: string;
  services: ServiceOption[];
  messages: {
    eyebrow: string;
    heading: string;
    description: string;
    audienceLabel: string;
    audienceIndividual: string;
    audienceBusiness: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    companyLabel: string;
    serviceLabel: string;
    generalInquiry: string;
    messageLabel: string;
    helperText: string;
    privacyConsent: string;
    submitBtn: string;
    submitting: string;
    disclaimer: string;
    successTitle: string;
    successMessage: string;
    refNumber: string;
  };
}

export function ContactForm({ locale, services, messages }: ContactFormProps) {
  const [audience, setAudience] = useState<AudienceTag>('individual');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [message, setMessage] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const isAr = locale === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.length < 2) {
      setError(isAr ? 'يرجى إدخال اسم صحيح لا يقل عن حرفين.' : 'Please enter a valid name (at least 2 characters).');
      return;
    }

    if (!phone.trim() || phone.length < 7) {
      setError(isAr ? 'يرجى إدخال رقم هاتف صحيح مع رمز الدولة.' : 'Please enter a valid phone number with country code.');
      return;
    }

    if (!message.trim() || message.length < 15) {
      setError(isAr ? 'يرجى كتابة وصف موجز لطلبك لا يقل عن 15 حرفاً.' : 'Please provide a brief request description (at least 15 characters).');
      return;
    }

    if (!privacyAgreed) {
      setError(isAr ? 'يجب الإقرار بسياسة الخصوصية للمتابعة.' : 'You must acknowledge the Privacy Notice to proceed.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audience,
          name,
          phoneE164: phone,
          email: email.trim() || undefined,
          companyName: audience === 'business' ? companyName.trim() : undefined,
          serviceId: serviceId || undefined,
          message,
          locale,
          noticeVersion: '1.0',
          honeypot,
          idempotencyKey: `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isAr ? 'حدث خطأ أثناء معالجة الطلب.' : 'An error occurred.'));
      }

      setSuccessRef(data.referenceNumber);
    } catch (err: any) {
      setError(err.message || (isAr ? 'تعذر إرسال الطلب. يرجى المحاولة لاحقاً.' : 'Failed to submit request.'));
    } finally {
      setLoading(false);
    }
  };

  if (successRef) {
    return (
      <div className="p-8 sm:p-10 bg-surface rounded-sm border border-success/30 shadow-md space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading-ar font-bold text-2xl text-ink">
            {messages.successTitle}
          </h3>
          <p className="text-muted text-sm sm:text-base max-w-lg mx-auto">
            {messages.successMessage}
          </p>
        </div>
        <div className="p-4 bg-canvas rounded-sm border border-border inline-block">
          <span className="text-xs text-muted block mb-1">{messages.refNumber}</span>
          <span className="font-mono font-bold text-lg text-ink" dir="ltr">{successRef}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 sm:p-10 bg-surface rounded-sm border border-border/80 shadow-md space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-sm flex items-start gap-3 text-danger text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Audience Toggle */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
          {messages.audienceLabel}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAudience('individual')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-sm border text-sm font-semibold transition-all ${
              audience === 'individual'
                ? 'bg-ink text-on-dark border-ink shadow-xs'
                : 'bg-canvas text-ink border-border hover:bg-canvas/80'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{messages.audienceIndividual}</span>
          </button>
          <button
            type="button"
            onClick={() => setAudience('business')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-sm border text-sm font-semibold transition-all ${
              audience === 'business'
                ? 'bg-ink text-on-dark border-ink shadow-xs'
                : 'bg-canvas text-ink border-border hover:bg-canvas/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{messages.audienceBusiness}</span>
          </button>
        </div>
      </div>

      {/* Name & Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block text-xs font-semibold text-ink">
            {messages.nameLabel} <span className="text-danger">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? 'أدخل اسمك الكريم' : 'Your full legal name'}
            className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/60 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-phone" className="block text-xs font-semibold text-ink">
            {messages.phoneLabel} <span className="text-danger">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+966 50 000 0000"
            className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/60 focus:outline-none focus:border-gold transition-colors text-start"
          />
        </div>
      </div>

      {/* Optional Email & Company Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="block text-xs font-semibold text-ink">
            {messages.emailLabel}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/60 focus:outline-none focus:border-gold transition-colors text-start"
          />
        </div>

        {audience === 'business' && (
          <div className="space-y-1.5">
            <label htmlFor="contact-company" className="block text-xs font-semibold text-ink">
              {messages.companyLabel} <span className="text-danger">*</span>
            </label>
            <input
              id="contact-company"
              name="companyName"
              type="text"
              required={audience === 'business'}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={isAr ? 'اسم الشركة أو المنشأة' : 'Company or Enterprise Legal Name'}
              className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/60 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        )}

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="contact-service" className="block text-xs font-semibold text-ink">
            {messages.serviceLabel}
          </label>
          <select
            id="contact-service"
            name="serviceId"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink focus:outline-none focus:border-gold transition-colors"
          >
            <option value="">{messages.generalInquiry}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message & Sensitive Data Helper */}
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="block text-xs font-semibold text-ink">
          {messages.messageLabel} <span className="text-danger">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isAr ? 'صف طبيعة الاستفسار القانوني بشكل عام...' : 'Provide a general summary of your legal inquiry...'}
          className="w-full px-4 py-3 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/60 focus:outline-none focus:border-gold transition-colors"
        />
        <p className="text-[12px] text-muted leading-relaxed">
          {messages.helperText}
        </p>
      </div>

      {/* Honeypot field (hidden from accessibility tree & visual display) */}
      <div className="hidden" aria-hidden="true">
        <input
          id="contact-honeypot"
          aria-label="Leave this field empty"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Privacy Consent */}
      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="privacyConsent"
          required
          checked={privacyAgreed}
          onChange={(e) => setPrivacyAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border text-gold focus:ring-gold"
        />
        <label htmlFor="privacyConsent" className="text-xs text-muted leading-relaxed cursor-pointer">
          {messages.privacyConsent}{' '}
          <Link href={`/${locale}/privacy`} target="_blank" className="text-gold-ink underline font-medium">
            {isAr ? 'سياسة الخصوصية' : 'Privacy Notice'}
          </Link>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-sm bg-ink text-on-dark text-base font-semibold hover:bg-signature transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
      >
        <span>{loading ? messages.submitting : messages.submitBtn}</span>
        {!loading && <Send className={`w-4 h-4 transition-transform ${isAr ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />}
      </button>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="pt-4 border-t border-border/70 text-[11px] text-muted/80 leading-relaxed text-center">
        {messages.disclaimer}
      </div>
    </form>
  );
}
