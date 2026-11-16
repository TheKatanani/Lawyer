'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Scale, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

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
      {/* Decorative luxury architectural grid lines in background */}
      <div className="absolute inset-0 bg-[radial-gradient(#A28248_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px] lg:min-h-[660px]">
          {/* Text Content: 55% (~7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Eyebrow badge */}
            <ScrollReveal direction="down" delay={100}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-gold/40 text-gold-ink text-xs font-semibold w-fit shadow-xs hover:border-gold transition-colors duration-300">
                <Scale className="w-3.5 h-3.5 text-gold" />
                <span>{messages.eyebrow}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              </div>
            </ScrollReveal>

            {/* Master Headline with Noto Naskh Arabic */}
            <ScrollReveal direction="up" delay={220}>
              <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl lg:text-[3.25rem] leading-[1.2] lg:leading-[1.25] tracking-tight">
                {messages.heading}
              </h1>
            </ScrollReveal>

            {/* Explanatory description */}
            <ScrollReveal direction="up" delay={360}>
              <p className="text-muted text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                {messages.description}
              </p>
            </ScrollReveal>

            {/* Dual CTA Group */}
            <ScrollReveal direction="up" delay={480}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href={`/${locale}/services`}
                  className="relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-sm bg-ink text-on-dark text-base font-semibold hover:bg-signature transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group overflow-hidden"
                >
                  <span className="relative z-10">{messages.ctaPrimary}</span>
                  <ArrowUpRight className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isAr ? 'group-hover:-translate-x-1 group-hover:-translate-y-1' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </Link>
                <Link
                  href={`/${locale}/consultation`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-sm bg-surface border border-border text-ink text-base font-semibold hover:border-gold hover:bg-canvas transition-all duration-300 hover:-translate-y-0.5 shadow-xs"
                >
                  <span>{messages.ctaSecondary}</span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Trust badge */}
            <ScrollReveal direction="up" delay={600}>
              <div className="pt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted font-medium border-t border-border/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-ink flex-shrink-0" />
                  <span>{isAr ? 'امتثال تام لنظام المحاماة السعودي' : 'Full Compliance with Saudi Legal Regulations'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span>{isAr ? 'سرية مهنية وحوكمة موثوقة' : 'Strict Professional Confidentiality'}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Visual Architecture Asset: 45% (~5 columns on desktop) */}
          <div className="lg:col-span-5">
            <ScrollReveal direction={isAr ? 'right' : 'left'} delay={300}>
              <div className="group relative w-full h-[380px] sm:h-[460px] lg:h-[560px] rounded-sm overflow-hidden shadow-xl border border-border/80 hover:border-gold/50 transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&w=1200&q=80"
                  alt={messages.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
                  className="object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                {/* Subtle luxury gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-signature/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Interactive Credential Badge */}
                <div className="absolute bottom-5 inset-x-5 p-4 rounded-sm bg-surface/95 backdrop-blur-md border border-border/80 shadow-lg flex items-center justify-between gap-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-signature text-gold flex items-center justify-center flex-shrink-0 border border-gold/40">
                      <Scale className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-ink block leading-tight">
                        {isAr ? 'شركة محاماة مرخصة رسمياً' : 'Officially Licensed Saudi Legal Firm'}
                      </span>
                      <span className="text-[10px] text-muted font-mono block mt-0.5">
                        {isAr ? 'ترخيص وزارة العدل رقم 4112' : 'MOJ License No. 4112 · SBA Member'}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
