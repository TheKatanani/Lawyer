import { revalidatePath } from 'next/cache';

/**
 * Revalidates public localized pages, dynamic entity routes, sitemap, and llms.txt
 * immediately after an admin CMS update, publication, or settings change.
 */
export function revalidateSiteRoutes(extraPaths: string[] = []) {
  try {
    const staticLocalePaths = [
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

    revalidatePath('/ar', 'layout');
    revalidatePath('/en', 'layout');
    revalidatePath('/sitemap.xml');
    revalidatePath('/llms.txt');
    revalidatePath('/admin');

    for (const locale of ['ar', 'en']) {
      for (const p of staticLocalePaths) {
        revalidatePath(`/${locale}${p}`);
      }
    }

    for (const p of extraPaths) {
      if (p) {
        revalidatePath(p);
      }
    }
  } catch {
    // Safe no-op in non-Next test contexts (e.g. Vitest unit/integration runs)
  }
}
