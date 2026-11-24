'use client';

import React from 'react';
import { Quote, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface LeadershipMessageProps {
  locale: string;
}

export function LeadershipMessage({ locale }: LeadershipMessageProps) {
  const isAr = locale === 'ar';

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
                {isAr ? 'كلمة القيادة' : 'Leadership Message'}
              </span>
            </div>

            <div className="space-y-6 text-ink leading-relaxed">
              <h2 className="font-heading-ar font-bold text-2xl sm:text-3xl lg:text-4xl text-ink leading-snug">
                {isAr
                  ? 'يقوم العمل القانوني في جوهره على الثقة: ثقة الموكل بأن مصالحه في أيدٍ أمينة، وبأن كل ما يقع بين أيدينا يبقى في دائرة السرية التامة.'
                  : 'Legal practice rests on trust: the client’s trust that their interests are in safe hands, and that everything they share with us remains strictly confidential.'}
              </h2>

              <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                {isAr
                  ? 'على مدى أكثر من عشرين عامًا في التقاضي والتحكيم والصياغة النظامية، تعلّمنا أن القضايا لا تُكسب بكثرة الأوراق، بل بوضوح المركز القانوني وسلامة الإجراء. ولذلك نبدأ كل ملف بسؤال واحد: ما الذي يمكن إثباته، وكيف؟'
                  : 'Over more than twenty years in litigation, arbitration and legislative drafting, we have learned that cases are not won by the weight of their files, but by the clarity of the legal position and the soundness of the procedure. So every matter begins with one question: what can be proven, and how?'}
              </p>

              <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                {isAr
                  ? 'يأتينا الموكل أحيانًا في أصعب لحظاته: متهماً يبحث عن دفاع عادل، أو أسرة يمزقها خلاف، أو منشأة يهدد النزاع استمرارها. ومسؤوليتنا أن نمنحه رأياً صادقاً لا مجاملة فيه، ومساراً واضحاً يعرف فيه خياراته وكلفتها.'
                  : 'Clients often come to us at their most difficult moments — accused and seeking a fair defence, a family divided by conflict, a business whose future is threatened by a dispute. Our duty is to give them candid advice, without flattery, and a clear path on which they understand their options and what each will cost.'}
              </p>

              <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                {isAr
                  ? 'ونؤمن بأن أفضل نزاع هو الذي لم يقع؛ لذلك نعمل مع عملائنا على الوقاية بقدر ما نعمل على المعالجة، في العقود والقرارات والحوكمة. نتشرف بثقتكم، ونتطلع إلى أن نكون شريككم القانوني في كل مرحلة.'
                  : 'We believe the best dispute is the one that never arises; so we work with our clients on prevention as much as on resolution — in their contracts, their decisions and their governance. We are honoured by your trust, and look forward to serving as your legal partner at every stage.'}
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading-ar font-bold text-xl text-ink">
                  {isAr ? 'المستشار رياض بن محمد الزهراني' : 'Counselor Riyadh Mohammed Alzahrani'}
                </h3>
                <p className="text-gold-ink text-sm font-semibold">
                  {isAr
                    ? 'الشريك المؤسس والمدير العام · محكم تجاري دولي معتمد'
                    : 'Founding & Managing Partner · Certified International Commercial Arbitrator'}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-gold/40 text-xs font-semibold text-ink">
                <ShieldCheck className="w-4 h-4 text-gold-ink" />
                <span>{isAr ? 'خبرة تتجاوز 20 عاماً' : '20+ Years Experience'}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
