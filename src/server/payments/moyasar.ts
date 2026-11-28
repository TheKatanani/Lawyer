import 'server-only';
import { getSiteSettingsOrNull, savePaymentRequest } from '@/server/db/dal';
import { PaymentRequest, PaymentRequestMethod, PaymentRequestReceipt } from '@/server/types';

export interface MoyasarPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  callback_url?: string;
  status: 'created' | 'paid' | 'failed' | 'expired' | string;
  client_secret: string;
  fulfilled_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
  payments?: MoyasarPayment[];
}

export interface MoyasarPayment {
  id: string;
  status: 'initiated' | 'paid' | 'failed' | 'refunded' | 'captured' | 'voided';
  amount: number;
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
    type: string;
    company?: string;
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

export function isPaymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === 'true';
}

export async function getMoyasarSecretKey(): Promise<string> {
  try {
    const settings = await getSiteSettingsOrNull();
    if (settings?.moyasarSecretKey?.trim()) {
      return settings.moyasarSecretKey.trim();
    }
  } catch {
    // Fallback strictly to server env when settings check fails
  }
  return process.env.MOYASAR_SECRET_KEY || '';
}

export async function getMoyasarPublishableKey(): Promise<string> {
  try {
    const settings = await getSiteSettingsOrNull();
    if (settings?.moyasarPublishableKey?.trim()) {
      return settings.moyasarPublishableKey.trim();
    }
  } catch {
    // Fallback strictly to server env when settings check fails
  }
  const dynamicPublicKeyName = 'NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY';
  return (
    process.env.MOYASAR_PUBLISHABLE_KEY?.trim() ||
    process.env[dynamicPublicKeyName]?.trim() ||
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY?.trim() ||
    ''
  );
}

export async function fetchMoyasarPayment(paymentId: string): Promise<MoyasarPayment> {
  if (!paymentId || !/^[A-Za-z0-9_-]{1,150}$/.test(paymentId)) {
    throw new PaymentVerificationError(
      'INVALID_PAYMENT_ID',
      'Invalid payment transaction ID provided.',
      400
    );
  }

  const secret = await getMoyasarSecretKey();
  if (!secret) {
    throw new PaymentVerificationError(
      'PAYMENT_NOT_CONFIGURED',
      'Moyasar secret key is not configured on the server.',
      503
    );
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
    throw new PaymentVerificationError(
      'INVALID_PROVIDER_RESPONSE',
      'Invalid response format received from Moyasar.',
      502
    );
  }

  return data as MoyasarPayment;
}

export function mapMoyasarPaymentMethod(payment: MoyasarPayment): PaymentRequestMethod {
  const sourceType = (payment.source?.type || '').toLowerCase();
  const sourceCompany = (payment.source?.company || '').toLowerCase();
  if (sourceType === 'applepay' || sourceCompany === 'applepay') {
    return 'applepay';
  }
  if (sourceCompany === 'mada') {
    return 'mada';
  }
  return 'creditcard';
}

export function buildPaymentRequestReceipt(
  pr: PaymentRequest,
  payment?: MoyasarPayment | null
): PaymentRequestReceipt {
  if (pr.receipt && pr.receipt.moyasarPaymentId) {
    return pr.receipt;
  }
  const maskedCard =
    pr.maskedCard ||
    (payment?.source?.number ? `•••• •••• •••• ${payment.source.number.slice(-4)}` : undefined);
  const paidAt = pr.paidAt || payment?.created_at || new Date().toISOString();
  const payerName = pr.payerName || payment?.source?.name?.trim() || pr.clientName;
  const currency = (pr.currency || payment?.currency || 'SAR').toUpperCase();
  const method = pr.paymentMethod || (payment ? mapMoyasarPaymentMethod(payment) : 'creditcard');

  return {
    reference: pr.id,
    moyasarPaymentId: pr.moyasarPaymentId || payment?.id || '',
    amountSar: pr.amountSar,
    amountMinor: pr.amountMinor,
    currency,
    paidAt,
    payerName,
    paymentMethod: method,
    maskedCard,
  };
}

