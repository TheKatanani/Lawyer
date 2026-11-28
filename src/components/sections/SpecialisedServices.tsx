'use client';

import React from 'react';
import { Shield, Building2, Users, Layers, AlertTriangle, Globe, FileText, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';

export interface SpecialisedServiceItem {
  title: string;
  desc: string;
}

interface SpecialisedServicesProps {
  locale: string;
  eyebrow: string;
  heading: string;
  description: string;
  items: SpecialisedServiceItem[];
}

export function SpecialisedServices({
  locale,
  eyebrow,
  heading,
  description,
  items,
}: SpecialisedServicesProps) {
  const isAr = locale === 'ar';
  if (!items || items.length === 0) return null;

  const SPECIALISED_ICONS = [
    <Shield key="shield" className="w-5 h-5 text-gold" />,
    <Building2 key="bldg" className="w-5 h-5 text-gold" />,
    <Users key="users" className="w-5 h-5 text-gold" />,
    <Layers key="layers" className="w-5 h-5 text-gold" />,
    <AlertTriangle key="alert" className="w-5 h-5 text-gold" />,
    <Globe key="globe" className="w-5 h-5 text-gold" />,
    <FileText key="file" className="w-5 h-5 text-gold" />,
  ];

  const services = items.map((item, idx) => ({
    ...item,
    icon: SPECIALISED_ICONS[idx % SPECIALISED_ICONS.length],
  }));

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-border/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
              {eyebrow}
            </span>
            <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl lg:text-5xl leading-tight">
              {heading}
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
              {description}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {services.map((s, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={idx * 80}
              className={idx === 6 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <div className="p-7 rounded-sm bg-canvas border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="w-10 h-10 rounded-sm bg-surface border border-border flex items-center justify-center">
                    {s.icon}
                  </div>
                  <h3 className="font-heading-ar font-bold text-ink text-lg">
                    {s.title}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <Link
                    href={`/${locale}/consultation`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-ink hover:text-gold transition-colors"
                  >
                    <span>{isAr ? 'طلب استشارة متخصصة' : 'Retain Advisory'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
