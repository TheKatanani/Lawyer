import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { getPaymentRequestById, savePaymentRequest } from '@/server/db/dal';
import { buildPaymentRequestReceipt } from '@/server/payments/moyasar';
import { PaymentRequestStatus, PaymentRequestMethod } from '@/server/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    assertCapability(user.role, 'inquiries.read');

    const pr = await getPaymentRequestById(params.id);
    if (!pr) {
      return NextResponse.json({ error: 'طلب السداد غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: pr });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch payment request' },
      { status: 403 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const pr = await getPaymentRequestById(params.id);
    if (!pr) {
      return NextResponse.json({ error: 'طلب السداد غير موجود' }, { status: 404 });
    }

    const body = await req.json();

    if (body.status) {
      const allowedStatuses: PaymentRequestStatus[] = ['unpaid', 'paid', 'cancelled'];
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'حالة السداد غير صالحة' }, { status: 400 });
      }
      pr.status = body.status;
      if (body.status === 'paid') {
        if (!pr.paidAt) pr.paidAt = new Date().toISOString();
        if (body.paymentMethod) {
          pr.paymentMethod = body.paymentMethod as PaymentRequestMethod;
        } else if (!pr.paymentMethod) {
          pr.paymentMethod = 'office';
        }
        pr.receipt = buildPaymentRequestReceipt(pr);
      }
    }

    if (body.notes !== undefined) {
      pr.notes = String(body.notes);
    }

    if (body.description !== undefined) {
      pr.description = String(body.description);
    }

    await savePaymentRequest(pr);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث طلب السداد بنجاح',
      data: pr,
    });
  } catch (err: any) {
    console.error('[ADMIN_INVOICE_PATCH_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء تعديل طلب السداد' },
      { status: 403 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    assertCapability(user.role, 'content.publish');

    const pr = await getPaymentRequestById(params.id);
    if (!pr) {
      return NextResponse.json({ error: 'طلب السداد غير موجود' }, { status: 404 });
    }

    pr.status = 'cancelled';
    await savePaymentRequest(pr);

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء طلب السداد بنجاح',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء إلغاء طلب السداد' },
      { status: 403 }
    );
  }
}
