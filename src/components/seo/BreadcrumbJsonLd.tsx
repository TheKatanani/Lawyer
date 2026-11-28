import React from 'react';
import { SupportedLocale } from '@/server/types';
import { buildBreadcrumbJsonLd } from '@/lib/seo';
import { getSiteSettingsOrNull } from '@/server/db/dal';

export async function BreadcrumbJsonLd({
  locale,
  items,
  siteUrl,
}: {
  locale: SupportedLocale;
  items: Array<{ name: string; path: string }>;
  siteUrl?: string;
}) {
  const resolvedUrl =
    siteUrl || (await getSiteSettingsOrNull())?.websiteUrl || undefined;
  const schema = buildBreadcrumbJsonLd(locale, items, resolvedUrl);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
