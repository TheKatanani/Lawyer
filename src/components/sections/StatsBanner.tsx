'use client';

import React from 'react';
import { Award, ShieldCheck, Scale, Compass, CheckCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export interface StatsBannerItem {
  target: number;
  prefix?: string;
  suffix: string;
  title: string;
  desc: string;
}

interface StatsBannerProps {
  locale?: string;
  items: StatsBannerItem[];
}

const STAT_ICONS = [
  <Award key="award" className="w-5 h-5 text-gold" />,
  <Scale key="scale" className="w-5 h-5 text-gold" />,
  <Compass key="compass" className="w-5 h-5 text-gold" />,
  <CheckCircle key="check" className="w-5 h-5 text-gold" />,
  <ShieldCheck key="shield" className="w-5 h-5 text-gold" />,
];

export function StatsBanner({ items }: StatsBannerProps) {
  if (!items || items.length === 0) return null;

  const stats = items.map((item, idx) => ({
    ...item,
    icon: STAT_ICONS[idx % STAT_ICONS.length],
  }));

  return (
    <section className="relative bg-surface border-y border-border/70 py-12 lg:py-16 overflow-hidden">
      {/* Subtle luxury ambient gold gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((item, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={idx * 120}
              className="h-full"
            >
              <div className="group relative p-6 sm:p-7 rounded-sm bg-canvas/70 border border-border/80 hover:border-gold/60 hover:bg-canvas transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full flex flex-col justify-between">
                {/* Top Row: Icon + Glow */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-sm bg-surface border border-border flex items-center justify-center group-hover:scale-110 group-hover:border-gold/50 transition-all duration-300 shadow-xs">
                    {item.icon}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-gold/40 group-hover:bg-gold transition-colors duration-300" />
                </div>

                {/* Counter & Metric Number */}
                <div className="space-y-1.5">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink group-hover:text-gold-ink transition-colors duration-300">
                    <AnimatedCounter
                      target={item.target}
                      prefix={item.prefix}
                      suffix={item.suffix}
                    />
                  </div>

                  <h3 className="font-heading-ar font-bold text-base text-ink pt-1">
                    {item.title}
                  </h3>

                  <p className="text-muted text-xs leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom subtle accent line on hover */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