export async function applySettledPaymentToRequest(
  pr: PaymentRequest,
  payment: MoyasarPayment
): Promise<{ changed: boolean; receipt: PaymentRequestReceipt }> {
  const alreadyPaid = pr.status === 'paid';
  const method = mapMoyasarPaymentMethod(payment);
  const maskedCard = payment.source?.number
    ? `•••• •••• •••• ${payment.source.number.slice(-4)}`
    : pr.maskedCard;
  const paidAt = pr.paidAt || payment.created_at || new Date().toISOString();
  const payerName = pr.payerName || payment.source?.name?.trim() || pr.clientName;
  const currency = (payment.currency || pr.currency || 'SAR').toUpperCase();

  pr.status = 'paid';
  pr.currency = currency;
  pr.moyasarPaymentId = pr.moyasarPaymentId || payment.id;
  pr.paymentMethod = pr.paymentMethod || method;
  pr.payerName = payerName;
  pr.maskedCard = maskedCard;
  pr.paidAt = paidAt;
  pr.receipt = pr.receipt || {
    reference: pr.id,
    moyasarPaymentId: payment.id,
    amountSar: pr.amountSar,
    amountMinor: pr.amountMinor,
    currency,
    paidAt,
    payerName,
    paymentMethod: method,
    maskedCard,
  };

  if (!alreadyPaid) {
    await savePaymentRequest(pr);
  }
  return { changed: !alreadyPaid, receipt: pr.receipt };
}

export async function createMoyasarPaymentIntent(input: {
  amountMinor: number;
  currency?: string;
  description: string;
  callbackUrl: string;
}): Promise<MoyasarPaymentIntent> {
  const secret = await getMoyasarSecretKey();
  if (!secret) {
    throw new PaymentVerificationError(
      'PAYMENT_NOT_CONFIGURED',
      'Moyasar secret key is not configured on the server.',
      503
    );
  }

  const response = await fetch('https://api.moyasar.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(secret + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: input.amountMinor,
      currency: (input.currency || 'SAR').toUpperCase(),
      description: input.description.slice(0, 255),
      callback_url: input.callbackUrl,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new PaymentVerificationError(
      'PAYMENT_INTENT_CREATE_FAILED',
      `Failed to initialize Moyasar payment intent (status: ${response.status}). ${errorBody}`,
      502
    );
  }

  const data = await response.json();
  if (!data?.id || !data?.client_secret) {
    throw new PaymentVerificationError(
      'INVALID_PROVIDER_RESPONSE',
      'Invalid payment intent returned by Moyasar.',
      502
    );
  }
  return data as MoyasarPaymentIntent;
}

export async function fetchMoyasarPaymentIntent(
  intentId: string
): Promise<MoyasarPaymentIntent | null> {
  const secret = await getMoyasarSecretKey();
  if (!secret || !intentId) return null;
  try {
    const response = await fetch(
      `https://api.moyasar.com/v1/payment_intents/${encodeURIComponent(intentId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(secret + ':').toString('base64')}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!response.ok) return null;
    return (await response.json()) as MoyasarPaymentIntent;
  } catch {
    return null;
  }
}

export async function findPaidMoyasarPaymentByMetadata(
  metaKey: 'token' | 'consultationId',
  metaValue: string,
  expectedAmountMinor: number,
  exactAmount = true
): Promise<MoyasarPayment | null> {
  const secret = await getMoyasarSecretKey();
  if (!secret || !metaValue) return null;

  try {
    const url = `https://api.moyasar.com/v1/payments?metadata[${encodeURIComponent(
      metaKey
    )}]=${encodeURIComponent(metaValue)}&page=1`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(secret + ':').toString('base64')}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const payments: MoyasarPayment[] = Array.isArray(payload?.payments)
      ? payload.payments
      : Array.isArray(payload)
      ? payload
      : [];

    for (const p of payments) {
      if (!p || (p.status !== 'paid' && p.status !== 'captured')) continue;
      if ((p.currency || '').toUpperCase() !== 'SAR') continue;
      if (exactAmount ? p.amount !== expectedAmountMinor : p.amount < expectedAmountMinor) continue;
      if (p.metadata?.[metaKey] === metaValue) {
        return p;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function reconcilePaidPaymentRequest(
  pr: PaymentRequest
): Promise<PaymentRequest> {
  if (pr.status === 'paid') {
    if (!pr.receipt) {
      pr.receipt = buildPaymentRequestReceipt(pr);
      await savePaymentRequest(pr);
    }
    return pr;
  }

  if (!isPaymentsEnabled() || !(await getMoyasarSecretKey())) {
    return pr;
  }

  if (pr.paymentIntentId) {
    const intent = await fetchMoyasarPaymentIntent(pr.paymentIntentId);
    const settledInIntent = intent?.payments?.find(
      (p) =>
        (p.status === 'paid' || p.status === 'captured') &&
        (p.currency || '').toUpperCase() === 'SAR' &&
        p.amount === pr.amountMinor
    );
    if (settledInIntent) {
      await applySettledPaymentToRequest(pr, settledInIntent);
      return pr;
    }
  }

  const paidPayment = await findPaidMoyasarPaymentByMetadata(
    'token',
    pr.token,
    pr.amountMinor,
    true
  );
  if (paidPayment) {
    await applySettledPaymentToRequest(pr, paidPayment);
  }
  return pr;
}
