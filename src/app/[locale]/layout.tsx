import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteSettings } from '@/server/db/dal';

export const dynamic = 'force-dynamic';
import { DEFAULT_OG_IMAGE_PATH, getSiteUrl, resolveAbsoluteAssetUrl } from '@/lib/seo';
import '@/app/globals.css';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = locale === 'ar';
  const siteUrl = getSiteUrl();
  const settings = await getSiteSettings();
  const ogImage = resolveAbsoluteAssetUrl(
    settings.ogImageUrl || DEFAULT_OG_IMAGE_PATH,
    siteUrl
  );

  return {
    title: {
      template: isAr ? `%s | ${settings.brandNameAr}` : `%s | ${settings.brandNameEn}`,
      default: isAr ? settings.seoTitleAr : settings.seoTitleEn,
    },
    description: isAr ? settings.seoDescAr : settings.seoDescEn,
    icons: settings.faviconUrl ? [{ rel: 'icon', url: settings.faviconUrl }] : undefined,
    openGraph: {
      title: isAr ? settings.seoTitleAr : settings.seoTitleEn,
      description: isAr ? settings.seoDescAr : settings.seoDescEn,
      images: [{ url: ogImage, width: 1200, height: 630, alt: isAr ? settings.brandNameAr : settings.brandNameEn }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isAr ? settings.seoTitleAr : settings.seoTitleEn,
      description: isAr ? settings.seoDescAr : settings.seoDescEn,
      images: [ogImage],
    },
    metadataBase: new URL(siteUrl),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const isAr = locale === 'ar';
  const settings = await getSiteSettings();

  const headerMessages = {
    brandName: isAr
      ? settings.brandNameAr || (messages.common as any)?.brandName || 'شركة رياض محمد الزهراني للمحاماة'
      : settings.brandNameEn || (messages.common as any)?.brandName || 'Riyadh Alzahrani Law Firm',
    brandShort: isAr
      ? settings.brandShortAr || (messages.common as any)?.brandShort || 'رياض الزهراني للمحاماة'
      : settings.brandShortEn || (messages.common as any)?.brandShort || 'RMA Legal',
    navHome: (messages.nav as any)?.home || 'الرئيسية',
    navAbout: (messages.nav as any)?.about || 'عن الشركة',
    navServices: (messages.nav as any)?.services || 'الخدمات',
    navTeam: (messages.nav as any)?.team || 'فريق العمل',
    navInsights: (messages.nav as any)?.insights || 'المدونة المعرفية',
    navContact: (messages.nav as any)?.contact || 'تواصل معنا',
    navConsultation: (messages.nav as any)?.consultation || 'طلب استشارة',
    contactUs: (messages.common as any)?.contactUs || 'تواصل معنا',
    requestConsultation: (messages.nav as any)?.consultation || 'طلب استشارة',
    languageSwitchLabel: (messages.common as any)?.language || 'English',
    targetLocale: isAr ? 'en' : 'ar',
  };

  const footerSettings = {
    brandName: isAr ? settings.brandNameAr : settings.brandNameEn,
    brandShort: isAr ? settings.brandShortAr : settings.brandShortEn,
    footerDesc: isAr ? settings.footerSummaryAr : settings.footerSummaryEn,
    address: isAr ? settings.addressAr : settings.addressEn,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    website: settings.website,
    websiteUrl: settings.websiteUrl,
    licenseNote: isAr ? settings.footerLicenseNoteAr : settings.footerLicenseNoteEn,
    pdplNotice: isAr ? settings.footerPdplNoticeAr : settings.footerPdplNoticeEn,
  };

  return (
    <html lang={locale} dir={isAr ? 'rtl' : 'ltr'}>
      <body className="min-h-screen flex flex-col antialiased selection:bg-gold/20 selection:text-ink">
        <a href="#main-content" className="skip-link">
          {(messages.common as any)?.skipToContent || 'Skip to content'}
        </a>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header locale={locale} messages={headerMessages} />
          <main id="main-content" className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer locale={locale} settings={footerSettings} />
        </NextIntlClientProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LegalService',
              name: isAr ? settings.brandNameAr : settings.brandNameEn,
              alternateName: isAr ? settings.brandShortAr : settings.brandShortEn,
              description: isAr ? settings.taglineAr : settings.taglineEn,
              url: settings.websiteUrl || 'https://www.riyadhalzahrani.com',
              telephone: settings.phone,
              email: settings.email,
              address: {
                '@type': 'PostalAddress',
                streetAddress: isAr ? settings.addressAr : settings.addressEn,
                addressLocality: isAr ? (settings.cityAr || '') : (settings.cityEn || ''),
                addressCountry: 'SA',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
