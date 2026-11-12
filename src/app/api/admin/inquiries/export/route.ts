import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { exportInquiriesToCsv } from '@/server/repositories/inquiries';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const csvContent = await exportInquiriesToCsv(user.role);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rma-inquiries-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || 'Export forbidden', { status: 403 });
  }
}
