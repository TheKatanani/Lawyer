import crypto from 'crypto';
import { getServerSigningSecret } from '@/server/auth/secret';
import { PaymentRequest } from '@/server/types';

interface SealedPaymentPayload {
  v: 1;
  id: string;
  c: string;
  s: string;
  a: number;
  d: string;
  iat: string;
  exp?: string;
}

function getAesKey(): Buffer {
  return crypto.createHash('sha256').update(`pay:${getServerSigningSecret()}`).digest();
}

/**
 * Deterministic token for built-in sample payment requests so sample links
 * stay identical across serverless cold starts.
 */
export function deriveSamplePaymentToken(requestId: string): string {
  return crypto
    .createHmac('sha256', getServerSigningSecret())
    .update(`sample-pr:${requestId}`)
    .digest('base64url')
    .slice(0, 32);
}

/**
 * Seals non-PII checkout fields into a tamper-proof AES-256-GCM token so payment
 * links work reliably across separate Vercel serverless Lambda instances even without
 * an external shared database.
 */
export function sealPaymentToken(
  data: Pick<PaymentRequest, 'id' | 'clientName' | 'serviceCategory' | 'amountMinor' | 'description' | 'createdAt' | 'expiresAt'>
): string {
  const payload: SealedPaymentPayload = {
    v: 1,
    id: data.id,
    c: data.clientName,
    s: data.serviceCategory,
    a: data.amountMinor,
    d: data.description,
    iat: data.createdAt,
    ...(data.expiresAt ? { exp: data.expiresAt } : {}),
  };

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getAesKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1.${Buffer.concat([iv, tag, encrypted]).toString('base64url')}`;
}

export function unsealPaymentToken(token: string): PaymentRequest | null {
  try {
    if (!token || !token.startsWith('v1.')) return null;
    const encoded = token.slice(3);
    const raw = Buffer.from(encoded, 'base64url');
    if (raw.length < 29 || raw.toString('base64url') !== encoded) return null;

    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const ciphertext = raw.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', getAesKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(decrypted) as SealedPaymentPayload;

    if (
      parsed?.v !== 1 ||
      typeof parsed.id !== 'string' ||
      typeof parsed.c !== 'string' ||
      typeof parsed.s !== 'string' ||
      !Number.isSafeInteger(parsed.a) ||
      parsed.a <= 0
    ) {
      return null;
    }

    return {
      id: parsed.id,
      token,
      clientName: parsed.c,
      clientPhone: '',
      serviceCategory: parsed.s,
      amountSar: Math.round((parsed.a / 100) * 100) / 100,
      amountMinor: parsed.a,
      description: parsed.d || parsed.s,
      status: 'unpaid',
      createdAt: parsed.iat || new Date().toISOString(),
      expiresAt: parsed.exp,
    };
  } catch {
    return null;
  }
}
