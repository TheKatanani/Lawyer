import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as handleCreateService } from '@/app/api/admin/services/route';
import { PATCH as handlePatchService, DELETE as handleDeleteService } from '@/app/api/admin/services/[id]/route';
import { POST as handleCreateTeam, GET as handleGetTeam } from '@/app/api/admin/team/route';
import { PATCH as handlePatchTeam, DELETE as handleDeleteTeam } from '@/app/api/admin/team/[id]/route';
import { POST as handleCreateInsight, GET as handleGetInsights } from '@/app/api/admin/insights/route';
import { PATCH as handlePatchInsight, DELETE as handleDeleteInsight } from '@/app/api/admin/insights/[id]/route';
import { POST as handleCreateAdmin, GET as handleGetAdmins } from '@/app/api/admin/users/route';
import { PATCH as handlePatchAdmin, DELETE as handleDeleteAdmin } from '@/app/api/admin/users/[id]/route';
import { GET as handleGetSettings, PUT as handlePutSettings } from '@/app/api/admin/settings/route';
import { store } from '@/server/db/store';
import { encodeSessionPayload, SESSION_COOKIE_NAME } from '@/server/auth/session';

function makeAuthCookie(role: 'super_admin' | 'admin' | 'editor' | 'inquiry_manager' = 'super_admin', uid = 'admin-rma-01') {
  const token = encodeSessionPayload(uid, 'admin@rma-law.sa', role);
  return `${SESSION_COOKIE_NAME}=${token}`;
}

