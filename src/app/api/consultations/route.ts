import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/server/db/store';
import { ConsultationRequest, ConsultationStatus, SupportedLocale } from '@/server/types';
import { normalizePhoneE164, buildWhatsAppMessage } from '@/server/utils/consultation';
import { getMoyasarPublishableKey } from '@/server/payments/moyasar';

// Rate limiting sliding window helper
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = store.rateLimits.get(ip);
  if (!record || record.expiresAt < now) {
    store.rateLimits.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP & Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      serviceId,
      preferredLawyerId,
      preferredDate,
      locale = 'ar',
      sourcePage,
      idempotencyKey,
      botHoneypot,
    } = body;

    // 2. Anti-spam bot honeypot check
    if (botHoneypot) {
      return NextResponse.json({ success: true, reference: 'CR-REF-SPAM' });
    }

    // 3. Idempotency Check
    if (idempotencyKey && store.idempotencyKeys.has(idempotencyKey)) {
      const cached = store.idempotencyKeys.get(idempotencyKey)!;
      if (cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.result);
      }
    }

    // 4. Validation
    const cleanName = typeof fullName === 'string' ? fullName.trim() : '';
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: 'Valid full name between 2 and 100 characters is required.' },
        { status: 400 }
      );
    }

    const rawPhone = typeof phone === 'string' ? phone.trim() : '';
    if (!rawPhone || rawPhone.length < 7) {
      return NextResponse.json(
        { error: 'Valid contact phone number is required.' },
        { status: 400 }
      );
    }
    const cleanPhone = normalizePhoneE164(rawPhone);

    // Validate service selection
    let serviceLabelAr = 'استفسار عام';
    let serviceLabelEn = 'General Inquiry';
    const effectiveServiceId = serviceId || 'general';

    if (effectiveServiceId !== 'general') {
      const matchedService = store.services.get(effectiveServiceId);
      if (matchedService) {
        // Look up revision titles
        const arRev = store.serviceRevisions.get(matchedService.locales.ar.publishedRevisionId || '');
        const enRev = store.serviceRevisions.get(matchedService.locales.en.publishedRevisionId || '');
        serviceLabelAr = arRev?.title || matchedService.id;
        serviceLabelEn = enRev?.title || matchedService.id;
      }
    }

    // Validate lawyer selection
    let preferredLawyerAr: string | null = null;
    let preferredLawyerEn: string | null = null;
    let validLawyerId: string | null = null;

    if (preferredLawyerId && preferredLawyerId !== 'no_preference') {
      const matchedLawyer = store.teamMembers.get(preferredLawyerId);
      if (matchedLawyer) {
        validLawyerId = matchedLawyer.id;
        const arRev = store.teamMemberRevisions.get(matchedLawyer.locales.ar.publishedRevisionId || '');
        const enRev = store.teamMemberRevisions.get(matchedLawyer.locales.en.publishedRevisionId || '');
        preferredLawyerAr = arRev?.fullName || validLawyerId;
        preferredLawyerEn = enRev?.fullName || validLawyerId;
      }
    }

    // Validate preferredDate (if provided, must be YYYY-MM-DD and not in the past in Asia/Riyadh)
    let cleanDate: string | null = null;
    if (preferredDate && typeof preferredDate === 'string' && preferredDate.trim()) {
      const parsed = new Date(preferredDate.trim());
      if (!isNaN(parsed.getTime())) {
        const todayStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Riyadh',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());

        if (preferredDate.trim() < todayStr) {
          return NextResponse.json(
            { error: 'Preferred day cannot be in the past.' },
            { status: 400 }
          );
        }
        cleanDate = preferredDate.trim();
      }
    }

    // 5. Generate Reference Number & Store Entity
    const count = store.consultations.size + 1;
    const refNum = `CR-2026-${String(count).padStart(4, '0')}`;
    const id = `consultation-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const settings = store.siteSettings;
    const paymentEnabled = Boolean(settings?.paymentEnabled ?? true);
    const paymentRequirement = settings?.paymentRequirement ?? 'optional';
    const consultationFee = Number(settings?.consultationFee ?? 500);
    const consultationCurrency = settings?.consultationCurrency || 'SAR';
    const amountMinor = Math.round(consultationFee * 100);

    const consultation: ConsultationRequest = {
      id,
      reference: refNum,
      fullName: cleanName,
      phone: cleanPhone,
      serviceId: effectiveServiceId,
      serviceLabelSnapshot: {
        ar: serviceLabelAr,
        en: serviceLabelEn,
      },
      preferredLawyerId: validLawyerId,
      preferredLawyerLabelSnapshot: validLawyerId
        ? {
            ar: preferredLawyerAr || '',
            en: preferredLawyerEn || '',
          }
        : null,
      preferredDate: cleanDate,
      assignedLawyerId: null,
      scheduledAt: null,
      appointmentTimezone: 'Asia/Riyadh',
      meetingType: null,
      meetingLink: null,
      meetingAddress: null,
      status: 'pending', // Strictly pending at creation
      locale: locale === 'en' ? 'en' : 'ar',
      sourcePage: typeof sourcePage === 'string' ? sourcePage.slice(0, 150) : null,
      notes: [],
      history: [
        {
          id: `H-${Date.now()}`,
          actorEmail: 'system',
          action: 'CONSULTATION_CREATED',
          toStatus: 'pending',
          details: {
            service: effectiveServiceId,
            lawyer: validLawyerId || 'no_preference',
            date: cleanDate,
            paymentRequirement,
          },
          timestamp: nowIso,
        },
      ],
      idempotencyKey: idempotencyKey || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,

      // Payment Tracking Fields
      paymentStatus: paymentEnabled ? 'unpaid' : 'waived',
      paymentMethod: paymentEnabled ? undefined : 'waived',
      amountMinor: paymentEnabled ? amountMinor : 0,
      currency: consultationCurrency,
      paidAt: null,
    };

    store.consultations.set(consultation.id, consultation);
    store.persistToDisk?.();

    try {
      revalidatePath('/admin/consultations');
      revalidatePath('/admin');
    } catch (e) {
      // Ignore in non-request contexts
    }

    // Audit log
    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: 'public-visitor',
      actorEmail: cleanPhone,
      action: 'CONSULTATION_REQUEST_SUBMITTED',
      targetType: 'consultationRequest',
      targetId: consultation.id,
      details: {
        reference: refNum,
        serviceId: effectiveServiceId,
        preferredLawyerId: validLawyerId,
        paymentStatus: consultation.paymentStatus,
      },
      createdAt: nowIso,
    });

    // 6. Construct Encoded WhatsApp URL
    const destinationWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+966557775504';
    const cleanDestination = destinationWhatsApp.replace(/[^\d]/g, '');

    const lawyerLabel =
      locale === 'en'
        ? preferredLawyerEn || 'No preference'
        : preferredLawyerAr || 'لا يوجد تفضيل';

    const messageText = buildWhatsAppMessage({
      reference: refNum,
      fullName: cleanName,
      phone: cleanPhone,
      serviceName: locale === 'en' ? serviceLabelEn : serviceLabelAr,
      preferredLawyer: lawyerLabel,
      preferredDate: cleanDate,
      locale: locale === 'en' ? 'en' : 'ar',
    });

    const whatsappUrl = `https://wa.me/${cleanDestination}?text=${encodeURIComponent(messageText)}`;

    const publishableKey = getMoyasarPublishableKey();

    const responsePayload = {
      success: true,
      consultationId: consultation.id,
      reference: refNum,
      whatsappUrl,
      payment: {
        enabled: paymentEnabled && paymentRequirement !== 'disabled',
        requirement: paymentRequirement,
        amountMinor,
        amountSar: consultationFee,
        currency: consultationCurrency,
        publishableKey,
        applePayEnabled: Boolean(settings?.applePayEnabled),
        notice:
          locale === 'en'
            ? settings?.paymentNoticeEn || 'Consultation booking fee is deductible upon representation retainer.'
            : settings?.paymentNoticeAr || 'رسوم حجز الاستشارة تُحسم من أتعاب القضية أو العقد في حال التوكيل الرسمي.',
      },
    };

    // Cache idempotency result for 1 hour
    if (idempotencyKey) {
      store.idempotencyKeys.set(idempotencyKey, {
        result: responsePayload,
        expiresAt: Date.now() + 60 * 60 * 1000,
      });
    }

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process consultation request.' },
      { status: 500 }
    );
  }
}
