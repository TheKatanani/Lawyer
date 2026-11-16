import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Scale, ShieldCheck, Building2, BookOpen, ArrowUpRight, Compass, Target } from 'lucide-react';
import { store, INITIAL_SETTINGS } from '@/server/db/store';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const isAr = locale === 'ar';
  const settings = store.siteSettings || INITIAL_SETTINGS;

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Breadcrumb & Title */}
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold-ink uppercase tracking-wider">
              <span>{isAr ? 'عن الشركة' : 'About Firm'}</span>
              <span>/</span>
              <span>{isAr ? 'الرؤية والمنهجية' : 'Vision & Principles'}</span>
            </div>
            <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl leading-tight">
              {isAr
                ? (settings.aboutVisionAr || 'شريك قانوني يقوم على الرصانة والمعرفة النظامية العميقة')
                : (settings.aboutVisionEn || 'A Legal Partner Grounded in Diligence and Regulatory Depth')}
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed">
              {isAr
                ? (settings.aboutTextAr || 'تأسست شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية بالرياض لتقديم خدمات التمثيل القضائي والمشورة الإستراتيجية للمنشآت والأفراد، مع التزام مهني صارم بأعلى معايير الحوكمة والنزاهة.')
                : (settings.aboutTextEn || 'Riyadh Mohammed Alzahrani Legal Company was established in Riyadh to provide authoritative advocacy and strategic legal counsel for enterprises and individuals under strict standards of integrity.')}
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Image Grid with Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <ScrollReveal direction={isAr ? 'left' : 'right'} delay={100}>
              <div className="relative h-[380px] sm:h-[480px] rounded-sm overflow-hidden border border-border shadow-sm group">
                <Image
                  src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"
                  alt="Riyadh Architecture"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-signature/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500" />
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction={isAr ? 'right' : 'left'} delay={200}>
              <div className="p-6 bg-surface rounded-sm border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-3">
                <div className="flex items-center gap-3 text-gold-ink font-heading-ar font-bold text-lg">
                  <Target className="w-5 h-5 text-gold" />
                  <h3>{isAr ? 'رسالتنا المؤسسية' : 'Our Corporate Mission'}</h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {isAr
                    ? (settings.aboutMissionAr || 'تقديم خدمات واستشارات قانونية رصينة تحمي مصالح الموكلين وتعزز استدامة الأعمال وفق الأنظمة القضائية والتجارية السعودية.')
                    : (settings.aboutMissionEn || 'Delivering authoritative legal advisory that safeguards client interests and fosters corporate sustainability under Saudi legal frameworks.')}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction={isAr ? 'right' : 'left'} delay={300}>
              <div className="p-6 bg-surface rounded-sm border border-border/80 hover:border-gold/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-3">
                <div className="flex items-center gap-3 text-gold-ink font-heading-ar font-bold text-lg">
                  <Compass className="w-5 h-5 text-gold" />
                  <h3>{isAr ? 'الترخيص والاعتماد النظامي' : 'Official Licensing & Accreditation'}</h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {isAr
                    ? 'تمارس الشركة أعمالها بموجب تراخيص رسمية معتمدة من وزارة العدل بالمملكة العربية السعودية، ونخبة محامين مسجلين بالهيئة السعودية للمحامين.'
                    : 'The practice operates under formal accreditation from the Saudi Ministry of Justice, with advocates certified by the Saudi Bar Association.'}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Strategic Pillars */}
        <div className="pt-8 border-t border-border space-y-8">
          <ScrollReveal direction="up">
            <h2 className="font-heading-ar font-bold text-ink text-2xl sm:text-3xl">
              {isAr ? 'منهجيتنا في تقديم الحلول القانونية' : 'Our Legal Advisory Framework'}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={100}>
              <div className="p-6 bg-surface rounded-sm border border-border hover:border-gold/70 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 space-y-3 h-full">
                <span className="font-heading-ar font-bold text-gold text-2xl">01</span>
                <h3 className="font-heading-ar font-bold text-ink text-lg">
                  {isAr ? 'الفهم العميق لبيئة الأعمال' : 'Commercial Context Mastery'}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {isAr
                    ? 'دراسة واقع السوق السعودي واللوائح التنفيذية الصادرة عن الهيئات الحكومية لضمان جدوى المشورة نظامياً وتجارياً.'
                    : 'Mastery of Saudi market realpolitik and ministerial bylaws ensures practical, commercially viable legal outcomes.'}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="p-6 bg-surface rounded-sm border border-border hover:border-gold/70 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 space-y-3 h-full">
                <span className="font-heading-ar font-bold text-gold text-2xl">02</span>
                <h3 className="font-heading-ar font-bold text-ink text-lg">
                  {isAr ? 'الوضوح والشفافية' : 'Objective Clarity'}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {isAr
                    ? 'تقديم تقييم موضوعي وصادق للموقف القضائي أو التعاقدي دون إعطاء وعود غير واقعية أو ضمانات وهمية.'
                    : 'Delivering unvarnished risk assessments without hyperbolic promises or unfounded guarantees of court outcomes.'}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <div className="p-6 bg-surface rounded-sm border border-border hover:border-gold/70 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 space-y-3 h-full">
                <span className="font-heading-ar font-bold text-gold text-2xl">03</span>
                <h3 className="font-heading-ar font-bold text-ink text-lg">
                  {isAr ? 'الاستدامة والوقاية النظامية' : 'Regulatory Prevention'}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {isAr
                    ? 'صياغة العقود ولوائح الحوكمة بطريقة وقائية تحمي المنشأة من نشوء النزاعات المستقبلية وتقلل مخاطر التقاضي.'
                    : 'Drafting preemptive charters and agreements designed to inoculate enterprises against protracted litigation.'}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* CTA Banner */}
        <ScrollReveal direction="up" delay={150}>
          <div className="p-8 sm:p-12 rounded-sm bg-signature text-on-dark flex flex-col md:flex-row items-center justify-between gap-6 border border-gold/30 shadow-lg hover:border-gold/60 transition-all duration-300">
            <div className="space-y-2 text-center md:text-start">
              <h3 className="font-heading-ar font-bold text-2xl text-on-dark">
                {isAr ? 'هل تحتاج إلى استشارة متخصصة؟' : 'Require Specialized Legal Counsel?'}
              </h3>
              <p className="text-on-dark/70 text-sm max-w-xl">
                {isAr
                  ? 'فريقنا مستعد لدراسة طلبك وتنسيق جلسة استشارية أولية مع المحامي المختص.'
                  : 'Our legal team is available to evaluate your request and coordinate an initial consultation.'}
              </p>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-signature font-bold text-sm rounded-sm hover:bg-gold/90 hover:scale-105 transition-all flex-shrink-0 group"
            >
              <span>{isAr ? 'تواصل معنا الآن' : 'Contact Us'}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
