'use client';

import React from 'react';
import { Compass, CheckCircle2, Shield, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export interface MethodologyStepItem {
  num: string;
  title: string;
  desc: string;
}

interface MethodologySectionProps {
  locale: string;
  eyebrow: string;
  heading: string;
  description: string;
  steps: MethodologyStepItem[];
}

export function MethodologySection({
  locale,
  eyebrow,
  heading,
  description,
  steps,
}: MethodologySectionProps) {
  const isAr = locale === 'ar';

  if (!steps || steps.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-canvas border-b border-border/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-gold" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {steps.map((s, idx) => (
            <ScrollReveal
              key={s.num}
              direction="up"
              delay={idx * 100}
              className={idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <div className="group p-8 rounded-sm bg-surface border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-2xl text-gold-ink/80 group-hover:text-gold transition-colors">
                      {s.num}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                  </div>

                  <h3 className="font-heading-ar font-bold text-ink text-xl group-hover:text-gold-ink transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-muted text-sm leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-gold-ink">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  <span>{isAr ? `المرحلة ${s.num} من المنهج` : `Stage ${s.num} Protocol`}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
