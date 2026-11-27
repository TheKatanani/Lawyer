import type { Metadata } from 'next';
import { SupportedLocale } from '@/server/types';
import { FIRM_DETAILS } from '@/config/compliance';
import { store, INITIAL_SETTINGS } from '@/server/db/store';

export const DEFAULT_OG_IMAGE_PATH = '/images/home-hero.webp';

/**
 * Resolves the canonical public site origin from a single env variable (NEXT_PUBLIC_SITE_URL),
 * with safe fallbacks for preview/local environments.
 */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : '') ||
    process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() ||
    'https://rma-law.sa';

  return configured.replace(/\/+$/, '');
}

export function resolveAbsoluteAssetUrl(assetPath: string | undefined, baseOrigin: string): string {
  const raw = assetPath?.trim() || DEFAULT_OG_IMAGE_PATH;
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return `${baseOrigin.replace(/\/+$/, '')}${normalized}`;
}

export function buildBreadcrumbJsonLd(
  locale: SupportedLocale,
  items: Array<{ name: string; path: string }>
) {
  const isAr = locale === 'ar';
  const baseUrl = FIRM_DETAILS.websiteUrl.replace(/\/+$/, '');
  const crumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: isAr ? 'الرئيسية' : 'Home',
      item: `${baseUrl}/${locale}`,
    },
    ...items.map((item, idx) => {
      const normalized = item.path.startsWith('/') ? item.path : `/${item.path}`;
      return {
        '@type': 'ListItem',
        position: idx + 2,
        name: item.name,
        item: `${baseUrl}/${locale}${normalized}`,
      };
    }),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs,
  };
}

/**
 * Strips any accidental trailing " | Firm Name" suffix from dynamic titles so
 * LocaleLayout's title.template appends the firm name cleanly once.
 */
export function stripFirmTitleSuffix(rawTitle: string): string {
  return rawTitle
    .replace(
      /\s*\|\s*(شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية|شركة رياض محمد الزهراني للمحاماة|شركة رياض الزهراني للمحاماة|رؤى شركة رياض الزهراني للمحاماة|رؤى وتحليلات شركة رياض الزهراني للمحاماة|Riyadh Mohammed Alzahrani Law Firm & Legal Consultations|Riyadh Mohammed Alzahrani Legal Company|Riyadh Alzahrani Law Firm|Alzahrani Law Insights|Alzahrani Law|RMA Legal)\s*$/i,
      ''
    )
    .trim();
}

export function buildAlternates(pathWithoutLocale: string, locale: SupportedLocale) {
  const siteUrl = getSiteUrl();
  const normalizedPath =
    pathWithoutLocale === '' || pathWithoutLocale === '/'
      ? ''
      : pathWithoutLocale.startsWith('/')
      ? pathWithoutLocale
      : `/${pathWithoutLocale}`;

  return {
    canonical: `${siteUrl}/${locale}${normalizedPath}`,
    languages: {
      ar: `${siteUrl}/ar${normalizedPath}`,
      en: `${siteUrl}/en${normalizedPath}`,
      'x-default': `${siteUrl}/ar${normalizedPath}`,
    },
  };
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  ogImageUrl,
  noIndex = false,
}: {
  locale: SupportedLocale;
  path: string;
  title: string | { absolute: string };
  description: string;
  ogImageUrl?: string;
  noIndex?: boolean;
}): Metadata {
  const siteUrl = getSiteUrl();
  const settings = store.siteSettings || INITIAL_SETTINGS;
  const cleanTitle = typeof title === 'string' ? stripFirmTitleSuffix(title) : title;
  const alternates = buildAlternates(path, locale);
  const ogTitle = typeof cleanTitle === 'string' ? cleanTitle : cleanTitle.absolute;
  const resolvedOgImage = resolveAbsoluteAssetUrl(
    ogImageUrl || settings.ogImageUrl || DEFAULT_OG_IMAGE_PATH,
    siteUrl
  );

  return {
    title: cleanTitle,
    description,
    metadataBase: new URL(siteUrl),
    alternates,
    openGraph: {
      title: ogTitle,
      description,
      url: alternates.canonical,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [resolvedOgImage],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}
