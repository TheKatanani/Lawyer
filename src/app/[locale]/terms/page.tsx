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
    path: '/terms',
    title: isAr ? 'الشروط والأحكام العامة' : 'Terms of Use & Disclaimer',
    description: isAr
      ? 'الشروط والأحكام العامة لاستخدام موقع شركة رياض محمد الزهراني للمحاماة وإخلاء المسؤولية والضوابط النظامية.'
      : 'Terms of use, non-representation notice, intellectual property, and regulatory disclaimers for Riyadh Alzahrani Law Firm.',
  });
}

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const isAr = currentLocale === 'ar';
  const settings = await getSiteSettings();
  const sections = settings.termsSections || [];

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <BreadcrumbJsonLd
        locale={currentLocale}
        items={[{ name: isAr ? 'الشروط والأحكام' : 'Terms of Use', path: '/terms' }]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
            {pickLocalized(locale, settings.termsEyebrowAr, settings.termsEyebrowEn)}
          </span>
          <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
            {pickLocalized(locale, settings.termsTitleAr, settings.termsTitleEn)}
          </h1>
          <p className="text-muted text-sm">
            {pickLocalized(locale, settings.termsUpdatedAr, settings.termsUpdatedEn)}
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
        </div>
      </div>
    </div>
  );
}
