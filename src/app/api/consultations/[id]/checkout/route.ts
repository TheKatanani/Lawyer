import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/server/db/store';
import {
  createMoyasarPaymentIntent,
  fetchMoyasarPaymentIntent,
  findPaidMoyasarPaymentByMetadata,
  isPaymentsEnabled,
  PaymentVerificationError,
} from '@/server/payments/moyasar';
import { checkRateLimit, getClientIp } from '@/server/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`consult_checkout:${ip}`, 15, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429, headers: { 'Retry-After': String(rl.resetInSeconds) } }
    );
  }

  const consultationId = params.id;
  const consultation = store.consultations.get(consultationId);
  const feeMinor =
    consultation?.amountMinor || Math.round((store.siteSettings?.consultationFee || 500) * 100);

  if (consultation?.paymentStatus === 'paid') {
    return NextResponse.json(
      {
        error: 'Consultation fee has already been paid.',
        alreadyPaid: true,
        paymentId: consultation.paymentId,
      },
      { status: 409 }
    );
  }

  // Also check Moyasar in case payment completed on another serverless instance
  const existingPaid = await findPaidMoyasarPaymentByMetadata(
    'consultationId',
    consultationId,
    feeMinor,
    false
  );
  if (existingPaid) {
    return NextResponse.json(
      {
        error: 'Consultation fee has already been paid.',
        alreadyPaid: true,
        paymentId: existingPaid.id,
      },
      { status: 409 }
    );
  }

  if (!isPaymentsEnabled()) {
    return NextResponse.json({ error: 'Online payments are currently disabled.' }, { status: 503 });
  }

  const rawBody = await req.json().catch(() => ({}));
  const locale = rawBody?.locale === 'en' ? 'en' : 'ar';

  try {
    const existingIntentId = (consultation as any)?.paymentIntentId;
    if (existingIntentId) {
      const existingIntent = await fetchMoyasarPaymentIntent(existingIntentId);
      if (existingIntent && existingIntent.status === 'created' && existingIntent.client_secret) {
        return NextResponse.json({
          success: true,
          paymentIntent: {
            id: existingIntent.id,
            client_secret: existingIntent.client_secret,
          },
        });
      }
    }

    const origin = new URL(req.url).origin;
    const reference = consultation?.reference || String(rawBody?.reference || consultationId);
    const intent = await createMoyasarPaymentIntent({
      amountMinor: feeMinor,
      currency: consultation?.currency || store.siteSettings?.consultationCurrency || 'SAR',
      description: `RMA Legal Consultation ${reference}`,
      callbackUrl: `${origin}/${locale}/consultation/callback?consultation=${encodeURIComponent(consultationId)}`,
    });

    if (consultation) {
      (consultation as any).paymentIntentId = intent.id;
      store.consultations.set(consultation.id, consultation);
      store.persistToDisk?.();
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: intent.id,
        client_secret: intent.client_secret,
      },
    });
  } catch (err: any) {
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    return NextResponse.json(
      { error: err.message || 'Failed to prepare payment checkout.' },
      { status: 500 }
    );
  }
}
