import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedProjection, listPublishedProjections } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { Scale, CheckCircle, ArrowUpRight, ShieldCheck, User } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const currentLocale = locale as SupportedLocale;
  const projection = await getPublishedProjection('service', slug, currentLocale);

  if (!projection) {
    return { title: 'Service Not Found' };
  }

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

export default async function ServiceDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const currentLocale = locale as SupportedLocale;
  const isAr = locale === 'ar';

  const service = await getPublishedProjection('service', slug, currentLocale);
  if (!service) {
    notFound();
  }

  const allTeam = await listPublishedProjections('teamMember', currentLocale);

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumb & Header */}
        <ScrollReveal direction="up">
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-ink uppercase tracking-wider">
              <Link href={`/${locale}/services`} className="hover:underline">
                {isAr ? 'الخدمات' : 'Practice Areas'}
              </Link>
              <span>/</span>
              <span>{service.title}</span>
            </div>

            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl leading-tight">
              {service.title}
            </h1>

            <p className="text-muted text-base sm:text-lg leading-relaxed">
              {service.summary}
            </p>

            <div className="flex items-center gap-2 pt-2">
              {service.metadata?.audiences?.map((aud: string) => (
                <span
                  key={aud}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-surface border border-border text-xs font-semibold text-ink"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-ink" />
                  <span>
                    {aud === 'business'
                      ? isAr ? 'خدمات المنشآت والشركات' : 'Corporate & Enterprise'
                      : isAr ? 'خدمات الأفراد' : 'Private Clients'}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Deliverables & Scope Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content & Scope */}
          <div className="lg:col-span-8 space-y-10">
            {service.metadata?.deliverables && service.metadata.deliverables.length > 0 && (
              <ScrollReveal direction="up" delay={100}>
                <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 transition-all duration-300 space-y-6">
                  <h2 className="font-heading-ar font-bold text-ink text-2xl">
                    {isAr ? 'نطاق الخدمة والمخرجات الرئيسية' : 'Deliverables & Advisory Scope'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.metadata.deliverables.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-canvas rounded-xs border border-border/60 hover:border-gold/40 transition-colors">
                        <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-ink leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Editorial Blocks */}
            <div className="space-y-6 text-muted text-base leading-relaxed">
              {service.blocks?.map((b, bIdx) => (
                <ScrollReveal key={b.id} direction="up" delay={150 + bIdx * 80}>
                  <div className="p-6 bg-surface rounded-sm border border-border/60 hover:border-gold/50 transition-colors">
                    <p>{b.data?.text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Regulatory Disclaimer Notice */}
            <ScrollReveal direction="up" delay={200}>
              <div className="p-6 bg-canvas rounded-sm border-l-4 rtl:border-r-4 rtl:border-l-0 border-gold space-y-2">
                <h3 className="font-heading-ar font-bold text-sm text-ink">
                  {isAr ? 'ضوابط تقديم الخدمة وفق الأنظمة السعودية' : 'Regulatory Engagement Notice'}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {isAr
                    ? 'يخضع تقديم هذه الخدمة للأنظمة واللوائح الصادرة عن وزارة العدل والهيئة السعودية للمحامين. يتم تحديد نطاق التمثيل الدقيق والالتزامات التعاقدية بموجب عقد أتعاب معتمد.'
                    : 'Provision of this legal service is governed by regulations issued by the Saudi Ministry of Justice. Precise representation scope is documented via a formal engagement agreement.'}
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Sticky Sidebar: Intake CTA & Team Link */}
          <div className="lg:col-span-4 space-y-6">
            <ScrollReveal direction={isAr ? 'left' : 'right'} delay={250}>
              <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-sm hover:border-gold/60 transition-all duration-300 space-y-6 sticky top-28">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                    {isAr ? 'طلب الخدمة' : 'Retain Counsel'}
                  </span>
                  <h3 className="font-heading-ar font-bold text-ink text-xl">
                    {isAr ? 'ابدأ طلب التواصل للخدمة' : 'Request a Consultation'}
                  </h3>
                  <p className="text-muted text-xs leading-relaxed">
                    {isAr
                      ? 'سيقوم فريق العمل بفرز الطلب والتأكد من خلوه من تعارض المصالح وتحديد الخطوات المناسبة.'
                      : 'Our intake team will review your inquiry, verify absence of conflicts, and outline subsequent procedural steps.'}
                  </p>
                </div>

                <Link
                  href={`/${locale}/consultation?service=${service.entityId}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-signature text-on-dark font-semibold text-sm rounded-sm hover:bg-signature/90 transition-all shadow-md border border-gold/30 group hover:scale-[1.02]"
                >
                  <span>{isAr ? 'طلب استشارة في هذه الخدمة' : 'Request Consultation for this Service'}</span>
                  <ArrowUpRight className="w-4 h-4 text-gold group-hover:scale-110 transition-transform duration-300" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
