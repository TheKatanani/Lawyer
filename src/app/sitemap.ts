import { MetadataRoute } from 'next';
import { store } from '@/server/db/store';
import { getSiteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const now = new Date();

  // Core Static Routes
  const staticPaths = [
    '',
    '/about',
    '/services',
    '/team',
    '/insights',
    '/contact',
    '/consultation',
    '/terms',
    '/privacy',
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of ['ar', 'en'] as const) {
      entries.push({
        url: `${origin}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : 0.8,
      });
    }
  }

  // Dynamic Published Entities
  const projections = Array.from(store.publishedContent.values());
  for (const proj of projections) {
    let subPath = '';
    if (proj.entityType === 'service') subPath = `/services/${proj.slug}`;
    else if (proj.entityType === 'teamMember') subPath = `/team/${proj.slug}`;
    else if (proj.entityType === 'article') subPath = `/insights/${proj.slug}`;

    if (subPath) {
      entries.push({
        url: `${origin}/${proj.locale}${subPath}`,
        lastModified: new Date(proj.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
