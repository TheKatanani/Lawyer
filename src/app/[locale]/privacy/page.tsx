import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SupportedLocale } from '@/server/types';
import { buildPageMetadata } from '@/lib/seo';
import { FIRM_DETAILS } from '@/config/compliance';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const currentLocale = (locale === 'en' ? 'en' : 'ar') as SupportedLocale;
  const isAr = currentLocale === 'ar';

  return buildPageMetadata({
    locale: currentLocale,
    path: '/privacy',
    title: isAr ? 'سياسة الخصوصية وحماية البيانات الشخصية' : 'Privacy Notice & Data Protection',
    description: isAr
      ? 'إشعار الخصوصية وحماية البيانات الشخصية المُعدّ وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL) وضوابط سدايا.'
      : 'Privacy notice and personal data protection safeguards aligned with the Saudi Personal Data Protection Law (PDPL).',
  });
}

export default async function PrivacyPage({
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
            {isAr ? 'الامتثال النظامي' : 'Regulatory Compliance'}
          </span>
          <h1 className="font-heading-ar font-bold text-ink text-3xl sm:text-5xl">
            {isAr
              ? 'إشعار الخصوصية وحماية البيانات الشخصية (PDPL)'
              : 'Privacy Notice & Data Protection Policy (PDPL)'}
          </h1>
          <p className="text-muted text-sm">
            {isAr
              ? 'مُعدّ وفقاً لنظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19) ولائحته التنفيذية بالمملكة العربية السعودية.'
              : 'Formulated in accordance with the Saudi Personal Data Protection Law (Royal Decree No. M/19) and Executive Regulations.'}
          </p>
        </div>

        <div className="p-8 bg-surface rounded-sm border border-border/80 shadow-xs space-y-8 text-ink text-sm sm:text-base leading-relaxed">
          {/* 1. Controller Identity */}
          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '1. جهة التحكم في البيانات' : '1. Data Controller Identity'}
            </h2>
            <p className="text-muted">
              {isAr
                ? `تُعد ${FIRM_DETAILS.nameAr}، ومقرها مدينة ${FIRM_DETAILS.cityAr} بالمملكة العربية السعودية، هي "جهة التحكم" المسؤولة عن معالجة بياناتك الشخصية التي تُجمع عبر هذا الموقع الإلكتروني.`
                : `${FIRM_DETAILS.nameEn}, headquartered in ${FIRM_DETAILS.cityEn}, Kingdom of Saudi Arabia, acts as the designated Data Controller responsible for processing personal data submitted across this website.`}
            </p>
          </div>

          {/* 2. Categories Collected */}
          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '2. فئات البيانات الشخصية التي نجمعها' : '2. Categories of Personal Data Collected'}
            </h2>
            <ul className="list-disc list-inside space-y-1 text-muted">
              <li>{isAr ? 'بيانات الهوية والتواصل: الاسم الكامل، رقم الجوال بصيغة E.164 الدولية، والبريد الإلكتروني.' : 'Identity & Contact Data: Full name, international phone number (E.164), and email address.'}</li>
              <li>{isAr ? 'البيانات التجارية: اسم المنشأة والصفة المهنية للممثل في طلبات الشركات.' : 'Commercial Data: Company name and corporate representative title for enterprise inquiries.'}</li>
              <li>{isAr ? 'بيانات الاستفسار: موضوع الاستشارة العامة ونوع الخدمة المطلوبة.' : 'Inquiry Scope: General matter summary and practice area selection.'}</li>
              <li>{isAr ? 'البيانات التقنية والأمنية: بصمة مجزأة (Hash) لعنوان الشبكة وتوقيت الإرسال لمنع الهجمات الإلكترونية.' : 'Technical Security Telemetry: Cryptographically hashed network identifier and timestamps for DDoS prevention.'}</li>
            </ul>
          </div>

          {/* 3. Purpose & Legal Basis */}
          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '3. الغرض والمسوغ النظامي للمعالجة' : '3. Purpose & Lawful Basis of Processing'}
            </h2>
            <p className="text-muted">
              {isAr
                ? 'تُعالج البيانات الشخصية استناداً إلى موافقتك الصريحة عند تقديم الطلب، ولغرض التحقق المبدئي من خلو التمثيل من تعارض المصالح وفق لوائح الهيئة السعودية للمحامين، والرد على استفسارك وتنسيق الموعد الاستشاري.'
                : 'Personal data is processed based upon your explicit consent and legitimate interests to conduct pre-engagement conflict-of-interest checks and coordinate initial legal consultations.'}
            </p>
          </div>

          {/* 4. Cross-border & Processors */}
          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '4. معالجة البيانات ونقلها عبر الحدود' : '4. Processing & Cross-Border Data Transfer Safeguards'}
            </h2>
            <p className="text-muted">
              {isAr
                ? 'تلتزم الشركة بضوابط نقل البيانات الشخصية خارج المملكة الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا). تُحفظ قواعد البيانات في خوادم سحابية آمنة في النطاق الجغرافي المعتمد، ولا يتم تمرير مستندات القضايا السرية عبر خوادم عامة غير مشفرة.'
                : 'The firm strictly adheres to the Cross-Border Data Transfer Regulations issued by SDAIA. Database repositories are provisioned within approved cloud regions (GCP me-central1 / Dammam).'}
            </p>
          </div>

          {/* 5. Rights under PDPL */}
          <div className="space-y-3">
            <h2 className="font-heading-ar font-bold text-xl text-ink">
              {isAr ? '5. حقوق صاحب البيانات الشخصية' : '5. Data Subject Rights Under Saudi PDPL'}
            </h2>
            <p className="text-muted">
              {isAr
                ? 'بموجب نظام حماية البيانات الشخصية، يحق لك: العلم بمسوغ المعالجة، الوصول إلى بياناتك الشخصية وطلب نسخة منها، طلب تصحيحها أو تحديثها، وطلب إتلافها متى ما انتهى الغرض من جمعها ما لم يُلزمنا النظام بحفظها لمدد نظامية محددة.'
                : 'Under the Saudi PDPL, you hold the right to be informed, access and request copies of your personal data, rectify inaccuracies, and request destruction when the processing purpose concludes.'}
            </p>
          </div>

          {/* 6. Contact DPO */}
          <div className="p-6 bg-canvas rounded-sm border border-border space-y-2">
            <h3 className="font-heading-ar font-bold text-sm text-ink">
              {isAr ? 'التواصل بشأن حماية البيانات' : 'Privacy Inquiries & Data Protection Contact'}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {isAr
                ? `لممارسة حقوقك أو لتقديم أي استفسار حول سياسة الخصوصية، يرجى مراسلة مسؤول حماية البيانات عبر البريد: ${FIRM_DETAILS.email}`
                : `To exercise your statutory rights or submit a privacy inquiry, contact our Data Protection Officer at: ${FIRM_DETAILS.email}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
