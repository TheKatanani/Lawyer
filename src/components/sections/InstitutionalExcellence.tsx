'use client';

import React from 'react';
import { Award, FileCheck2, ShieldAlert, Lock, MessagesSquare, CheckCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export interface ExcellencePillarItem {
  title: string;
  desc: string;
}

interface InstitutionalExcellenceProps {
  locale?: string;
  eyebrow: string;
  heading: string;
  description: string;
  pillars: ExcellencePillarItem[];
}

export function InstitutionalExcellence({
  eyebrow,
  heading,
  description,
  pillars,
}: InstitutionalExcellenceProps) {
  if (!pillars || pillars.length === 0) return null;

  const PILLAR_ICONS = [
    <FileCheck2 key="fc" className="w-5 h-5 text-gold" />,
    <ShieldAlert key="sa" className="w-5 h-5 text-gold" />,
    <Lock key="lk" className="w-5 h-5 text-gold" />,
    <MessagesSquare key="ms" className="w-5 h-5 text-gold" />,
    <CheckCheck key="cc" className="w-5 h-5 text-gold" />,
  ];

  const mappedPillars = pillars.map((p, idx) => ({
    ...p,
    icon: PILLAR_ICONS[idx % PILLAR_ICONS.length],
  }));

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-canvas border-b border-border/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" />
              <span>{eyebrow}</span>
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
          {mappedPillars.map((p, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={idx * 90}
              className={idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <div className="p-7 rounded-sm bg-surface border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full space-y-4">
                <div className="w-10 h-10 rounded-sm bg-canvas border border-border flex items-center justify-center">
                  {p.icon}
                </div>
                <h3 className="font-heading-ar font-bold text-ink text-lg">
                  {p.title}
                </h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
