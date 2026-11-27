import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/server/db/store';
import { applySettledPaymentToRequest, fetchMoyasarPayment, mapMoyasarPaymentMethod } from '@/server/payments/moyasar';
import { checkRateLimit, getClientIp } from '@/server/security/rate-limit';
import { ConsultationRequest } from '@/server/types';

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
    if (payment.status !== 'paid' && payment.status !== 'captured') {
      return NextResponse.json({ ok: true, note: `Payment status is ${payment.status}` });
    }
    const nowIso = new Date().toISOString();
    const paymentMethodMapped = mapMoyasarPaymentMethod(payment);

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
        return NextResponse.json({ ok: true, alreadySettled: true, paymentRequestId: pr.id });
      }

      // Exact amount & currency validation
      if (payment.amount === pr.amountMinor && payment.currency.toUpperCase() === 'SAR') {
        const { changed } = applySettledPaymentToRequest(pr, payment);

        if (changed) {
          try {
            revalidatePath('/admin/invoices');
            revalidatePath(`/ar/pay/${pr.token}`);
            revalidatePath(`/en/pay/${pr.token}`);
          } catch {}
        }

        return NextResponse.json({ ok: true, settled: true, paymentRequestId: pr.id });
      } else {
        console.warn(`[WEBHOOK_PAYMENT_MISMATCH] Amount or currency did not match for PR: ${pr.id}`);
        return NextResponse.json({ ok: false, error: 'Payment amount or currency mismatch' }, { status: 400 });
      }
    }

    // B. Check for Consultation Booking
    const consultationId = payment.metadata?.consultationId || event.data?.metadata?.consultationId;
    if (consultationId) {
      let consultation = store.consultations.get(consultationId);
      if (!consultation) {
        const fallbackNow = new Date().toISOString();
        consultation = {
          id: consultationId,
          reference: String(payment.metadata?.reference || consultationId),
          fullName: payment.source?.name || 'Client',
          phone: '',
          serviceId: 'general',
          serviceLabelSnapshot: { ar: 'استشارة قانونية', en: 'Legal Consultation' },
          preferredLawyerId: null,
          preferredLawyerLabelSnapshot: null,
          preferredDate: null,
          assignedLawyerId: null,
          scheduledAt: null,
          appointmentTimezone: 'Asia/Riyadh',
          meetingType: null,
          meetingLink: null,
          meetingAddress: null,
          status: 'pending',
          locale: 'ar',
          sourcePage: null,
          notes: [],
          history: [],
          createdAt: fallbackNow,
          updatedAt: fallbackNow,
          amountMinor: Math.round((store.siteSettings?.consultationFee || 500) * 100),
          currency: store.siteSettings?.consultationCurrency || 'SAR',
        };
      }

      if (consultation.paymentStatus === 'paid') {
        return NextResponse.json({ ok: true, alreadySettled: true, consultationId });
      }

      const expectedMinor =
        consultation.amountMinor || Math.round((store.siteSettings?.consultationFee || 500) * 100);
      if (payment.currency.toUpperCase() !== 'SAR' || payment.amount < expectedMinor) {
        return NextResponse.json(
          { ok: false, error: 'Consultation payment amount or currency mismatch' },
          { status: 400 }
        );
      }

      consultation.paymentStatus = 'paid';
      consultation.paymentId = payment.id;
      consultation.paymentMethod = paymentMethodMapped as any;
      consultation.paidAt = payment.created_at || nowIso;
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
