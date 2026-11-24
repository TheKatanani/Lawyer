import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/server/db/store';
import { fetchMoyasarPayment, PaymentVerificationError } from '@/server/payments/moyasar';
import { checkRateLimit, getClientIp, logInvalidTokenProbe } from '@/server/security/rate-limit';
import { PaymentRequestMethod } from '@/server/types';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');
  const token = params.token;

  // 1. Strict rate limiting on verification endpoint (max 10 req/min per IP)
  const rl = checkRateLimit(`pr_verify:${ip}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'تجاوزت عدد المحاولات المسموح بها. يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.' },
      { status: 429, headers: { 'Retry-After': String(rl.resetInSeconds) } }
    );
  }

  // 2. Token lookup
  const pr = store.getPaymentRequestByToken(token);
  if (!pr) {
    logInvalidTokenProbe(ip, token, userAgent);
    return NextResponse.json(
      { error: 'طلب السداد غير موجود أو غير صالح' },
      { status: 404 }
    );
  }

  // 3. Strict Idempotency: If already marked paid, return success immediately
  if (pr.status === 'paid') {
    return NextResponse.json({
      success: true,
      message: 'تم التحقق من السداد بنجاح مسبقاً',
      data: {
        id: pr.id,
        token: pr.token,
        clientName: pr.clientName,
        serviceCategory: pr.serviceCategory,
        amountSar: pr.amountSar,
        status: pr.status,
        paymentMethod: pr.paymentMethod,
        moyasarPaymentId: pr.moyasarPaymentId,
        paidAt: pr.paidAt,
      },
    });
  }

  // 4. Extract Moyasar payment ID
  let paymentId: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    paymentId = body.paymentId || body.id || null;
  } catch {
    // Body parsing error handled below
  }

  if (!paymentId) {
    const url = new URL(req.url);
    paymentId = url.searchParams.get('id');
  }

  if (!paymentId) {
    return NextResponse.json({ error: 'معرف عملية الدفع (payment_id) مفقود' }, { status: 400 });
  }

  // 5. Direct server-to-server verification with Moyasar API
  try {
    const payment = await fetchMoyasarPayment(paymentId);

    if (payment.status !== 'paid' && payment.status !== 'captured') {
      return NextResponse.json(
        {
          error: `لم تكتمل عملية السداد بنجاح (حالة العملية: ${payment.status}). يرجى إعادة المحاولة.`,
          status: payment.status,
        },
        { status: 400 }
      );
    }

    // Exact Currency Matching
    if (payment.currency.toUpperCase() !== 'SAR') {
      console.error(`[PAYMENT_CURRENCY_MISMATCH] Expected SAR, got ${payment.currency} for token ${token}`);
      return NextResponse.json({ error: 'فشل التحقق: عملة الدفع غير متطابقة' }, { status: 400 });
    }

    // Exact Amount Matching in Halalas
    if (payment.amount !== pr.amountMinor) {
      console.error(
        `[PAYMENT_AMOUNT_MISMATCH] Expected ${pr.amountMinor} halalas, got ${payment.amount} for token ${token}`
      );
      return NextResponse.json({ error: 'فشل التحقق: المبلغ المدفوع لا يتطابق مع قيمة الطلب' }, { status: 400 });
    }

    // Detect payment method
    let detectedMethod: PaymentRequestMethod = 'creditcard';
    if (payment.source?.type === 'applepay') {
      detectedMethod = 'applepay';
    } else if (payment.source?.company === 'mada') {
      detectedMethod = 'mada';
    }

    // Update payment request state
    pr.status = 'paid';
    pr.moyasarPaymentId = payment.id;
    pr.paymentMethod = detectedMethod;
    pr.paidAt = new Date().toISOString();

    store.paymentRequests.set(pr.id, pr);
    store.persistToDisk();

    // Masked card info for receipt
    const maskedCard = payment.source?.number ? `•••• •••• •••• ${payment.source.number.slice(-4)}` : undefined;

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد السداد وإصدار إيصال الاستلام بنجاح',
      data: {
        id: pr.id,
        token: pr.token,
        clientName: pr.clientName,
        serviceCategory: pr.serviceCategory,
        amountSar: pr.amountSar,
        amountMinor: pr.amountMinor,
        status: pr.status,
        paymentMethod: pr.paymentMethod,
        moyasarPaymentId: pr.moyasarPaymentId,
        paidAt: pr.paidAt,
        maskedCard,
      },
    });
  } catch (err: any) {
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    console.error('[PAYMENT_VERIFY_UNEXPECTED_ERROR]', err);
    return NextResponse.json({ error: 'تعذر التحقق من عملية السداد، يرجى التواصل مع إدارة المكتب' }, { status: 500 });
  }
}
