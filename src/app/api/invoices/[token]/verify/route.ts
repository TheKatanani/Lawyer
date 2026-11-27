import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { store } from '@/server/db/store';
import {
  applySettledPaymentToRequest,
  buildPaymentRequestReceipt,
  fetchMoyasarPayment,
  isPaymentsEnabled,
  PaymentVerificationError,
  reconcilePaidPaymentRequest,
} from '@/server/payments/moyasar';
import { checkRateLimit, getClientIp, logInvalidTokenProbe } from '@/server/security/rate-limit';

const VerifyInvoiceSchema = z
  .object({
    paymentId: z.string().trim().min(1).max(120).optional(),
    id: z.string().trim().min(1).max(120).optional(),
  })
  .optional();

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  if (!isPaymentsEnabled()) {
    return NextResponse.json(
      { error: 'خدمة الدفع الإلكتروني غير مفعلة حالياً.' },
      { status: 503 }
    );
  }
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

  // 2. Token lookup + reconciliation
  const pr = store.getPaymentRequestByToken(token);
  if (!pr) {
    logInvalidTokenProbe(ip, token, userAgent);
    return NextResponse.json(
      { error: 'طلب السداد غير موجود أو غير صالح' },
      { status: 404 }
    );
  }

  await reconcilePaidPaymentRequest(pr);

  // 3. Strict Idempotency: If already marked paid, return persisted receipt immediately
  if (pr.status === 'paid') {
    const receipt = buildPaymentRequestReceipt(pr);
    return NextResponse.json({
      success: true,
      alreadyProcessed: true,
      message: 'تم التحقق من السداد بنجاح مسبقاً',
      data: {
        id: pr.id,
        token: pr.token,
        clientName: pr.clientName,
        payerName: receipt.payerName,
        serviceCategory: pr.serviceCategory,
        amountSar: pr.amountSar,
        amountMinor: pr.amountMinor,
        currency: receipt.currency,
        status: pr.status,
        paymentMethod: pr.paymentMethod,
        moyasarPaymentId: pr.moyasarPaymentId,
        maskedCard: receipt.maskedCard,
        paidAt: pr.paidAt,
        receipt,
      },
    });
  }

  // 4. Extract and validate Moyasar payment ID
  let paymentId: string | null = null;
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = VerifyInvoiceSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات التحقق غير صالحة' }, { status: 400 });
    }
    paymentId = parsed.data?.paymentId || parsed.data?.id || null;
  } catch {
    // Body parsing error handled below
  }

  if (!paymentId) {
    const url = new URL(req.url);
    const paramId = url.searchParams.get('id')?.trim();
    paymentId = paramId && paramId.length <= 120 ? paramId : null;
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

    const { receipt } = applySettledPaymentToRequest(pr, payment);

    try {
      revalidatePath('/admin/invoices');
      revalidatePath(`/ar/pay/${pr.token}`);
      revalidatePath(`/en/pay/${pr.token}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد السداد وإصدار إيصال الاستلام بنجاح',
      data: {
        id: pr.id,
        token: pr.token,
        clientName: pr.clientName,
        payerName: receipt.payerName,
        serviceCategory: pr.serviceCategory,
        amountSar: pr.amountSar,
        amountMinor: pr.amountMinor,
        currency: receipt.currency,
        status: pr.status,
        paymentMethod: pr.paymentMethod,
        moyasarPaymentId: pr.moyasarPaymentId,
        paidAt: pr.paidAt,
        maskedCard: receipt.maskedCard,
        receipt,
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
