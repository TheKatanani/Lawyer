import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { store } from '@/server/db/store';
import '@/app/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = locale === 'ar';
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://rma-law.sa';
  const settings = store.siteSettings;

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
      images: settings.ogImageUrl ? [{ url: settings.ogImageUrl, width: 1200, height: 630 }] : undefined,
    },
    metadataBase: new URL(origin),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: '/ar',
        en: '/en',
        'x-default': '/ar',
      },
    },
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

  const headerMessages = {
    brandName: (messages.common as any)?.brandName || 'شركة رياض محمد الزهراني للمحاماة',
    brandShort: (messages.common as any)?.brandShort || 'رياض الزهراني للمحاماة',
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
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
