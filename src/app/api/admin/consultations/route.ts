import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { ConsultationRequest, ConsultationStatus } from '@/server/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    assertCapability(user.role, 'inquiries.read');

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as ConsultationStatus | 'all' | null;
    const lawyerId = searchParams.get('lawyerId');
    const query = searchParams.get('q')?.toLowerCase().trim();

    let list = Array.from(store.consultations.values());

    // Status filter
    if (status && status !== 'all') {
      list = list.filter((c) => c.status === status);
    }

    // Assigned Lawyer filter
    if (lawyerId && lawyerId !== 'all') {
      list = list.filter((c) => c.assignedLawyerId === lawyerId);
    }

    // Search query filter
    if (query) {
      list = list.filter(
        (c) =>
          c.reference.toLowerCase().includes(query) ||
          c.fullName.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      consultations: list,
      total: list.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch consultations.' }, { status: 403 });
  }
}
