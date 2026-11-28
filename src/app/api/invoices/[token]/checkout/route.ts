import { NextRequest, NextResponse } from 'next/server';
import { getPaymentRequestByToken, savePaymentRequest } from '@/server/db/dal';
import {
  buildPaymentRequestReceipt,
  createMoyasarPaymentIntent,
  fetchMoyasarPaymentIntent,
  isPaymentsEnabled,
  PaymentVerificationError,
  reconcilePaidPaymentRequest,
} from '@/server/payments/moyasar';
import { checkRateLimit, getClientIp, logInvalidTokenProbe } from '@/server/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');
  const token = params.token;

  const rl = checkRateLimit(`pr_checkout:${ip}`, 15, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح من المحاولات. يرجى الانتظار دقيقة.' },
      { status: 429, headers: { 'Retry-After': String(rl.resetInSeconds) } }
    );
  }

  const pr = await getPaymentRequestByToken(token);
  if (!pr) {
    await logInvalidTokenProbe(ip, token, userAgent);
    return NextResponse.json(
      { error: 'طلب السداد غير موجود أو غير صالح' },
      { status: 404 }
    );
  }

  await reconcilePaidPaymentRequest(pr);

  if (pr.status === 'paid') {
    const receipt = buildPaymentRequestReceipt(pr);
    return NextResponse.json(
      {
        error: 'تم سداد هذا الطلب مسبقاً ولا يمكن إنشاء عملية دفع جديدة.',
        alreadyPaid: true,
        data: {
          id: pr.id,
          token: pr.token,
          clientName: pr.clientName,
          serviceCategory: pr.serviceCategory,
          amountSar: pr.amountSar,
          amountMinor: pr.amountMinor,
          currency: receipt.currency,
          status: pr.status,
          paymentMethod: pr.paymentMethod,
          payerName: receipt.payerName,
          moyasarPaymentId: pr.moyasarPaymentId,
          maskedCard: receipt.maskedCard,
          paidAt: pr.paidAt,
          receipt,
        },
      },
      { status: 409 }
    );
  }

  if (pr.status === 'cancelled') {
    return NextResponse.json(
      { error: 'تم إلغاء طلب السداد ولا يمكن إتمام الدفع.' },
      { status: 409 }
    );
  }

  if (pr.expiresAt && new Date(pr.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { error: 'انتهت صلاحية رابط السداد.' },
      { status: 410 }
    );
  }

  if (!isPaymentsEnabled()) {
    return NextResponse.json(
      { error: 'خدمة الدفع الإلكتروني غير مفعلة حالياً.' },
      { status: 503 }
    );
  }

  const rawBody = await req.json().catch(() => ({}));
  const locale = rawBody?.locale === 'en' ? 'en' : 'ar';

  try {
    if (pr.paymentIntentId) {
      const existing = await fetchMoyasarPaymentIntent(pr.paymentIntentId);
      if (existing && existing.status === 'created' && existing.client_secret) {
        return NextResponse.json({
          success: true,
          paymentIntent: {
            id: existing.id,
            client_secret: existing.client_secret,
          },
        });
      }
    }

    const origin = new URL(req.url).origin;
    const intent = await createMoyasarPaymentIntent({
      amountMinor: pr.amountMinor,
      currency: pr.currency || 'SAR',
      description: `RMA Legal - ${pr.id} - ${pr.clientName}`,
      callbackUrl: `${origin}/${locale}/pay/${pr.token}`,
    });

    pr.paymentIntentId = intent.id;
    await savePaymentRequest(pr);

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
      { error: err.message || 'تعذر تجهيز جلسة الدفع الإلكتروني.' },
      { status: 500 }
    );
  }
}
