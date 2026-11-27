import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedProjection } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { Clock, Scale, ShieldAlert } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { buildPageMetadata } from '@/lib/seo';
import { computeArticleReadingTimeMinutes, formatReadingTime } from '@/lib/reading-time';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const projection = await getPublishedProjection('article', slug, currentLocale);

  if (!projection) {
    return { title: currentLocale === 'ar' ? 'المقال غير موجود' : 'Article Not Found' };
  }

  return buildPageMetadata({
    locale: currentLocale,
    path: `/insights/${projection.slug}`,
    title: projection.seo.title || projection.title,
    description: projection.seo.description || projection.summary,
  });
}

export default async function ArticleDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const currentLocale = locale as SupportedLocale;
  const isAr = locale === 'ar';

  const article = await getPublishedProjection('article', slug, currentLocale);
  if (!article) notFound();

  const readMinutes = computeArticleReadingTimeMinutes(article.summary, article.blocks);

  return (
    <article className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <BreadcrumbJsonLd
        locale={isAr ? 'ar' : 'en'}
        items={[
          { name: isAr ? 'المدونة المعرفية' : 'Legal Insights', path: '/insights' },
          { name: article.title, path: `/insights/${article.slug}` },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb & Header */}
        <ScrollReveal direction="up">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-ink uppercase tracking-wider">
              <Link href={`/${locale}/insights`} className="hover:underline">
                {isAr ? 'المدونة المعرفية' : 'Legal Insights'}
              </Link>
              <span>/</span>
              <span>{isAr ? 'تحليل نظامي' : 'Analysis'}</span>
            </div>

            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-6 text-xs text-muted pt-2 border-b border-border pb-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold-ink" />
                <span>{formatReadingTime(readMinutes, locale)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-gold-ink" />
                <span>{isAr ? 'الأنظمة السعودية' : 'Saudi Regulatory Framework'}</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Lead Excerpt */}
        <ScrollReveal direction="up" delay={100}>
          <div className="p-6 bg-surface rounded-sm border-r-4 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 border-gold shadow-xs hover:shadow-md transition-shadow">
            <p className="font-heading-ar font-medium text-lg sm:text-xl text-ink leading-relaxed">
              {article.summary}
            </p>
          </div>
        </ScrollReveal>

        {/* Article Body Blocks */}
        <div className="space-y-6 text-ink text-base sm:text-lg leading-relaxed">
          {article.blocks?.map((b, bIdx) => {
            if (b.type === 'heading') {
              return (
                <ScrollReveal key={b.id} direction="up" delay={100 + bIdx * 40}>
                  <h2 className="font-heading-ar font-bold text-xl sm:text-2xl text-ink pt-4">
                    {b.data?.text}
                  </h2>
                </ScrollReveal>
              );
            }
            if (b.type === 'list' && Array.isArray(b.data?.items)) {
              return (
                <ScrollReveal key={b.id} direction="up" delay={100 + bIdx * 40}>
                  <ul className="list-disc list-inside space-y-2 text-muted px-2">
                    {b.data.items.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </ScrollReveal>
              );
            }
            if (b.type === 'quote') {
              return (
                <ScrollReveal key={b.id} direction="up" delay={100 + bIdx * 40}>
                  <blockquote className="p-5 bg-surface border-s-4 border-gold text-ink italic rounded-sm">
                    {b.data?.text}
                  </blockquote>
                </ScrollReveal>
              );
            }
            return (
              <ScrollReveal key={b.id} direction="up" delay={100 + bIdx * 40}>
                <div className="p-1">
                  <p>{b.data?.text}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Mandatory Educational Disclaimer */}
        <ScrollReveal direction="up" delay={200}>
          <div className="p-6 bg-surface rounded-sm border border-border/80 flex items-start gap-4 text-xs text-muted">
            <ShieldAlert className="w-5 h-5 text-gold-ink flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isAr
                ? 'تنويه: ما يرد في هذه المقالة من معلومات وتحليلات هو لأغراض التوعية النظامية العامة فقط، ولا يُعد مشورة قانونية مخصصة أو تمثيلاً نظامياً. للحصول على رأي قانوني يلائم واقعتك المحددة، يُرجى التواصل مباشرة مع محامي الشركة.'
                : 'Disclaimer: The analysis and commentary in this article are provided solely for general educational and informational purposes and do not constitute specific legal counsel or representation. For tailored advice, please consult firm advocates directly.'}
            </p>
          </div>
        </ScrollReveal>

        {/* Back Link */}
        <ScrollReveal direction="up" delay={250}>
          <div className="pt-6 border-t border-border flex justify-between items-center">
            <Link
              href={`/${locale}/insights`}
              className="text-sm font-semibold text-ink hover:text-gold-ink transition-colors"
            >
              {isAr ? '← العودة إلى كافة المقالات' : '← Back to all articles'}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="px-6 py-2.5 bg-ink text-on-dark text-xs font-semibold rounded-sm hover:bg-signature hover:scale-105 transition-all shadow-sm"
            >
              {isAr ? 'استشر محامياً في هذا الموضوع' : 'Consult Counsel on this Matter'}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </article>
  );
}
