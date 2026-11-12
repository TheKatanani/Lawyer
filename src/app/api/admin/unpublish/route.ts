import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { unpublishService } from '@/server/repositories/content';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityType, entityId } = await req.json();

    if (entityType === 'service') {
      const res = await unpublishService(entityId, user.uid);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: 'Unsupported entity type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unpublish transaction failed' }, { status: 400 });
  }
}
