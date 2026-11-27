import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedProjection } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { getPracticeAreaBySlug } from '@/data/practice-areas';
import { CheckCircle2, ArrowUpRight, ShieldCheck, Quote, Compass, AlertCircle } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ImageSlot } from '@/components/ImageSlot';
import { isSiteImageSlug } from '@/lib/site-images';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { buildPageMetadata } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const projection = await getPublishedProjection('service', slug, currentLocale);

  if (!projection) {
    return { title: currentLocale === 'ar' ? 'الخدمة غير موجودة' : 'Service Not Found' };
  }

  return buildPageMetadata({
    locale: currentLocale,
    path: `/services/${projection.slug}`,
    title: projection.seo.title || projection.title,
    description: projection.seo.description || projection.summary,
  });
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

  const area = getPracticeAreaBySlug(slug);

  const dbDeliverables = Array.isArray(service.metadata?.deliverables)
    ? service.metadata.deliverables.filter(Boolean)
    : [];
  const scopeItems = dbDeliverables.length > 0
    ? dbDeliverables
    : area
    ? (isAr ? area.scopeOfServicesAr : area.scopeOfServicesEn)
    : [];

  const dbProblemsBlock = service.blocks?.find((b) => b.id.includes('list-problems'));
  const dbProblems = Array.isArray(dbProblemsBlock?.data?.items)
    ? dbProblemsBlock!.data.items.filter(Boolean)
    : [];
  const problemsItems = dbProblems.length > 0
    ? dbProblems
    : area
    ? (isAr ? area.problemsAddressedAr : area.problemsAddressedEn)
    : [];

  const steps = area?.methodologySteps || [];

  const dbValueBlock = service.blocks?.find((b) => b.id.includes('callout-val'));
  const valueQuote = dbValueBlock?.data?.text
    ? String(dbValueBlock.data.text)
    : area
    ? (isAr ? area.valueToClientAr : area.valueToClientEn)
    : null;

  const imageSlug = isSiteImageSlug(slug)
    ? slug
    : isSiteImageSlug(service.slug)
    ? service.slug
    : isSiteImageSlug(service.entityId)
    ? service.entityId
    : null;

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <BreadcrumbJsonLd
        locale={isAr ? 'ar' : 'en'}
        items={[
          { name: isAr ? 'مجالات الممارسة' : 'Practice Areas', path: '/services' },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumb & Header */}
        <ScrollReveal direction="up">
          <div className={imageSlug ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center' : 'max-w-4xl'}>
            <div className={`${imageSlug ? 'lg:col-span-7 ' : ''}space-y-4`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-ink uppercase tracking-wider">
                <Link href={`/${locale}/services`} className="hover:underline">
                  {isAr ? 'مجالات الممارسة' : 'Practice Areas'}
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

            {imageSlug && (
              <div className="lg:col-span-5">
                <ImageSlot
                  slug={imageSlug}
                  locale={isAr ? 'ar' : 'en'}
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="rounded-sm border border-border/80 shadow-md"
                />
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Deliverables, Problems, Methodology & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area (8 columns) */}
          <div className="lg:col-span-8 space-y-12">
            {/* 1. Scope of Services */}
            {scopeItems.length > 0 && (
              <ScrollReveal direction="up" delay={100}>
                <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 transition-all duration-300 space-y-6">
                  <h2 className="font-heading-ar font-bold text-ink text-2xl">
                    {isAr ? 'نطاق الخدمات والتمثيل النظامي' : 'Scope of Services'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {scopeItems.map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 bg-canvas rounded-xs border border-border/60 hover:border-gold/40 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-ink leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* 2. Problems We Address */}
            {problemsItems.length > 0 && (
              <ScrollReveal direction="up" delay={150}>
                <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 transition-all duration-300 space-y-6">
                  <h2 className="font-heading-ar font-bold text-ink text-2xl flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-gold" />
                    <span>{isAr ? 'طبيعة المشكلات التي نعالجها' : 'Problems We Address'}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {problemsItems.map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 bg-canvas/80 rounded-xs border border-border/50 text-sm text-ink font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-ink mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* 3. Methodology Steps */}
            {steps.length > 0 && (
              <ScrollReveal direction="up" delay={200}>
                <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 transition-all duration-300 space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                      {isAr ? 'المسار الإجرائي' : 'Procedural Workflow'}
                    </span>
                    <h2 className="font-heading-ar font-bold text-ink text-2xl flex items-center gap-2.5">
                      <Compass className="w-5 h-5 text-gold" />
                      <span>{isAr ? 'منهجية التعامل مع الملف' : 'How We Handle the Matter'}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    {steps.map((s) => (
                      <div
                        key={s.step}
                        className="p-5 bg-canvas rounded-sm border border-border/70 hover:border-gold/50 transition-all duration-300 space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-signature text-on-dark flex items-center justify-center font-mono font-bold text-xs border border-gold/40">
                            {s.step}
                          </span>
                          <h3 className="font-heading-ar font-bold text-ink text-base">
                            {isAr ? s.titleAr : s.titleEn}
                          </h3>
                        </div>
                        <p className="text-xs text-muted leading-relaxed font-normal">
                          {isAr ? s.descriptionAr : s.descriptionEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* 4. Value to the Client Callout */}
            {valueQuote && (
              <ScrollReveal direction="up" delay={250}>
                <div className="p-6 bg-signature text-on-dark rounded-sm border border-gold/40 shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <Quote className="w-8 h-8 text-gold flex-shrink-0 opacity-80" />
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-gold uppercase tracking-wider block">
                        {isAr ? 'القيمة للعميل' : 'Value to the Client'}
                      </span>
                      <p className="font-heading-ar font-bold text-base sm:text-lg leading-relaxed text-on-dark">
                        {valueQuote}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Regulatory Disclaimer Notice */}
            <ScrollReveal direction="up" delay={300}>
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

          {/* Sticky Sidebar: Intake CTA (4 columns) */}
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
