import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { updateInquiryStatus } from '@/server/repositories/inquiries';

const UpdateInquirySchema = z.object({
  inquiryId: z.string().trim().min(1).max(120),
  newStatus: z.enum(['new', 'triaged', 'inProgress', 'closed', 'spam']),
  noteText: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    assertCapability(user.role, 'inquiries.update');

    const body = await req.json().catch(() => null);
    const parsed = UpdateInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid inquiry update payload.' }, { status: 400 });
    }

    const updated = await updateInquiryStatus(
      user.uid,
      parsed.data.inquiryId,
      parsed.data.newStatus,
      parsed.data.noteText
    );
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: any) {
    const msg = err.message || 'Failed to update inquiry.';
    const status = msg.startsWith('Forbidden') ? 403 : msg === 'Inquiry not found' ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
