import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { ArrowUpRight, Clock } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { buildPageMetadata } from '@/lib/seo';
import { computeArticleReadingTimeMinutes, formatReadingTime } from '@/lib/reading-time';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const isAr = currentLocale === 'ar';

  return buildPageMetadata({
    locale: currentLocale,
    path: '/insights',
    title: isAr ? 'المدونة المعرفية والرؤى القانونية' : 'Legal Insights & Briefings',
    description: isAr
      ? 'مقالات وتحليلات قانونية متخصصة في الأنظمة التجارية والاستثمارية السعودية لأغراض التوعية النظامية العامة.'
      : 'Legal briefings and regulatory commentary on Saudi corporate, commercial and investment statutes.',
  });
}

export default async function InsightsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const currentLocale = locale as SupportedLocale;
  const isAr = locale === 'ar';

  const articles = await listPublishedProjections('article', currentLocale);

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
              {t('insightsSection.eyebrow')}
            </span>
            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
              {t('insightsSection.heading')}
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed">
              {t('insightsSection.description')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => {
            const readMinutes = computeArticleReadingTimeMinutes(article.summary, article.blocks);
            return (
              <ScrollReveal key={article.projectionId} direction="up" delay={idx * 120}>
                <Link
                  href={`/${locale}/insights/${article.slug}`}
                  className="group block p-6 bg-surface rounded-sm border border-border/80 hover:border-gold/60 shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 h-full"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-canvas text-gold-ink rounded-xs border border-border/70">
                      {isAr ? 'تحليل نظامي' : 'Legal Analysis'}
                    </span>
                    <h2 className="font-heading-ar font-bold text-ink text-xl group-hover:text-gold-ink transition-colors leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-muted text-sm leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-ink" />
                        <span>{formatReadingTime(readMinutes, locale)}</span>
                      </span>
                      <span className="text-ink font-semibold flex items-center gap-1 group-hover:text-gold-ink">
                        {t('common.readMore')}
                        <ArrowUpRight className="w-3.5 h-3.5 text-gold-ink group-hover:scale-110 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
