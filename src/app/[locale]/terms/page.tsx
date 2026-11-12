import React from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Scale, ShieldAlert } from 'lucide-react';

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
            {isAr ? 'الضوابط النظامية' : 'Legal Terms'}
          </span>
          <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
            {isAr ? 'الشروط والأحكام العامة للموقع' : 'Website Terms of Use & Disclaimer'}
          </h1>
          <p className="text-muted text-sm">
            {isAr ? 'آخر تحديث: 12 نوفمبر 2026' : 'Last Updated: 12 November 2026'}
          </p>
        </div>

        <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs space-y-8 text-ink text-sm sm:text-base leading-relaxed">
          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '1. عدم قيام علاقة التوكيل أو التمثيل القانوني' : '1. No Attorney-Client Relationship Established'}
            </h2>
            <p className="text-muted">
              {isAr
                ? 'إن تصفح هذا الموقع الإلكتروني، أو إرسال استفسار عبر نموذج التواصل، أو تبادل الرسائل عبر القنوات الموضحة لا يُنشئ بأي حال من الأحوال علاقة توكيل أو تمثيل قانوني بينك وبين شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية. لا تنشأ هذه العلاقة إلا بعد إتمام الفحص النظامي لتعارض المصالح وتوقيع اتفاقية أتعاب رسمية معتمدة من الطرفين.'
                : 'Visiting this website, submitting an inquiry, or communicating through listed channels does not create an attorney-client relationship. Representation commences only after completing formal conflict checks and executing a signed written engagement agreement.'}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '2. إخلاء المسؤولية عن المحتوى الإرشادي' : '2. General Information Disclaimer'}
            </h2>
            <p className="text-muted">
              {isAr
                ? 'تُقدّم المقالات والتحليلات والمعلومات المنشورة في الموقع لأغراض التوعية العامة فقط. ولا تُعد بديلاً عن استشارة قانونية مهنية تراعي وقائع ومستندات كل حالة على حدة. تخلي الشركة مسؤوليتها عن أي تصرف أو قرار يُتخذ بناءً على المحتوى العام للموقع.'
                : 'Articles, legal insights, and website content are provided for general educational purposes and do not constitute specific legal counsel tailored to your circumstances. The firm disclaims all liability for decisions made solely based on general web content.'}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '3. حقوق الملكية الفكرية' : '3. Intellectual Property Rights'}
            </h2>
            <p className="text-muted">
              {isAr
                ? 'كافة النصوص، التصاميم، الشعارات، والمقالات المنشورة في هذا الموقع مملوكة حصراً لشركة رياض محمد الزهراني للمحاماة، ومحمية بموجب أنظمة حماية حقوق المؤلف وحقوق الملكية الفكرية في المملكة العربية السعودية.'
                : 'All written materials, design tokens, trademarks, and articles on this platform are the intellectual property of Riyadh Mohammed Alzahrani Legal Company and protected under Saudi copyright statutes.'}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '4. الاختصاص القضائي والنظام الحاكم' : '4. Governing Law & Jurisdiction'}
            </h2>
            <p className="text-muted">
              {isAr
                ? 'تخضع هذه الشروط والأحكام وتُفسر وفقاً للأنظمة المعمول بها في المملكة العربية السعودية، وتختص المحاكم السعودية بمدينة الرياض بالفصل في أي نزاع قد ينشأ عنها.'
                : 'These terms are governed by the laws and regulations of the Kingdom of Saudi Arabia, and any disputes shall be adjudicated before the competent courts of Riyadh.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
