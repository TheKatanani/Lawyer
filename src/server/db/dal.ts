import 'server-only';
import { COLLECTIONS, SITE_SETTINGS_DOC_ID, getDb } from './firestore';
import {
  AdminUser,
  ArticleDocument,
  AuditLogEntry,
  ConsultationRequest,
  ContactRequest,
  MediaAsset,
  OutboxJob,
  PaymentRequest,
  ServiceDocument,
  SiteSettings,
  TeamMemberDocument,
} from '../types';
import { unsealPaymentToken } from '../payments/tokens';

// ---------------------------------------------------------------------------
// 1. Site Settings (siteSettings/global)
// ---------------------------------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await getDb()
    .collection(COLLECTIONS.siteSettings)
    .doc(SITE_SETTINGS_DOC_ID)
    .get();

  if (!snap.exists) {
    throw new Error(
      'Site settings document (siteSettings/global) does not exist in Firestore. Run "npm run seed" first.'
    );
  }

  return snap.data() as SiteSettings;
}

export async function getSiteSettingsOrNull(): Promise<SiteSettings | null> {
  const snap = await getDb()
    .collection(COLLECTIONS.siteSettings)
    .doc(SITE_SETTINGS_DOC_ID)
    .get();
  return snap.exists ? (snap.data() as SiteSettings) : null;
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const docRef = getDb().collection(COLLECTIONS.siteSettings).doc(SITE_SETTINGS_DOC_ID);
  const snap = await docRef.get();
  const current = snap.exists ? (snap.data() as SiteSettings) : ({} as SiteSettings);
  const next = { ...current, ...patch } as SiteSettings;
  await docRef.set(next, { merge: false });
  return next;
}

