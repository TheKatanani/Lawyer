'use client';

import React from 'react';
import { Compass, CheckCircle2, Shield, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface MethodologySectionProps {
  locale: string;
}

export function MethodologySection({ locale }: MethodologySectionProps) {
  const isAr = locale === 'ar';

  const steps = [
    {
      num: '01',
      titleAr: 'التشخيص قبل الرأي',
      titleEn: 'Diagnosis Before Opinion',
      descAr: 'لا نقدم رأياً قبل فهم الوقائع كاملة وتكييفها نظامياً؛ فالتكييف الخاطئ يقود إلى طريق خاطئ مهما أُتقن السير فيه.',
      descEn: 'We give no opinion until the facts are fully understood and characterised in law; a mistaken characterisation leads down the wrong path however skillfully walked.',
    },
    {
      num: '02',
      titleAr: 'الإثبات قبل المرافعة',
      titleEn: 'Proof Before Pleading',
      descAr: 'نحدد عبء الإثبات ووسائله مبكراً، ونحفظ الدليل في وقته، لأن المرافعة القوية لا تعوّض دليلاً غائباً.',
      descEn: 'We establish the burden and means of proof early, and preserve evidence in time; strong advocacy cannot make up for missing proof.',
    },
    {
      num: '03',
      titleAr: 'الإجراء جزء من الحق',
      titleEn: 'Procedure is Part of the Right',
      descAr: 'نفحص الاختصاص والمواعيد وسلامة الإجراءات بالعناية نفسها التي نفحص بها موضوع النزاع.',
      descEn: 'We examine jurisdiction, time limits and procedural integrity with the same care we give to the merits.',
    },
    {
      num: '04',
      titleAr: 'الخيارات قبل القرار',
      titleEn: 'Options Before Decision',
      descAr: 'نعرض على الموكل البدائل القضائية والتفاوضية بكلفتها ومخاطرها، ونترك له القرار على بيّنة تامة.',
      descEn: 'We present litigation and negotiation alternatives with their costs and risks, leaving the client to decide with eyes open.',
    },
    {
      num: '05',
      titleAr: 'الوقاية قبل النزاع',
      titleEn: 'Prevention Before Dispute',
      descAr: 'نصوغ العقود والسياسات بعين من يتوقع النزاع، حتى لا يقع، أو يقع والموكل في أقوى مراكزه القانونية.',
      descEn: 'We draft contracts and policies with the foresight of dispute, so that none arises — or if it does, the client stands in the strongest position.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-canvas border-b border-border/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-gold" />
              <span>{isAr ? 'فلسفتنا ومنهجنا' : 'Our Philosophy & Method'}</span>
            </span>
            <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl lg:text-5xl leading-tight">
              {isAr
                ? 'القضية لا تُقاس بحجم مستنداتها، بل بقوة مركزها القانوني وسلامة بنائها الإجرائي'
                : 'A case is measured not by the volume of its documents, but by the strength of its legal position and procedural soundness'}
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
              {isAr
                ? 'منهج عمل مكتوب ومحدد من 5 مراحل إجرائية يضمن وضوح المسار، وتجنب المفاجآت، وتحقيق أعلى معايير الحماية القانونية.'
                : 'A structured, written 5-stage method ensuring complete clarity, eliminating surprises, and maintaining rigorous legal safeguards.'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {steps.map((s, idx) => (
            <ScrollReveal
              key={s.num}
              direction="up"
              delay={idx * 100}
              className={idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <div className="group p-8 rounded-sm bg-surface border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-2xl text-gold-ink/80 group-hover:text-gold transition-colors">
                      {s.num}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                  </div>

                  <h3 className="font-heading-ar font-bold text-ink text-xl group-hover:text-gold-ink transition-colors">
                    {isAr ? s.titleAr : s.titleEn}
                  </h3>

                  <p className="text-muted text-sm leading-relaxed font-normal">
                    {isAr ? s.descAr : s.descEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-gold-ink">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  <span>{isAr ? `المرحلة ${s.num} من المنهج` : `Stage ${s.num} Protocol`}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
