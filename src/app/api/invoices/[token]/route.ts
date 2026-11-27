import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/server/db/store';
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

  // 1. Rate limiting on public token lookup (max 15 requests/min per IP)
  const rl = checkRateLimit(`pr_lookup:${ip}`, 15, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة بعد قليل.' },
      { status: 429, headers: { 'Retry-After': String(rl.resetInSeconds) } }
    );
  }

  // 2. Lookup by cryptographic token and reconcile paid status with Moyasar if needed
  const pr = store.getPaymentRequestByToken(token);
  if (!pr) {
    // Log masked probe event to security audit log
    logInvalidTokenProbe(ip, token, userAgent);
    return NextResponse.json(
      { error: 'طلب السداد غير موجود أو انتهت صلاحيته' },
      { status: 404 }
    );
  }

  await reconcilePaidPaymentRequest(pr);
  const receipt = pr.status === 'paid' ? buildPaymentRequestReceipt(pr) : null;

  // 3. Return sanitized public representation (never expose internal notes)
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
