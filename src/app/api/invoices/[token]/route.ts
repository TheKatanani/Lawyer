import { NextRequest, NextResponse } from 'next/server';
import { getPaymentRequestByToken } from '@/server/db/dal';
import { buildPaymentRequestReceipt, reconcilePaidPaymentRequest } from '@/server/payments/moyasar';
import { checkRateLimit, getClientIp, logInvalidTokenProbe } from '@/server/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');
  const token = params.token;

  const rl = checkRateLimit(`pr_lookup:${ip}`, 15, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة بعد قليل.' },
      { status: 429, headers: { 'Retry-After': String(rl.resetInSeconds) } }
    );
  }

  const pr = await getPaymentRequestByToken(token);
  if (!pr) {
    await logInvalidTokenProbe(ip, token, userAgent);
    return NextResponse.json(
      { error: 'طلب السداد غير موجود أو انتهت صلاحيته' },
      { status: 404 }
    );
  }

  await reconcilePaidPaymentRequest(pr);
  const receipt = pr.status === 'paid' ? buildPaymentRequestReceipt(pr) : null;

  return NextResponse.json({
    success: true,
    data: {
      id: pr.id,
      token: pr.token,
      clientName: pr.clientName,
      serviceCategory: pr.serviceCategory,
      amountSar: pr.amountSar,
      amountMinor: pr.amountMinor,
      currency: pr.currency || receipt?.currency || 'SAR',
      description: pr.description,
      status: pr.status,
      paymentMethod: pr.paymentMethod,
      payerName: pr.payerName || receipt?.payerName || pr.clientName,
      moyasarPaymentId: pr.moyasarPaymentId,
      maskedCard: pr.maskedCard || receipt?.maskedCard,
      paidAt: pr.paidAt,
      receipt,
      createdAt: pr.createdAt,
      expiresAt: pr.expiresAt,
      isExpired: pr.expiresAt ? new Date(pr.expiresAt).getTime() < Date.now() : false,
    },
  });
}
