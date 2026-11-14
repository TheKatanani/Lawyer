'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Scale, ShieldCheck } from 'lucide-react';

interface HeroProps {
  locale: string;
  messages: {
    eyebrow: string;
    heading: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageAlt: string;
  };
}

export function Hero({ locale, messages }: HeroProps) {
  const isAr = locale === 'ar';

  return (
    <section className="relative overflow-hidden bg-canvas pt-8 pb-16 lg:py-20 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px] lg:min-h-[660px]">
          {/* Text Content: 55% (~7 columns on desktop) */}
          <div className={`lg:col-span-7 flex flex-col justify-center space-y-6 ${isAr ? 'lg:order-1' : 'lg:order-1'}`}>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-gold/40 text-gold-ink text-xs font-semibold w-fit shadow-xs">
              <Scale className="w-3.5 h-3.5 text-gold" />
              <span>{messages.eyebrow}</span>
            </div>

            {/* Master Headline with Noto Naskh Arabic */}
            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl lg:text-[3.25rem] leading-[1.2] lg:leading-[1.25]">
              {messages.heading}
            </h1>

            {/* Explanatory description */}
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              {messages.description}
            </p>

            {/* Dual CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href={`/${locale}/services`}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-sm bg-ink text-on-dark text-base font-semibold hover:bg-signature transition-all duration-200 shadow-md group"
              >
                <span>{messages.ctaPrimary}</span>
                <ArrowUpRight className={`w-4 h-4 transition-transform duration-200 ${isAr ? 'group-hover:-translate-x-1 group-hover:-translate-y-1' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
              </Link>
              <Link
                href={`/${locale}/consultation`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-sm bg-surface border border-border text-ink text-base font-semibold hover:bg-canvas transition-colors duration-200"
              >
                <span>{messages.ctaSecondary}</span>
              </Link>
            </div>

            {/* Trust badge */}
            <div className="pt-6 flex items-center gap-6 text-xs text-muted font-medium border-t border-border/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-ink" />
                <span>{isAr ? 'امتثال تام لنظام المحاماة السعودي' : 'Full Compliance with Saudi Legal Regulations'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                <span>{isAr ? 'سرية مهنية غير قابلة للمساومة' : 'Strict Professional Confidentiality'}</span>
              </div>
            </div>
          </div>

          {/* Visual Architecture Asset: 45% (~5 columns on desktop) */}
          <div className={`lg:col-span-5 relative w-full h-[380px] sm:h-[460px] lg:h-[560px] rounded-sm overflow-hidden shadow-xl border border-border/80 ${isAr ? 'lg:order-2' : 'lg:order-2'}`}>
            <Image
              src="https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&w=1200&q=80"
              alt={messages.imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
              className="object-cover object-center transform hover:scale-102 transition-transform duration-700 ease-out"
            />
            {/* Subtle luxury gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-signature/30 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
