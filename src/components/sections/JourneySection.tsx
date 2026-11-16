'use client';

import React from 'react';
import { FileText, SearchCheck, FileSignature, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface JourneySectionProps {
  locale: string;
  messages: {
    eyebrow: string;
    heading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
}

export function JourneySection({ locale, messages }: JourneySectionProps) {
  const isAr = locale === 'ar';
  const steps = [
    { num: '01', title: messages.step1Title, desc: messages.step1Desc, icon: <FileText className="w-5 h-5 text-gold-ink" /> },
    { num: '02', title: messages.step2Title, desc: messages.step2Desc, icon: <SearchCheck className="w-5 h-5 text-gold-ink" /> },
    { num: '03', title: messages.step3Title, desc: messages.step3Desc, icon: <FileSignature className="w-5 h-5 text-gold-ink" /> },
    { num: '04', title: messages.step4Title, desc: messages.step4Desc, icon: <CheckCircle2 className="w-5 h-5 text-gold-ink" /> },
  ];

  return (
    <section className="py-20 lg:py-24 bg-surface border-b border-border/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal direction="up" delay={100}>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
              {messages.eyebrow}
            </span>
            <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl">
              {messages.heading}
            </h2>
            <div className="w-12 h-0.5 bg-gold mx-auto mt-3" />
          </div>
        </ScrollReveal>

        {/* Timeline cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          {/* Subtle connecting horizontal bar on desktop */}
          <div className="hidden lg:block absolute top-12 inset-x-12 h-0.5 bg-border/80 -z-0" />

          {steps.map((step, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={150 + idx * 120}
              className="h-full relative z-10"
            >
              <div className="group relative p-6 bg-canvas rounded-sm border border-border/80 hover:border-gold/60 flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 h-full">
                <div className="space-y-4">
                  {/* Step header: Number + Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-sm bg-surface border border-border group-hover:border-gold/60 group-hover:scale-110 group-hover:shadow-xs transition-all duration-300 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-muted/60 group-hover:text-gold-ink transition-colors duration-300 px-2 py-1 bg-surface border border-border/60 rounded">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="font-heading-ar font-bold text-lg text-ink group-hover:text-gold-ink transition-colors duration-300">
                    {step.title}
                  </h3>

                  <p className="text-muted text-xs sm:text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom line */}
                <div className="w-full h-0.5 bg-border/40 group-hover:bg-gold transition-colors duration-300" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
