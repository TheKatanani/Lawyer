import React from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/forms/ContactForm';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { Phone, MessageSquare, MapPin, Clock, ShieldCheck, Mail, Globe } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { FIRM_DETAILS, UNVERIFIED_CLAIMS_CONFIG } from '@/config/compliance';

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const currentLocale = locale as SupportedLocale;
  const isAr = locale === 'ar';

  const publishedServices = await listPublishedProjections('service', currentLocale);
  const serviceOptions = publishedServices.map((s) => ({
    id: s.entityId,
    title: s.title,
  }));

  const formMessages = {
    eyebrow: t('contactSection.eyebrow'),
    heading: t('contactSection.heading'),
    description: t('contactSection.description'),
    audienceLabel: t('contactSection.audienceLabel'),
    audienceIndividual: t('contactSection.audienceIndividual'),
    audienceBusiness: t('contactSection.audienceBusiness'),
    nameLabel: t('contactSection.nameLabel'),
    phoneLabel: t('contactSection.phoneLabel'),
    emailLabel: t('contactSection.emailLabel'),
    companyLabel: t('contactSection.companyLabel'),
    serviceLabel: t('contactSection.serviceLabel'),
    generalInquiry: t('contactSection.generalInquiry'),
    messageLabel: t('contactSection.messageLabel'),
    helperText: t('contactSection.helperText'),
    privacyConsent: t('contactSection.privacyConsent'),
    submitBtn: t('contactSection.submitBtn'),
    submitting: t('contactSection.submitting'),
    disclaimer: t('contactSection.disclaimer'),
    successTitle: t('contactSection.successTitle'),
    successMessage: t('contactSection.successMessage'),
    refNumber: t('contactSection.refNumber'),
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
              {t('contactSection.eyebrow')}
            </span>
            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
              {t('contactSection.heading')}
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed">
              {t('contactSection.description')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Interactive Contact Form (7 columns) */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="up" delay={150}>
              <ContactForm
                locale={locale}
                services={serviceOptions}
                messages={formMessages}
              />
            </ScrollReveal>
          </div>

          {/* Direct Channels & Office Info (5 columns) */}
          <div className="lg:col-span-5 space-y-8">
            <ScrollReveal direction={isAr ? 'left' : 'right'} delay={250}>
              <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 hover:shadow-md transition-all duration-300 space-y-6">
                <h2 className="font-heading-ar font-bold text-ink text-xl">
                  {isAr ? 'القنوات المباشرة وساعات العمل' : 'Direct Channels & Hours'}
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'المقر الرئيسي (جدة)' : 'Headquarters (Jeddah)'}</span>
                      <span className="text-muted leading-relaxed block">{isAr ? FIRM_DETAILS.addressAr : FIRM_DETAILS.addressEn}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'الجوال والاتصال' : 'Mobile & Telephone'}</span>
                      <a href={`tel:${FIRM_DETAILS.phoneRaw}`} className="text-gold-ink hover:underline font-mono">
                        <bdi dir="ltr">{FIRM_DETAILS.phone}</bdi>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'واتساب الرسمي' : 'Official WhatsApp'}</span>
                      <a
                        href={FIRM_DETAILS.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-ink hover:underline font-mono"
                      >
                        <bdi dir="ltr">{FIRM_DETAILS.whatsapp}</bdi>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
                      <a href={`mailto:${FIRM_DETAILS.email}`} className="text-gold-ink hover:underline">
                        {FIRM_DETAILS.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'الموقع الإلكتروني' : 'Website'}</span>
                      <a href={FIRM_DETAILS.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-gold-ink hover:underline">
                        {FIRM_DETAILS.website}
                      </a>
                    </div>
                  </div>

                  {UNVERIFIED_CLAIMS_CONFIG.enableOfficialWorkingHours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-ink block">{isAr ? 'ساعات العمل الرسمية' : 'Working Hours'}</span>
                        <span className="text-muted">
                          {isAr ? UNVERIFIED_CLAIMS_CONFIG.workingHoursAr : UNVERIFIED_CLAIMS_CONFIG.workingHoursEn}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Privacy & PDPL Notice Box */}
            <div className="p-8 bg-signature text-on-dark rounded-sm border border-gold/30 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-gold font-heading-ar font-bold text-lg">
                <ShieldCheck className="w-5 h-5" />
                <h3>{isAr ? 'حماية البيانات الشخصية' : 'PDPL Data Safeguards'}</h3>
              </div>
              <p className="text-on-dark/70 text-xs sm:text-sm leading-relaxed">
                {isAr
                  ? 'تُعالج بياناتك وفقاً لأحكام نظام حماية البيانات الشخصية بالمملكة (PDPL) وبسرية مهنية تامة، وتُستخدم حصراً لدراسة طلبك والتواصل بشأن التمثيل القانوني.'
                  : 'Your information is processed in strict compliance with the Saudi Personal Data Protection Law (PDPL) and dedicated solely to conflict assessment.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
