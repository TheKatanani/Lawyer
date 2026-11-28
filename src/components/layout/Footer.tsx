import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageSquare, Shield, Scale, MapPin, Mail, Globe } from 'lucide-react';
interface FooterProps {
  locale: string;
  settings?: {
    brandName?: string;
    brandShort?: string;
    footerDesc?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    websiteUrl?: string;
    licenseNote?: string;
    pdplNotice?: string;
  };
}

export function Footer({ locale, settings }: FooterProps) {
  const isAr = locale === 'ar';
  const firmName = settings?.brandName || '';
  const shortBrand = settings?.brandShort || firmName;
  const footerDesc = settings?.footerDesc || '';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const phoneHref = phone.replace(/[^\d+]/g, '');
  const whatsapp = settings?.whatsapp || '';
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d]/g, '')}` : '#';
  const email = settings?.email || '';

  return (
    <footer className="bg-signature text-on-dark/90 border-t border-gold/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-on-dark/10">
          {/* Identity & Licensing */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 flex-shrink-0">
                <Image
                  src="/logo-gold-emblem.png"
                  alt={isAr ? 'شعار شركة رياض محمد الزهراني للمحاماة' : 'Riyadh Alzahrani Law Firm Emblem'}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-heading-ar font-bold text-base sm:text-lg text-on-dark leading-tight">
                {shortBrand}
              </span>
            </div>
            <p className="text-sm text-on-dark/70 leading-relaxed font-normal">
              {footerDesc}
            </p>
            {settings?.licenseNote && (
              <div className="flex items-center gap-2 text-xs text-gold font-medium pt-2">
                <Scale className="w-4 h-4 text-gold flex-shrink-0" />
                <span>{settings.licenseNote}</span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading-ar font-semibold text-base text-on-dark">
              {isAr ? 'المحتوى والخدمات' : 'Navigation'}
            </h3>
            <ul className="space-y-2.5 text-sm text-on-dark/70">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-gold transition-colors">
                  {isAr ? 'عن الشركة' : 'About Firm'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services`} className="hover:text-gold transition-colors">
                  {isAr ? 'مجالات الاختصاص' : 'Practice Areas'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/team`} className="hover:text-gold transition-colors">
                  {isAr ? 'فريق المحامين' : 'Our Team'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/insights`} className="hover:text-gold transition-colors">
                  {isAr ? 'المدونة المعرفية' : 'Legal Insights'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Channels */}
          <div className="space-y-4">
            <h3 className="font-heading-ar font-semibold text-base text-on-dark">
              {isAr ? 'قنوات التواصل' : 'Direct Channels'}
            </h3>
            <ul className="space-y-3 text-sm text-on-dark/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-1" />
                <span className="leading-snug">{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a href={`tel:${phoneHref}`} className="hover:text-gold transition-colors font-medium">
                  <bdi dir="ltr">{phone}</bdi>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors font-medium"
                >
                  {isAr ? 'واتساب: ' : 'WhatsApp: '}
                  <bdi dir="ltr">{whatsapp}</bdi>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-gold transition-colors">
                  {email}
                </a>
              </li>
              {settings?.websiteUrl && (
                <li className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-gold flex-shrink-0" />
                  <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                    {settings.website || settings.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Regulatory Notice & Governance */}
          <div className="space-y-4">
            <h3 className="font-heading-ar font-semibold text-base text-on-dark">
              {isAr ? 'الحوكمة والخصوصية' : 'Governance & Policy'}
            </h3>
            <p className="text-xs text-on-dark/60 leading-relaxed">
              {settings?.pdplNotice ||
                (isAr
                  ? 'تخضع كافة البيانات المقدمة لأحكام نظام حماية البيانات الشخصية السعودي (PDPL).'
                  : 'All submissions are governed under the Saudi Personal Data Protection Law (PDPL).')}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium">
              <Link href={`/${locale}/privacy`} className="text-gold hover:underline">
                {isAr ? 'سياسة الخصوصية' : 'Privacy Notice'}
              </Link>
              <span className="text-on-dark/30">|</span>
              <Link href={`/${locale}/terms`} className="text-gold hover:underline">
                {isAr ? 'الشروط والأحكام' : 'Terms of Use'}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-on-dark/50 gap-4">
          <p>
            © {new Date().getFullYear()}{' '}
            {isAr
              ? `${firmName}. جميع الحقوق محفوظة.`
              : `${firmName}. All rights reserved.`}
          </p>
          <p className="flex items-center gap-1.5 text-on-dark/60">
            <Shield className="w-3.5 h-3.5 text-gold/70" />
            <span>{isAr ? 'التزام بنظام المحاماة السعودي' : 'Saudi Legal Code of Conduct Compliant'}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
