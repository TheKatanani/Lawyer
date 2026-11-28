import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { Scale } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
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
    path: '/team',
    title: isAr ? 'القيادة وفريق المحامين' : 'Leadership & Legal Team',
    description: isAr
      ? 'القيادة القانونية والسيرة المهنية للمستشار رياض بن محمد الزهراني الشريك المؤسس ومحكم تجاري دولي معتمد.'
      : 'Legal leadership and professional credentials of Founding & Managing Partner Counselor Riyadh Mohammed Alzahrani.',
  });
}

export default async function TeamPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const currentLocale = locale as SupportedLocale;
  const isAr = locale === 'ar';

  const [team, settings] = await Promise.all([
    listPublishedProjections('teamMember', currentLocale),
    getSiteSettings(),
  ]);

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <BreadcrumbJsonLd
        locale={isAr ? 'ar' : 'en'}
        items={[{ name: isAr ? 'فريق المحامين' : 'Our Team', path: '/team' }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
              {pickLocalized(currentLocale, settings.teamSectionEyebrowAr, settings.teamSectionEyebrowEn) ||
                t('teamSection.eyebrow')}
            </span>
            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
              {pickLocalized(currentLocale, settings.teamSectionHeadingAr, settings.teamSectionHeadingEn) ||
                t('teamSection.heading')}
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed">
              {pickLocalized(currentLocale, settings.teamSectionDescAr, settings.teamSectionDescEn) ||
                t('teamSection.description')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          {team.map((member, idx) => (
            <ScrollReveal key={member.projectionId} direction="up" delay={idx * 150}>
              <Link
                href={`/${locale}/team/${member.slug}`}
                className="group block p-8 bg-surface rounded-sm border border-border/80 hover:border-gold/70 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 h-full"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-signature text-on-dark flex items-center justify-center font-heading-ar font-bold text-2xl border border-gold/40 group-hover:border-gold group-hover:scale-105 transition-all duration-300">
                    {member.metadata?.fullName?.charAt(0) || 'م'}
                  </div>
                  <div>
                    <h2 className="font-heading-ar font-bold text-ink text-2xl group-hover:text-gold-ink transition-colors">
                      {member.metadata?.fullName || member.title}
                    </h2>
                    <p className="text-gold-ink font-semibold text-sm mt-1">
                      {member.metadata?.positionTitle}
                    </p>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    {member.summary}
                  </p>

                  {member.metadata?.verifiedCredentials && (
                    <div className="pt-4 border-t border-border/60 flex flex-wrap gap-2">
                      {member.metadata.verifiedCredentials.map((cred: string, cIdx: number) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink bg-canvas px-3 py-1 rounded-xs border border-border"
                        >
                          <Scale className="w-3.5 h-3.5 text-gold-ink" />
                          <span>{cred}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
