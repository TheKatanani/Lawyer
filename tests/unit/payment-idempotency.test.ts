import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as handleCheckoutInvoice } from '@/app/api/invoices/[token]/checkout/route';
import { POST as handleVerifyInvoice } from '@/app/api/invoices/[token]/verify/route';
import { GET as handleGetInvoice } from '@/app/api/invoices/[token]/route';
import { POST as handleMoyasarWebhook } from '@/app/api/webhooks/moyasar/route';
import { POST as handleCheckoutConsultation } from '@/app/api/consultations/[id]/checkout/route';
import { store } from '@/server/db/store';
import { PaymentRequest } from '@/server/types';

describe('Moyasar Paid State, Idempotency & Persistent Receipt', () => {
  const origPaymentsEnabled = process.env.PAYMENTS_ENABLED;
  const origSecretKey = process.env.MOYASAR_SECRET_KEY;
  const origPubKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;
  const origWebhookSecret = process.env.MOYASAR_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.PAYMENTS_ENABLED = 'true';
    process.env.MOYASAR_SECRET_KEY = 'sk_test_unit_mock_secret';
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY = 'pk_test_unit_mock_pub';
    process.env.MOYASAR_WEBHOOK_SECRET = 'wh_test_secret';
    store.rateLimits.clear();
  });

  afterEach(() => {
    process.env.PAYMENTS_ENABLED = origPaymentsEnabled;
    process.env.MOYASAR_SECRET_KEY = origSecretKey;
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY = origPubKey;
    process.env.MOYASAR_WEBHOOK_SECRET = origWebhookSecret;
    vi.restoreAllMocks();
  });

  it('persists receipt idempotently across verify, webhook, and GET reload, and blocks double checkout (409)', async () => {
    const token = store.generatePaymentRequestToken({
      id: 'PR-2099-0777',
      clientName: 'شركة الاختبار المتكامل',
      serviceCategory: 'التقاضي التجاري',
      amountMinor: 200000,
      description: 'أتعاب دراسة ملف',
      createdAt: '2026-11-27T10:00:00.000Z',
    });

    const pr: PaymentRequest = {
      id: 'PR-2099-0777',
      token,
      clientName: 'شركة الاختبار المتكامل',
      clientPhone: '+966551112233',
      serviceCategory: 'التقاضي التجاري',
      amountSar: 2000,
      amountMinor: 200000,
      currency: 'SAR',
      description: 'أتعاب دراسة ملف',
      status: 'unpaid',
      createdAt: '2026-11-27T10:00:00.000Z',
    };
    store.paymentRequests.set(pr.id, pr);

    let settledOnMoyasar = false;
    let verifyLookupCalls = 0;
    const paidObject = {
      id: 'pay_test_777',
      status: 'paid',
      amount: 200000,
      currency: 'SAR',
      created_at: '2026-11-27T11:30:00.000Z',
      metadata: { token, requestId: pr.id },
      source: {
        type: 'creditcard',
        company: 'mada',
        name: 'Abdullah Al-Test',
        number: '4111-11XX-XXXX-1111',
      },
    };

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes('metadata')) {
        return new Response(JSON.stringify({ payments: settledOnMoyasar ? [paidObject] : [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      verifyLookupCalls += 1;
      settledOnMoyasar = true;
      return new Response(JSON.stringify(paidObject), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    // 1. First callback verify sets status = paid & stores receipt
    const verifyReq1 = new NextRequest(`http://localhost:3000/api/invoices/${token}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 'pay_test_777' }),
    });
    const res1 = await handleVerifyInvoice(verifyReq1, { params: { token } });
    const json1 = await res1.json();
    expect(res1.status).toBe(200);
    expect(json1.data.status).toBe('paid');
    expect(json1.data.receipt.reference).toBe('PR-2099-0777');
    expect(json1.data.receipt.moyasarPaymentId).toBe('pay_test_777');
    expect(json1.data.receipt.payerName).toBe('Abdullah Al-Test');
    expect(json1.data.receipt.currency).toBe('SAR');
    expect(json1.data.receipt.amountSar).toBe(2000);
    expect(verifyLookupCalls).toBe(1);

    // 2. Repeated callback verify returns alreadyProcessed idempotently without re-hitting Moyasar
    const verifyReq2 = new NextRequest(`http://localhost:3000/api/invoices/${token}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 'pay_test_777' }),
    });
    const res2 = await handleVerifyInvoice(verifyReq2, { params: { token } });
    const json2 = await res2.json();
    expect(res2.status).toBe(200);
    expect(json2.alreadyProcessed).toBe(true);
    expect(json2.data.receipt.moyasarPaymentId).toBe('pay_test_777');
    expect(verifyLookupCalls).toBe(1);
    void fetchMock;

    // 3. Repeated webhook does not duplicate state or create second payment
    const webhookReq = new NextRequest('http://localhost:3000/api/webhooks/moyasar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment_paid',
        secret_token: 'wh_test_secret',
        data: { id: 'pay_test_777', metadata: { token, requestId: pr.id } },
      }),
    });
    const whRes = await handleMoyasarWebhook(webhookReq);
    const whJson = await whRes.json();
    expect(whRes.status).toBe(200);
    expect(whJson.alreadySettled).toBe(true);

    // 4. Reopening GET /api/invoices/[token] returns paid status & receipt
    const getReq = new NextRequest(`http://localhost:3000/api/invoices/${token}`);
    const getRes = await handleGetInvoice(getReq, { params: { token } });
    const getJson = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getJson.data.status).toBe('paid');
    expect(getJson.data.receipt.moyasarPaymentId).toBe('pay_test_777');

    // 5. Server-side checkout guard refuses creating a second payment (409 Conflict)
    const checkoutReq = new NextRequest(`http://localhost:3000/api/invoices/${token}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'ar' }),
    });
    const checkoutRes = await handleCheckoutInvoice(checkoutReq, { params: { token } });
    const checkoutJson = await checkoutRes.json();
    expect(checkoutRes.status).toBe(409);
    expect(checkoutJson.alreadyPaid).toBe(true);

    store.paymentRequests.delete(pr.id);
  });

  it('refuses creating a second Moyasar payment intent for an already-paid consultation', async () => {
    store.consultations.set('consult-paid-guard', {
      id: 'consult-paid-guard',
      reference: 'CR-2099-0888',
      fullName: 'سعد الاختباري',
      phone: '+966550000111',
      serviceId: 'general',
      serviceLabelSnapshot: { ar: 'استفسار عام', en: 'General Inquiry' },
      preferredLawyerId: null,
      preferredLawyerLabelSnapshot: null,
      preferredDate: null,
      assignedLawyerId: null,
      scheduledAt: null,
      appointmentTimezone: 'Asia/Riyadh',
      meetingType: null,
      meetingLink: null,
      meetingAddress: null,
      status: 'confirmed',
      locale: 'ar',
      sourcePage: '/ar/consultation',
      notes: [],
      history: [],
      createdAt: '2026-11-27T10:00:00.000Z',
      updatedAt: '2026-11-27T10:05:00.000Z',
      paymentStatus: 'paid',
      paymentId: 'pay_consult_888',
      amountMinor: 50000,
      currency: 'SAR',
      paidAt: '2026-11-27T10:05:00.000Z',
    });

    const req = new NextRequest('http://localhost:3000/api/consultations/consult-paid-guard/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'ar' }),
    });
    const res = await handleCheckoutConsultation(req, { params: { id: 'consult-paid-guard' } });
    const json = await res.json();
    expect(res.status).toBe(409);
    expect(json.alreadyPaid).toBe(true);

    store.consultations.delete('consult-paid-guard');
  });
});
