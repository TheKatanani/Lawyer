'use client';

import React from 'react';
import { BookOpen, Scale, Lock, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface ValuesSectionProps {
  locale?: string;
  messages: {
    eyebrow: string;
    heading: string;
    items: Array<{ title: string; desc: string }>;
  };
}

const VALUE_ICONS = [
  <BookOpen key="book" className="w-6 h-6 text-gold" />,
  <Scale key="scale" className="w-6 h-6 text-gold" />,
  <Lock key="lock" className="w-6 h-6 text-gold" />,
];

export function ValuesSection({ messages }: ValuesSectionProps) {
  const values = (messages.items || []).map((item, idx) => ({
    ...item,
    icon: VALUE_ICONS[idx % VALUE_ICONS.length],
  }));

  if (values.length === 0) return null;

  return (
    <section className="py-24 bg-signature text-on-dark border-b border-gold/20 relative overflow-hidden">
      {/* Subtle radial luxury glow in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal direction="up" delay={100}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-semibold text-gold uppercase tracking-wider inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>{messages.eyebrow}</span>
            </span>
            <h2 className="font-heading-ar font-bold text-3xl sm:text-4xl text-on-dark">
              {messages.heading}
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {values.map((v, i) => (
            <ScrollReveal
              key={i}
              direction="up"
              delay={200 + i * 150}
              className="h-full"
            >
              <div
                className="group relative p-8 rounded-sm bg-on-dark/5 border border-on-dark/10 hover:border-gold/60 hover:bg-on-dark/8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between h-full overflow-hidden"
              >
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-sm bg-signature border border-gold/40 flex items-center justify-center group-hover:scale-110 group-hover:border-gold transition-all duration-300 shadow-sm">
                    {v.icon}
                  </div>
                  <h3 className="font-heading-ar font-bold text-xl text-on-dark group-hover:text-gold transition-colors duration-300">
                    {v.title}
                  </h3>
                  <p className="text-on-dark/70 text-sm leading-relaxed font-normal group-hover:text-on-dark/90 transition-colors duration-300">
                    {v.desc}
                  </p>
                </div>

                {/* Animated Gold Bottom Accent */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
