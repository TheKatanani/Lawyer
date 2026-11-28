import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  allocateNextPaymentRequestId,
  appendAuditLog,
  listPaymentRequests,
  savePaymentRequest,
} from '@/server/db/dal';
import { sealPaymentToken } from '@/server/payments/tokens';
import { CreatePaymentRequestInput, PaymentRequest } from '@/server/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    assertCapability(user.role, 'inquiries.read');

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    let items = await listPaymentRequests();
    if (statusFilter && statusFilter !== 'all') {
      items = items.filter((item) => item.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch payment requests' },
      { status: 403 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const body: CreatePaymentRequestInput = await req.json();

    if (!body.clientName || !body.clientPhone || !body.serviceCategory || !body.amountSar) {
      return NextResponse.json(
        { error: 'الحقول التالية إلزامية: اسم العميل، رقم الجوال، بيان الخدمة، والمبلغ' },
        { status: 400 }
      );
    }

    const amountSar = Number(body.amountSar);
    if (isNaN(amountSar) || amountSar <= 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون رقماً موجباً أكبر من صفر' },
        { status: 400 }
      );
    }

    const id = await allocateNextPaymentRequestId();
    const now = new Date().toISOString();
    const expiresInDays = body.expiresInDays && body.expiresInDays > 0 ? body.expiresInDays : 14;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    const description = body.description?.trim() || body.serviceCategory.trim();
    const amountMinor = Math.round(amountSar * 100);
    const token = sealPaymentToken({
      id,
      clientName: body.clientName.trim(),
      serviceCategory: body.serviceCategory.trim(),
      amountMinor,
      description,
      createdAt: now,
      expiresAt,
    });

    const paymentRequest: PaymentRequest = {
      id,
      token,
      clientName: body.clientName.trim(),
      clientPhone: body.clientPhone.trim(),
      serviceCategory: body.serviceCategory.trim(),
      amountSar,
      amountMinor,
      currency: 'SAR',
      description,
      status: 'unpaid',
      createdAt: now,
      expiresAt,
      notes: body.notes?.trim() || '',
    };

    await savePaymentRequest(paymentRequest);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'PAYMENT_REQUEST_CREATED',
      targetType: 'paymentRequest',
      targetId: id,
      details: { clientName: paymentRequest.clientName, amountSar },
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء طلب السداد بنجاح',
      data: paymentRequest,
    });
  } catch (err: any) {
    console.error('[ADMIN_INVOICE_CREATE_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء إنشاء طلب السداد' },
      { status: 400 }
    );
  }
}
