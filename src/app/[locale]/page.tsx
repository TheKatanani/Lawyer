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
import { store, INITIAL_SETTINGS } from '@/server/db/store';
import { FIRM_DETAILS } from '@/config/compliance';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const isAr = currentLocale === 'ar';
  const settings = store.siteSettings || INITIAL_SETTINGS;

  return buildPageMetadata({
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
  const isAr = locale === 'ar';

  const publishedServices = await listPublishedProjections('service', currentLocale);
  const settings = store.siteSettings || INITIAL_SETTINGS;

  const heroMessages = {
    eyebrow: t('hero.eyebrow'),
    heading: isAr ? (settings.heroHeadlineAr || t('hero.heading')) : (settings.heroHeadlineEn || t('hero.heading')),
    description: isAr ? (settings.heroDescAr || t('hero.description')) : (settings.heroDescEn || t('hero.description')),
    ctaPrimary: t('hero.ctaPrimary'),
    ctaSecondary: t('hero.ctaSecondary'),
    imageAlt: t('hero.imageAlt'),
  };

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

  const journeyMessages = {
    eyebrow: t('journeySection.eyebrow'),
    heading: t('journeySection.heading'),
    step1Title: t('journeySection.step1Title'),
    step1Desc: t('journeySection.step1Desc'),
    step2Title: t('journeySection.step2Title'),
    step2Desc: t('journeySection.step2Desc'),
    step3Title: t('journeySection.step3Title'),
    step3Desc: t('journeySection.step3Desc'),
    step4Title: t('journeySection.step4Title'),
    step4Desc: t('journeySection.step4Desc'),
  };

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <Hero locale={locale} messages={heroMessages} />

      {/* 1.5 Legal Stature & Metric Counters Banner */}
      <StatsBanner locale={locale} />

      {/* 2. Leadership Message (PDF p. 6-7) */}
      <LeadershipMessage locale={locale} />

      {/* 3. 5-Step Methodology & Philosophy (PDF p. 10-11) */}
      <MethodologySection locale={locale} />

      {/* 4. 16 Official Practice Areas Directory */}
      <ServicesPreview
        locale={locale}
        initialServices={publishedServices}
        messages={servicesMessages}
      />

      {/* 5. Specialised Services (PDF p. 48-51) */}
      <SpecialisedServices locale={locale} />

      {/* 6. Institutional Excellence (PDF p. 52-53) */}
      <InstitutionalExcellence locale={locale} />

      {/* 7. Client Engagement Journey */}
      <JourneySection locale={locale} messages={journeyMessages} />

      {/* 8. Closing Word / Promise (PDF p. 54) */}
      <ClosingWord locale={locale} />

      {/* 9. Final Contact Call to Action Banner */}
      <section className="py-20 bg-canvas">
        <ScrollReveal direction="up">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                {t('contactSection.eyebrow')}
              </span>
              <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
                {t('contactSection.heading')}
              </h2>
              <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
                {t('contactSection.description')}
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
                href={FIRM_DETAILS.whatsappUrl}
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
