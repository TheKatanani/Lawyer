import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { ConsultationForm } from '@/components/consultation/ConsultationForm';
import { buildPageMetadata } from '@/lib/seo';
import { isPaymentsEnabled } from '@/server/payments/moyasar';

interface Props {
  params: { locale: string };
}

function FormFallback() {
  return (
    <div className="max-w-xl mx-auto p-12 bg-surface border border-border rounded-sm animate-pulse space-y-6">
      <div className="h-8 bg-canvas rounded w-2/3" />
      <div className="h-4 bg-canvas rounded w-full" />
      <div className="space-y-4 pt-4">
        <div className="h-10 bg-canvas rounded" />
        <div className="h-10 bg-canvas rounded" />
        <div className="h-10 bg-canvas rounded" />
      </div>
    </div>
  );
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const t = await getTranslations({ locale, namespace: 'consultation' });

  return buildPageMetadata({
    locale: currentLocale,
    path: '/consultation',
    title: t('title'),
    description: t('explanation'),
  });
}

export default async function ConsultationPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'consultation' });
  const currentLocale = locale as SupportedLocale;
  const paymentsEnabled = isPaymentsEnabled();

  // Fetch active published services and lawyers from projections
  const publishedServices = await listPublishedProjections('service', currentLocale);
  const publishedLawyers = await listPublishedProjections('teamMember', currentLocale);

  const servicesData = publishedServices.map((s) => ({
    id: s.entityId,
    slug: s.slug,
    title: s.title,
  }));

  const lawyersData = publishedLawyers.map((l) => ({
    id: l.entityId,
    slug: l.slug,
    name: l.title,
    title: (l.metadata?.positionTitle as string) || '',
  }));

  const messages = {
    title: t('title'),
    explanation: t('explanation'),
    fullName: t('fullName'),
    fullNamePlaceholder: t('fullNamePlaceholder'),
    phone: t('phone'),
    phonePlaceholder: t('phonePlaceholder'),
    service: t('service'),
    generalService: t('generalService'),
    optionalSection: t('optionalSection'),
    lawyer: t('lawyer'),
    defaultLawyer: t('defaultLawyer'),
    preferredDay: t('preferredDay'),
    submit: t('submit'),
    saving: t('saving'),
    belowButton: t('belowButton'),
    savedHeading: t('savedHeading'),
    savedMessage: t('savedMessage'),
    fallbackAction: t('fallbackAction'),
    failure: t('failure'),
    referenceLabel: t('referenceLabel'),
    privacyNotice: t('privacyNotice'),
  };

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-canvas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<FormFallback />}>
          <ConsultationForm
            locale={locale}
            services={servicesData}
            lawyers={lawyersData}
            messages={messages}
            paymentsEnabled={paymentsEnabled}
          />
        </Suspense>
      </div>
    </div>
  );
}
