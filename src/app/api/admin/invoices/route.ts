import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
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

    let items = Array.from(store.paymentRequests.values());
    if (statusFilter && statusFilter !== 'all') {
      items = items.filter(item => item.status === statusFilter);
    }

    // Sort descending by creation date
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch payment requests' }, { status: 403 });
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
      return NextResponse.json({ error: 'المبلغ يجب أن يكون رقماً موجباً أكبر من صفر' }, { status: 400 });
    }

    const id = store.getNextPaymentRequestId();
    const now = new Date().toISOString();
    const expiresInDays = body.expiresInDays && body.expiresInDays > 0 ? body.expiresInDays : 14;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    const description = body.description?.trim() || body.serviceCategory.trim();
    const amountMinor = Math.round(amountSar * 100);
    const token = store.generatePaymentRequestToken({
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
      description,
      status: 'unpaid',
      createdAt: now,
      expiresAt,
      notes: body.notes?.trim() || '',
    };

    store.paymentRequests.set(id, paymentRequest);
    store.persistToDisk();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء طلب السداد بنجاح',
      data: paymentRequest,
    });
  } catch (err: any) {
    console.error('[ADMIN_INVOICE_CREATE_ERROR]', err);
    return NextResponse.json({ error: err.message || 'حدث خطأ أثناء إنشاء طلب السداد' }, { status: 403 });
  }
}

