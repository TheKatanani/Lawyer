import React from 'react';
import { BookOpen, Scale, Lock } from 'lucide-react';

interface ValuesSectionProps {
  locale: string;
  messages: {
    eyebrow: string;
    heading: string;
    value1Title: string;
    value1Desc: string;
    value2Title: string;
    value2Desc: string;
    value3Title: string;
    value3Desc: string;
  };
}

export function ValuesSection({ locale, messages }: ValuesSectionProps) {
  const values = [
    {
      title: messages.value1Title,
      desc: messages.value1Desc,
      icon: <BookOpen className="w-6 h-6 text-gold" />,
    },
    {
      title: messages.value2Title,
      desc: messages.value2Desc,
      icon: <Scale className="w-6 h-6 text-gold" />,
    },
    {
      title: messages.value3Title,
      desc: messages.value3Desc,
      icon: <Lock className="w-6 h-6 text-gold" />,
    },
  ];

  return (
    <section className="py-24 bg-signature text-on-dark border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold text-gold uppercase tracking-wider">
            {messages.eyebrow}
          </span>
          <h2 className="font-heading-ar font-bold text-3xl sm:text-4xl text-on-dark">
            {messages.heading}
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-8 rounded-sm bg-on-dark/5 border border-on-dark/10 hover:border-gold/40 transition-colors duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-sm bg-signature border border-gold/40 flex items-center justify-center">
                {v.icon}
              </div>
              <h3 className="font-heading-ar font-bold text-xl text-on-dark">
                {v.title}
              </h3>
              <p className="text-on-dark/70 text-sm leading-relaxed font-normal">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
