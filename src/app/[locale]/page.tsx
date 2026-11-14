import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Scale, Shield, Building2, User, Phone, MessageSquare } from 'lucide-react';
import { Hero } from '@/components/sections/Hero';
import { ServicesPreview } from '@/components/sections/ServicesPreview';
import { ValuesSection } from '@/components/sections/ValuesSection';
import { JourneySection } from '@/components/sections/JourneySection';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { store } from '@/server/db/store';

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
  const publishedTeam = await listPublishedProjections('teamMember', currentLocale);
  const publishedInsights = await listPublishedProjections('article', currentLocale);
  const settings = store.siteSettings;

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

  const valuesMessages = {
    eyebrow: t('valuesSection.eyebrow'),
    heading: t('valuesSection.heading'),
    value1Title: t('valuesSection.value1Title'),
    value1Desc: t('valuesSection.value1Desc'),
    value2Title: t('valuesSection.value2Title'),
    value2Desc: t('valuesSection.value2Desc'),
    value3Title: t('valuesSection.value3Title'),
    value3Desc: t('valuesSection.value3Desc'),
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

      {/* 2. Company Introduction (Asymmetric Image/Text) */}
      <section className="py-20 lg:py-24 bg-surface border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative h-[360px] sm:h-[420px] rounded-sm overflow-hidden border border-border shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="Saudi Corporate Architecture"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                {t('aboutPreview.eyebrow')}
              </span>
              <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl leading-tight">
                {t('aboutPreview.heading')}
              </h2>
              <p className="text-muted text-base leading-relaxed">
                {isAr ? (settings.aboutTextAr || t('aboutPreview.description')) : (settings.aboutTextEn || t('aboutPreview.description'))}
              </p>
              <div className="pt-2">
                <Link
                  href={`/${locale}/about`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold-ink border-b-2 border-gold pb-1 transition-colors"
                >
                  <span>{t('aboutPreview.cta')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services Directory Preview */}
      <ServicesPreview
        locale={locale}
        initialServices={publishedServices}
        messages={servicesMessages}
      />

      {/* 4. Signature Values Section */}
      <ValuesSection locale={locale} messages={valuesMessages} />

      {/* 5. Client Engagement Journey */}
      <JourneySection locale={locale} messages={journeyMessages} />

      {/* 6. Legal Insights Preview */}
      {publishedInsights.length > 0 && (
        <section className="py-20 lg:py-24 bg-canvas border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                  {t('insightsSection.eyebrow')}
                </span>
                <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl">
                  {t('insightsSection.heading')}
                </h2>
              </div>
              <Link
                href={`/${locale}/insights`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-gold-ink transition-colors"
              >
                <span>{t('common.viewAll')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedInsights.map((article) => (
                <Link
                  key={article.projectionId}
                  href={`/${locale}/insights/${article.slug}`}
                  className="group block p-6 bg-surface rounded-sm border border-border/80 hover:border-gold/50 shadow-xs hover:shadow-sm transition-all duration-200"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-canvas text-gold-ink rounded-xs border border-border/70">
                      {isAr ? 'تحليل نظامي' : 'Legal Analysis'}
                    </span>
                    <h3 className="font-heading-ar font-bold text-ink text-xl group-hover:text-gold-ink transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                      <span>{isAr ? 'قراءة في 5 دقائق' : '5 min read'}</span>
                      <span className="text-ink font-semibold flex items-center gap-1 group-hover:text-gold-ink">
                        {t('common.readMore')}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Verified Team Preview */}
      {publishedTeam.length > 0 && (
        <section className="py-20 lg:py-24 bg-surface border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                {t('teamSection.eyebrow')}
              </span>
              <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl">
                {t('teamSection.heading')}
              </h2>
              <p className="text-muted text-base">
                {t('teamSection.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {publishedTeam.map((member) => (
                <Link
                  key={member.projectionId}
                  href={`/${locale}/team/${member.slug}`}
                  className="group block p-8 bg-canvas rounded-sm border border-border hover:border-gold/60 transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-full bg-ink text-on-dark flex items-center justify-center font-heading-ar font-bold text-xl border border-gold/40">
                      {member.metadata?.fullName?.charAt(0) || 'م'}
                    </div>
                    <div>
                      <h3 className="font-heading-ar font-bold text-ink text-xl group-hover:text-gold-ink transition-colors">
                        {member.metadata?.fullName || member.title}
                      </h3>
                      <p className="text-gold-ink text-sm font-medium mt-1">
                        {member.metadata?.positionTitle}
                      </p>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">
                      {member.summary}
                    </p>
                    {member.metadata?.verifiedCredentials && (
                      <div className="pt-3 border-t border-border/60 flex flex-wrap gap-2">
                        {member.metadata.verifiedCredentials.map((cred: string, cIdx: number) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink bg-surface px-2.5 py-1 rounded-xs border border-border"
                          >
                            <Scale className="w-3 h-3 text-gold-ink" />
                            <span>{cred}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Final Contact Call to Action Banner */}
      <section className="py-20 bg-canvas">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-sm bg-ink text-on-dark text-base font-semibold hover:bg-signature transition-all duration-200 shadow-md group"
            >
              <span>{t('contactSection.submitBtn')}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-sm bg-surface border border-border text-ink text-base font-semibold hover:bg-canvas transition-colors duration-200"
            >
              <MessageSquare className="w-4 h-4 text-gold-ink" />
              <span>{t('common.whatsappLabel')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
