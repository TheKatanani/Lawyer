import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { updateInquiryStatus } from '@/server/repositories/inquiries';

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inquiryId, newStatus, noteText } = await req.json();
    if (!inquiryId || !newStatus) {
      return NextResponse.json({ error: 'inquiryId and newStatus are required.' }, { status: 400 });
    }

    const updated = await updateInquiryStatus(user.uid, inquiryId, newStatus, noteText);
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update inquiry.' }, { status: 500 });
  }
}
