'use client';

import React from 'react';
import { Shield, Building2, Users, Layers, AlertTriangle, Globe, FileText, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';

interface SpecialisedServicesProps {
  locale: string;
}

export function SpecialisedServices({ locale }: SpecialisedServicesProps) {
  const isAr = locale === 'ar';

  const services = [
    {
      titleAr: 'خدمات كبار العملاء',
      titleEn: 'Private Client Services',
      descAr: 'خدمة قانونية خاصة لرجال الأعمال وأصحاب الثروات، بتواصل مباشر مع القيادة، ومتابعة شخصية، وأعلى درجات التحفظ في كل ما يتعلق بالأصول والعلاقات والقرارات.',
      descEn: 'Dedicated counsel for business leaders and high-net-worth individuals — with direct access to leadership, personal follow-up and the utmost discretion in all matters of assets, relationships and decisions.',
      icon: <Shield className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'خدمات الشركات والمجموعات',
      titleEn: 'Corporate Groups',
      descAr: 'دعم قانوني متكامل للمجموعات متعددة الكيانات: هيكلة العلاقات بين الشركات التابعة، وتوحيد العقود والسياسات، وإدارة منازعات المجموعة من مركز واحد.',
      descEn: 'Integrated support for multi-entity groups: structuring relationships between subsidiaries, standardising contracts and policies, and managing group disputes from a single point.',
      icon: <Building2 className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'إدارة الثروات العائلية',
      titleEn: 'Family Wealth Management',
      descAr: 'تنظيم الأصول العائلية عبر الشركات القابضة والأوقاف والمواثيق العائلية، بما يدعم انتقال الثروة بين الأجيال وفق الأحكام الشرعية والنظامية، دون ادعاء حماية مطلقة.',
      descEn: 'Organising family assets through holding companies, waqf and family charters, supporting the transfer of wealth across generations under Sharia and statutory rules — without claiming absolute protection.',
      icon: <Users className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'إدارة النزاعات المعقدة',
      titleEn: 'Complex Dispute Management',
      descAr: 'للنزاعات متعددة الأطراف أو الجهات أو الدول: فريق عمل موحد، وخطة نزاع مكتوبة، وتنسيق بين المسارات القضائية والتحكيمية والتفاوضية.',
      descEn: 'For disputes spanning several parties, authorities or countries: a single team, a written dispute plan, and coordination across litigation, arbitration and negotiation.',
      icon: <Layers className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'الخدمات القانونية الوقائية',
      titleEn: 'Preventive Legal Services',
      descAr: 'مراجعة دورية للعقود والقرارات والسياسات لرصد المخاطر قبل أن تتحول إلى نزاع، مع تقرير مكتوب بالتوصيات القابلة للتنفيذ.',
      descEn: 'Periodic review of contracts, decisions and policies to identify risk before it becomes a dispute, with a written report of recommendations.',
      icon: <AlertTriangle className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'المنازعات العابرة للحدود',
      titleEn: 'Cross-Border Disputes',
      descAr: 'معالجة المنازعات ذات العنصر الأجنبي، من اختيار القانون والاختصاص إلى تنفيذ الأحكام، بالتنسيق مع مختصين في الولايات القضائية الأخرى عند الحاجة.',
      descEn: 'Resolving disputes with a foreign element — from choice of law and forum to enforcement of judgments — coordinating with specialists in other jurisdictions where needed.',
      icon: <Globe className="w-5 h-5 text-gold" />,
    },
    {
      titleAr: 'الاستشارات القانونية المستمرة',
      titleEn: 'Retained Legal Advisory',
      descAr: 'اتفاقية خدمة شهرية أو سنوية توفر رأياً قانونياً سريعاً، ومراجعة للعقود، وحضوراً في القرارات المهمة، بكلفة محددة ومعروفة مسبقاً.',
      descEn: 'A monthly or annual service agreement providing prompt legal opinions, contract review and presence at key decisions, at a cost known in advance.',
      icon: <FileText className="w-5 h-5 text-gold" />,
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-border/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
              {isAr ? 'حلول مؤسسية متقدمة' : 'Institutional Solutions'}
            </span>
            <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl lg:text-5xl leading-tight">
              {isAr ? 'الخدمات المتخصصة' : 'Specialised Services'}
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
              {isAr
                ? 'حزم استشارية واستراتيجية متقدمة صُممت لتلبية متطلبات كبار العملاء والشركات القابضة والمجموعات الاستثمارية.'
                : 'Advanced strategic counsel designed for private clients, holding companies and multi-entity corporate groups.'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {services.map((s, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={idx * 80}
              className={idx === 6 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <div className="p-7 rounded-sm bg-canvas border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="w-10 h-10 rounded-sm bg-surface border border-border flex items-center justify-center">
                    {s.icon}
                  </div>
                  <h3 className="font-heading-ar font-bold text-ink text-lg">
                    {isAr ? s.titleAr : s.titleEn}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed font-normal">
                    {isAr ? s.descAr : s.descEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <Link
                    href={`/${locale}/consultation`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-ink hover:text-gold transition-colors"
                  >
                    <span>{isAr ? 'طلب استشارة متخصصة' : 'Retain Advisory'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
