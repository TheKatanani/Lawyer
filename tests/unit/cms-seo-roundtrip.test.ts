import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleLlmsTxt } from '@/app/llms.txt/route';
import { PUT as handlePutSettings } from '@/app/api/admin/settings/route';
import { PATCH as handlePatchService } from '@/app/api/admin/services/[id]/route';
import { GET as handleListConsultations } from '@/app/api/admin/consultations/route';
import { POST as handleCreateConsultation } from '@/app/api/consultations/route';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import { store, INITIAL_SETTINGS } from '@/server/db/store';
import { encodeSessionPayload, SESSION_COOKIE_NAME } from '@/server/auth/session';

function makeAdminCookie() {
  const token = encodeSessionPayload('admin-rma-01', 'admin@rma-law.sa', 'super_admin');
  return `${SESSION_COOKIE_NAME}=${token}`;
}

describe('SEO, llms.txt, CMS Persistence & Consultations Ordering', () => {
  beforeEach(() => {
    store.siteSettings = { ...INITIAL_SETTINGS };
    store.rateLimits.clear();
    if (!store.admins.has('admin-rma-01')) {
      store.admins.set('admin-rma-01', {
        uid: 'admin-rma-01',
        email: 'admin@rma-law.sa',
        displayName: 'Riyadh Alzahrani',
        role: 'super_admin',
        isActive: true,
        mfaEnrolled: true,
        createdAt: '2026-11-12T10:00:00Z',
        updatedAt: '2026-11-12T10:00:00Z',
      });
    }
  });

  it('serves /llms.txt with bilingual summary, services, team, and contact details', async () => {
    const res = await handleLlmsTxt();
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    expect(text).toContain('شركة رياض محمد الزهراني');
    expect(text).toContain('Riyadh Mohammed Alzahrani');
    expect(text).toContain('https://www.riyadhalzahrani.com');
    expect(text).toContain('/ar/services');
    expect(text).toContain('/en/services');
  });

  it('includes default og:image and twitter card on inner pages and www.riyadhalzahrani.com in BreadcrumbList', () => {
    const metaAr = buildPageMetadata({
      locale: 'ar',
      path: '/about',
      title: 'عن الشركة',
      description: 'نبذة عن الشركة',
    });

    const images = metaAr.openGraph?.images as Array<{ url: string }>;
    expect(Array.isArray(images)).toBe(true);
    expect(images[0].url).toContain('/images/home-hero.webp');

    const schema = buildBreadcrumbJsonLd('en', [{ name: 'About', path: '/about' }]);
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement[0].item).toBe('https://www.riyadhalzahrani.com/en');
    expect(schema.itemListElement[1].item).toBe('https://www.riyadhalzahrani.com/en/about');
  });

  it('updates published service deliverables & settings cleanly in store', async () => {
    const cookie = makeAdminCookie();

    const settingsReq = new NextRequest('http://localhost:3000/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        phone: '+966 55 111 2222',
        heroEyebrowAr: 'شارة محدثة من الإدارة',
      }),
    });
    const settingsRes = await handlePutSettings(settingsReq);
    expect(settingsRes.status).toBe(200);
    expect(store.siteSettings.phone).toBe('+966 55 111 2222');
    expect(store.siteSettings.heroEyebrowAr).toBe('شارة محدثة من الإدارة');

    const firstSvc = Array.from(store.services.values())[0];
    const patchReq = new NextRequest(`http://localhost:3000/api/admin/services/${firstSvc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        deliverablesAr: ['مخرج محدث للاختبار'],
      }),
    });
    const patchRes = await handlePatchService(patchReq, { params: { id: firstSvc.id } });
    expect(patchRes.status).toBe(200);
    const updatedProj = store.publishedContent.get(`service_${firstSvc.id}_ar`);
    expect(updatedProj?.metadata?.deliverables).toEqual(['مخرج محدث للاختبار']);
  });

  it('generates monotonic references, preserves WhatsApp country code, and sorts admin consultations newest first', async () => {
    store.consultations.clear();
    const cookie = makeAdminCookie();

    const req1 = new NextRequest('http://localhost:3000/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
      body: JSON.stringify({
        fullName: 'الطلب الأول',
        phone: '+9660551110001',
        serviceId: 'general',
        locale: 'ar',
      }),
    });
    const r1 = await (await handleCreateConsultation(req1)).json();
    await new Promise((r) => setTimeout(r, 15));

    const req2 = new NextRequest('http://localhost:3000/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.2' },
      body: JSON.stringify({
        fullName: 'الطلب الأحدث',
        phone: '+966551110002',
        serviceId: 'criminal-litigation',
        preferredLawyerId: 'riyadh-alzahrani',
        preferredDate: '2026-12-20',
        locale: 'ar',
      }),
    });
    const r2 = await (await handleCreateConsultation(req2)).json();

    expect(r1.reference).toBe('CR-2026-0001');
    expect(r2.reference).toBe('CR-2026-0002');

    const listReq = new NextRequest('http://localhost:3000/api/admin/consultations', {
      headers: { Cookie: cookie },
    });
    const listRes = await handleListConsultations(listReq);
    const listJson = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listJson.consultations[0].reference).toBe('CR-2026-0002');
    expect(listJson.consultations[0].fullName).toBe('الطلب الأحدث');
    expect(listJson.consultations[0].phone).toBe('+966551110002');
    expect(listJson.consultations[1].phone).toBe('+966551110001');
  });
});
