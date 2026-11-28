import type { Firestore } from 'firebase-admin/firestore';
import { COLLECTIONS, SITE_SETTINGS_DOC_ID, getDb } from './firestore';
import {
  buildSeedAdmins,
  buildSeedArticles,
  buildSeedConsultations,
  buildSeedInquiries,
  buildSeedPaymentRequests,
  buildSeedServices,
  buildSeedSettings,
  buildSeedTeamMembers,
} from './seed-defaults';

export interface SeedCollectionResult {
  collection: string;
  seeded: number;
  skipped: boolean;
}

export interface SeedReport {
  results: SeedCollectionResult[];
}

async function seedCollectionIfEmpty<T extends Record<string, any>>(
  db: Firestore,
  collectionName: string,
  items: T[],
  getId: (item: T) => string
): Promise<SeedCollectionResult> {
  const col = db.collection(collectionName);
  const existing = await col.limit(1).get();
  if (!existing.empty) {
    return { collection: collectionName, seeded: 0, skipped: true };
  }

  let count = 0;
  // Write in chunks of 400 (well under Firestore 500 batch limit)
  for (let i = 0; i < items.length; i += 400) {
    const chunk = items.slice(i, i + 400);
    const batch = db.batch();
    for (const item of chunk) {
      batch.set(col.doc(getId(item)), item);
      count += 1;
    }
    await batch.commit();
  }

  return { collection: collectionName, seeded: count, skipped: false };
}

/**
 * Idempotent one-time Firestore seed.
 * Checks each collection independently and populates defaults ONLY when empty.
 */
export async function seedFirestore(dbInstance?: Firestore): Promise<SeedReport> {
  const db = dbInstance || getDb();
  const results: SeedCollectionResult[] = [];

  // 1. siteSettings (single document: global)
  const settingsRef = db.collection(COLLECTIONS.siteSettings).doc(SITE_SETTINGS_DOC_ID);
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set(buildSeedSettings());
    results.push({ collection: COLLECTIONS.siteSettings, seeded: 1, skipped: false });
  } else {
    results.push({ collection: COLLECTIONS.siteSettings, seeded: 0, skipped: true });
  }

  // 2. Core domain & CMS collections (one document per item)
  results.push(
    await seedCollectionIfEmpty(db, COLLECTIONS.services, buildSeedServices(), (s) => s.id),
    await seedCollectionIfEmpty(
      db,
      COLLECTIONS.teamMembers,
      buildSeedTeamMembers(),
      (m) => m.id
    ),
    await seedCollectionIfEmpty(db, COLLECTIONS.articles, buildSeedArticles(), (a) => a.id),
    await seedCollectionIfEmpty(
      db,
      COLLECTIONS.consultations,
      buildSeedConsultations(),
      (c) => c.id
    ),
    await seedCollectionIfEmpty(
      db,
      COLLECTIONS.paymentRequests,
      buildSeedPaymentRequests(),
      (p) => p.id
    ),
    await seedCollectionIfEmpty(db, COLLECTIONS.admins, buildSeedAdmins(), (a) => a.uid),
    await seedCollectionIfEmpty(db, COLLECTIONS.inquiries, buildSeedInquiries(), (i) => i.id)
  );

  // 3. Monotonic sequence counters (seeded if absent)
  const countersCol = db.collection(COLLECTIONS.counters);
  const nowIso = new Date().toISOString();
  const year = new Date().getFullYear();

  const consultCounterRef = countersCol.doc('consultations');
  if (!(await consultCounterRef.get()).exists) {
    await consultCounterRef.set({ seq: 2, year, updatedAt: nowIso });
  }

  const prCounterRef = countersCol.doc('paymentRequests');
  if (!(await prCounterRef.get()).exists) {
    await prCounterRef.set({ seq: 2, year, updatedAt: nowIso });
  }

  return { results };
}
