import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SupportedLocale } from '@/server/types';
import { buildPageMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/server/db/dal';
import { pickLocalized } from '@/lib/settings-presenters';

export const dynamic = 'force-dynamic';

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
    path: '/privacy',
    title: isAr ? 'سياسة الخصوصية وحماية البيانات الشخصية' : 'Privacy Notice & Data Protection',
    description: isAr
      ? 'إشعار الخصوصية وحماية البيانات الشخصية المُعدّ وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL) وضوابط سدايا.'
      : 'Privacy notice and personal data protection safeguards aligned with the Saudi Personal Data Protection Law (PDPL).',
  });
}

export default async function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const isAr = currentLocale === 'ar';
  const settings = await getSiteSettings();
  const firmEmail = settings.email;
  const sections = settings.privacySections || [];

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <BreadcrumbJsonLd
        locale={currentLocale}
        items={[{ name: isAr ? 'سياسة الخصوصية' : 'Privacy Policy', path: '/privacy' }]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
            {pickLocalized(locale, settings.privacyEyebrowAr, settings.privacyEyebrowEn)}
          </span>
          <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
            {pickLocalized(locale, settings.privacyTitleAr, settings.privacyTitleEn)}
          </h1>
          <p className="text-muted text-sm">
            {pickLocalized(locale, settings.privacyIntroAr, settings.privacyIntroEn)}
          </p>
        </div>

        <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs space-y-8 text-ink text-sm sm:text-base leading-relaxed">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="font-heading-ar font-bold text-xl text-ink">
                {isAr ? sec.titleAr : sec.titleEn}
              </h2>
              <p className="text-muted whitespace-pre-line">
                {isAr ? sec.bodyAr : sec.bodyEn}
              </p>
            </div>
          ))}

          {/* Contact DPO */}
          <div className="p-6 bg-canvas rounded-sm border border-border space-y-2">
            <h3 className="font-heading-ar font-bold text-sm text-ink">
              {isAr ? 'التواصل بشأن حماية البيانات' : 'Privacy Inquiries & Data Protection Contact'}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {isAr
                ? `لممارسة حقوقك أو لتقديم أي استفسار حول سياسة الخصوصية، يرجى مراسلة مسؤول حماية البيانات عبر البريد: ${firmEmail}`
                : `To exercise your statutory rights or submit a privacy inquiry, contact our Data Protection Officer at: ${firmEmail}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
