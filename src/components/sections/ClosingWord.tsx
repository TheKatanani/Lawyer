'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface ClosingWordProps {
  locale?: string;
  eyebrow: string;
  quote: string;
  author: string;
  role: string;
}

export function ClosingWord({ eyebrow, quote, author, role }: ClosingWordProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-signature text-on-dark relative overflow-hidden border-t border-gold/30">
      {/* Decorative ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative space-y-8">
        <ScrollReveal direction="up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface/10 border border-gold/40 text-gold mb-2">
            <Quote className="w-6 h-6" />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={120}>
          <div className="space-y-4">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest block">
              {eyebrow}
            </span>
            <p className="font-heading-ar font-bold text-xl sm:text-2xl lg:text-3xl leading-relaxed sm:leading-loose text-on-dark max-w-3xl mx-auto">
              {quote}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={240}>
          <div className="pt-4 border-t border-on-dark/15 max-w-xs mx-auto">
            <h3 className="font-heading-ar font-bold text-lg text-on-dark">
              {author}
            </h3>
            <p className="text-xs text-gold/80 font-medium">
              {role}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
