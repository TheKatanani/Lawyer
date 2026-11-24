import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/server/db/store';
import { fetchMoyasarPayment } from '@/server/payments/moyasar';
import { checkRateLimit, getClientIp } from '@/server/security/rate-limit';
import { PaymentRequestMethod } from '@/server/types';

export const runtime = 'nodejs';

function timingSafeSecretCheck(givenSecret: string, expectedSecret: string): boolean {
  try {
    const givenBuf = Buffer.from(givenSecret);
    const expectedBuf = Buffer.from(expectedSecret);
    if (givenBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(givenBuf, expectedBuf);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Webhook rate limit (60 requests/min per IP to prevent DoS while accommodating legitimate bursts)
    const rl = checkRateLimit(`webhook_moyasar:${ip}`, 60, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rl.resetInSeconds) } }
      );
    }

    const configuredSecret = process.env.MOYASAR_WEBHOOK_SECRET;
    const raw = await req.text();

    if (Buffer.byteLength(raw) > 64000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    let event: any;
    try {
      event = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 2. Constant-time signature / secret verification
    if (configuredSecret && event.secret_token) {
      const isValid = timingSafeSecretCheck(event.secret_token, configuredSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
      }
    }

    if (event.type !== 'payment_paid' && event.type !== 'payment_captured') {
      return NextResponse.json({ ok: true, ignoredType: event.type });
    }

    const paymentId = event.data?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true, note: 'No payment id in payload' });
    }

    // 3. Fetch verified payment details directly from Moyasar
    const payment = await fetchMoyasarPayment(paymentId);
    const nowIso = new Date().toISOString();

    const sourceCompany = (payment.source?.company || payment.source?.type || 'card').toLowerCase();
    const paymentMethodMapped: PaymentRequestMethod =
      sourceCompany === 'mada'
        ? 'mada'
        : sourceCompany === 'applepay'
        ? 'applepay'
        : 'creditcard';

    // A. Check for Ad-Hoc Payment Request (Token or RequestId)
    const requestToken = payment.metadata?.token || event.data?.metadata?.token;
    const requestId = payment.metadata?.requestId || event.data?.metadata?.requestId;

    let pr = requestToken ? store.getPaymentRequestByToken(requestToken) : undefined;
    if (!pr && requestId) {
      pr = store.getPaymentRequestById(requestId);
    }

    if (pr) {
      // Idempotency: Return immediately if already settled
      if (pr.status === 'paid') {
        return NextResponse.json({ ok: true, note: 'Payment request already settled' });
      }

      // Exact amount & currency validation
      if (payment.amount === pr.amountMinor && payment.currency.toUpperCase() === 'SAR') {
        pr.status = 'paid';
        pr.moyasarPaymentId = payment.id;
        pr.paymentMethod = paymentMethodMapped;
        pr.paidAt = nowIso;

        store.paymentRequests.set(pr.id, pr);
        store.persistToDisk?.();

        try {
          revalidatePath('/admin/invoices');
          revalidatePath(`/pay/${pr.token}`);
        } catch {}

        return NextResponse.json({ ok: true, settled: true, paymentRequestId: pr.id });
      } else {
        console.warn(`[WEBHOOK_PAYMENT_MISMATCH] Amount or currency did not match for PR: ${pr.id}`);
      }
    }

    // B. Check for Consultation Booking (Existing Integration - Preserved)
    const consultationId = payment.metadata?.consultationId || event.data?.metadata?.consultationId;
    if (consultationId) {
      const consultation = store.consultations.get(consultationId);
      if (!consultation) {
        return NextResponse.json({ ok: true, note: 'Consultation not found in store' });
      }

      if (consultation.paymentStatus === 'paid') {
        return NextResponse.json({ ok: true, note: 'Consultation already settled' });
      }

      consultation.paymentStatus = 'paid';
      consultation.paymentId = payment.id;
      consultation.paymentMethod = paymentMethodMapped as any;
      consultation.paidAt = nowIso;
      consultation.status = 'confirmed';
      consultation.updatedAt = nowIso;

      consultation.history.push({
        id: `H-${Date.now()}`,
        actorEmail: 'webhook/moyasar',
        action: 'CONSULTATION_PAYMENT_SETTLED_VIA_WEBHOOK',
        details: {
          paymentId: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
        },
        timestamp: nowIso,
      });

      store.consultations.set(consultation.id, consultation);
      store.persistToDisk?.();

      try {
        revalidatePath('/admin/consultations');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({ ok: true, settled: true, consultationId });
    }

    return NextResponse.json({ ok: true, note: 'No matching transaction found in store' });
  } catch (err: any) {
    console.error('[MOYASAR_WEBHOOK_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
