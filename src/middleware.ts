import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all request paths except for:
  // - /api routes
  // - /admin routes (CMS has its own auth & session middleware / boundary)
  // - /_next (Next.js internals)
  // - /_static, /_vercel
  // - Static files (e.g. /favicon.ico, sitemap.xml, robots.txt, etc.)
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)', '/'],
};
