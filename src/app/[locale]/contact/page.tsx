import React from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/forms/ContactForm';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { Phone, MessageSquare, MapPin, ShieldCheck, Mail, Globe } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getSiteSettings } from '@/server/db/dal';
import { pickLocalized } from '@/lib/settings-presenters';

export const dynamic = 'force-dynamic';
import { buildPageMetadata } from '@/lib/seo';

import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const isAr = currentLocale === 'ar';

  return await buildPageMetadata({
    locale: currentLocale,
    path: '/contact',
    title: isAr ? 'تواصل معنا' : 'Contact Us',
    description: isAr
      ? 'تواصل مع مكتب شركة رياض محمد الزهراني للمحاماة في برج هيدكوارترز بجدة عبر الهاتف أو واتساب أو نموذج التواصل الرسمي.'
      : 'Contact Riyadh Mohammed Alzahrani Law Firm at Headquarters Tower in Jeddah by phone, WhatsApp, email or online inquiry form.',
  });
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const currentLocale = locale as SupportedLocale;
  const isAr = locale === 'ar';
  const settings = await getSiteSettings();
  const contactAddress = isAr ? settings.addressAr : settings.addressEn;
  const contactPhone = settings.phone;
  const contactPhoneRaw = contactPhone.replace(/[^\d+]/g, '');
  const contactWhatsapp = settings.whatsapp;
  const contactWhatsappUrl = `https://wa.me/${contactWhatsapp.replace(/[^\d]/g, '')}`;
  const contactEmail = settings.email;

  const publishedServices = await listPublishedProjections('service', currentLocale);
  const serviceOptions = publishedServices.map((s) => ({
    id: s.entityId,
    title: s.title,
  }));

  const contactSectionEyebrow =
    pickLocalized(currentLocale, settings.contactSectionEyebrowAr, settings.contactSectionEyebrowEn) ||
    t('contactSection.eyebrow');
  const contactSectionHeading =
    pickLocalized(currentLocale, settings.contactSectionHeadingAr, settings.contactSectionHeadingEn) ||
    t('contactSection.heading');
  const contactSectionDesc =
    pickLocalized(currentLocale, settings.contactSectionDescAr, settings.contactSectionDescEn) ||
    t('contactSection.description');

  const formMessages = {
    eyebrow: contactSectionEyebrow,
    heading: contactSectionHeading,
    description: contactSectionDesc,
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
    disclaimer:
      pickLocalized(currentLocale, settings.contactDisclaimerAr, settings.contactDisclaimerEn) ||
      t('contactSection.disclaimer'),
    successTitle: t('contactSection.successTitle'),
    successMessage: t('contactSection.successMessage'),
    refNumber: t('contactSection.refNumber'),
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <BreadcrumbJsonLd
        locale={currentLocale === 'en' ? 'en' : 'ar'}
        items={[{ name: isAr ? 'تواصل معنا' : 'Contact Us', path: '/contact' }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
              {contactSectionEyebrow}
            </span>
            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
              {contactSectionHeading}
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed">
              {contactSectionDesc}
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
                      <span className="text-muted leading-relaxed block">{contactAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'الجوال والاتصال' : 'Mobile & Telephone'}</span>
                      <a href={`tel:${contactPhoneRaw}`} className="text-gold-ink hover:underline font-mono">
                        <bdi dir="ltr">{contactPhone}</bdi>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'واتساب الرسمي' : 'Official WhatsApp'}</span>
                      <a
                        href={contactWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-ink hover:underline font-mono"
                      >
                        <bdi dir="ltr">{contactWhatsapp}</bdi>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
                      <a href={`mailto:${contactEmail}`} className="text-gold-ink hover:underline">
                        {contactEmail}
                      </a>
                    </div>
                  </div>

                  {settings.websiteUrl && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-ink block">{isAr ? 'الموقع الإلكتروني' : 'Website'}</span>
                        <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-gold-ink hover:underline">
                          {settings.website || settings.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
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
