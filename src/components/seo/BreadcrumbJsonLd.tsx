import React from 'react';
import { SupportedLocale } from '@/server/types';
import { buildBreadcrumbJsonLd } from '@/lib/seo';

export function BreadcrumbJsonLd({
  locale,
  items,
}: {
  locale: SupportedLocale;
  items: Array<{ name: string; path: string }>;
}) {
  const schema = buildBreadcrumbJsonLd(locale, items);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
