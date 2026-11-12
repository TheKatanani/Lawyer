import React from 'react';
import { FileText, SearchCheck, FileSignature, CheckCircle2 } from 'lucide-react';

interface JourneySectionProps {
  locale: string;
  messages: {
    eyebrow: string;
    heading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
}

export function JourneySection({ locale, messages }: JourneySectionProps) {
  const isAr = locale === 'ar';
  const steps = [
    { title: messages.step1Title, desc: messages.step1Desc, icon: <FileText className="w-5 h-5 text-gold-ink" /> },
    { title: messages.step2Title, desc: messages.step2Desc, icon: <SearchCheck className="w-5 h-5 text-gold-ink" /> },
    { title: messages.step3Title, desc: messages.step3Desc, icon: <FileSignature className="w-5 h-5 text-gold-ink" /> },
    { title: messages.step4Title, desc: messages.step4Desc, icon: <CheckCircle2 className="w-5 h-5 text-gold-ink" /> },
  ];

  return (
    <section className="py-20 lg:py-24 bg-surface border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
            {messages.eyebrow}
          </span>
          <h2 className="font-heading-ar font-bold text-ink text-3xl sm:text-4xl">
            {messages.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative p-6 bg-canvas rounded-sm border border-border/80 flex flex-col justify-between space-y-4 hover:shadow-sm transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-sm bg-surface border border-border flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="font-heading-ar font-bold text-lg text-ink">
                  {step.title}
                </h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
