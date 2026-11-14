import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://rma-law.sa';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/api', '/api/*'],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
