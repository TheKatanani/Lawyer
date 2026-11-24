'use client';

import React from 'react';
import { Award, FileCheck2, ShieldAlert, Lock, MessagesSquare, CheckCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface InstitutionalExcellenceProps {
  locale: string;
}

export function InstitutionalExcellence({ locale }: InstitutionalExcellenceProps) {
  const isAr = locale === 'ar';

  const pillars = [
    {
      titleAr: 'منهجية دراسة القضية',
      titleEn: 'Case Study Method',
      descAr: 'مذكرة دراسة أولية لكل ملف: الوقائع، والتكييف، والأدلة، والمخاطر، والخيارات المتاحة.',
      descEn: 'An initial study memo for every matter: facts, characterisation, evidence, risks and options.',
      icon: <FileCheck2 className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'إدارة المخاطر',
      titleEn: 'Risk Management',
      descAr: 'تقييم المخاطر القانونية والمالية والإجرائية لكل مسار قبل اتخاذ القرار الاستراتيجي.',
      descEn: 'Assessing the legal, financial and procedural risks of each route before a decision is taken.',
      icon: <ShieldAlert className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'السرية وحماية البيانات',
      titleEn: 'Confidentiality & Data Protection',
      descAr: 'التزام صارم بالسر المهني وبنظام حماية البيانات الشخصية (PDPL)، وقصر الاطلاع على الفريق المكلف، وفحص تعارض المصالح قبل قبول التكليف.',
      descEn: 'Professional secrecy and compliance with the Personal Data Protection Law (PDPL); access limited to the assigned team; conflict checks before any engagement.',
      icon: <Lock className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'معايير التواصل مع العملاء',
      titleEn: 'Client Communication Standards',
      descAr: 'تحديث دوري بعد كل إجراء، ورد على الاستفسارات في وقت معلوم، ولغة قانونية واضحة يفهمها غير المتخصص.',
      descEn: 'Regular updates after every step, responses within a known timeframe, and language a non-specialist understands.',
      icon: <MessagesSquare className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'جودة الخدمة القانونية',
      titleEn: 'Quality of Legal Service',
      descAr: 'مراجعة ثانية مستقلة لكل مذكرة وعقد قبل تقديمه، ومتابعة للمواعيد والمهل النظامية عبر سجل موحد.',
      descEn: 'A second review of every submission and contract before it is filed, and statutory deadlines tracked in a single register.',
      icon: <CheckCheck className="w-5 h-5 text-gold" />,
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-canvas border-b border-border/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" />
              <span>{isAr ? 'لماذا يختارنا العملاء؟' : 'Why Clients Choose Us'}</span>
            </span>
            <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl lg:text-5xl leading-tight">
              {isAr ? 'التميز المؤسسي' : 'Institutional Excellence'}
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
              {isAr
                ? 'خبرة تمتد لأكثر من عشرين عاماً، ومنهج مكتوب، ورأي صادق، وتواصل مباشر مع من يتولى الملف.'
                : 'More than twenty years of experience, a written method, candid advice and direct contact with the person handling the matter.'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {pillars.map((p, idx) => (
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
                  {isAr ? p.titleAr : p.titleEn}
                </h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed font-normal">
                  {isAr ? p.descAr : p.descEn}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
