import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Compass, Target } from 'lucide-react';
import { ImageSlot } from '@/components/ImageSlot';
import { getSiteSettings } from '@/server/db/dal';
import {
  getLeadershipContent,
  getMethodologyProps,
  getExcellenceProps,
  pickLocalized,
} from '@/lib/settings-presenters';

export const dynamic = 'force-dynamic';
import { SupportedLocale } from '@/server/types';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { LeadershipMessage } from '@/components/sections/LeadershipMessage';
import { MethodologySection } from '@/components/sections/MethodologySection';
import { InstitutionalExcellence } from '@/components/sections/InstitutionalExcellence';
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
    path: '/about',
    title: isAr ? 'عن الشركة والرؤية المؤسسية' : 'About the Firm & Vision',
    description: isAr
      ? 'تعرّف على شركة رياض محمد الزهراني للمحاماة في جدة، خبرة تتجاوز عشرين عاماً في التقاضي والتحكيم ومنهج عملنا الخماسي.'
      : 'Learn about Riyadh Mohammed Alzahrani Law Firm in Jeddah, 20+ years in litigation and arbitration, and our 5-step methodology.',
  });
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const settings = await getSiteSettings();

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas overflow-x-clip">
      <BreadcrumbJsonLd
        locale={isAr ? 'ar' : 'en'}
        items={[{ name: isAr ? 'عن الشركة' : 'About Firm', path: '/about' }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Breadcrumb & Title */}
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold-ink uppercase tracking-wider">
              <span>{pickLocalized(locale, settings.aboutEyebrowAr, settings.aboutEyebrowEn) || (isAr ? 'عن الشركة / الرؤية والمنهجية' : 'About Firm / Vision & Principles')}</span>
            </div>
            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl leading-tight">
              {pickLocalized(locale, settings.aboutVisionAr, settings.aboutVisionEn)}
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed">
              {pickLocalized(locale, settings.aboutTextAr, settings.aboutTextEn)}
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Image Grid with Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <ScrollReveal direction={isAr ? 'left' : 'right'} delay={100}>
              <ImageSlot
                slug="about-library"
                locale={isAr ? 'ar' : 'en'}
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                aspectClassName="h-[380px] sm:h-[480px] w-full"
                className="rounded-sm border border-border shadow-sm group"
                imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
              >
                <div className="absolute inset-0 bg-signature/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500" />
              </ImageSlot>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction={isAr ? 'right' : 'left'} delay={200}>
              <div className="p-6 bg-surface rounded-sm border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-3">
                <div className="flex items-center gap-3 text-gold-ink font-heading-ar font-bold text-lg">
                  <Target className="w-5 h-5 text-gold" />
                  <h3>{isAr ? 'رسالتنا المؤسسية' : 'Our Corporate Mission'}</h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {pickLocalized(locale, settings.aboutMissionAr, settings.aboutMissionEn)}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction={isAr ? 'right' : 'left'} delay={300}>
              <div className="p-6 bg-surface rounded-sm border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-3">
                <div className="flex items-center gap-3 text-gold-ink font-heading-ar font-bold text-lg">
                  <Compass className="w-5 h-5 text-gold" />
                  <h3>
                    {pickLocalized(
                      locale,
                      settings.aboutAccreditationTitleAr,
                      settings.aboutAccreditationTitleEn
                    )}
                  </h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {pickLocalized(
                    locale,
                    settings.aboutAccreditationDescAr,
                    settings.aboutAccreditationDescEn
                  )}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Strategic Pillars */}
        <div className="pt-8 border-t border-border space-y-8">
          <ScrollReveal direction="up">
            <h2 className="font-heading-ar font-bold text-ink text-2xl sm:text-3xl">
              {pickLocalized(
                locale,
                settings.aboutPillarsHeadingAr,
                settings.aboutPillarsHeadingEn
              )}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(settings.aboutPillars || []).map((pillar, idx) => (
              <ScrollReveal key={pillar.num || idx} direction="up" delay={(idx + 1) * 100}>
                <div className="p-6 bg-surface rounded-sm border border-border hover:border-gold/70 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 space-y-3 h-full">
                  <span className="font-heading-ar font-bold text-gold text-2xl">{pillar.num}</span>
                  <h3 className="font-heading-ar font-bold text-ink text-lg">
                    {isAr ? pillar.titleAr : pillar.titleEn}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {isAr ? pillar.descAr : pillar.descEn}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Leadership Message (PDF p. 6-7) */}
        <LeadershipMessage locale={locale} content={getLeadershipContent(settings, locale)} />

        {/* 5-Step Methodology (PDF p. 10-11) */}
        <MethodologySection locale={locale} {...getMethodologyProps(settings, locale)} />

        {/* Institutional Excellence (PDF p. 52-53) */}
        <InstitutionalExcellence locale={locale} {...getExcellenceProps(settings, locale)} />

        {/* CTA Banner */}
        <ScrollReveal direction="up" delay={150}>
          <div className="p-8 sm:p-12 rounded-sm bg-signature text-on-dark flex flex-col md:flex-row items-center justify-between gap-6 border border-gold/30 shadow-lg hover:border-gold/60 transition-all duration-300">
            <div className="space-y-2 text-center md:text-start">
              <h3 className="font-heading-ar font-bold text-2xl text-on-dark">
                {isAr ? 'هل تحتاج إلى استشارة متخصصة؟' : 'Require Specialized Legal Counsel?'}
              </h3>
              <p className="text-on-dark/70 text-sm max-w-xl">
                {isAr
                  ? 'فريقنا مستعد لدراسة طلبك وتنسيق جلسة استشارية أولية مع المحامي المختص.'
                  : 'Our legal team is available to evaluate your request and coordinate an initial consultation.'}
              </p>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-signature font-bold text-sm rounded-sm hover:bg-gold/90 hover:scale-105 transition-all flex-shrink-0 group"
            >
              <span>{isAr ? 'تواصل معنا الآن' : 'Contact Us'}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
