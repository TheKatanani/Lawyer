import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { publishServicePaired } from '@/server/repositories/content';
import { revalidateSiteRoutes } from '@/server/utils/revalidate';

const PublishSchema = z.object({
  entityType: z.enum(['service']),
  entityId: z.string().trim().min(1).max(120),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    assertCapability(user.role, 'content.publish');

    const body = await req.json().catch(() => null);
    const parsed = PublishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Unsupported or invalid entity payload' },
        { status: 400 }
      );
    }

    const res = await publishServicePaired(parsed.data.entityId, user.uid);
    revalidateSiteRoutes([
      `/ar/services/${parsed.data.entityId}`,
      `/en/services/${parsed.data.entityId}`,
    ]);
    return NextResponse.json(res);
  } catch (err: any) {
    const msg = err.message || 'Publication transaction failed';
    return NextResponse.json({ error: msg }, { status: msg.startsWith('Forbidden') ? 403 : 400 });
  }
}
