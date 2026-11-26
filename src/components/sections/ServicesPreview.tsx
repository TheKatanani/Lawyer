'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Building2, Scale, Globe2, Shield, Briefcase } from 'lucide-react';
import { ImageSlot } from '@/components/ImageSlot';
import { isSiteImageSlug } from '@/lib/site-images';
import { PublicContentProjection, AudienceTag } from '@/server/types';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface ServicesPreviewProps {
  locale: string;
  initialServices: PublicContentProjection[];
  headingAs?: 'h1' | 'h2';
  messages: {
    eyebrow: string;
    heading: string;
    description: string;
    filters: {
      all: string;
      individual: string;
      business: string;
    };
    viewDetails: string;
  };
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-5 h-5 text-gold-ink" />,
  Scale: <Scale className="w-5 h-5 text-gold-ink" />,
  Globe2: <Globe2 className="w-5 h-5 text-gold-ink" />,
  Shield: <Shield className="w-5 h-5 text-gold-ink" />,
  Briefcase: <Briefcase className="w-5 h-5 text-gold-ink" />,
};

export function ServicesPreview({
  locale,
  initialServices,
  headingAs = 'h2',
  messages,
}: ServicesPreviewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | AudienceTag>('all');
  const isAr = locale === 'ar';
  const HeadingTag = headingAs;

  const filteredServices = initialServices.filter((s) => {
    if (activeFilter === 'all') return true;
    const audiences = s.metadata?.audiences || [];
    return audiences.includes(activeFilter);
  });

  return (
    <section className="py-20 lg:py-24 bg-canvas border-b border-border/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={100}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                {messages.eyebrow}
              </span>
              <HeadingTag className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl">
                {messages.heading}
              </HeadingTag>
              <p className="text-muted text-base leading-relaxed">
                {messages.description}
              </p>
            </div>

            {/* Audience Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-sm self-start md:self-auto shadow-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xs transition-all duration-300 ${
                  activeFilter === 'all'
                    ? 'bg-ink text-on-dark shadow-sm scale-102'
                    : 'text-muted hover:text-ink hover:bg-canvas/50'
                }`}
              >
                {messages.filters.all}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('individual')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xs transition-all duration-300 ${
                  activeFilter === 'individual'
                    ? 'bg-ink text-on-dark shadow-sm scale-102'
                    : 'text-muted hover:text-ink hover:bg-canvas/50'
                }`}
              >
                {messages.filters.individual}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('business')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xs transition-all duration-300 ${
                  activeFilter === 'business'
                    ? 'bg-ink text-on-dark shadow-sm scale-102'
                    : 'text-muted hover:text-ink hover:bg-canvas/50'
                }`}
              >
                {messages.filters.business}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Editorial Service Rows */}
        <div className="divide-y divide-border border-y border-border">
          {filteredServices.map((service, idx) => {
            const icon = ICON_MAP[service.metadata?.iconName || 'Scale'] || <Scale className="w-5 h-5 text-gold-ink" />;
            const itemNumber = (idx + 1).toString().padStart(2, '0');
            const imageSlug = isSiteImageSlug(service.slug)
              ? service.slug
              : isSiteImageSlug(service.entityId)
              ? service.entityId
              : null;

            return (
              <ScrollReveal
                key={service.projectionId}
                direction="up"
                delay={idx * 80}
              >
                <Link
                  href={`/${locale}/services/${service.slug}`}
                  className="group relative block py-7 px-4 sm:px-6 hover:bg-surface transition-all duration-300"
                >
                  {/* Subtle Expanding Gold Accent Line on hover */}
                  <div className="absolute start-0 inset-y-0 w-0 group-hover:w-1.5 bg-gold transition-all duration-300 ease-out" />

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-center">
                    {/* Visual Thumbnail */}
                    <div className="md:col-span-2">
                      {imageSlug ? (
                        <ImageSlot
                          slug={imageSlug}
                          locale={isAr ? 'ar' : 'en'}
                          sizes="(max-width: 768px) 100vw, 180px"
                          className="rounded-xs border border-border/80 group-hover:border-gold/60 transition-colors shadow-xs"
                          imgClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="relative aspect-video w-full rounded-xs bg-signature border border-gold/30 flex items-center justify-center overflow-hidden shadow-xs">
                          <div className="absolute inset-0 bg-[radial-gradient(#A28248_1px,transparent_1px)] [background-size:14px_14px] opacity-20 pointer-events-none" />
                          <div className="p-2.5 rounded-sm bg-canvas/10 border border-gold/40">
                            {icon}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Number, Icon, Title & Audience Badges */}
                    <div className="md:col-span-4 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading-ar font-bold text-gold text-base transition-transform duration-300 group-hover:scale-110">
                          {itemNumber}
                        </span>
                        <div className="p-1.5 bg-canvas rounded-xs border border-border/70 group-hover:border-gold group-hover:bg-surface transition-all duration-300">
                          {icon}
                        </div>
                      </div>
                      <h3 className="font-heading-ar font-bold text-ink text-xl group-hover:text-gold-ink transition-colors duration-300">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {service.metadata?.audiences?.map((aud: string) => (
                          <span
                            key={aud}
                            className="inline-block px-2 py-0.5 text-[11px] font-medium bg-canvas text-muted border border-border/70 rounded-xs group-hover:border-gold/30 transition-colors"
                          >
                            {aud === 'business'
                              ? isAr ? 'منشآت' : 'Business'
                              : isAr ? 'أفراد' : 'Individual'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-5 text-muted text-sm leading-relaxed group-hover:text-ink transition-colors duration-300">
                      {service.summary}
                    </div>

                    {/* Action Arrow */}
                    <div className="md:col-span-1 flex justify-end">
                      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-ink group-hover:bg-signature group-hover:text-gold group-hover:border-gold/60 group-hover:scale-105 transition-all duration-300 shadow-xs">
                        <ArrowUpRight className="w-4 h-4 transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
