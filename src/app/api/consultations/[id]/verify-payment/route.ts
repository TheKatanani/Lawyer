import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  appendAuditLog,
  getConsultationById,
  getSiteSettingsOrNull,
  saveConsultation,
} from '@/server/db/dal';
import { fetchMoyasarPayment, isPaymentsEnabled } from '@/server/payments/moyasar';
import { ConsultationRequest } from '@/server/types';

export const dynamic = 'force-dynamic';

const VerifyConsultationPaymentSchema = z.object({
  paymentId: z.string().trim().min(1).max(120).optional(),
  chosenMethod: z.enum(['office', 'online']).optional(),
});

interface Params {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params: { id } }: Params) {
  try {
    let consultation = await getConsultationById(id);

    const rawBody = await req.json().catch(() => null);
    const parsed = VerifyConsultationPaymentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment verification payload.' }, { status: 400 });
    }
    const { paymentId, chosenMethod } = parsed.data;

    // Handle "pay at office" choice if payment is optional
    if (chosenMethod === 'office') {
      if (!consultation) {
        return NextResponse.json({ error: 'Consultation record not found.' }, { status: 404 });
      }
      consultation.paymentStatus = 'unpaid';
      consultation.paymentMethod = 'office_cash';
      consultation.updatedAt = new Date().toISOString();
      consultation.history.push({
        id: `H-${Date.now()}`,
        actorEmail: consultation.phone,
        action: 'CONSULTATION_CHOSE_PAY_AT_OFFICE',
        details: { note: 'Client opted to pay consultation fee in person at firm office' },
        timestamp: new Date().toISOString(),
      });
      await saveConsultation(consultation);
      return NextResponse.json({
        success: true,
        consultation,
        message: 'Pay at office recorded successfully.',
      });
    }

    if (!isPaymentsEnabled()) {
      return NextResponse.json(
        { error: 'Online payments are currently disabled.' },
        { status: 503 }
      );
    }

    if (!paymentId || typeof paymentId !== 'string') {
      return NextResponse.json({ error: 'Valid Moyasar payment ID is required.' }, { status: 400 });
    }

    // Idempotent: If already marked as paid, return persisted consultation receipt
    if (consultation && consultation.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        consultation,
        alreadyProcessed: true,
        receipt: {
          reference: consultation.reference,
          paymentId: consultation.paymentId,
          amountSar: (consultation.amountMinor || 0) / 100,
          currency: consultation.currency || 'SAR',
          method: consultation.paymentMethod,
          paidAt: consultation.paidAt,
        },
      });
    }

    // Direct server verification with Moyasar API
    const verifiedPayment = await fetchMoyasarPayment(paymentId);

    const settings = await getSiteSettingsOrNull();

    // Cross-lambda fallback: if another serverless instance created this consultation,
    // verify ownership cleanly via Moyasar's verified metadata.consultationId
    if (!consultation) {
      if (verifiedPayment.metadata?.consultationId !== id) {
        return NextResponse.json({ error: 'Consultation record not found.' }, { status: 404 });
      }
      const fallbackNow = new Date().toISOString();
      consultation = {
        id,
        reference: String(verifiedPayment.metadata?.reference || id),
        fullName: verifiedPayment.source?.name || 'Client',
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
        amountMinor: Math.round((settings?.consultationFee || 500) * 100),
        currency: settings?.consultationCurrency || 'SAR',
      };
    }

    if (verifiedPayment.status !== 'paid' && verifiedPayment.status !== 'captured') {
      return NextResponse.json(
        {
          error: `Payment is not completed. Current status: ${verifiedPayment.status}`,
          status: verifiedPayment.status,
        },
        { status: 422 }
      );
    }

    if (verifiedPayment.currency.toUpperCase() !== 'SAR') {
      return NextResponse.json(
        { error: `Invalid payment currency (${verifiedPayment.currency}). Expected SAR.` },
        { status: 422 }
      );
    }

    // Verify amount matches
    const expectedMinor = consultation.amountMinor || Math.round((settings?.consultationFee || 500) * 100);
    if (verifiedPayment.amount < expectedMinor) {
      return NextResponse.json(
        {
          error: `Payment amount (${verifiedPayment.amount / 100} SAR) is less than expected (${expectedMinor / 100} SAR).`,
        },
        { status: 422 }
      );
    }

    const nowIso = new Date().toISOString();
    const sourceCompany = (verifiedPayment.source?.company || verifiedPayment.source?.type || 'card').toLowerCase();
    const paymentMethodMapped =
      sourceCompany === 'mada'
        ? 'mada'
        : sourceCompany === 'applepay'
        ? 'applepay'
        : 'creditcard';

    consultation.paymentStatus = 'paid';
    consultation.paymentId = verifiedPayment.id;
    consultation.paymentMethod = paymentMethodMapped as any;
    consultation.paidAt = nowIso;
    consultation.status = 'confirmed'; // Auto-confirm on verified payment
    consultation.updatedAt = nowIso;

    consultation.history.push({
      id: `H-${Date.now()}`,
      actorEmail: 'system/moyasar',
      action: 'CONSULTATION_PAYMENT_VERIFIED',
      fromStatus: 'pending',
      toStatus: 'confirmed',
      details: {
        paymentId: verifiedPayment.id,
        amount: verifiedPayment.amount / 100,
        currency: verifiedPayment.currency,
        cardCompany: verifiedPayment.source?.company,
        maskedNumber: verifiedPayment.source?.number,
      },
      timestamp: nowIso,
    });

    await saveConsultation(consultation);

    try {
      revalidatePath('/admin/consultations');
      revalidatePath('/admin');
    } catch (e) {
      // Ignore in non-request contexts
    }

    // Audit log
    await appendAuditLog({
      id: `AUDIT-${Date.now()}`,
      actorUid: 'moyasar-gateway',
      actorEmail: consultation.phone,
      action: 'CONSULTATION_PAYMENT_SETTLED',
      targetType: 'consultationRequest',
      targetId: consultation.id,
      details: {
        reference: consultation.reference,
        paymentId: verifiedPayment.id,
        amountSar: verifiedPayment.amount / 100,
        method: paymentMethodMapped,
      },
      createdAt: nowIso,
    });

    return NextResponse.json({
      success: true,
      consultation,
      receipt: {
        reference: consultation.reference,
        paymentId: verifiedPayment.id,
        amountSar: verifiedPayment.amount / 100,
        currency: verifiedPayment.currency,
        method: paymentMethodMapped,
        paidAt: nowIso,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Payment verification failed.' },
      { status: err.statusCode || 500 }
    );
  }
}
