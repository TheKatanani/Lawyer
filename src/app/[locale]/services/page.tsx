import React from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { ServicesPreview } from '@/components/sections/ServicesPreview';
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
    path: '/services',
    title: isAr ? 'مجالات الممارسة والخدمات القانونية' : 'Practice Areas & Legal Services',
    description: isAr
      ? 'تعرّف على مجالات الممارسة الـ 16 المعتمدة لدى شركة رياض محمد الزهراني للمحاماة في التقاضي والتحكيم والشركات والاستثمار والأوقاف.'
      : 'Explore the 16 specialised legal practice areas offered by Riyadh Mohammed Alzahrani Law Firm across litigation, arbitration, corporate and private wealth.',
  });
}

export default async function ServicesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const currentLocale = locale as SupportedLocale;
  const [publishedServices, settings] = await Promise.all([
    listPublishedProjections('service', currentLocale),
    getSiteSettings(),
  ]);

  const servicesMessages = {
    eyebrow:
      pickLocalized(currentLocale, settings.servicesSectionEyebrowAr, settings.servicesSectionEyebrowEn) ||
      t('servicesSection.eyebrow'),
    heading:
      pickLocalized(currentLocale, settings.servicesSectionHeadingAr, settings.servicesSectionHeadingEn) ||
      t('servicesSection.heading'),
    description:
      pickLocalized(currentLocale, settings.servicesSectionDescAr, settings.servicesSectionDescEn) ||
      t('servicesSection.description'),
    filters: {
      all: t('servicesSection.filters.all'),
      individual: t('servicesSection.filters.individual'),
      business: t('servicesSection.filters.business'),
    },
    viewDetails: t('servicesSection.viewDetails'),
  };

  return (
    <div className="py-12 bg-canvas">
      <BreadcrumbJsonLd
        locale={currentLocale}
        items={[{ name: currentLocale === 'ar' ? 'الخدمات' : 'Practice Areas', path: '/services' }]}
      />
      <ServicesPreview
        locale={locale}
        initialServices={publishedServices}
        headingAs="h1"
        messages={servicesMessages}
      />
    </div>
  );
}
