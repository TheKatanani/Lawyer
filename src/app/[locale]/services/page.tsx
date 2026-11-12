import React from 'react';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { ServicesPreview } from '@/components/sections/ServicesPreview';

export default async function ServicesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const currentLocale = locale as SupportedLocale;
  const publishedServices = await listPublishedProjections('service', currentLocale);

  const servicesMessages = {
    eyebrow: t('servicesSection.eyebrow'),
    heading: t('servicesSection.heading'),
    description: t('servicesSection.description'),
    filters: {
      all: t('servicesSection.filters.all'),
      individual: t('servicesSection.filters.individual'),
      business: t('servicesSection.filters.business'),
    },
    viewDetails: t('servicesSection.viewDetails'),
  };

  return (
    <div className="py-12 bg-canvas">
      <ServicesPreview
        locale={locale}
        initialServices={publishedServices}
        messages={servicesMessages}
      />
    </div>
  );
}
