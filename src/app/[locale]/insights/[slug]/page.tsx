import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedProjection } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { Clock, BookOpen, ArrowUpRight, Scale, ShieldAlert } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const currentLocale = locale as SupportedLocale;
  const projection = await getPublishedProjection('article', slug, currentLocale);

  if (!projection) return { title: 'Article Not Found' };

  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://rma-law.sa';
  return {
    title: projection.seo.title,
    description: projection.seo.description,
    metadataBase: new URL(origin),
    alternates: {
      canonical: projection.seo.canonicalPath,
      languages: {
        ar: projection.seo.alternatePaths.ar,
        en: projection.seo.alternatePaths.en,
        'x-default': projection.seo.alternatePaths.ar,
      },
    },
  };
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

  return (
    <article className="py-12 sm:py-16 lg:py-20 bg-canvas">
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
                <span>{isAr ? 'قراءة في 5 دقائق' : '5 min read'}</span>
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
          {article.blocks?.map((b, bIdx) => (
            <ScrollReveal key={b.id} direction="up" delay={120 + bIdx * 60}>
              <div className="p-2">
                <p>{b.data?.text}</p>
              </div>
            </ScrollReveal>
          ))}
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
