import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { SiteSettings } from '@/server/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    return NextResponse.json({ settings: store.siteSettings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const body: Partial<SiteSettings> = await req.json();

    // Merge settings into in-memory store
    store.siteSettings = {
      ...store.siteSettings,
      ...body,
    };

    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SITE_SETTINGS_UPDATED',
      targetType: 'site_settings',
      targetId: 'global',
      details: { updatedKeys: Object.keys(body) },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, settings: store.siteSettings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
