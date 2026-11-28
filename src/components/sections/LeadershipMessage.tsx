'use client';

import React from 'react';
import { Quote, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export interface LeadershipMessageContent {
  eyebrow: string;
  quote: string;
  body1: string;
  body2: string;
  body3: string;
  author: string;
  role: string;
  experienceBadge: string;
}

interface LeadershipMessageProps {
  locale?: string;
  content: LeadershipMessageContent;
}

export function LeadershipMessage({ content }: LeadershipMessageProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-surface border-y border-border/70 relative overflow-hidden">
      {/* Decorative luxury architectural grid lines in background */}
      <div className="absolute inset-0 bg-[radial-gradient(#A28248_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal direction="up">
          <div className="p-8 sm:p-12 lg:p-16 rounded-sm bg-canvas border border-border/90 shadow-md relative">
            <div className="flex items-center gap-3 mb-6">
              <Quote className="w-8 h-8 text-gold flex-shrink-0 opacity-80" />
              <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
                {content.eyebrow}
              </span>
            </div>

            <div className="space-y-6 text-ink leading-relaxed">
              <h2 className="font-heading-ar font-bold text-2xl sm:text-3xl lg:text-4xl text-ink leading-snug">
                {content.quote}
              </h2>

              {content.body1 && (
                <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                  {content.body1}
                </p>
              )}

              {content.body2 && (
                <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                  {content.body2}
                </p>
              )}

              {content.body3 && (
                <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                  {content.body3}
                </p>
              )}
            </div>

            <div className="pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading-ar font-bold text-xl text-ink">
                  {content.author}
                </h3>
                <p className="text-gold-ink text-sm font-semibold">
                  {content.role}
                </p>
              </div>

              {content.experienceBadge && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-gold/40 text-xs font-semibold text-ink">
                  <ShieldCheck className="w-4 h-4 text-gold-ink" />
                  <span>{content.experienceBadge}</span>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
