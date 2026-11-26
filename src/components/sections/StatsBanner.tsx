'use client';

import React from 'react';
import { Award, ShieldCheck, Scale, Compass, CheckCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { UNVERIFIED_CLAIMS_CONFIG } from '@/config/compliance';

interface StatsBannerProps {
  locale: string;
}

export function StatsBanner({ locale }: StatsBannerProps) {
  const isAr = locale === 'ar';

  const stats = [
    {
      target: 20,
      prefix: '+',
      suffix: isAr ? ' عاماً' : ' Yrs',
      title: isAr ? 'خبرة رصينة متراكمة' : 'Years of Experience',
      desc: isAr ? 'في التقاضي، التحكيم، والصياغة النظامية' : 'In litigation, arbitration & legislative drafting',
      icon: <Award className="w-5 h-5 text-gold" />,
    },
    UNVERIFIED_CLAIMS_CONFIG.enableCompletedCasesCounter
      ? {
          target: 950,
          prefix: '+',
          suffix: '',
          title: isAr ? 'قضية واستشارة منجزة' : 'Matters Successfully Advised',
          desc: isAr ? 'للشركات والمستثمرين والأفراد في المملكة' : 'For corporate entities, investors & individuals',
          icon: <ShieldCheck className="w-5 h-5 text-gold" />,
        }
      : {
          target: 16,
          prefix: '',
          suffix: isAr ? ' مجالاً' : ' Areas',
          title: isAr ? 'مجال ممارسة متخصص' : 'Specialised Practice Areas',
          desc: isAr ? 'تغطية شاملة للنزاعات والمعاملات النظامية' : 'Comprehensive coverage of statutory disciplines',
          icon: <Scale className="w-5 h-5 text-gold" />,
        },
    UNVERIFIED_CLAIMS_CONFIG.enable100PercentComplianceClaim
      ? {
          target: 100,
          prefix: '',
          suffix: '%',
          title: isAr ? 'امتثال وتراخيص معتمدة' : 'MOJ Licensed & SBA Verified',
          desc: isAr ? 'ترخيص وزارة العدل وهيئة المحامين' : 'Ministry of Justice & Saudi Bar Association',
          icon: <Scale className="w-5 h-5 text-gold" />,
        }
      : {
          target: 5,
          prefix: '',
          suffix: isAr ? ' خطوات' : ' Steps',
          title: isAr ? 'منهجية العمل المعتمدة' : 'Structured Method Stages',
          desc: isAr ? 'التشخيص، الإثبات، الإجراء، الخيارات، الوقاية' : 'Diagnosis, proof, procedure, options, prevention',
          icon: <Compass className="w-5 h-5 text-gold" />,
        },
    UNVERIFIED_CLAIMS_CONFIG.enable100PercentComplianceClaim
      ? {
          target: 100,
          prefix: '',
          suffix: '%',
          title: isAr ? 'سرية وحماية بيانات' : 'Confidentiality & PDPL',
          desc: isAr ? 'سر مهني صارم ونظام حماية البيانات الشخصية' : 'Strict professional secrecy and PDPL adherence',
          icon: <CheckCircle className="w-5 h-5 text-gold" />,
        }
      : {
          target: 7,
          prefix: '',
          suffix: isAr ? ' مسارات' : ' Tracks',
          title: isAr ? 'خدمات متخصصة ومؤسسية' : 'Specialised Client Programs',
          desc: isAr ? 'لكبار العملاء والمجموعات والثروات والنزاعات' : 'Private clients, groups, family wealth & cross-border',
          icon: <CheckCircle className="w-5 h-5 text-gold" />,
        },
  ];

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