// ---------------------------------------------------------------------------
// 2. Services (services/{id}, embedded revisions map)
// ---------------------------------------------------------------------------
export async function listServiceDocs(): Promise<ServiceDocument[]> {
  const snap = await getDb().collection(COLLECTIONS.services).get();
  return snap.docs
    .map((d) => d.data() as ServiceDocument)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function listPublishedServiceDocs(): Promise<ServiceDocument[]> {
  const snap = await getDb()
    .collection(COLLECTIONS.services)
    .where('isPublished', '==', true)
    .get();
  return snap.docs
    .map((d) => d.data() as ServiceDocument)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getServiceDoc(id: string): Promise<ServiceDocument | null> {
  if (!id) return null;
  const snap = await getDb().collection(COLLECTIONS.services).doc(id).get();
  return snap.exists ? (snap.data() as ServiceDocument) : null;
}

export async function getServiceBySlugOrId(slugOrId: string): Promise<ServiceDocument | null> {
  if (!slugOrId) return null;
  const direct = await getServiceDoc(slugOrId);
  if (direct) return direct;
  const all = await listServiceDocs();
  return (
    all.find(
      (s) => s.locales?.ar?.slug === slugOrId || s.locales?.en?.slug === slugOrId
    ) || null
  );
}

export async function saveServiceDoc(doc: ServiceDocument): Promise<void> {
  await getDb().collection(COLLECTIONS.services).doc(doc.id).set(doc);
}

export async function deleteServiceDoc(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.services).doc(id).delete();
}

// ---------------------------------------------------------------------------
// 3. Team Members (teamMembers/{id}, embedded revisions map)
// ---------------------------------------------------------------------------
export async function listTeamMemberDocs(): Promise<TeamMemberDocument[]> {
  const snap = await getDb().collection(COLLECTIONS.teamMembers).get();
  return snap.docs
    .map((d) => d.data() as TeamMemberDocument)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function listPublishedTeamMemberDocs(): Promise<TeamMemberDocument[]> {
  const snap = await getDb()
    .collection(COLLECTIONS.teamMembers)
    .where('isPublished', '==', true)
    .get();
  return snap.docs
    .map((d) => d.data() as TeamMemberDocument)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getTeamMemberDoc(id: string): Promise<TeamMemberDocument | null> {
  if (!id) return null;
  const snap = await getDb().collection(COLLECTIONS.teamMembers).doc(id).get();
  return snap.exists ? (snap.data() as TeamMemberDocument) : null;
}

export async function getTeamMemberBySlugOrId(slugOrId: string): Promise<TeamMemberDocument | null> {
  if (!slugOrId) return null;
  const direct = await getTeamMemberDoc(slugOrId);
  if (direct) return direct;
  const all = await listTeamMemberDocs();
  return (
    all.find(
      (m) => m.locales?.ar?.slug === slugOrId || m.locales?.en?.slug === slugOrId
    ) || null
  );
}

export async function saveTeamMemberDoc(doc: TeamMemberDocument): Promise<void> {
  await getDb().collection(COLLECTIONS.teamMembers).doc(doc.id).set(doc);
}

export async function deleteTeamMemberDoc(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.teamMembers).doc(id).delete();
}

// ---------------------------------------------------------------------------
// 4. Articles / Insights (articles/{id}, embedded revisions map)
// ---------------------------------------------------------------------------
export async function listArticleDocs(): Promise<ArticleDocument[]> {
  const snap = await getDb().collection(COLLECTIONS.articles).get();
  return snap.docs
    .map((d) => d.data() as ArticleDocument)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function listPublishedArticleDocs(): Promise<ArticleDocument[]> {
  const snap = await getDb()
    .collection(COLLECTIONS.articles)
    .where('isPublished', '==', true)
    .get();
  return snap.docs
    .map((d) => d.data() as ArticleDocument)
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    );
}

export async function getArticleDoc(id: string): Promise<ArticleDocument | null> {
  if (!id) return null;
  const snap = await getDb().collection(COLLECTIONS.articles).doc(id).get();
  return snap.exists ? (snap.data() as ArticleDocument) : null;
}

export async function getArticleBySlugOrId(slugOrId: string): Promise<ArticleDocument | null> {
  if (!slugOrId) return null;
  const direct = await getArticleDoc(slugOrId);
  if (direct) return direct;
  const all = await listArticleDocs();
  return (
    all.find(
      (a) => a.locales?.ar?.slug === slugOrId || a.locales?.en?.slug === slugOrId
    ) || null
  );
}

export async function saveArticleDoc(doc: ArticleDocument): Promise<void> {
  await getDb().collection(COLLECTIONS.articles).doc(doc.id).set(doc);
}

export async function deleteArticleDoc(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.articles).doc(id).delete();
}

// ---------------------------------------------------------------------------
// 5. Consultations (consultations/{id})
// ---------------------------------------------------------------------------
export async function listConsultations(): Promise<ConsultationRequest[]> {
  const snap = await getDb().collection(COLLECTIONS.consultations).get();
  return snap.docs
    .map((d) => d.data() as ConsultationRequest)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getConsultationById(id: string): Promise<ConsultationRequest | null> {
  if (!id) return null;
  const snap = await getDb().collection(COLLECTIONS.consultations).doc(id).get();
  return snap.exists ? (snap.data() as ConsultationRequest) : null;
}

export async function saveConsultation(c: ConsultationRequest): Promise<void> {
  await getDb().collection(COLLECTIONS.consultations).doc(c.id).set(c);
}

export async function deleteConsultationById(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.consultations).doc(id).delete();
}

export async function allocateNextConsultationReference(): Promise<string> {
  const db = getDb();
  const year = new Date().getFullYear();
  const counterRef = db.collection(COLLECTIONS.counters).doc('consultations');
  const existingSnap = await db.collection(COLLECTIONS.consultations).get();

  const existingMax = existingSnap.docs.reduce((max, doc) => {
    const ref = String((doc.data() as ConsultationRequest)?.reference || '');
    const m = ref.match(/^CR-\d{4}-(\d+)$/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > max ? n : max;
  }, 0);

  const nextSeq = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists ? Number(snap.data()?.seq || 0) : 0;
    const base = Math.max(current, existingMax);
    const next = base + 1;
    tx.set(counterRef, { seq: next, year, updatedAt: new Date().toISOString() });
    return next;
  });

  return `CR-${year}-${String(nextSeq).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// 6. Payment Requests (paymentRequests/{id})
// ---------------------------------------------------------------------------
export async function listPaymentRequests(): Promise<PaymentRequest[]> {
  const snap = await getDb().collection(COLLECTIONS.paymentRequests).get();
  return snap.docs
    .map((d) => d.data() as PaymentRequest)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPaymentRequestById(id: string): Promise<PaymentRequest | null> {
  if (!id) return null;
  const snap = await getDb().collection(COLLECTIONS.paymentRequests).doc(id).get();
  return snap.exists ? (snap.data() as PaymentRequest) : null;
}

export async function getPaymentRequestByToken(token: string): Promise<PaymentRequest | null> {
  if (!token) return null;
  const snap = await getDb()
    .collection(COLLECTIONS.paymentRequests)
    .where('token', '==', token)
    .limit(1)
    .get();

  if (!snap.empty) {
    return snap.docs[0].data() as PaymentRequest;
  }

  const unsealed = unsealPaymentToken(token);
  if (unsealed) {
    const byId = await getPaymentRequestById(unsealed.id);
    return byId || unsealed;
  }
  return null;
}

export async function savePaymentRequest(pr: PaymentRequest): Promise<void> {
  await getDb().collection(COLLECTIONS.paymentRequests).doc(pr.id).set(pr);
}

export async function deletePaymentRequestById(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.paymentRequests).doc(id).delete();
}

export async function allocateNextPaymentRequestId(): Promise<string> {
  const db = getDb();
  const year = new Date().getFullYear();
  const counterRef = db.collection(COLLECTIONS.counters).doc('paymentRequests');
  const existingSnap = await db.collection(COLLECTIONS.paymentRequests).get();

  const existingMax = existingSnap.docs.reduce((max, doc) => {
    const m = doc.id.match(/^PR-\d{4}-(\d+)$/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > max ? n : max;
  }, 0);

  const nextSeq = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists ? Number(snap.data()?.seq || 0) : 0;
    const base = Math.max(current, existingMax);
    const next = base + 1;
    tx.set(counterRef, { seq: next, year, updatedAt: new Date().toISOString() });
    return next;
  });

  return `PR-${year}-${String(nextSeq).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// 7. Admins (admins/{uid})
// ---------------------------------------------------------------------------
export async function listAdmins(): Promise<AdminUser[]> {
  const snap = await getDb().collection(COLLECTIONS.admins).get();
  return snap.docs.map((d) => d.data() as AdminUser);
}

export async function getAdminByUid(uid: string): Promise<AdminUser | null> {
  if (!uid) return null;
  const snap = await getDb().collection(COLLECTIONS.admins).doc(uid).get();
  return snap.exists ? (snap.data() as AdminUser) : null;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const all = await listAdmins();
  return all.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function saveAdmin(admin: AdminUser): Promise<void> {
  await getDb().collection(COLLECTIONS.admins).doc(admin.uid).set(admin);
}

export async function deleteAdmin(uid: string): Promise<void> {
  await getDb().collection(COLLECTIONS.admins).doc(uid).delete();
}

// ---------------------------------------------------------------------------
// 8. Inquiries (inquiries/{id})
// ---------------------------------------------------------------------------
export async function listInquiriesDocs(): Promise<ContactRequest[]> {
  const snap = await getDb().collection(COLLECTIONS.inquiries).get();
  return snap.docs
    .map((d) => d.data() as ContactRequest)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getInquiryDoc(id: string): Promise<ContactRequest | null> {
  if (!id) return null;
  const snap = await getDb().collection(COLLECTIONS.inquiries).doc(id).get();
  return snap.exists ? (snap.data() as ContactRequest) : null;
}

export async function saveInquiryDoc(inq: ContactRequest): Promise<void> {
  await getDb().collection(COLLECTIONS.inquiries).doc(inq.id).set(inq);
}

// ---------------------------------------------------------------------------
// 9. Audit Logs (auditLogs/{id})
// ---------------------------------------------------------------------------
export async function listAuditLogs(limitCount = 200): Promise<AuditLogEntry[]> {
  const snap = await getDb()
    .collection(COLLECTIONS.auditLogs)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();
  return snap.docs.map((d) => d.data() as AuditLogEntry);
}

export async function appendAuditLog(
  entry: Omit<AuditLogEntry, 'id'> & { id?: string }
): Promise<void> {
  const id =
    entry.id || `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await getDb()
    .collection(COLLECTIONS.auditLogs)
    .doc(id)
    .set({ ...entry, id });
}

// ---------------------------------------------------------------------------
// 10. Media Assets (media/{id})
// ---------------------------------------------------------------------------
export async function listMediaAssets(): Promise<MediaAsset[]> {
  const snap = await getDb().collection(COLLECTIONS.media).get();
  return snap.docs
    .map((d) => d.data() as MediaAsset)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  if (!id) return null;
  const snap = await getDb().collection(COLLECTIONS.media).doc(id).get();
  return snap.exists ? (snap.data() as MediaAsset) : null;
}

export async function saveMediaAsset(asset: MediaAsset): Promise<void> {
  await getDb().collection(COLLECTIONS.media).doc(asset.id).set(asset);
}

export async function deleteMediaAssetById(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.media).doc(id).delete();
}

// ---------------------------------------------------------------------------
// 11. Outbox Jobs (outboxJobs/{id})
// ---------------------------------------------------------------------------
export async function listOutboxJobs(): Promise<OutboxJob[]> {
  const snap = await getDb().collection(COLLECTIONS.outboxJobs).get();
  return snap.docs.map((d) => d.data() as OutboxJob);
}

export async function saveOutboxJob(job: OutboxJob): Promise<void> {
  await getDb().collection(COLLECTIONS.outboxJobs).doc(job.id).set(job);
}
