import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  COLLECTIONS,
  SITE_SETTINGS_DOC_ID,
  getDb,
  getFirestoreConfigStatus,
  pingFirestore,
} from '@/server/db/firestore';
import {
  allocateNextConsultationReference,
  allocateNextPaymentRequestId,
  appendAuditLog,
  getSiteSettings,
  listAdmins,
  listArticleDocs,
  listAuditLogs,
  listConsultations,
  listInquiriesDocs,
  listMediaAssets,
  listOutboxJobs,
  listPaymentRequests,
  listServiceDocs,
  listTeamMemberDocs,
  saveMediaAsset,
  deleteMediaAssetById,
  saveOutboxJob,
  updateSiteSettings,
} from '@/server/db/dal';
import { seedFirestore } from '@/server/db/seed';
import {
  getPublishedProjection,
  listPublishedProjections,
} from '@/server/repositories/content';

async function clearAllEmulatorCollections() {
  const db = getDb();
  const names = Object.values(COLLECTIONS);
  for (const name of names) {
    const snap = await db.collection(name).get();
    if (snap.empty) continue;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

describe('Firestore Single Source of Truth (Emulator Suite)', () => {
  beforeEach(async () => {
    await clearAllEmulatorCollections();
  });

  it('runs in emulator mode, closes client rules completely, and answers live ping', async () => {
    const status = getFirestoreConfigStatus();
    expect(status.configured).toBe(true);
    expect(status.mode).toBe('emulator');
    expect(process.env.FIRESTORE_EMULATOR_HOST).toBeTruthy();

    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesText = fs.readFileSync(rulesPath, 'utf-8');
    expect(rulesText).toContain('allow read, write: if false;');

    // Verify client REST request (unauthenticated browser client simulation) is denied by firestore.rules
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST!;
    const clientUrl = `http://${emulatorHost}/v1/projects/${status.projectId}/databases/(default)/documents/${COLLECTIONS.siteSettings}/${SITE_SETTINGS_DOC_ID}`;
    const res = await fetch(clientUrl);
    expect(res.status).toBe(403);

    const beforeSeedPing = await pingFirestore();
    expect(beforeSeedPing.ok).toBe(true);
    expect(beforeSeedPing.mode).toBe('emulator');
    expect(beforeSeedPing.seededSettings).toBe(false);
  });

  it('seeds Firestore idempotently only when empty and preserves admin changes', async () => {
    const firstRun = await seedFirestore();
    expect(firstRun.results.every((r) => !r.skipped && r.seeded > 0)).toBe(true);

    const afterSeedPing = await pingFirestore();
    expect(afterSeedPing.ok).toBe(true);
    expect(afterSeedPing.seededSettings).toBe(true);

    const [services, team, articles, consultations, prs, admins, inquiries] = await Promise.all([
      listServiceDocs(),
      listTeamMemberDocs(),
      listArticleDocs(),
      listConsultations(),
      listPaymentRequests(),
      listAdmins(),
      listInquiriesDocs(),
    ]);

    expect(services.length).toBe(16);
    expect(team.length).toBeGreaterThanOrEqual(1);
    expect(articles.length).toBeGreaterThanOrEqual(1);
    expect(consultations.length).toBe(2);
    expect(prs.length).toBe(2);
    expect(admins.some((a) => a.email === 'admin@rma-law.sa')).toBe(true);
    expect(inquiries.length).toBeGreaterThanOrEqual(1);

    // Modify siteSettings in Firestore, then run seedFirestore() again
    await updateSiteSettings({ brandShortAr: 'العلامة المعدلة في الاختبار' });
    const secondRun = await seedFirestore();
    expect(secondRun.results.every((r) => r.skipped && r.seeded === 0)).toBe(true);

    const persistedSettings = await getSiteSettings();
    expect(persistedSettings.brandShortAr).toBe('العلامة المعدلة في الاختبار');
  });

  it('stores 1 doc per item across editorial CMS, inquiries, logs, media, outbox, and counters', async () => {
    await seedFirestore();

    // Verify dynamic projections read directly from Firestore docs (embedded revisions)
    const arServices = await listPublishedProjections('service', 'ar');
    expect(arServices.length).toBe(16);

    const corp = await getPublishedProjection('service', 'commercial-corporate', 'en');
    expect(corp).not.toBeNull();
    expect(Array.isArray(corp!.metadata.problems)).toBe(true);
    expect(Array.isArray(corp!.metadata.methodologySteps)).toBe(true);
    expect(typeof corp!.metadata.valueToClient).toBe('string');

    // Atomic counters never collide across consecutive allocations
    const ref1 = await allocateNextConsultationReference();
    const ref2 = await allocateNextConsultationReference();
    expect(ref1).not.toBe(ref2);
    expect(ref2).toMatch(/^CR-\d{4}-\d{4}$/);

    const pr1 = await allocateNextPaymentRequestId();
    const pr2 = await allocateNextPaymentRequestId();
    expect(pr1).not.toBe(pr2);
    expect(pr2).toMatch(/^PR-\d{4}-\d{4}$/);

    // Media, outbox, and auditLogs roundtrips
    const now = new Date().toISOString();
    await saveMediaAsset({
      id: 'media-test-1',
      publicId: 'rma-legal/test-banner',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
      format: 'jpg',
      width: 1200,
      height: 630,
      bytes: 12345,
      altText: { ar: 'صورة اختبار', en: 'Test banner' },
      uploadedBy: 'admin-rma-01',
      createdAt: now,
    });
    expect((await listMediaAssets()).some((m) => m.id === 'media-test-1')).toBe(true);
    await deleteMediaAssetById('media-test-1');
    expect((await listMediaAssets()).some((m) => m.id === 'media-test-1')).toBe(false);

    await saveOutboxJob({
      id: 'outbox-test-1',
      type: 'inquiry_notification',
      payload: { inquiryId: 'RMA-TEST-1' },
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      nextAttemptAt: now,
      createdAt: now,
      updatedAt: now,
    });
    expect((await listOutboxJobs()).some((j) => j.id === 'outbox-test-1')).toBe(true);

    await appendAuditLog({
      actorUid: 'admin-rma-01',
      actorEmail: 'admin@rma-law.sa',
      action: 'FIRESTORE_EMULATOR_TEST_LOG',
      targetType: 'system',
      targetId: 'global',
      details: { test: true },
      createdAt: now,
    });
    expect((await listAuditLogs(10)).some((l) => l.action === 'FIRESTORE_EMULATOR_TEST_LOG')).toBe(true);
  });
});