describe('CMS Admin Full CRUD Integration Suite', () => {
  const authCookie = makeAuthCookie('super_admin');

  beforeEach(() => {
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

  // --- 1. SERVICES CRUD ---
  it('creates, publishes, updates, and deletes a legal service', async () => {
    // Create
    const createReq = new NextRequest('http://localhost:3000/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        titleAr: 'قضايا الإفلاس وإعادة التنظيم المالي',
        titleEn: 'Bankruptcy & Financial Restructuring',
        summaryAr: 'إدارة إجراءات الإفلاس والتسوية الوقائية للشركات المتعثرة.',
        summaryEn: 'Handling corporate insolvency and protective settlements.',
        publishImmediately: true,
      }),
    });
    const createRes = await handleCreateService(createReq);
    expect(createRes.status).toBe(201);
    const { serviceId } = await createRes.json();
    expect(store.services.has(serviceId)).toBe(true);
    expect(store.publishedContent.has(`service_${serviceId}_ar`)).toBe(true);

    // Update
    const patchReq = new NextRequest(`http://localhost:3000/api/admin/services/${serviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        titleAr: 'قضايا الإفلاس وإعادة التنظيم المالي المحدثة',
      }),
    });
    const patchRes = await handlePatchService(patchReq, { params: { id: serviceId } });
    expect(patchRes.status).toBe(200);

    // Delete
    const deleteReq = new NextRequest(`http://localhost:3000/api/admin/services/${serviceId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    const deleteRes = await handleDeleteService(deleteReq, { params: { id: serviceId } });
    expect(deleteRes.status).toBe(200);
    expect(store.services.has(serviceId)).toBe(false);
    expect(store.publishedContent.has(`service_${serviceId}_ar`)).toBe(false);
  });

  // --- 2. TEAM MANAGEMENT CRUD ---
  it('creates, queries, modifies, and deletes a lawyer profile', async () => {
    // Create
    const createReq = new NextRequest('http://localhost:3000/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        fullNameAr: 'أ. خالد التميمي',
        fullNameEn: 'Khalid Al-Tamimi',
        positionTitleAr: 'مستشار في الحوكمة والاندماج',
        positionTitleEn: 'Governance & M&A Counsel',
        summaryAr: 'خبرة تزيد عن 12 عاماً في تأسيس الاستثمارات الأجنبية.',
        summaryEn: 'Over 12 years advising foreign investors entering KSA.',
        verifiedCredentialsAr: ['ترخيص وزارة العدل رقم 5521'],
        verifiedCredentialsEn: ['MOJ Advocate License #5521'],
        publishImmediately: true,
      }),
    });
    const createRes = await handleCreateTeam(createReq);
    expect(createRes.status).toBe(201);
    const { memberId } = await createRes.json();
    expect(store.teamMembers.has(memberId)).toBe(true);
    expect(store.publishedContent.has(`teamMember_${memberId}_ar`)).toBe(true);

    // Query List
    const listReq = new NextRequest('http://localhost:3000/api/admin/team', {
      headers: { Cookie: authCookie },
    });
    const listRes = await handleGetTeam(listReq);
    const listData = await listRes.json();
    const created = listData.team.find((m: any) => m.id === memberId);
    expect(created).toBeDefined();
    expect(created.revisions.ar.fullName).toBe('أ. خالد التميمي');

    // Update
    const patchReq = new NextRequest(`http://localhost:3000/api/admin/team/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        positionTitleAr: 'شريك أول - الحوكمة والاندماج',
      }),
    });
    const patchRes = await handlePatchTeam(patchReq, { params: { id: memberId } });
    expect(patchRes.status).toBe(200);

    // Delete
    const deleteReq = new NextRequest(`http://localhost:3000/api/admin/team/${memberId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    const deleteRes = await handleDeleteTeam(deleteReq, { params: { id: memberId } });
    expect(deleteRes.status).toBe(200);
    expect(store.teamMembers.has(memberId)).toBe(false);
  });

  // --- 3. INSIGHTS / BLOG CRUD ---
  it('creates, queries, and unpublishes legal insights article', async () => {
    // Create
    const createReq = new NextRequest('http://localhost:3000/api/admin/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        titleAr: 'تحليل اللائحة التنفيذية لنظام حماية البيانات الشخصية',
        titleEn: 'Analysis of the Executive Regulations of the Saudi PDPL',
        summaryAr: 'التزامات المنشآت وحقوق أصحاب البيانات وفق اللائحة الجديدة.',
        summaryEn: 'Corporate obligations and data subject rights under the PDPL.',
        contentAr: 'تفرض اللائحة التنفيذية معايير دقيقة لنقل البيانات عبر الحدود...',
        contentEn: 'The regulations establish stringent criteria for cross-border data transfers...',
        publishImmediately: true,
      }),
    });
    const createRes = await handleCreateInsight(createReq);
    expect(createRes.status).toBe(201);
    const { articleId } = await createRes.json();
    expect(store.articles.has(articleId)).toBe(true);

    // Query
    const listReq = new NextRequest('http://localhost:3000/api/admin/insights', {
      headers: { Cookie: authCookie },
    });
    const listRes = await handleGetInsights(listReq);
    const listData = await listRes.json();
    expect(listData.articles.some((a: any) => a.id === articleId)).toBe(true);

    // Unpublish
    const unpubReq = new NextRequest(`http://localhost:3000/api/admin/insights/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({ action: 'unpublish' }),
    });
    const unpubRes = await handlePatchInsight(unpubReq, { params: { id: articleId } });
    expect(unpubRes.status).toBe(200);
    expect(store.publishedContent.has(`article_${articleId}_ar`)).toBe(false);

    // Delete
    const deleteReq = new NextRequest(`http://localhost:3000/api/admin/insights/${articleId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    const deleteRes = await handleDeleteInsight(deleteReq, { params: { id: articleId } });
    expect(deleteRes.status).toBe(200);
    expect(store.articles.has(articleId)).toBe(false);
  });

  // --- 4. ADMINISTRATOR & RBAC GOVERNANCE CRUD ---
  it('manages admin accounts and protects the last active super_admin', async () => {
    // Add Admin
    const addReq = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        email: 'new-counsel@rma-law.sa',
        displayName: 'New Counsel Member',
        role: 'admin',
      }),
    });
    const addRes = await handleCreateAdmin(addReq);
    expect(addRes.status).toBe(201);
    const { admin } = await addRes.json();
    expect(store.admins.has(admin.uid)).toBe(true);

    // Update Role
    const patchReq = new NextRequest(`http://localhost:3000/api/admin/users/${admin.uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({ role: 'editor', isActive: false }),
    });
    const patchRes = await handlePatchAdmin(patchReq, { params: { id: admin.uid } });
    expect(patchRes.status).toBe(200);
    expect(store.admins.get(admin.uid)?.role).toBe('editor');
    expect(store.admins.get(admin.uid)?.isActive).toBe(false);

    // Self-deletion guard test
    const selfDeleteReq = new NextRequest(`http://localhost:3000/api/admin/users/admin-rma-01`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    const selfDeleteRes = await handleDeleteAdmin(selfDeleteReq, { params: { id: 'admin-rma-01' } });
    expect(selfDeleteRes.status).toBe(400); // Prohibited!

    // Delete newly created admin
    const delReq = new NextRequest(`http://localhost:3000/api/admin/users/${admin.uid}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    const delRes = await handleDeleteAdmin(delReq, { params: { id: admin.uid } });
    expect(delRes.status).toBe(200);
    expect(store.admins.has(admin.uid)).toBe(false);
  });

  // --- 5. SITE SETTINGS & SEO CRUD ---
  it('retrieves and updates global branding and SEO metadata', async () => {
    const getReq = new NextRequest('http://localhost:3000/api/admin/settings', {
      headers: { Cookie: authCookie },
    });
    const getRes = await handleGetSettings(getReq);
    expect(getRes.status).toBe(200);
    const { settings } = await getRes.json();
    expect(settings.phone).toBeDefined();

    // Update settings
    const putReq = new NextRequest('http://localhost:3000/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        taglineAr: 'رؤية قانونية راسخة وشراكة موثوقة للأعمال',
        seoTitleAr: 'شركة رياض الزهراني للمحاماة | نخبة المستشارين بالرياض',
        ogImageUrl: 'https://res.cloudinary.com/dhgk61npp/image/upload/v12345/og-custom.png',
        faviconUrl: 'https://res.cloudinary.com/dhgk61npp/image/upload/v12345/favicon-custom.ico',
      }),
    });
    const putRes = await handlePutSettings(putReq);
    expect(putRes.status).toBe(200);
    expect(store.siteSettings.taglineAr).toBe('رؤية قانونية راسخة وشراكة موثوقة للأعمال');
    expect(store.siteSettings.ogImageUrl).toContain('og-custom.png');
    expect(store.siteSettings.faviconUrl).toContain('favicon-custom.ico');
  });
});
