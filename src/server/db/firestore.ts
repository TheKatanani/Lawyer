import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  throw new Error('src/server/db/firestore.ts is server-only and cannot be used in browser code.');
}

export const COLLECTIONS = {
  siteSettings: 'siteSettings',
  services: 'services',
  teamMembers: 'teamMembers',
  articles: 'articles',
  consultations: 'consultations',
  paymentRequests: 'paymentRequests',
  admins: 'admins',
  inquiries: 'inquiries',
  auditLogs: 'auditLogs',
  media: 'media',
  outboxJobs: 'outboxJobs',
  counters: 'counters',
} as const;

export const SITE_SETTINGS_DOC_ID = 'global';

const ADMIN_APP_NAME = 'rma-legal-admin';

interface ServiceAccountPayload {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export interface FirestoreConfigStatus {
  configured: boolean;
  mode: 'emulator' | 'cloud' | 'unconfigured';
  projectId: string;
  emulatorHost?: string;
}

export interface FirestorePingResult {
  ok: boolean;
  mode: 'emulator' | 'cloud' | 'unconfigured';
  projectId: string;
  latencyMs: number;
  seededSettings: boolean;
  error?: string;
}

export function resolveProjectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    'lawyer-ad052'
  );
}

function parseServiceAccountFromEnv(): ServiceAccountPayload | null {
  const projectIdFallback = resolveProjectId();
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON contains invalid JSON.');
    }
    const clientEmail = String(parsed.client_email || parsed.clientEmail || '').trim();
    const privateKey = String(parsed.private_key || parsed.privateKey || '')
      .replace(/\\n/g, '\n')
      .trim();
    const projectId = String(parsed.project_id || parsed.projectId || projectIdFallback).trim();
    if (!clientEmail || !privateKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing client_email or private_key.');
    }
    return { projectId, clientEmail, privateKey };
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (clientEmail && rawKey) {
    const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
    return {
      projectId: projectIdFallback,
      clientEmail,
      privateKey,
    };
  }

  return null;
}

export function getFirestoreConfigStatus(): FirestoreConfigStatus {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST?.trim();
  const projectId = resolveProjectId();

  if (emulatorHost) {
    return { configured: true, mode: 'emulator', projectId, emulatorHost };
  }

  try {
    const creds = parseServiceAccountFromEnv();
    if (creds) {
      return { configured: true, mode: 'cloud', projectId: creds.projectId };
    }
  } catch {
    return { configured: false, mode: 'unconfigured', projectId };
  }

  return { configured: false, mode: 'unconfigured', projectId };
}

let cachedDb: Firestore | null = null;
let cachedApp: App | null = null;
let cachedModeKey = '';

function getCurrentModeKey(): string {
  return [
    process.env.FIRESTORE_EMULATOR_HOST?.trim() || '',
    resolveProjectId(),
    process.env.FIREBASE_CLIENT_EMAIL?.trim() || '',
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()),
  ].join('|');
}

export function getAdminApp(): App {
  const modeKey = getCurrentModeKey();
  if (cachedApp && cachedModeKey === modeKey) {
    return cachedApp;
  }

  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing && cachedModeKey === modeKey) {
    cachedApp = existing;
    return existing;
  }

  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST?.trim();
  const projectId = resolveProjectId();

  let app: App;
  if (emulatorHost) {
    app = existing || initializeApp({ projectId }, ADMIN_APP_NAME);
  } else {
    const sa = parseServiceAccountFromEnv();
    if (!sa) {
      throw new Error(
        'Firestore Admin credentials are missing. Configure FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON), or set FIRESTORE_EMULATOR_HOST.'
      );
    }
    app =
      existing ||
      initializeApp(
        {
          credential: cert({
            projectId: sa.projectId,
            clientEmail: sa.clientEmail,
            privateKey: sa.privateKey,
          }),
          projectId: sa.projectId,
        },
        ADMIN_APP_NAME
      );
  }

  cachedApp = app;
  cachedModeKey = modeKey;
  return app;
}

export function getDb(): Firestore {
  const modeKey = getCurrentModeKey();
  if (cachedDb && cachedModeKey === modeKey) {
    return cachedDb;
  }

  const app = getAdminApp();
  const db = getFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // db.settings() throws if already initialized on this instance — safe to ignore
  }
  cachedDb = db;
  return db;
}

export async function pingFirestore(): Promise<FirestorePingResult> {
  const status = getFirestoreConfigStatus();
  const startedAt = Date.now();

  if (!status.configured) {
    return {
      ok: false,
      mode: 'unconfigured',
      projectId: status.projectId,
      latencyMs: 0,
      seededSettings: false,
      error:
        'بيانات حساب الخدمة (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY أو FIREBASE_SERVICE_ACCOUNT_JSON) غير مضافة في متغيرات البيئة.',
    };
  }

  try {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.siteSettings).doc(SITE_SETTINGS_DOC_ID).get();
    return {
      ok: true,
      mode: status.mode,
      projectId: status.projectId,
      latencyMs: Date.now() - startedAt,
      seededSettings: snap.exists,
    };
  } catch (err: any) {
    return {
      ok: false,
      mode: status.mode,
      projectId: status.projectId,
      latencyMs: Date.now() - startedAt,
      seededSettings: false,
      error: err?.message || 'Firestore connection failed',
    };
  }
}
