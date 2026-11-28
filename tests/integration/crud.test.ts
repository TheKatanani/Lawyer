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
import {
  getAdminByUid,
  getArticleDoc,
  getServiceDoc,
  getSiteSettings,
  getTeamMemberDoc,
} from '@/server/db/dal';
import { getPublishedProjection } from '@/server/repositories/content';
import { seedFirestore } from '@/server/db/seed';
import { encodeSessionPayload, SESSION_COOKIE_NAME } from '@/server/auth/session';

function makeAuthCookie(role: 'super_admin' | 'admin' | 'editor' | 'inquiry_manager' = 'super_admin', uid = 'admin-rma-01') {
  const token = encodeSessionPayload(uid, 'admin@rma-law.sa', role);
  return `${SESSION_COOKIE_NAME}=${token}`;
}

describe('CMS Admin Full CRUD Integration Suite', () => {
  const authCookie = makeAuthCookie('super_admin');

  beforeEach(async () => {
    await seedFirestore();
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
    expect(await getServiceDoc(serviceId)).not.toBeNull();
    expect(await getPublishedProjection('service', serviceId, 'ar')).not.toBeNull();

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
    expect(await getServiceDoc(serviceId)).toBeNull();
    expect(await getPublishedProjection('service', serviceId, 'ar')).toBeNull();
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
    expect(await getTeamMemberDoc(memberId)).not.toBeNull();
    expect(await getPublishedProjection('teamMember', memberId, 'ar')).not.toBeNull();

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
    expect(await getTeamMemberDoc(memberId)).toBeNull();
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
    expect(await getArticleDoc(articleId)).not.toBeNull();

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
    expect(await getPublishedProjection('article', articleId, 'ar')).toBeNull();

    // Delete
    const deleteReq = new NextRequest(`http://localhost:3000/api/admin/insights/${articleId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    const deleteRes = await handleDeleteInsight(deleteReq, { params: { id: articleId } });
    expect(deleteRes.status).toBe(200);
    expect(await getArticleDoc(articleId)).toBeNull();
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
    expect(await getAdminByUid(admin.uid)).not.toBeNull();

    // Update Role
    const patchReq = new NextRequest(`http://localhost:3000/api/admin/users/${admin.uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({ role: 'editor', isActive: false }),
    });
    const patchRes = await handlePatchAdmin(patchReq, { params: { id: admin.uid } });
    expect(patchRes.status).toBe(200);
    const updatedAdmin = await getAdminByUid(admin.uid);
    expect(updatedAdmin?.role).toBe('editor');
    expect(updatedAdmin?.isActive).toBe(false);

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
    expect(await getAdminByUid(admin.uid)).toBeNull();
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
    const persisted = await getSiteSettings();
    expect(persisted.taglineAr).toBe('رؤية قانونية راسخة وشراكة موثوقة للأعمال');
    expect(persisted.ogImageUrl).toContain('og-custom.png');
    expect(persisted.faviconUrl).toContain('favicon-custom.ico');
  });
});
