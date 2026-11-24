import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedProjection } from '@/server/repositories/content';
import { SupportedLocale } from '@/server/types';
import { Scale, CheckCircle2, ArrowUpRight, Globe, Languages } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { UNVERIFIED_CLAIMS_CONFIG } from '@/config/compliance';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (
    !UNVERIFIED_CLAIMS_CONFIG.enableUnconfirmedTeamMembers &&
    (slug === 'senior-counsel' || slug === 'abdulrahman-alotaibi')
  ) {
    return { title: 'Lawyer Not Found' };
  }

  const currentLocale = locale as SupportedLocale;
  const projection = await getPublishedProjection('teamMember', slug, currentLocale);

  if (!projection) return { title: 'Lawyer Not Found' };

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

export default async function TeamMemberDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  if (
    !UNVERIFIED_CLAIMS_CONFIG.enableUnconfirmedTeamMembers &&
    (slug === 'senior-counsel' || slug === 'abdulrahman-alotaibi')
  ) {
    notFound();
  }

  const currentLocale = locale as SupportedLocale;
  const isAr = locale === 'ar';

  const member = await getPublishedProjection('teamMember', slug, currentLocale);
  if (!member) notFound();

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <ScrollReveal direction="up">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-ink uppercase tracking-wider">
            <Link href={`/${locale}/team`} className="hover:underline">
              {isAr ? 'فريق المحامين' : 'Our Team'}
            </Link>
            <span>/</span>
            <span>{member.metadata?.fullName || member.title}</span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Lawyer Header Card */}
          <div className="lg:col-span-4">
            <ScrollReveal direction={isAr ? 'left' : 'right'} delay={100}>
              <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-sm hover:border-gold/60 transition-all duration-300 space-y-6">
                <div className="w-24 h-24 rounded-full bg-signature text-on-dark flex items-center justify-center font-heading-ar font-bold text-4xl border-2 border-gold/40">
                  {member.metadata?.fullName?.charAt(0) || 'م'}
                </div>
                <div className="space-y-1">
                  <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
                    {member.metadata?.fullName || member.title}
                  </h1>
                  <p className="text-gold-ink font-semibold text-base">
                    {member.metadata?.positionTitle}
                  </p>
                </div>

                {member.metadata?.spokenLanguages && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-gold-ink" />
                      {isAr ? 'اللغات المعتمدة' : 'Languages Spoken'}
                    </span>
                    <div className="flex gap-2">
                      {member.metadata.spokenLanguages.map((lang: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 text-xs bg-canvas rounded-xs border border-border font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <Link
                    href={`/${locale}/consultation?lawyer=${member.entityId}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-signature text-on-dark font-semibold text-sm rounded-sm hover:bg-signature/90 transition-all shadow-sm border border-gold/30 group hover:scale-[1.02]"
                  >
                    <span>{isAr ? 'طلب استشارة مع المحامي' : 'Request Consultation with Lawyer'}</span>
                    <ArrowUpRight className="w-4 h-4 text-gold group-hover:scale-110 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Bio & Verified Credentials */}
          <div className="lg:col-span-8 space-y-8">
            {/* Verified Credentials Box */}
            {member.metadata?.verifiedCredentials && (
              <ScrollReveal direction="up" delay={150}>
                <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 transition-all duration-300 space-y-4">
                  <h2 className="font-heading-ar font-bold text-ink text-xl flex items-center gap-2">
                    <Scale className="w-5 h-5 text-gold-ink" />
                    <span>{isAr ? 'التراخيص والاعتمادات النظامية المعتمدة' : 'Verified Accreditations & Bar Admissions'}</span>
                  </h2>
                  <div className="space-y-2.5">
                    {member.metadata.verifiedCredentials.map((cred: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-canvas rounded-xs border border-border/70 hover:border-gold/40 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-sm font-semibold text-ink">{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Practice Areas */}
            {member.metadata?.practiceAreas && (
              <ScrollReveal direction="up" delay={200}>
                <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 transition-all duration-300 space-y-4">
                  <h2 className="font-heading-ar font-bold text-ink text-xl">
                    {isAr ? 'مجالات الممارسة والاختصاص' : 'Practice Areas of Expertise'}
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {member.metadata.practiceAreas.map((area: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-canvas rounded-xs border border-border text-xs font-semibold text-ink">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Editorial Blocks */}
            <ScrollReveal direction="up" delay={250}>
              <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs hover:border-gold/60 transition-all duration-300 space-y-4">
                <h2 className="font-heading-ar font-bold text-ink text-xl">
                  {isAr ? 'نبذة مهنية موجزة' : 'Professional Biography'}
                </h2>
                <div className="space-y-4 text-muted text-base leading-relaxed">
                  {member.blocks?.map((b) => (
                    <p key={b.id}>{b.data?.text}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
