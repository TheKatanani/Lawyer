import 'server-only';
import { store } from '@/server/db/store';

export interface MoyasarPayment {
  id: string;
  status: 'initiated' | 'paid' | 'failed' | 'refunded' | 'captured' | 'voided';
  amount: number; // In Halalas (e.g., 50000 for 500 SAR)
  fee?: number;
  currency: string;
  refunded?: number;
  refunded_at?: string | null;
  captured?: number;
  captured_at?: string | null;
  voided_at?: string | null;
  description?: string;
  invoice_id?: string | null;
  ip?: string | null;
  callback_url?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  source?: {
    type: string; // 'creditcard' | 'applepay'
    company?: string; // 'mada' | 'visa' | 'mastercard'
    name?: string;
    number?: string;
    message?: string;
    transaction_url?: string;
  };
}

export class PaymentVerificationError extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = 'PaymentVerificationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Resolves the effective Moyasar Secret Key either from database/siteSettings or env
 */
export function getMoyasarSecretKey(): string {
  if (store.siteSettings?.moyasarSecretKey?.trim()) {
    return store.siteSettings.moyasarSecretKey.trim();
  }
  return process.env.MOYASAR_SECRET_KEY || '';
}

/**
 * Resolves the effective Moyasar Publishable Key either from database/siteSettings or env
 */
export function getMoyasarPublishableKey(): string {
  if (store.siteSettings?.moyasarPublishableKey?.trim()) {
    return store.siteSettings.moyasarPublishableKey.trim();
  }
  return process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || '';
}

/**
 * Securely verify payment directly with Moyasar API
 */
export async function fetchMoyasarPayment(paymentId: string): Promise<MoyasarPayment> {
  if (!paymentId || !/^[A-Za-z0-9_-]{1,150}$/.test(paymentId)) {
    throw new PaymentVerificationError('INVALID_PAYMENT_ID', 'Invalid payment transaction ID provided.', 400);
  }

  const secret = getMoyasarSecretKey();
  if (!secret) {
    throw new PaymentVerificationError('PAYMENT_NOT_CONFIGURED', 'Moyasar secret key is not configured on the server.', 503);
  }

  const url = `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(secret + ':').toString('base64')}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new PaymentVerificationError(
      'PAYMENT_VERIFICATION_FAILED',
      `Failed to verify payment with Moyasar (status: ${response.status}). ${errorBody}`,
      502
    );
  }

  const data = await response.json();

  if (
    !data ||
    data.id !== paymentId ||
    !Number.isSafeInteger(data.amount) ||
    typeof data.currency !== 'string' ||
    typeof data.status !== 'string'
  ) {
    throw new PaymentVerificationError('INVALID_PROVIDER_RESPONSE', 'Invalid response format received from Moyasar.', 502);
  }

  return data as MoyasarPayment;
}
