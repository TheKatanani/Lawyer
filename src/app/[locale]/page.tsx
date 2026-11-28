import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import { Hero } from '@/components/sections/Hero';
import { StatsBanner } from '@/components/sections/StatsBanner';
import { ServicesPreview } from '@/components/sections/ServicesPreview';
import { LeadershipMessage } from '@/components/sections/LeadershipMessage';
import { MethodologySection } from '@/components/sections/MethodologySection';
import { SpecialisedServices } from '@/components/sections/SpecialisedServices';
import { InstitutionalExcellence } from '@/components/sections/InstitutionalExcellence';
import { ClosingWord } from '@/components/sections/ClosingWord';
import { JourneySection } from '@/components/sections/JourneySection';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { getSiteSettings } from '@/server/db/dal';
import {
  getHeroMessages,
  getStatsBannerItems,
  getLeadershipContent,
  getMethodologyProps,
  getSpecialisedProps,
  getExcellenceProps,
  getJourneyMessages,
  getClosingWordProps,
  pickLocalized,
} from '@/lib/settings-presenters';

export const dynamic = 'force-dynamic';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const isAr = currentLocale === 'ar';
  const settings = await getSiteSettings();

  return await buildPageMetadata({
    locale: currentLocale,
    path: '',
    title: {
      absolute: isAr ? settings.seoTitleAr : settings.seoTitleEn,
    },
    description: isAr ? settings.seoDescAr : settings.seoDescEn,
  });
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const currentLocale = locale as SupportedLocale;

  const publishedServices = await listPublishedProjections('service', currentLocale);
  const settings = await getSiteSettings();
  const whatsappUrl = `https://wa.me/${(settings.whatsapp || '').replace(/[^\d]/g, '')}`;

  const heroMessages = getHeroMessages(settings, currentLocale);

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

  const journeyMessages = getJourneyMessages(settings, currentLocale);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <Hero locale={locale} messages={heroMessages} />

      {/* 1.5 Legal Stature & Metric Counters Banner */}
      <StatsBanner locale={locale} items={getStatsBannerItems(settings, currentLocale)} />

      {/* 2. Leadership Message (PDF p. 6-7) */}
      <LeadershipMessage
        locale={locale}
        content={getLeadershipContent(settings, currentLocale)}
      />

      {/* 3. 5-Step Methodology & Philosophy (PDF p. 10-11) */}
      <MethodologySection locale={locale} {...getMethodologyProps(settings, currentLocale)} />

      {/* 4. 16 Official Practice Areas Directory */}
      <ServicesPreview
        locale={locale}
        initialServices={publishedServices}
        messages={servicesMessages}
      />

      {/* 5. Specialised Services (PDF p. 48-51) */}
      <SpecialisedServices locale={locale} {...getSpecialisedProps(settings, currentLocale)} />

      {/* 6. Institutional Excellence (PDF p. 52-53) */}
      <InstitutionalExcellence locale={locale} {...getExcellenceProps(settings, currentLocale)} />

      {/* 7. Client Engagement Journey */}
      <JourneySection locale={locale} messages={journeyMessages} />

      {/* 8. Closing Word / Promise (PDF p. 54) */}
      <ClosingWord
        locale={locale}
        {...getClosingWordProps(settings, currentLocale)}
      />

      {/* 9. Final Contact Call to Action Banner */}
      <section className="py-20 bg-canvas">
        <ScrollReveal direction="up">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                {pickLocalized(currentLocale, settings.contactSectionEyebrowAr, settings.contactSectionEyebrowEn) ||
                  t('contactSection.eyebrow')}
              </span>
              <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
                {pickLocalized(currentLocale, settings.homeCtaHeadingAr, settings.homeCtaHeadingEn) ||
                  t('contactSection.heading')}
              </h2>
              <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
                {pickLocalized(currentLocale, settings.homeCtaDescAr, settings.homeCtaDescEn) ||
                  t('contactSection.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={`/${locale}/contact`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-sm bg-ink text-on-dark text-base font-semibold hover:bg-signature transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
              >
                <span>{t('contactSection.submitBtn')}</span>
                <ArrowUpRight className="w-4 h-4 text-gold group-hover:scale-110 transition-transform duration-300" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-sm bg-surface border border-border text-ink text-base font-semibold hover:border-gold hover:bg-canvas transition-all duration-300 hover:-translate-y-0.5 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-gold-ink" />
                <span>{t('common.whatsappLabel')}</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
