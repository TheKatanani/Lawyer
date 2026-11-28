import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/server/db/dal';
import { listPublishedProjections } from '@/server/repositories/content';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = getSiteUrl();
  const settings = await getSiteSettings();

  const [servicesAr, servicesEn, teamAr, articlesAr] = await Promise.all([
    listPublishedProjections('service', 'ar'),
    listPublishedProjections('service', 'en'),
    listPublishedProjections('teamMember', 'ar'),
    listPublishedProjections('article', 'ar'),
  ]);

  const lines: string[] = [
    `# ${settings.brandNameAr} | ${settings.brandNameEn}`,
    '',
    `> ${settings.taglineAr}`,
    `> ${settings.taglineEn}`,
    '',
    '## Overview / نبذة عن الشركة',
    settings.aboutTextAr,
    '',
    settings.aboutTextEn,
    '',
    '## Contact Details / بيانات التواصل',
    `- Headquarters (AR): ${settings.addressAr}`,
    `- Headquarters (EN): ${settings.addressEn}`,
    `- Phone / الهاتف: ${settings.phone}`,
    `- WhatsApp / واتساب: ${settings.whatsapp}`,
    `- Email / البريد الإلكتروني: ${settings.email}`,
    `- Official Domain / الموقع الرسمي: ${settings.websiteUrl || 'https://www.riyadhalzahrani.com'}`,
    '',
    '## Key Pages / الصفحات الرئيسية',
    `- Arabic Home: ${siteUrl}/ar`,
    `- English Home: ${siteUrl}/en`,
    `- About Firm (AR/EN): ${siteUrl}/ar/about | ${siteUrl}/en/about`,
    `- Practice Areas (AR/EN): ${siteUrl}/ar/services | ${siteUrl}/en/services`,
    `- Legal Team (AR/EN): ${siteUrl}/ar/team | ${siteUrl}/en/team`,
    `- Legal Insights (AR/EN): ${siteUrl}/ar/insights | ${siteUrl}/en/insights`,
    `- Consultation Intake (AR/EN): ${siteUrl}/ar/consultation | ${siteUrl}/en/consultation`,
    `- Contact Us (AR/EN): ${siteUrl}/ar/contact | ${siteUrl}/en/contact`,
    `- Terms & Privacy (AR): ${siteUrl}/ar/terms | ${siteUrl}/ar/privacy`,
    '',
    '## Practice Areas / مجالات الممارسة والخدمات القانونية',
    ...servicesAr.map((sAr, idx) => {
      const sEn = servicesEn.find((e) => e.entityId === sAr.entityId);
      return `- ${idx + 1}. ${sAr.title}${sEn ? ` (${sEn.title})` : ''}: ${siteUrl}/ar/services/${sAr.slug} | ${siteUrl}/en/services/${sEn?.slug || sAr.slug}`;
    }),
    '',
    '## Leadership & Advocates / الفريق القانوني',
    ...teamAr.map(
      (m) => `- ${m.metadata?.fullName || m.title} — ${m.metadata?.positionTitle || ''}: ${siteUrl}/ar/team/${m.slug}`
    ),
  ];

  if (articlesAr.length > 0) {
    lines.push('', '## Published Insights / المقالات القانونية');
    for (const a of articlesAr) {
      lines.push(`- ${a.title}: ${siteUrl}/ar/insights/${a.slug}`);
    }
  }

  return new NextResponse(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
